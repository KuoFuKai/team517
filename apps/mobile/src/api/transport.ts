import type { ApiError, ValidationField } from '@team517/contracts';

export class ApiClientError extends Error {
  constructor(public code: string, message: string, public status?: number, public fields?: ValidationField[]) {
    super(message);
    this.name = 'ApiClientError';
  }
}

interface TransportOptions {
  baseUrl: string;
  getToken: () => Promise<string | undefined>;
  fetcher?: typeof fetch;
  timeoutMs?: number;
}

export type ApiRequest = <T>(path: string, body?: unknown, method?: 'GET' | 'POST' | 'PATCH') => Promise<T>;

export function createTransport({ baseUrl, getToken, fetcher = fetch, timeoutMs = 15000 }: TransportOptions): ApiRequest {
  return async <T>(path: string, body?: unknown, method?: 'GET' | 'POST' | 'PATCH'): Promise<T> => {
    let token: string | undefined;
    try {
      token = await getToken();
    } catch (error) {
      const code = (error as { code?: string })?.code;
      if (code === 'auth/network-request-failed') {
        throw new ApiClientError('NETWORK_ERROR', 'Could not reach authentication. Check your connection and Auth emulator.');
      }
      throw new ApiClientError('AUTH_REQUIRED', 'Your session could not be verified. Please sign in again.');
    }
    if (!token) throw new ApiClientError('AUTH_REQUIRED', 'Please sign in to continue.');

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetcher(baseUrl.replace(/\/$/, '') + path, {
        method: method ?? (body === undefined ? 'GET' : 'POST'),
        headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller.signal,
      });
      let data: unknown;
      try { data = await response.json(); }
      catch (error) {
        if (controller.signal.aborted) throw error;
        if (response.ok) throw new ApiClientError('INVALID_RESPONSE', 'The API returned an unexpected response. Check the configured API URL.', response.status);
      }
      if (!response.ok) {
        const apiError = (data as ApiError | null)?.error;
        // Preserve safe AI-specific failures instead of hiding them behind a
        // generic 5xx message; manual Task operations remain independent.
        const aiMessages: Record<string, string> = {
          AI_NOT_CONFIGURED: 'AI is not configured. Continue manually or enable the backend emulator mock provider.',
          AI_UNAVAILABLE: 'AI is unavailable. Your draft has not changed; continue manually.',
          AI_INVALID_RESPONSE: 'AI returned an invalid suggestion. Your draft has not changed.',
          TRANSCRIPTION_FAILED: 'Transcription failed. Enter or paste a transcript and review it instead.',
        };
        if (apiError?.code && aiMessages[apiError.code]) throw new ApiClientError(apiError.code, aiMessages[apiError.code], response.status);
        if (response.status >= 500) throw new ApiClientError('BACKEND_UNAVAILABLE', 'The backend is unavailable. Check that the emulators are running, then try again.', response.status);
        const messages: Record<number, string> = {
          400: path === '/care-contexts' ? 'Check your input. Care context names must contain 1–120 characters.' : apiError?.message ?? 'Check the fields and try again.',
          401: 'Your session has expired. Please sign in again.',
          403: 'You do not have permission to access this care context or perform this action.',
        };
        throw new ApiClientError(apiError?.code ?? 'API_ERROR', messages[response.status] ?? apiError?.message ?? 'The request failed. Please try again.', response.status, apiError?.fields);
      }
      return data as T;
    } catch (error) {
      if (error instanceof ApiClientError) throw error;
      throw new ApiClientError('NETWORK_ERROR', 'Could not reach the backend. Check your connection, API URL and emulators. The request may not have completed; refresh the list before submitting again.');
    } finally {
      clearTimeout(timer);
    }
  };
}

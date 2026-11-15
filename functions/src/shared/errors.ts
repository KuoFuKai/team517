import type { ValidationField } from '@team517/contracts';
export class ApiFailure extends Error {
  constructor(public status: number, public code: string, message: string, public fields?: ValidationField[]) { super(message); }
}
// The SDK already retries transactions. An exhausted ABORTED lock conflict is
// still a conflict, not an unknown server failure; callers must refresh, not replay.
export function transactionConflict(error: unknown): ApiFailure | undefined {
  const failure=error as {code?:unknown;details?:unknown}|null;
  return failure?.code===10 && typeof failure.details==='string' && /transaction|contention/i.test(failure.details)
    ? new ApiFailure(409,'CONFLICT','This item changed while the request was running. Refresh before trying again.') : undefined;
}

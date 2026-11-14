import { getMessaging } from 'firebase-admin/messaging';
import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app';
import type { Notification } from '../domain/support';

export interface PushPayload { notification: { title: string; body: string }; data: { notificationId: string; resourceType: string; resourceId: string } }
export interface PushProvider { send(token: string, payload: PushPayload): Promise<'SENT' | 'INVALID' | 'FAILED'> }
const important = new Set(['OFFER_AVAILABILITY_UPDATED', 'OFFER_RECEIVED', 'HELPER_SELECTED', 'ASSIGNMENT_CONFIRMED', 'ASSIGNMENT_DECLINED', 'ASSIGNMENT_CANCELLED', 'COMPLETION_REQUESTED', 'TASK_COMPLETED', 'COMPLETION_DISPUTED', 'NEW_MESSAGE']);
export function pushPayload(n: Notification): PushPayload | undefined {
  if (!important.has(n.type)) return;
  // Deliberately never copy persisted title/body or user-provided content.
  return { notification: { title: 'team517', body: n.type === 'NEW_MESSAGE' ? 'You have a new message.' : 'You have a task update.' },
    data: { notificationId: n.id, resourceType: n.resourceType, resourceId: n.resourceId } };
}
export class FcmPushProvider implements PushProvider {
  constructor(private sendMessage = async (token: string, payload: PushPayload) => {
    // Separate FCM app allows a real test Firebase project for push while Auth /
    // Firestore stay on demo-team517 emulators. Never replace the business app.
    const app = getApps().find(a => a.name === 'team517-fcm') ?? initializeApp({ credential: applicationDefault(), projectId: process.env.FCM_PROJECT_ID }, 'team517-fcm');
    await getMessaging(app).send({ token, ...payload, android: { priority: 'high', notification: { channelId: 'updates', tag: payload.data.notificationId } } });
  }) {}
  async send(token: string, payload: PushPayload) {
    try {
      await this.sendMessage(token, payload);
      return 'SENT' as const;
    } catch (error) {
      const code = (error as { code?: string }).code;
      return code === 'messaging/registration-token-not-registered' || code === 'messaging/invalid-registration-token' ? 'INVALID' as const : 'FAILED' as const;
    }
  }
}
export function configuredPushProvider(): PushProvider | undefined {
  // CI is always isolated. Native acceptance may explicitly opt into FCM from
  // local Functions, with externally supplied credentials and test devices only.
  const local = process.env.FUNCTIONS_EMULATOR === 'true' || Boolean(process.env.FIRESTORE_EMULATOR_HOST);
  if (process.env.CI || (local && process.env.PUSH_ALLOW_EMULATOR_FCM !== 'true') || process.env.PUSH_PROVIDER !== 'fcm' || !process.env.FCM_PROJECT_ID || process.env.FCM_PROJECT_ID.startsWith('demo-')) return;
  return new FcmPushProvider();
}

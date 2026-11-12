import { initializeApp } from 'firebase-admin/app';
import { onRequest } from 'firebase-functions/v2/https';
import { createApp } from './api/app';
import { Store } from './repositories/store';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { NotificationDeliveryService } from './push/service';
import { configuredPushProvider } from './push/provider';
initializeApp();
export const api = onRequest({region:'us-central1'},createApp(new Store()));
export const deliverNotification = onDocumentCreated({ document: 'notifications/{notificationId}', region: 'us-central1', retry: false }, async event => {
  await new NotificationDeliveryService(configuredPushProvider()).deliver(event.params.notificationId);
});

import React from 'react';
import { ScreenModal } from './ScreenModal';
import { ConversationScreen } from '../screens/MessagingScreen';
export function ConversationModal({ id, close }: { id: string; close: () => void }) {
  return <ScreenModal title="Conversation" close={close}><ConversationScreen id={id} back={close} /></ScreenModal>;
}

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { conversationKey, messageKey } from '../src/messaging/service';
import { conversationSchema, messageSchema, parseSendMessage } from '../src/validation/messaging';
test('conversation pair identity is order-independent and scope/message sender identity remains isolated', () => {
  assert.equal(conversationKey('TASK', 't', ['a', 'b']), conversationKey('TASK', 't', ['b', 'a']));
  assert.notEqual(conversationKey('TASK', 't', ['a', 'b']), conversationKey('CARE_CONTEXT', 't', ['a', 'b']));
  assert.notEqual(messageKey('c', 'a', 'client1'), messageKey('c', 'b', 'client1'));
  assert.notEqual(messageKey('c', 'a', 'client1'), messageKey('d', 'a', 'client1'));
});
test('messaging input is bounded plain text with strict scope, no group/attachment/permission fields', () => {
  assert.equal(conversationSchema.safeParse({ scope: 'TASK', taskId: 'a'.repeat(20), otherUserId: 'user', canSend: true }).success, false);
  assert.equal(messageSchema.safeParse({ text: 'Hello', clientMessageId: 'client-123', attachment: 'file' }).success, false);
  assert.equal(messageSchema.safeParse({ text: '<b>HTML</b>', clientMessageId: 'client-123' }).success, false);
  assert.throws(() => parseSendMessage({ text: ' ', clientMessageId: 'client-123' }), { code: 'MESSAGE_EMPTY' });
  assert.throws(() => parseSendMessage({ text: 'x'.repeat(2001), clientMessageId: 'client-123' }), { code: 'MESSAGE_TOO_LONG' });
  assert.equal(parseSendMessage({ text: ' Hello ', clientMessageId: 'client-123' }).text, 'Hello');
});

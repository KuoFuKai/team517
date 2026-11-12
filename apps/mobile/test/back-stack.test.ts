import assert from 'node:assert/strict';
import test from 'node:test';
import { createBackStack } from '../src/navigation/back-stack';
test('nested offer consumes Back before a later-mounted parent', () => {
  const stack = createBackStack(), called: string[] = [];
  stack.register(() => { called.push('offer'); return true; }, 3);
  stack.register(() => { called.push('task'); return true; }, 1);
  stack.register(() => { called.push('app'); return true; });
  assert.equal(stack.dispatch(), true);
  assert.deepEqual(called, ['offer']);
});
test('unhandled Back falls through and removed screens cannot intercept', () => {
  const stack = createBackStack(), called: string[] = [];
  stack.register(() => { called.push('root'); return false; });
  const remove = stack.register(() => { called.push('conversation'); return true; }, 5);
  remove();
  assert.equal(stack.size, 1);
  assert.equal(stack.dispatch(), false);
  assert.deepEqual(called, ['root']);
});
test('inner screen can yield to its workspace without exiting the app', () => {
  const stack = createBackStack(); let destination = '';
  stack.register(() => false, 4);
  stack.register(() => { destination = 'offer-list'; return true; }, 3);
  stack.register(() => { destination = 'task-list'; return true; }, 1);
  stack.dispatch(); assert.equal(destination, 'offer-list');
});

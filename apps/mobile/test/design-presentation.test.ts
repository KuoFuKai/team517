import assert from 'node:assert/strict';
import test from 'node:test';
import { compensationLabel, discoveryAreaLabel, messageTimeLabel, taskWhenLabel } from '../src/utils/design-presentation';
test('discovery hides generated grid jargon without changing neighborhood names', () => {
  assert.equal(discoveryAreaLabel('Approximate area (0.02° grid; not an address)'), 'Approximate area');
  assert.equal(discoveryAreaLabel('Downtown (west)'), 'Downtown (west)');
});
test('compensation only displays existing metadata, never prototype bonuses or balances', () => {
  assert.equal(compensationLabel({ compensationType: 'VOLUNTEER' }), 'Volunteer task');
  assert.equal(compensationLabel({ compensationType: 'PAID', cashAmount: 25, currency: 'USD' }), '25 USD');
  assert.equal(compensationLabel({ compensationType: 'POINTS', pointReward: 120 }), '120 points');
  assert.equal(compensationLabel({ compensationType: 'PAID' }), 'Paid task');
});
test('inbox time uses local today/yesterday and safely handles invalid timestamps', () => {
  const now = new Date(2026, 10, 12, 14), previous = new Date(2026, 10, 11, 10);
  assert.equal(messageTimeLabel(previous.toISOString(), now), 'Yesterday');
  assert.equal(messageTimeLabel('bad', now), '');
  assert.ok(messageTimeLabel(now.toISOString(), now).includes(':'));
});
test('task time remains readable for draft, same-day and cross-day ranges', () => {
  assert.equal(taskWhenLabel(undefined), 'Time to be arranged');
  assert.equal(taskWhenLabel('invalid'), 'Time to be arranged');
  const start = new Date(2026, 10, 13, 10), end = new Date(2026, 10, 13, 12), next = new Date(2026, 10, 14, 12);
  assert.ok(taskWhenLabel(start.toISOString(), end.toISOString()).includes('–'));
  assert.ok(taskWhenLabel(start.toISOString(), next.toISOString()).includes('Nov 14'));
});

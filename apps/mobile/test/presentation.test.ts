import { test } from 'node:test';
import assert from 'node:assert/strict';
import { statusLabel, roleLabel, friendlyError, dateLabel, personLabel, countLabel, localDateKey, localDayInstant, workPriority, assignmentNextAction, validationSummary } from '../src/utils/presentation';
test('product labels preserve distinct lifecycle meanings without exposing backend enum wording', () => {
  assert.equal(statusLabel('PENDING_CONFIRMATION'), 'Waiting for helper confirmation');
  assert.equal(statusLabel('CONFIRMED'), statusLabel('ARRANGED'));
  assert.equal(statusLabel('COMPLETION_PENDING'), 'Waiting for completion review');
  assert.equal(statusLabel('DISPUTED'), 'Issue reported');
  assert.equal(roleLabel('HELPER'), 'Helper');
  assert.notEqual(statusLabel('SELECTED'), statusLabel('ACTIVE'));
  assert.notEqual(statusLabel('NOT_SELECTED'), statusLabel('SELECTED'));
});
test('calendar groups the same instant by the explicit local zone across midnight and DST', () => {
  assert.equal(localDateKey('2026-11-11T02:30:00Z', 'America/New_York'), '2026-11-10');
  assert.equal(localDateKey('2026-11-11T02:30:00Z', 'Asia/Tokyo'), '2026-11-11');
  assert.equal(localDateKey('2026-03-08T07:30:00Z', 'America/New_York'), '2026-03-08');
  assert.equal(localDayInstant('2026-02-30'), undefined);
  assert.equal(localDayInstant('bad input'), undefined);
  const instant = localDayInstant('2026-11-10');
  assert.ok(instant); assert.equal(localDateKey(instant), '2026-11-10');
});
test('review copy and work ordering preserve singular counts and real next actions', () => {
  assert.equal(countLabel(1, 'review'), '1 review'); assert.equal(countLabel(0, 'review'), '0 reviews');
  assert.equal(countLabel(1, 'star'), '1 star'); assert.equal(countLabel(5, 'star'), '5 stars');
  assert.ok(workPriority('PENDING_CONFIRMATION') < workPriority('CANCELLED_BY_HELPER'));
  assert.match(assignmentNextAction('CONFIRMED', true), /Arrival details are unlocked/);
  assert.match(assignmentNextAction('COMPLETION_PENDING', false), /approve completion/);
});
test('product error copy handles verification/AI/privacy and never renders arbitrary exception details', () => {
  assert.match(friendlyError({ code: 'HELPER_NOT_VERIFIED' }), /Verification/);
  assert.match(friendlyError({ code: 'AI_NOT_CONFIGURED' }), /manually/);
  assert.match(friendlyError({ code: 'LOCATION_NOT_VISIBLE' }), /current confirmed/);
  assert.ok(!friendlyError(new Error('PRIVATE address or vendor stack')).includes('PRIVATE'));
  assert.equal(dateLabel('not a date'), 'Time to be arranged');
  assert.equal(personLabel('backend-uid-1234'), 'Helper 1234');
  const validation = validationSummary([{ field: 'visibility', message: 'expected CARE_CIRCLE|VERIFIED_HELPERS' }, { field: 'startAt', message: 'Invalid input: undefined' }]);
  assert.match(validation, /Choose your circle or verified helpers/);
  assert.match(validation, /timezone/); assert.doesNotMatch(validation, /undefined|CARE_CIRCLE|Invalid input/);
});

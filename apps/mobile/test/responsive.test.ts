import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compactNavigation, navigationLabel, stackActions } from '../src/utils/responsive';

test('action groups stack on small phones but use a row when actual space fits', () => {
  assert.equal(stackActions(320 - 40), true);
  for (const width of [360, 390, 412]) assert.equal(stackActions(width - 40), false);
  assert.equal(stackActions(250), true); // same phone, nested card with less space
});
test('enlarged fonts stack action groups without disabling text scaling', () => {
  for (const width of [320, 360, 390, 412]) assert.equal(stackActions(width - 40, 1.3), true);
  assert.equal(stackActions(600, 1.3), false);
  assert.equal(stackActions(320, 0.85), false);
});
test('compact navigation uses recognisable short labels while preserving destinations', () => {
  assert.equal(compactNavigation(320), true);
  assert.equal(compactNavigation(390), false);
  assert.equal(compactNavigation(412, 1.3), true);
  assert.equal(navigationLabel('Community', true), 'Feed');
  assert.equal(navigationLabel('Circle/Msg', true), 'Circle');
  assert.equal(navigationLabel('Messages', true), 'Inbox');
  assert.equal(navigationLabel('Tasks', true), 'Tasks');
  assert.equal(navigationLabel('Community', false), 'Community');
});

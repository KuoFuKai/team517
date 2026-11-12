import { test } from 'node:test';
import assert from 'node:assert/strict';
import { approximateLocation, distanceKm } from '../src/discovery/geo';
import type { Location } from '../src/domain/task';
import { discoverySchema } from '../src/validation/marketplace';

test('coarse points never expose exact input pairs, including cell centers and poles', () => {
  for (const [latitude, longitude] of [[40.75283, -73.95743], [40.01, -73.99], [-90, -180], [90, 180], [0.01, 0.01]]) {
    const coarse = approximateLocation({ latitude, longitude, label: 'Secret home', formattedAddress: '123 PRIVATE Street' } as Location);
    assert.ok(coarse.latitude !== latitude || coarse.longitude !== longitude);
    assert.ok(Math.abs(coarse.latitude!) <= 90 && Math.abs(coarse.longitude!) <= 180);
    assert.ok(!JSON.stringify(coarse).includes('PRIVATE')); assert.ok(!JSON.stringify(coarse).includes('Secret home'));
  }
  assert.equal(approximateLocation().latitude, undefined);
});
test('distance math is isolated and query bounds reject invalid/unpaired coordinates', () => {
  assert.equal(distanceKm({ latitude: 0, longitude: 0 }, { latitude: 0, longitude: 0 }), 0);
  assert.ok(Math.abs(distanceKm({ latitude: 0, longitude: 0 }, { latitude: 0, longitude: 1 }) - 111.19) < 0.1);
  for (const value of [{ latitude: '91', longitude: '0' }, { latitude: '1' }, { radiusKm: '5' }, { latitude: '0', longitude: '0', radiusKm: '101' }, { limit: '100000' }]) assert.equal(discoverySchema.safeParse(value).success, false);
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { TaskDiscoveryItemDto } from '@team517/contracts';
import { taskAreaMarkers, taskAreaRegion, defaultDiscoveryRegion, selectedDiscoveryTask } from '../src/utils/discovery-map';
const task = (id: string, latitude?: number, longitude?: number) => ({ id, title: 'Appointment companion', urgency: 'PLANNED', approximateLocation: { areaLabel: 'Approximate area', latitude, longitude } } as TaskDiscoveryItemDto);
test('map only copies backend approximate coordinates; no exact/private fields enter markers', () => {
  const input = { ...task('a', 40.75, -73.95), latitude: 40.75283, longitude: -73.95743, locationId: 'private', privateInstructions: 'private note', formattedAddress: 'private address' };
  assert.deepEqual(taskAreaMarkers([input]), [{ id: 'a', title: 'Appointment companion', urgent: false, coordinate: { latitude: 40.75, longitude: -73.95 } }]);
  assert.equal(JSON.stringify(taskAreaMarkers([input])).includes('private'), false);
});
test('missing/invalid map areas are omitted without fabricating pins; zero is valid; IDs are stable', () => {
  const inputs = [task('a', 0, 0), task('a', 1, 1), task('missing'), task('nan', NaN, 1), task('bad', 91, 0), task('lon', 0, 181)];
  assert.deepEqual(taskAreaMarkers(inputs).map(m => m.id), ['a']);
  assert.deepEqual(taskAreaMarkers(inputs)[0].coordinate, { latitude: 0, longitude: 0 });
});
test('camera fallback and one/multiple-task extents retain neighborhood-scale framing', () => {
  assert.deepEqual(taskAreaRegion([]), defaultDiscoveryRegion);
  assert.equal(taskAreaRegion(taskAreaMarkers([task('a', 40.75, -73.95)])).latitudeDelta, .04);
  const region = taskAreaRegion(taskAreaMarkers([task('a', 40.75, -73.95), task('b', 40.85, -73.85)]));
  assert.ok(region.latitudeDelta > .1); assert.equal(region.latitude, 40.8);
});
test('selection resolves only against the current shared result set and disappears after filtering', () => {
  const results = [task('a', 40.75, -73.95), task('b', 40.85, -73.85)];
  assert.equal(selectedDiscoveryTask(results, 'a'), results[0]);
  assert.equal(selectedDiscoveryTask(results, null), undefined);
  assert.equal(selectedDiscoveryTask(results.filter(t => t.id !== 'a'), 'a'), undefined);
});

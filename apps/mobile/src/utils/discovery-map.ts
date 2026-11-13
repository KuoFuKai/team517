import type { TaskDiscoveryItemDto } from '@team517/contracts';
export interface TaskAreaMarker { id: string; title: string; urgent: boolean; coordinate: { latitude: number; longitude: number } }
export const defaultDiscoveryRegion = { latitude: 40.75, longitude: -73.96, latitudeDelta: .1, longitudeDelta: .1 };
export const selectedDiscoveryTask = (tasks: readonly TaskDiscoveryItemDto[], id: string | null) => tasks.find(task => task.id === id);
// Coarse privacy cells can coincide. Cycle real tasks at that exact safe point;
// never jitter pins into fabricated coordinates or require a clustering SDK.
export function nextTaskAtArea(markers: readonly TaskAreaMarker[], pressedId: string, currentId: string | null) {
  const pressed = markers.find(m => m.id === pressedId);
  if (!pressed) return null;
  const same = markers.filter(m => m.coordinate.latitude === pressed.coordinate.latitude && m.coordinate.longitude === pressed.coordinate.longitude);
  return same[(same.findIndex(m => m.id === currentId) + 1) % same.length].id;
}
// This adapter accepts only the existing safe projection. Never read a Location
// document or Assignment execution details, and never round exact coordinates here.
export function taskAreaMarkers(tasks: readonly TaskDiscoveryItemDto[]): TaskAreaMarker[] {
  const ids = new Set<string>();
  return tasks.flatMap(task => {
    const { latitude, longitude } = task.approximateLocation;
    if (ids.has(task.id) || !Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude!) > 90 || Math.abs(longitude!) > 180) return [];
    ids.add(task.id);
    return [{ id: task.id, title: task.title, urgent: task.urgency === 'URGENT', coordinate: { latitude: latitude!, longitude: longitude! } }];
  });
}
export function taskAreaRegion(markers: readonly TaskAreaMarker[]) {
  if (!markers.length) return defaultDiscoveryRegion;
  const latitudes = markers.map(m => m.coordinate.latitude), longitudes = markers.map(m => m.coordinate.longitude);
  const minLat = Math.min(...latitudes), maxLat = Math.max(...latitudes), minLon = Math.min(...longitudes), maxLon = Math.max(...longitudes);
  return { latitude: (minLat + maxLat) / 2, longitude: (minLon + maxLon) / 2,
    latitudeDelta: Math.max(.04, Math.min(170, (maxLat - minLat) * 1.5)), longitudeDelta: Math.max(.04, Math.min(350, (maxLon - minLon) * 1.5)) };
}

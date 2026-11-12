import type { ApproximateLocationDto } from '@team517/contracts';
import type { Location } from '../domain/task';

export function approximateLocation(location?: Location): ApproximateLocationDto {
  if (!location || location.latitude === undefined || location.longitude === undefined) return { areaLabel: 'Area not provided; private location withheld' };
  const center = (value: number, max: number) => Number(Math.min(max - 0.01, Math.floor(value / 0.02) * 0.02 + 0.01).toFixed(3));
  let latitude = center(location.latitude, 90);
  const longitude = center(location.longitude, 180);
  // Even when an exact input happens to equal the cell center, never return the exact pair.
  if (latitude === location.latitude && longitude === location.longitude) latitude = Number((latitude - 0.005).toFixed(3));
  return { areaLabel: 'Approximate area (0.02° grid; not an address)', latitude, longitude };
}
export function distanceKm(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) {
  const rad = (degrees: number) => degrees * Math.PI / 180;
  const x = Math.sin(rad(b.latitude - a.latitude) / 2) ** 2 + Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(rad(b.longitude - a.longitude) / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(Math.min(1, x)), Math.sqrt(Math.max(0, 1 - x)));
}

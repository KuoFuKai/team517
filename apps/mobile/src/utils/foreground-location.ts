type Permission = { granted: boolean; canAskAgain: boolean };
interface LocationPort {
  permission(): Promise<Permission>;
  requestPermission(): Promise<Permission>;
  position(): Promise<{ coords: { latitude: number; longitude: number } }>;
}
export type ForegroundCenter = { status: 'AVAILABLE'; coordinate: { latitude: number; longitude: number } } | { status: 'DENIED' | 'UNAVAILABLE' };
// One user-triggered read, never a watcher. Keep denial for this app session so
// switching List/Map cannot cause repeated permission prompts. No persistence/API.
export function createForegroundLocator(port: LocationPort, timeoutMs = 12000) {
  let declined = false;
  return async (): Promise<ForegroundCenter> => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      let permission = await port.permission();
      if (!permission.granted && !declined && permission.canAskAgain) permission = await port.requestPermission();
      if (!permission.granted) { declined = true; return { status: 'DENIED' }; }
      // Time out the sensor read, not the person's permission decision.
      const position = await Promise.race([port.position(), new Promise<null>(resolve => { timer = setTimeout(() => resolve(null), timeoutMs); })]);
      if (!position) return { status: 'UNAVAILABLE' };
      const { coords } = position;
      if (!Number.isFinite(coords.latitude) || !Number.isFinite(coords.longitude) || Math.abs(coords.latitude) > 90 || Math.abs(coords.longitude) > 180) return { status: 'UNAVAILABLE' };
      return { status: 'AVAILABLE', coordinate: { latitude: coords.latitude, longitude: coords.longitude } };
    } catch { return { status: 'UNAVAILABLE' }; }
    finally { if (timer) clearTimeout(timer); }
  };
}

interface NativePushPort {
  getPermissionsAsync(): Promise<{ granted: boolean }>;
  requestPermissionsAsync(): Promise<{ granted: boolean }>;
  getDevicePushTokenAsync(): Promise<{ data: unknown }>;
}
export async function acquirePushToken(port: NativePushPort | null, requestPermission: boolean, refreshedToken?: string) {
  if (!port) return { state: 'unavailable' as const };
  let permission = await port.getPermissionsAsync();
  if (!permission.granted && requestPermission) permission = await port.requestPermissionsAsync();
  if (!permission.granted) return { state: 'denied' as const };
  // Expo emits a token listener event when its getter runs. Never call that
  // getter from a refresh event; consume the token already supplied by native.
  const token = refreshedToken ?? String((await port.getDevicePushTokenAsync()).data);
  return { state: 'granted' as const, token };
}

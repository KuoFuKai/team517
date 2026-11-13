import * as Location from 'expo-location';
import { createForegroundLocator } from '../utils/foreground-location';
export const locateOnce = createForegroundLocator({
  permission: () => Location.getForegroundPermissionsAsync(),
  requestPermission: () => Location.requestForegroundPermissionsAsync(),
  position: () => Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
});

import { useEffect } from 'react';
import { BackHandler } from 'react-native';
export function useHardwareBack(back: () => boolean) {
  useEffect(() => { const handler = BackHandler.addEventListener('hardwareBackPress', back); return () => handler.remove(); }, [back]);
}

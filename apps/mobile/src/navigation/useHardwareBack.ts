import { useEffect, useRef } from 'react';
import { BackHandler } from 'react-native';
import { createBackStack } from './back-stack';
const stack = createBackStack();
let subscription: ReturnType<typeof BackHandler.addEventListener> | undefined;
export function useHardwareBack(back: () => boolean, priority = 0) {
  const callback = useRef(back);
  callback.current = back;
  useEffect(() => {
    const remove = stack.register(() => callback.current(), priority);
    subscription ??= BackHandler.addEventListener('hardwareBackPress', () => stack.dispatch());
    return () => { remove(); if (!stack.size) { subscription?.remove(); subscription = undefined; } };
  }, [priority]);
}

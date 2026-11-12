import { createContext, useContext, useEffect } from 'react';

export const ScrollResetContext = createContext<() => void>(() => {});
// Feature screens share the root ScrollView. Reset only on navigation, never typing/refresh.
export function useScreenTop(screen: string | null) {
  const reset = useContext(ScrollResetContext);
  useEffect(() => {
    const frame = requestAnimationFrame(reset);
    return () => cancelAnimationFrame(frame);
  }, [screen, reset]);
}
export function useErrorScroll(error: string) {
  const reset = useContext(ScrollResetContext);
  useEffect(() => {
    if (!error) return;
    const frame = requestAnimationFrame(reset);
    return () => cancelAnimationFrame(frame);
  }, [error, reset]);
}

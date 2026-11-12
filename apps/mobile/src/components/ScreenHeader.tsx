import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
export interface HeaderOptions { title: string; back?: () => void; disabled?: boolean; priority?: number; enabled?: boolean }
type Entry = HeaderOptions & { key: symbol };
const HeaderContext = createContext<(entry: Entry) => () => void>(() => () => {});
export function useHeaderRegistry() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const register = useCallback((entry: Entry) => {
    setEntries(current => [...current, entry]);
    return () => setEntries(current => current.filter(item => item.key !== entry.key));
  }, []);
  const header = entries.reduce<Entry | undefined>((best, item) => !best || (item.priority ?? 0) >= (best.priority ?? 0) ? item : best, undefined);
  return { register, header };
}
export const ScreenHeaderProvider = HeaderContext.Provider;
export function useScreenHeader({ title, back, disabled, priority = 1, enabled = true }: HeaderOptions) {
  const register = useContext(HeaderContext), callback = useRef(back);
  callback.current = back;
  const hasBack = Boolean(back);
  useEffect(() => enabled ? register({ key: Symbol(title), title, priority, disabled, back: hasBack ? () => callback.current?.() : undefined }) : undefined, [register, title, priority, disabled, hasBack, enabled]);
}

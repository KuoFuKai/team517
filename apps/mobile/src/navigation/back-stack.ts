export function createBackStack() {
  let sequence = 0;
  const entries = new Map<number, { priority: number; callback: () => boolean }>();
  return {
    get size() { return entries.size; },
    register(callback: () => boolean, priority = 0) {
      const id = ++sequence;
      entries.set(id, { priority, callback });
      return () => { entries.delete(id); };
    },
    dispatch() {
      const ordered = [...entries].sort(([a, x], [b, y]) => y.priority - x.priority || b - a);
      for (const [, entry] of ordered) if (entry.callback()) return true;
      return false;
    },
  };
}

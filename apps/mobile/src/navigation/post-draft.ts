// A Post intent survives child unmounts while a notification is open.
export function createPostDraftSession<T>() {
  let pending: Promise<T> | undefined;
  return {
    get(create: () => Promise<T>) {
      if (!pending) {
        const request = create(); pending = request;
        void request.catch(() => { if (pending === request) pending = undefined; });
      }
      return pending;
    },
    reset() { pending = undefined; },
  };
}

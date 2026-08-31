import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

/** True after hydration; false during SSR so Playwright can wait for client state. */
export function useHydrated() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

import { useSyncExternalStore } from 'react';
import { FixedLoader } from '../components/FixedLoader.tsx';

let loadingCount = 0;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach(listener => listener());
}

function startLoading() {
  loadingCount++;
  emit();
}

function stopLoading() {
  loadingCount--;
  emit();
}

function useGlobalLoading() {
  return useSyncExternalStore(
    callback => {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
    () => loadingCount > 0,
  );
}

export function GlobalSwrLoader() {
  const isLoading = useGlobalLoading();

  if (!isLoading) {
    return null;
  }

  return <FixedLoader />;
}

export function createSwrLoadingFetcher<T, ARGS extends unknown[]>(fetcher: (...args: ARGS) => Promise<T>): (...args: ARGS) => Promise<T> {
  return async (...args: ARGS) => {
    try {
      startLoading();
      return fetcher(...args);
    } finally {
      stopLoading();
    }
  };
}

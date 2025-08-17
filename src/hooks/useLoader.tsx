import { createContext, useCallback, useContext, useState } from 'react';

interface LoaderState {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
}

const initialState: LoaderState = {
  isLoading: false,
  startLoading: () => undefined,
  stopLoading: () => undefined,
};

const LoaderContext = createContext(initialState);

export function LoaderProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(initialState.isLoading);

  const startLoading = useCallback(() => {
    setIsLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  return <LoaderContext.Provider value={{ isLoading, startLoading, stopLoading }}>{children}</LoaderContext.Provider>;
}

export function useLoader() {
  return useContext(LoaderContext);
}

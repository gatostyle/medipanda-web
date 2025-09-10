import { useSearchParams } from 'react-router-dom';

export function useSearchParamsOrDefault<T extends Record<string, string>>(defaults: T): T {
  const [urlSearchParams] = useSearchParams();

  const keys: string[] = Object.keys(defaults);
  const result: Record<string, string> = {};

  keys.forEach(key => {
    result[key] = urlSearchParams.get(key) ?? defaults[key];
  });

  return result as T;
}

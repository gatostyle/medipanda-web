import { useSearchParams } from 'react-router-dom';

export function useSearchParamsOrDefault<T extends Record<string, string>>(defaults: T): T {
  const [urlSearchParams] = useSearchParams();

  const keys = Object.keys(defaults) as string[];
  const result: Record<string, string> = {};

  keys.forEach(key => {
    result[key] = urlSearchParams.get(key) ?? defaults[key];
  });

  return result as T;
}

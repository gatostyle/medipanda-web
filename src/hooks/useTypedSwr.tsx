import useSWR from 'swr';

export const useTypedSwr: <T, Args extends unknown[]>(
  args: Args,
  fetcher: (...args: Args) => Promise<T>,
  options?: Parameters<typeof useSWR>[2],
) => ReturnType<typeof useSWR<T, Args>> = useSWR;

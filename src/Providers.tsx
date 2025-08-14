import type { ReactNode } from 'react';
import { SessionProvider } from './hooks/useSession.tsx';

export function Providers({ children }: { children?: ReactNode }) {
  return (
    <>
      <SessionProvider>{children}</SessionProvider>
    </>
  );
}

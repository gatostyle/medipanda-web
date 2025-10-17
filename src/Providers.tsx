import { MpModalProvider } from '@/hooks/useMpModal';
import { type ReactNode } from 'react';
import { MpDeleteDialogProvider } from '@/hooks/useMpDeleteDialog';
import { SessionProvider } from '@/hooks/useSession';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <MpModalProvider>
        <MpDeleteDialogProvider>{children}</MpDeleteDialogProvider>
      </MpModalProvider>
    </SessionProvider>
  );
}

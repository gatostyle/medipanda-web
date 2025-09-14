import { MpModalProvider } from '@/medipanda/hooks/useMpModal';
import { ReactNode } from 'react';
import { MpDeleteDialogProvider } from './hooks/useMpDeleteDialog';
import { MpMenuProvider } from './hooks/useMpMenu';
import { SessionProvider } from './hooks/useSession';

export function MpProviders({ children }: { children: ReactNode }) {
  return (
    <MpMenuProvider>
      <SessionProvider>
        <MpModalProvider>
          <MpDeleteDialogProvider>{children}</MpDeleteDialogProvider>
        </MpModalProvider>
      </SessionProvider>
    </MpMenuProvider>
  );
}

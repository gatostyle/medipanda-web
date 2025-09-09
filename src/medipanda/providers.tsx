import { ReactNode } from 'react';
import { MpDeleteDialogProvider } from './hooks/useMpDeleteDialog';
import { MpErrorDialogProvider } from './hooks/useMpErrorDialog';
import { MpInfoDialogProvider } from './hooks/useMpInfoDialog';
import { MpMenuProvider } from './hooks/useMpMenu';
import { SessionProvider } from './hooks/useSession';

export function MpProviders({ children }: { children: ReactNode }) {
  return (
    <MpMenuProvider>
      <SessionProvider>
        <MpInfoDialogProvider>
          <MpErrorDialogProvider>
            <MpDeleteDialogProvider>{children}</MpDeleteDialogProvider>
          </MpErrorDialogProvider>
        </MpInfoDialogProvider>
      </SessionProvider>
    </MpMenuProvider>
  );
}

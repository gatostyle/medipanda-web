import { ReactNode } from 'react';
import { MpDeleteDialogProvider } from './hooks/useMpDeleteDialog';
import { MpErrorDialogProvider } from './hooks/useMpErrorDialog';
import { MpInfoDialogProvider } from './hooks/useMpInfoDialog';
import { MpMenuProvider } from './hooks/useMpMenu';
import { MpNotImplementedDialogProvider } from './hooks/useMpNotImplementedDialog';
import { SessionProvider } from './hooks/useSession';

export function MpProviders({ children }: { children: ReactNode }) {
  return (
    <MpMenuProvider>
      <SessionProvider>
        <MpInfoDialogProvider>
          <MpErrorDialogProvider>
            <MpNotImplementedDialogProvider>
              <MpDeleteDialogProvider>{children}</MpDeleteDialogProvider>
            </MpNotImplementedDialogProvider>
          </MpErrorDialogProvider>
        </MpInfoDialogProvider>
      </SessionProvider>
    </MpMenuProvider>
  );
}

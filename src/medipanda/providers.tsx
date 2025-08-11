import { ReactNode } from 'react';
import { MpDeleteDialogProvider } from './hooks/useMpDeleteDialog';
import { MpErrorDialogProvider } from './hooks/useMpErrorDialog';
import { MpInfoDialogProvider } from './hooks/useMpInfoDialog';
import { MpMenuProvider } from './hooks/useMpMenu';
import { MpNotImplementedDialogProvider } from './hooks/useMpNotImplementedDialog';
import { MpSessionProvider } from './hooks/useMpSession';

export function MpProviders({ children }: { children: ReactNode }) {
  return (
    <MpMenuProvider>
      <MpSessionProvider>
        <MpInfoDialogProvider>
          <MpErrorDialogProvider>
            <MpNotImplementedDialogProvider>
              <MpDeleteDialogProvider>{children}</MpDeleteDialogProvider>
            </MpNotImplementedDialogProvider>
          </MpErrorDialogProvider>
        </MpInfoDialogProvider>
      </MpSessionProvider>
    </MpMenuProvider>
  );
}

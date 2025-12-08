import Notistack from '@/_able/components/third-party/Notistack';
import ThemeCustomization from '@/_able/themes';
import { MpDeleteDialogProvider } from '@/hooks/useMpDeleteDialog';
import { MpModalProvider } from '@/hooks/useMpModal';
import { SessionProvider } from '@/hooks/useSession';
import { type ReactNode } from 'react';

export function AdminProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeCustomization>
      <Notistack>
        <SessionProvider>
          <MpModalProvider>
            <MpDeleteDialogProvider>{children}</MpDeleteDialogProvider>
          </MpModalProvider>
        </SessionProvider>
      </Notistack>
    </ThemeCustomization>
  );
}

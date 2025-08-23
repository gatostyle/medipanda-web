import { LoaderProvider } from '@/hooks/useLoader';
import { SessionProvider } from '@/hooks/useSession';
import { BasicModalProvider } from '@/lib/react/useBasicModal';
import { MedipandaTheme } from '@/themes';
import { ThemeProvider } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ko } from 'date-fns/locale';
import type { ReactNode } from 'react';

export function Providers({ children }: { children?: ReactNode }) {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
      <LoaderProvider>
        <SessionProvider>
          <ThemeProvider theme={MedipandaTheme}>
            <BasicModalProvider>{children}</BasicModalProvider>
          </ThemeProvider>
        </SessionProvider>
      </LoaderProvider>
    </LocalizationProvider>
  );
}

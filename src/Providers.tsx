import { ThemeProvider } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ko } from 'date-fns/locale';
import type { ReactNode } from 'react';
import { MedipandaTheme } from './custom/themes.ts';
import { LoaderProvider } from './hooks/useLoader.tsx';
import { SessionProvider } from './hooks/useSession.tsx';
import { GlobalSwrLoader } from './module/GlobalLoader.tsx';

export function Providers({ children }: { children?: ReactNode }) {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
      <GlobalSwrLoader />
      <LoaderProvider>
        <SessionProvider>
          <ThemeProvider theme={MedipandaTheme}>{children}</ThemeProvider>
        </SessionProvider>
      </LoaderProvider>
    </LocalizationProvider>
  );
}

import { colors } from '@/themes';
import { createTheme, Switch, type SwitchProps, ThemeProvider } from '@mui/material';

const medipandaSwtichTheme = createTheme({
  palette: {
    primary: {
      main: colors.vividViolet,
      contrastText: colors.white,
    },
    secondary: {
      main: colors.navy,
      contrastText: colors.white,
    },
  },
});

export function MedipandaSwitch(props: SwitchProps): ReturnType<typeof Switch> {
  return (
    <ThemeProvider theme={medipandaSwtichTheme}>
      <Switch {...props} />
    </ThemeProvider>
  );
}

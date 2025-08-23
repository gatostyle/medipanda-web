import { colors } from '@/themes';
import { createTheme, Checkbox, type CheckboxProps, ThemeProvider } from '@mui/material';

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

export function MedipandaCheckbox(props: CheckboxProps): ReturnType<typeof Checkbox> {
  return (
    <ThemeProvider theme={medipandaSwtichTheme}>
      <Checkbox {...props} />
    </ThemeProvider>
  );
}

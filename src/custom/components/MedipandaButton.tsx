import { colors, typography } from '@/themes';
import { Button, type ButtonProps, type ButtonTypeMap, createTheme, type ExtendButtonBase, ThemeProvider } from '@mui/material';

const medipandaButtonTheme = createTheme({
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
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  typography: {
    allVariants: {
      fontFamily: 'Pretendard',
      whiteSpace: 'nowrap',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          variants: [
            {
              props: { rounded: true },
              style: {
                borderRadius: '30px',
              },
            },
            {
              props: { size: 'small' },
              style: {
                ...typography.smallTextM,
                height: '30px',
              },
            },
            {
              props: { size: 'medium' },
              style: {
                ...typography.largeTextB,
                height: '40px',
              },
            },
            {
              props: { size: 'large' },
              style: {
                ...typography.heading5B,
                height: '50px',
              },
            },
          ],
        },
      },
    },
  },
});

interface ExtendedProps {
  rounded?: boolean;
}

export const MedipandaButton = ((props: ButtonProps) => (
  <ThemeProvider theme={medipandaButtonTheme}>
    <Button {...props} />
  </ThemeProvider>
)) as ExtendButtonBase<ButtonTypeMap<ExtendedProps>>;

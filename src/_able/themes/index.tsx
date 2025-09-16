import { type ReactNode, useMemo } from 'react';

// material-ui
import { createTheme, type ThemeOptions, ThemeProvider, type Theme, type TypographyVariantsOptions } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
// import StyledEngineProvider from '@mui/material/StyledEngineProvider';

// project-imports
import Palette from './palette';
import Typography from './typography';
import CustomShadows from './shadows';
import componentsOverride from './overrides';

// types
import { type CustomShadowProps } from '@/_able/types/theme';

interface ThemeCustomizationProps {
  children: ReactNode;
}

// ==============================|| DEFAULT THEME - MAIN  ||============================== //

export default function ThemeCustomization({ children }: ThemeCustomizationProps) {
  const theme: Theme = useMemo<Theme>(() => Palette(), []);

  const themeTypography: TypographyVariantsOptions = useMemo<TypographyVariantsOptions>(
    () => Typography('Pretendard'),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const themeCustomShadows: CustomShadowProps = useMemo<CustomShadowProps>(() => CustomShadows(theme), [theme]);

  const themeOptions: ThemeOptions = useMemo(
    () => ({
      breakpoints: {
        values: {
          xs: 0,
          sm: 768,
          md: 1024,
          lg: 1266,
          xl: 1440,
        },
      },
      direction: 'ltr',
      mixins: {
        toolbar: {
          paddingTop: 8,
          paddingBottom: 8,
        },
      },
      palette: theme.palette,
      shape: {
        borderRadius: 8,
      },
      customShadows: themeCustomShadows,
      typography: themeTypography,
    }),
    [theme, themeTypography, themeCustomShadows],
  );

  const themes: Theme = createTheme(themeOptions);
  themes.components = componentsOverride(themes);

  return (
    <ThemeProvider theme={themes}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

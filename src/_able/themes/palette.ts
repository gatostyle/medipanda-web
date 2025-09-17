// material-ui
import { alpha, createTheme } from '@mui/material/styles';

// project-imports
import ThemeOption from './theme';

// types
import { type PaletteThemeProps } from '../types/theme';

// ==============================|| DEFAULT THEME - PALETTE  ||============================== //

export default function Palette() {
  const paletteColor: PaletteThemeProps = ThemeOption();

  return createTheme({
    palette: {
      mode: 'light',
      common: {
        black: '#000',
        white: '#fff',
      },
      ...paletteColor,
      text: {
        primary: paletteColor.secondary[800],
        secondary: paletteColor.secondary.main,
        disabled: paletteColor.secondary[400],
      },
      action: {
        disabled: paletteColor.secondary.light,
      },
      divider: alpha(paletteColor.secondary.light!, 0.65),
      background: {
        paper: '#fff',
        default: paletteColor.secondary.lighter,
      },
    },
  });
}

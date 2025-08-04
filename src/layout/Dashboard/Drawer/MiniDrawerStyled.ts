// material-ui
import { styled, Theme, CSSObject } from '@mui/material/styles';
import Drawer from '@mui/material/Drawer';

// project-imports
import { DRAWER_WIDTH, ThemeMode } from 'config';

const openedMixin = (theme: Theme) =>
  ({
    backgroundColor: theme.palette.background.default,
    width: DRAWER_WIDTH,
    borderRight: `1px dashed ${theme.palette.mode === ThemeMode.DARK ? theme.palette.secondary[200] : theme.palette.secondary[400]}`,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    }),
    overflowX: 'hidden',
    boxShadow: theme.palette.mode === ThemeMode.DARK ? theme.customShadows.z1 : 'none'
  }) as CSSObject;

// ==============================|| DRAWER - MINI STYLED ||============================== //

const MiniDrawerStyled = styled(Drawer, { shouldForwardProp: (prop) => prop !== 'open' })(({ theme }) => ({
  width: DRAWER_WIDTH,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  ...openedMixin(theme),
  '& .MuiDrawer-paper': openedMixin(theme)
}));

export default MiniDrawerStyled;

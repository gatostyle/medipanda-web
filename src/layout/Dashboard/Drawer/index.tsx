import { useMemo } from 'react';

// material-ui
import Box from '@mui/material/Box';

// project-imports
import DrawerContent from './DrawerContent';
import MiniDrawerStyled from './MiniDrawerStyled';

import { useGetMenuMaster } from 'api/menu';

// ==============================|| MAIN LAYOUT - DRAWER ||============================== //

export default function MainDrawer() {
  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;

  // header content
  const drawerContent = useMemo(() => <DrawerContent />, []);

  return (
    <Box component='nav' sx={{ flexShrink: { md: 0 }, zIndex: 1200 }} aria-label='mailbox folders'>
      <MiniDrawerStyled variant='permanent' open={drawerOpen}>
        {drawerContent}
      </MiniDrawerStyled>
    </Box>
  );
}

import { Outlet, useLocation } from 'react-router-dom';

// material-ui
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ko from 'date-fns/locale/ko';

// project-imports
import Drawer from './Drawer';
import Header from './Header';
import Loader from 'components/Loader';
import Breadcrumbs from 'components/@extended/Breadcrumbs';

import { DRAWER_WIDTH } from 'config';
import useConfig from 'hooks/useConfig';
import { useGetMenuMaster } from 'api/menu';
import { MpAdminGuard, MpMemberGuard } from 'medipanda/utils/route-guard';

// ==============================|| MAIN LAYOUT ||============================== //

export default function MainLayout() {
  const location = useLocation();

  const { menuMasterLoading } = useGetMenuMaster();

  const { container } = useConfig();

  if (menuMasterLoading) return <Loader />;

  const RoleGuard = location.pathname.startsWith('/admin') ? MpAdminGuard : MpMemberGuard;

  return (
    <RoleGuard>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
        <Box sx={{ display: 'flex', width: '100%' }}>
          <Header />
          <Drawer />

          <Box component="main" sx={{ width: `calc(100% - ${DRAWER_WIDTH}px)`, flexGrow: 1, p: { xs: 2, md: 3 } }}>
            <Toolbar sx={{ mt: 'inherit', mb: 'inherit' }} />
            <Container
              maxWidth={container ? 'xl' : false}
              sx={{
                xs: 0,
                ...(container && { px: { xs: 0, md: 2 } }),
                position: 'relative',
                minHeight: 'calc(100vh - 110px)',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Breadcrumbs />
              <Outlet />
            </Container>
          </Box>
        </Box>
      </LocalizationProvider>
    </RoleGuard>
  );
}

import { useSession } from '@/medipanda/hooks/useSession';
import { isLeafMenuItem, type MenuItem } from '@/medipanda/menus';
import { Circle } from '@mui/icons-material';
import {
  Box,
  Collapse,
  Container,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ko } from 'date-fns/locale';
import { ArrowDown2, ArrowUp2, Copy, Logout } from 'iconsax-reactjs';
import { Fragment, useState } from 'react';
import { Outlet, Link as RouterLink, useLocation } from 'react-router-dom';

function matchesPath(menuItem: MenuItem, currentPath: string): boolean {
  if (isLeafMenuItem(menuItem)) {
    return currentPath.startsWith(menuItem.path);
  }

  return menuItem.children.some(child => matchesPath(child, currentPath));
}

// ==============================|| MAIN LAYOUT ||============================== //

function MenuList({
  menuItems,
  openedMenus,
  setOpenedMenus,
}: {
  menuItems: MenuItem[];
  openedMenus: MenuItem[];
  setOpenedMenus: (openedMenus: MenuItem[]) => void;
}) {
  const location = useLocation();

  const theme = useTheme();
  const primaryColor = theme.palette.primary.main;

  return (
    <>
      {menuItems.map(menuItem => {
        const active = matchesPath(menuItem, location.pathname);
        const isOpened = openedMenus.includes(menuItem) || active;
        const textColor = active ? primaryColor : undefined;

        return (
          <Fragment key={menuItem.label}>
            {isLeafMenuItem(menuItem) ? (
              <>
                <ListItemButton onClick={() => setOpenedMenus([])} component={RouterLink} to={menuItem.path} sx={{ color: textColor }}>
                  <ListItemIcon sx={{ width: '40px' }}>
                    <Circle
                      sx={{
                        width: '24px',
                        fontSize: '6px',
                        color: textColor,
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText primary={menuItem.label} />
                </ListItemButton>
              </>
            ) : (
              <>
                <ListItemButton
                  onClick={() => {
                    setOpenedMenus(isOpened ? openedMenus.filter(m => m !== menuItem) : [...openedMenus, menuItem]);
                  }}
                  sx={{ color: textColor }}
                >
                  <ListItemIcon sx={{ width: '40px' }}>
                    <Copy variant='Bulk' color={textColor} />
                  </ListItemIcon>
                  <ListItemText primary={menuItem.label} />
                  {isOpened ? (
                    <ArrowUp2 size={12} color={textColor} style={{ marginLeft: 1 }} />
                  ) : (
                    <ArrowDown2 size={12} color={textColor} style={{ marginLeft: 1 }} />
                  )}
                </ListItemButton>
                <Collapse in={isOpened} timeout='auto' unmountOnExit>
                  <List disablePadding>
                    <MenuList menuItems={menuItem.children} openedMenus={openedMenus} setOpenedMenus={setOpenedMenus} />
                  </List>
                </Collapse>
              </>
            )}
          </Fragment>
        );
      })}
    </>
  );
}

export default function DashboardLayout() {
  const drawerWidth = '280px';

  const { session, menus } = useSession();

  const [openedMenus, setOpenedMenus] = useState<MenuItem[]>([]);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: 'unset',
          },
        }}
        variant='permanent'
        anchor='left'
      >
        <Stack sx={{ padding: '10px 24px' }}>
          <Typography variant='h5'>
            {session!.name}({session!.userId})
          </Typography>
        </Stack>
        <Divider />
        <List sx={{ paddingX: '15px' }}>
          <MenuList menuItems={menus} openedMenus={openedMenus} setOpenedMenus={setOpenedMenus} />
        </List>
      </Drawer>

      <Box
        component='main'
        sx={{
          flexGrow: 1,
          width: `calc(100% - ${drawerWidth})`,
          marginLeft: drawerWidth,
          padding: 3,
        }}
      >
        <Stack sx={{ justifyContent: 'center' }}>
          <IconButton
            size='large'
            color='error'
            component={RouterLink}
            to='/logout'
            sx={{
              alignSelf: 'flex-end',
              p: 1,
            }}
          >
            <Logout variant='Bulk' />
          </IconButton>
        </Stack>
        <Container
          sx={{
            xs: 0,
            position: 'relative',
            minHeight: 'calc(100vh - 110px)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Outlet />
        </Container>
      </Box>
    </LocalizationProvider>
  );
}

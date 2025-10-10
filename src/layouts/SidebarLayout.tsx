import { colors, typography } from '@/themes';
import { List, ListItemButton, ListItemText, Stack, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { memo } from 'react';
import { Link as RouterLink, Outlet, useLocation } from 'react-router-dom';

const SidebarLink = styled(ListItemButton)({
  color: colors.gray80,
  width: '250px',
  height: '55px',
  '& .MuiListItemText-root .MuiTypography-root': {
    ...typography.heading5B,
  },
  '&.Mui-selected': {
    backgroundColor: colors.vividViolet,
    color: colors.white,
    '&:hover': {
      backgroundColor: colors.vividViolet,
    },
  },
}) as typeof ListItemButton;

interface SidebarLayoutProps {
  title: string;
  tabConfig: { label: string; to: string }[];
}

function SidebarLayout({ title, tabConfig }: SidebarLayoutProps) {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <Stack direction='row'>
      <Stack>
        <Typography variant='heading3M' sx={{ color: colors.gray80 }}>
          {title}
        </Typography>
        <List
          sx={{
            p: 0,
            mt: '30px',
          }}
        >
          {tabConfig.map(({ label, to }) => (
            <SidebarLink
              key={to}
              component={RouterLink}
              to={to}
              selected={new URL(currentPath, window.location.origin).pathname.startsWith(to)}
            >
              <ListItemText primary={label} />
            </SidebarLink>
          ))}
        </List>
      </Stack>
      <Stack
        sx={{
          flexGrow: 1,
          marginLeft: '60px',
        }}
      >
        <Outlet />
      </Stack>
    </Stack>
  );
}

export default memo(SidebarLayout);

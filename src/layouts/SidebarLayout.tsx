import { Box, List, ListItemButton, ListItemText, Stack, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { memo } from 'react';
import { Link as RouterLink, Outlet, useLocation } from 'react-router';
import { colors, typography } from '../globalStyles.ts';

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
        <Typography
          sx={{
            ...typography.heading3B,
            color: colors.gray80,
          }}
        >
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
              selected={new URL(to, window.location.origin).pathname.startsWith(currentPath)}
            >
              <ListItemText primary={label} />
            </SidebarLink>
          ))}
        </List>
      </Stack>
      <Box
        sx={{
          flexGrow: 1,
          marginLeft: '60px',
        }}
      >
        <Outlet />
      </Box>
    </Stack>
  );
}

export default memo(SidebarLayout);

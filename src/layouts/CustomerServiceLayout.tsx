import { Box, Container, List, ListItem, ListItemButton, ListItemText, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link as RouterLink, Outlet, useLocation } from 'react-router';

const StyledContainer = styled(Container)({
  maxWidth: '1200px !important',
  padding: '0 !important',
  display: 'flex',
  minHeight: 'calc(100vh - 160px)',
});

const Sidebar = styled(Box)({
  width: 240,
  flexShrink: 0,
  paddingTop: 32,
  paddingRight: 32,
});

const MainContent = styled(Box)({
  flexGrow: 1,
  padding: '32px 0',
  borderLeft: '1px solid #e0e0e0',
  paddingLeft: 48,
});

const SidebarLink = styled(ListItemButton)({
  borderRadius: 0,
  padding: '12px 0',
  justifyContent: 'flex-start',
  '&.Mui-selected': {
    backgroundColor: 'transparent',
    color: '#6B3AA0',
    fontWeight: 'bold',
    '&:hover': {
      backgroundColor: 'transparent',
    },
  },
  '&:hover': {
    backgroundColor: 'transparent',
    color: '#6B3AA0',
  },
});

const sidebarItems = [
  { path: '/customer-service/notice', label: '공지사항' },
  { path: '/customer-service/faq', label: 'FAQ' },
  { path: '/customer-service/inquiry', label: '1:1 문의내역' },
];

export default function CustomerServiceLayout() {
  const location = useLocation();

  return (
    <StyledContainer>
      <Sidebar>
        <Typography variant='h5' sx={{ mb: 4, fontWeight: 'bold', color: '#333' }}>
          고객센터
        </Typography>
        <List sx={{ p: 0 }}>
          {sidebarItems.map(item => (
            <ListItem key={item.path} sx={{ p: 0 }}>
              <SidebarLink component={RouterLink} to={item.path} selected={location.pathname.startsWith(item.path)} sx={{ width: '100%' }}>
                <ListItemText
                  primary={item.label}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontSize: '16px',
                      fontWeight: location.pathname.startsWith(item.path) ? 'bold' : 'normal',
                    },
                  }}
                />
              </SidebarLink>
            </ListItem>
          ))}
        </List>
      </Sidebar>
      <MainContent>
        <Outlet />
      </MainContent>
    </StyledContainer>
  );
}

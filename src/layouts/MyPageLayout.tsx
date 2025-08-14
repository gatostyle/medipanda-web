import { Box, Container, List, ListItemButton, ListItemText, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link as RouterLink, Outlet } from 'react-router';
import GlobalLayout from './GlobalLayout';

const StyledContainer = styled(Container)({
  maxWidth: '1224px !important',
  padding: '0 24px !important',
  display: 'flex',
  minHeight: 'calc(100vh - 64px - 250px)', // Adjust based on header/footer height
});

const Sidebar = styled(Box)({
  width: 240,
  flexShrink: 0,
  paddingTop: 32,
  borderRight: '1px solid #e0e0e0',
});

const MainContent = styled(Box)({
  flexGrow: 1,
  padding: '32px 48px',
});

const SidebarLink = styled(ListItemButton)({
  borderRadius: '8px',
  marginBottom: '8px',
  '&.Mui-selected': {
    backgroundColor: '#6B3AA0',
    color: '#fff',
    '&:hover': {
      backgroundColor: '#6B3AA0',
    },
  },
});

export default function MyPageLayout() {
  const currentPath = window.location.pathname;

  return (
    <GlobalLayout>
      <StyledContainer>
        <Sidebar>
          <Typography variant='h6' sx={{ mb: 3, fontWeight: 'bold' }}>
            마이페이지
          </Typography>
          <List>
            <SidebarLink component={RouterLink} to='/mypage/info' selected={currentPath === '/mypage/info'}>
              <ListItemText primary='내정보관리' />
            </SidebarLink>
            <SidebarLink component={RouterLink} to='/mypage/notification' selected={currentPath === '/mypage/notification'}>
              <ListItemText primary='수신설정' />
            </SidebarLink>
            <SidebarLink component={RouterLink} to='/mypage/withdraw' selected={currentPath === '/mypage/withdraw'}>
              <ListItemText primary='회원탈퇴' />
            </SidebarLink>
          </List>
        </Sidebar>
        <MainContent>
          <Outlet />
        </MainContent>
      </StyledContainer>
    </GlobalLayout>
  );
}

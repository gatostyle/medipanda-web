import { AccountCircle, NotificationsNone } from '@mui/icons-material';
import { AppBar, Box, Button, Container, Toolbar, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link as RouterLink, Outlet, useLocation } from 'react-router';

const StyledContainer = styled(Container)({
  maxWidth: '1200px !important',
  padding: '0 !important',
});

const NavLink = styled(RouterLink)(({ to, currentPath }) => ({
  color: to === currentPath ? '#6B3AA0' : '#333',
  textDecoration: 'none',
  fontSize: '14px',
  fontWeight: to === currentPath ? 'bold' : 500,
  cursor: 'pointer',
  '&:hover': {
    color: '#6B3AA0',
  },
}));

const FooterLink = styled(RouterLink)({
  color: '#666',
  fontSize: '13px',
  textDecoration: 'none',
  '&:hover': {
    textDecoration: 'underline',
  },
});

const Footer = styled('footer')({
  backgroundColor: '#f8f8f8',
  padding: '48px 0',
  marginTop: 'auto',
  borderTop: '1px solid #e0e0e0',
});

const navItems = [
  { path: '/products', label: '제품검색' },
  { path: '/performance', label: '실적관리' },
  { path: '/settlements', label: '정산' },
  { path: '/community/anonymous', label: '커뮤니티' },
  { path: '/sales-agency/products', label: '영업대행상품' },
  { path: '/events', label: '이벤트' },
  { path: '/customer-service/notice', label: '공지사항' },
];

export default function GlobalLayout() {
  const location = useLocation();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position='static' color='transparent' elevation={0} sx={{ borderBottom: '1px solid #e0e0e0', backgroundColor: '#fff' }}>
        <StyledContainer>
          <Toolbar sx={{ minHeight: '80px' }}>
            <Typography
              component={RouterLink}
              to='/'
              variant='h6'
              sx={{
                color: '#333',
                fontWeight: 'bold',
                fontSize: '22px',
                letterSpacing: '-0.5px',
                textDecoration: 'none',
                '&:hover': {
                  color: '#333',
                },
              }}
            >
              medi<span style={{ color: '#6B3AA0' }}>panda</span>
            </Typography>
            <Box sx={{ display: 'flex', gap: 3.5, ml: 5, flexGrow: 1 }}>
              {navItems.map(item => (
                <NavLink key={item.path} to={item.path} currentPath={location.pathname}>
                  {item.label}
                </NavLink>
              ))}
            </Box>
            <Button
              component={RouterLink}
              to='/mypage/info'
              size='small'
              sx={{
                color: '#6B3AA0',
                textDecoration: 'underline',
                fontSize: '13px',
                mr: 1.5,
                textTransform: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                  backgroundColor: 'transparent',
                },
              }}
            >
              홍길동 님
            </Button>
            <NotificationsNone sx={{ color: '#6B3AA0', fontSize: '28px', mr: 1.5 }} />
            <AccountCircle sx={{ color: '#6B3AA0', fontSize: '28px' }} />
          </Toolbar>
        </StyledContainer>
      </AppBar>

      <Box component='main' sx={{ flexGrow: 1, py: 4 }}>
        <StyledContainer>
          <Outlet />
        </StyledContainer>
      </Box>

      <Footer>
        <StyledContainer>
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
              <Box>
                <FooterLink to='/terms' sx={{ mr: 2 }}>
                  이용약관
                </FooterLink>
                <span style={{ color: '#ccc', margin: '0 8px' }}>|</span>
                <FooterLink to='/privacy' sx={{ mx: 2 }}>
                  개인정보처리방침
                </FooterLink>
                <span style={{ color: '#ccc', margin: '0 8px' }}>|</span>
                <FooterLink to='/partnership' sx={{ ml: 2 }}>
                  제휴문의
                </FooterLink>
              </Box>
              <Typography
                sx={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#333',
                  letterSpacing: '-0.5px',
                }}
              >
                medi<span style={{ color: '#6B3AA0' }}>panda</span>
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '12px', color: '#999', lineHeight: 1.6 }}>
              법인명 : (주)케이앤메디슨 | 서울시 강남구 논현로 416, 4층 운기빌딩(역삼동) | 대표 : 황혁진 | 사업자등록번호 : 338-81-00767
            </Typography>
            <Typography sx={{ fontSize: '12px', color: '#999', lineHeight: 1.6 }}>
              팩스 : 02-6280-6393 | 이메일 : keymedi@keymedi.com
            </Typography>
            <Typography sx={{ fontSize: '12px', color: '#999', lineHeight: 1.6 }}>
              대표전화 : 02-540-0703 | 고객센터 : 오전 10시~오후 5시(토/일/공휴일 휴무)
            </Typography>
            <Typography sx={{ fontSize: '12px', color: '#999', lineHeight: 1.6 }}>
              통신판매번호 : 제2017-서울강남-03514호 | 개인정보관리책임자 : 강승균 | 메일 : keymedi@keymedi.com | Copyright©keymedi All
              Rights Reserved.
            </Typography>
          </Box>
        </StyledContainer>
      </Footer>
    </Box>
  );
}

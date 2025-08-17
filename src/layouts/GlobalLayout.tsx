import { Box, Container, Stack, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useSession } from 'hooks/useSession';
import { memo } from 'react';
import { Link as RouterLink, Outlet, useLocation } from 'react-router';
import { MedipandaTextLink } from '../custom/components/MedipandaTextLink.tsx';
import { colors, typography } from '../globalStyles.ts';

const StyledContainer = styled(Container)({
  maxWidth: '1224px !important',
  padding: '0 !important',
});

const NavLink = styled(RouterLink)({
  textDecoration: 'none',
  ...typography.heading4B,
  cursor: 'pointer',
  '&:hover': {
    color: colors.vividViolet,
  },
});

const FooterLink = styled(RouterLink)({
  ...typography.mediumTextB,
  color: colors.white,
  textDecoration: 'none',
  '&:hover': {
    textDecoration: 'underline',
  },
});

const Footer = styled('footer')({
  backgroundColor: colors.gray70,
  color: '#ffffff',
});

const navItems = [
  { path: '/products', label: '제품검색' },
  { path: '/prescriptions', label: '실적관리' },
  { path: '/settlements', label: '정산' },
  { path: '/community/anonymous', label: '커뮤니티' },
  { path: '/sales-agency-products', label: '영업대행상품' },
  { path: '/events', label: '이벤트' },
  { path: '/customer-service/notice', label: '공지사항' },
];

function GlobalLayout() {
  const location = useLocation();
  const currentPath = location.pathname;
  const { session } = useSession();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Box sx={{ height: '150px', display: 'flex', alignItems: 'center', borderBottom: `1px solid ${colors.gray40}` }}>
        <StyledContainer>
          <Stack
            direction='row'
            justifyContent='space-between'
            alignItems='center'
            sx={{
              height: '50px',
            }}
          >
            <Box
              component={RouterLink}
              to='/'
              sx={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
              }}
            >
              <img src='/assets/logo.svg' alt='medipanda' width='230' height='43' />
            </Box>
            <Box sx={{ display: 'flex', gap: 4 }}>
              {navItems.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  sx={{
                    color: currentPath.startsWith(item.path) ? colors.vividViolet : colors.gray80,
                  }}
                >
                  {item.label}
                </NavLink>
              ))}
            </Box>
            <Stack direction='row' alignItems='center'>
              <Box sx={{ mr: 1.5 }}>
                {session ? (
                  <>
                    <MedipandaTextLink
                      component={RouterLink}
                      to='/mypage/info'
                      sx={{
                        ...typography.heading5B,
                      }}
                    >
                      {session.name}
                    </MedipandaTextLink>
                    <Typography
                      component='span'
                      sx={{
                        ...typography.heading5R,
                        color: colors.navy,
                      }}
                    >
                      님
                    </Typography>
                  </>
                ) : (
                  <MedipandaTextLink
                    component={RouterLink}
                    to='/login'
                    sx={{
                      ...typography.heading5B,
                    }}
                  >
                    로그인
                  </MedipandaTextLink>
                )}
              </Box>
              <Box>
                <img src='/assets/icons/icon-bell.svg' width={48} height={48} style={{ display: 'block' }} />
              </Box>
            </Stack>
          </Stack>
        </StyledContainer>
      </Box>

      <Box component='main' sx={{ flexGrow: 1, my: '50px' }}>
        <StyledContainer>
          <Outlet />
        </StyledContainer>
      </Box>

      <Footer>
        <StyledContainer>
          <Stack
            direction='row'
            alignItems='center'
            sx={{
              height: '150px',
              paddingY: '20px',
              boxSizing: 'border-box',
            }}
          >
            <img src='/assets/logo-dark.svg' style={{ height: '34px' }} />
            <Stack sx={{ ml: '104px' }}>
              <Stack direction='row' sx={{ mb: '20px' }}>
                <FooterLink to='/terms'>이용약관</FooterLink>
                <span style={{ color: colors.white, margin: '0 8px' }}>|</span>
                <FooterLink to='/privacy'>개인정보처리방침</FooterLink>
                <span style={{ color: colors.white, margin: '0 8px' }}>|</span>
                <FooterLink to='/partnership'>제휴문의</FooterLink>
              </Stack>
              <Typography sx={{ ...typography.smallTextR, color: colors.white }}>
                법인명 : (주)케이앤메디슨 | 서울시 강남구 논현로 416, 4층 운기빌딩(역삼동) | 대표 : 황혁진 | 사업자등록번호 : 338-81-00767
              </Typography>
              <Typography sx={{ ...typography.smallTextR, color: colors.white }}>
                팩스 : 02-6280-6393 | 이메일 : keymedi@keymedi.com
              </Typography>
              <Typography sx={{ ...typography.smallTextR, color: colors.white }}>
                대표전화 : 02-540-0703 | 고객센터 : 오전 10시~오후 5시(토/일/공휴일 휴무)
              </Typography>
              <Typography sx={{ ...typography.smallTextR, color: colors.white }}>
                통신판매번호 : 제2017-서울강남-03514호 | 개인정보관리책임자 : 강승균 | 메일 : keymedi@keymedi.com | Copyright©keymedi All
                Rights Reserved.
              </Typography>
            </Stack>
          </Stack>
        </StyledContainer>
      </Footer>
    </Box>
  );
}

export default memo(GlobalLayout);

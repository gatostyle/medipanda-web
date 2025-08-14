import { AccountCircle } from '@mui/icons-material';
import { AppBar, Box, Button, Container, Toolbar, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Outlet } from 'react-router';

const StyledContainer = styled(Container)({
  maxWidth: '1224px !important',
  padding: '0 24px !important',
});

const Footer = styled('footer')({
  backgroundColor: '#f8f8f8',
  padding: '48px 0',
  marginTop: 'auto',
  borderTop: '1px solid #e0e0e0',
});

export default function PublicLayout() {
  return (
    <>
      <AppBar position='static' color='transparent' elevation={0} sx={{ borderBottom: '1px solid #e0e0e0', backgroundColor: '#fff' }}>
        <StyledContainer>
          <Toolbar sx={{ minHeight: '64px' }}>
            <Typography
              variant='h6'
              sx={{
                color: '#333',
                fontWeight: 'bold',
                fontSize: '22px',
                letterSpacing: '-0.5px',
                flexGrow: 1,
              }}
            >
              medi<span style={{ color: '#6B3AA0' }}>panda</span>
            </Typography>
            <Button
              size='small'
              sx={{
                color: '#6B3AA0',
                textDecoration: 'underline',
                fontSize: '13px',
                mr: 1.5,
                textTransform: 'none',
              }}
            >
              홍길동 님
            </Button>
            <AccountCircle sx={{ color: '#6B3AA0', fontSize: '28px' }} />
          </Toolbar>
        </StyledContainer>
      </AppBar>

      <main>
        <StyledContainer>
          <Outlet />
        </StyledContainer>
      </main>

      <Footer>
        <StyledContainer>
          <Box>
            <Box sx={{ mb: 2.5 }}>
              <Typography sx={{ fontSize: '12px', color: '#999', mb: 0.5, lineHeight: 1.6 }}>
                법인명 : (주)케이앤메디슨 | 서울시 강남구 논현로 416, 4층 운기빌딩(역삼동) | 대표 : 황혁진 | 사업자등록번호 : 338-81-00767
              </Typography>
              <Typography sx={{ fontSize: '12px', color: '#999', mb: 0.5, lineHeight: 1.6 }}>
                팩스 : 02-6280-6393 | 이메일 : keymedi@keymedi.com
              </Typography>
              <Typography sx={{ fontSize: '12px', color: '#999', mb: 0.5, lineHeight: 1.6 }}>
                대표전화 : 02-540-0703 | 고객센터 : 오전 10시~오후 5시(토/일/공휴일 휴무)
              </Typography>
              <Typography sx={{ fontSize: '12px', color: '#999', mb: 3, lineHeight: 1.6 }}>
                통신판매번호 : 제2017-서울강남-03514호 | 개인정보관리책임자 : 강승균 | 메일 : keymedi@keymedi.com | Copyright©keymedi All
                Rights Reserved.
              </Typography>
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
        </StyledContainer>
      </Footer>
    </>
  );
}

import { colors } from '@/themes';
import { Link, Stack, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { memo, type ReactNode } from 'react';
import { Link as RouterLink, Outlet } from 'react-router-dom';

const MaxWidthContainerWrapper = styled(Stack)({
  justifyContent: 'center',
  alignItems: 'center',
}) as typeof Stack;

const MaxWidthContainer = styled(Stack)({
  width: '1224px',
});

function FooterLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Stack sx={{ minHeight: '100vh' }}>
        <MaxWidthContainerWrapper component='main' sx={{ flexGrow: 1, my: '50px' }}>
          <MaxWidthContainer sx={{ flexGrow: 1 }}>
            {children}
            <Outlet />
          </MaxWidthContainer>
        </MaxWidthContainerWrapper>

        <MaxWidthContainerWrapper
          component='footer'
          sx={{
            backgroundColor: colors.gray70,
            color: '#ffffff',
          }}
        >
          <MaxWidthContainer>
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
                <Stack direction='row' sx={{ marginBottom: '20px' }}>
                  <Link
                    underline='hover'
                    component={RouterLink}
                    to='/terms'
                    sx={{
                      color: colors.white,
                    }}
                  >
                    이용약관
                  </Link>
                  <span style={{ color: colors.white, margin: '0 8px' }}>|</span>
                  <Link
                    underline='hover'
                    component={RouterLink}
                    to='/privacy'
                    sx={{
                      color: colors.white,
                    }}
                  >
                    개인정보처리방침
                  </Link>
                  <span style={{ color: colors.white, margin: '0 8px' }}>|</span>
                  <Link
                    underline='hover'
                    component={RouterLink}
                    to='/partnership'
                    sx={{
                      color: colors.white,
                    }}
                  >
                    제휴문의
                  </Link>
                </Stack>
                <Typography variant='smallTextR' sx={{ color: colors.white }}>
                  법인명 : (주)케이앤메디슨 | 서울시 강남구 논현로 416, 4층 운기빌딩(역삼동) | 대표 : 황혁진 | 사업자등록번호 : 338-81-00767
                  <br />
                  팩스 : 02-6280-6393 | 이메일 : keymedi@keymedi.com
                  <br />
                  대표전화 : 02-540-0703 | 고객센터 : 오전 10시~오후 5시(토/일/공휴일 휴무)
                  <br />
                  통신판매번호 : 제2017-서울강남-03514호 | 개인정보관리책임자 : 강승균 | 메일 : keymedi@keymedi.com | Copyright©keymedi All
                  Rights Reserved.
                </Typography>
              </Stack>
            </Stack>
          </MaxWidthContainer>
        </MaxWidthContainerWrapper>
      </Stack>
    </>
  );
}

export default memo(FooterLayout);

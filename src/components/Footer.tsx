import { colors } from '@/themes';
import { Link, Stack, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';

const MaxWidthContainerWrapper = styled(Stack)({
  justifyContent: 'center',
  alignItems: 'center',
}) as typeof Stack;

const MaxWidthContainer = styled(Stack)({
  width: '1224px',
});

export function Footer() {
  return (
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
          alignItems='flex-start'
          sx={{
            height: '260px',
            paddingTop: '48px',
            paddingBottom: '72px',
            boxSizing: 'border-box',
          }}
        >
          <img src='/assets/logo-dark.svg' style={{ width: '184px', height: '34px' }} />
          <Stack sx={{ ml: '104px' }}>
            <Stack direction='row' sx={{ marginBottom: '20px' }}>
              <Link
                variant='largeTextB'
                underline='hover'
                component={RouterLink}
                to='/terms'
                sx={{
                  color: colors.white,
                }}
              >
                이용약관
              </Link>
              <Typography variant='largeTextM' sx={{ margin: '0 8px' }}>
                |
              </Typography>
              <Link
                variant='largeTextB'
                underline='hover'
                component={RouterLink}
                to='/privacy'
                sx={{
                  color: colors.white,
                }}
              >
                개인정보처리방침
              </Link>
            </Stack>
            <Typography variant='largeTextR' sx={{ color: colors.gray50 }}>
              법인명 : (주)케이앤메디슨
              <Typography variant='largeTextM' sx={{ margin: '0 8px', color: colors.gray60 }}>
                |
              </Typography>
              서울시 강남구 논현로 416, 지하1층 운기빌딩(역삼동)
              <Typography variant='largeTextM' sx={{ margin: '0 8px', color: colors.gray60 }}>
                |
              </Typography>
              대표 : 황혁진
              <Typography variant='largeTextM' sx={{ margin: '0 8px', color: colors.gray60 }}>
                |
              </Typography>
              사업자등록번호 : 465-86-03299
              <br />
              대표전화 : 070-8666-1102
              <Typography variant='largeTextM' sx={{ margin: '0 8px', color: colors.gray60 }}>
                |
              </Typography>
              고객센터 : 오전 9시~오후 5시(토/일/공휴일 휴무)
              <br />
              통신판매번호 : 제 2025-서울강남-05488 호
              <Typography variant='largeTextM' sx={{ margin: '0 8px', color: colors.gray60 }}>
                |
              </Typography>
              개인정보관리책임자 : 황혁진
              <Typography variant='largeTextM' sx={{ margin: '0 8px', color: colors.gray60 }}>
                |
              </Typography>
              메일 :{' '}
              <Link
                underline='hover'
                component={RouterLink}
                to='mailto:info@knmedicine.com'
                sx={{
                  color: colors.gray50,
                }}
              >
                info@knmedicine.com
              </Link>
              <br />
              Copyright©knmedicine All Rights Reserved.
            </Typography>
          </Stack>
        </Stack>
      </MaxWidthContainer>
    </MaxWidthContainerWrapper>
  );
}

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
                variant='mediumTextB'
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
                variant='mediumTextB'
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
            <Typography variant='smallTextR' sx={{ color: colors.white }}>
              법인명: (주)케이앤메디슨 | 서울특별시 강남구 논현로 416, 지하1층 운기빌딩(역삼동) | 대표 황혁진 | 사업자등록번호 465-86-03299
              <br />
              대표전화: 070-7599-2528
              <br />
              이메일:{' '}
              <Link
                underline='hover'
                component={RouterLink}
                to='mailto:info@knmedicine.com'
                sx={{
                  color: colors.white,
                }}
              >
                info@knmedicine.com
              </Link>
              <br />
              통신판매번호: 제 2025-서울강남-05488 호
            </Typography>
          </Stack>
        </Stack>
      </MaxWidthContainer>
    </MaxWidthContainerWrapper>
  );
}

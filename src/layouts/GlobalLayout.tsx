import { MedipandaTextLink } from '@/custom/components/MedipandaTextLink';
import { useSession } from '@/hooks/useSession';
import { formatYyyyMmDd } from '@/lib/utils/dateFormat';
import { colors } from '@/themes';
import { Close } from '@mui/icons-material';
import { Box, Link, Popover, Stack, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { memo, useState } from 'react';
import { Link as RouterLink, Outlet, useLocation } from 'react-router-dom';

const MaxWidthContainerWrapper = styled(Stack)({
  justifyContent: 'center',
  alignItems: 'center',
}) as typeof Stack;

const MaxWidthContainer = styled(Stack)({
  width: '1224px',
});

const navItems = [
  { path: '/products', label: '제품검색' },
  { path: '/prescriptions', label: '실적관리', secondaryPaths: ['/dealers'] },
  { path: '/settlement-list', label: '정산', secondaryPaths: ['/sales-statistic'] },
  { path: '/community', label: '커뮤니티' },
  { path: '/sales-agency-products', label: '영업대행상품' },
  { path: '/events', label: '이벤트' },
  { path: '/customer-service/notice', label: '공지사항' },
];

function GlobalLayout() {
  const location = useLocation();
  const currentPath = location.pathname;
  const { session } = useSession();
  const hasPartnerContract = session?.partnerContractStatus === 'ORGANIZATION' || session?.partnerContractStatus === 'INDIVIDUAL';
  const [postPopupAnchor, setPostPopupAnchor] = useState<HTMLElement | null>(null);

  return (
    <>
      <Stack sx={{ minHeight: '100vh' }}>
        <MaxWidthContainerWrapper component='header' sx={{ height: '150px', borderBottom: `1px solid ${colors.gray40}` }}>
          <MaxWidthContainer>
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
                  <Link
                    key={item.path}
                    underline='hover'
                    component={RouterLink}
                    to={item.path}
                    sx={{
                      color: [item.path, ...(item.secondaryPaths || [])].some(path => currentPath.startsWith(path))
                        ? colors.vividViolet
                        : colors.gray80,
                      '&:hover': {
                        color: colors.vividViolet,
                      },
                    }}
                  >
                    <Typography variant='heading4B'>{item.label}</Typography>
                  </Link>
                ))}
              </Box>
              <Stack direction='row' alignItems='center'>
                <Box sx={{ mr: 1.5 }}>
                  {session ? (
                    <>
                      <Link
                        onClick={e => setPostPopupAnchor(e.currentTarget)}
                        underline='hover'
                        sx={{
                          color: colors.vividViolet,
                          cursor: 'pointer',
                        }}
                      >
                        <Typography variant='heading5B'>{session.name}</Typography>
                      </Link>
                      <Typography
                        component='span'
                        variant='heading5R'
                        sx={{
                          color: colors.navy,
                        }}
                      >
                        님
                      </Typography>
                    </>
                  ) : (
                    <MedipandaTextLink component={RouterLink} to='/login' typography='heading5B'>
                      로그인
                    </MedipandaTextLink>
                  )}
                </Box>
              </Stack>
            </Stack>
          </MaxWidthContainer>
        </MaxWidthContainerWrapper>

        <MaxWidthContainerWrapper component='main' sx={{ flexGrow: 1, my: '50px' }}>
          <MaxWidthContainer sx={{ flexGrow: 1 }}>
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

      <Popover
        open={postPopupAnchor !== null}
        anchorEl={postPopupAnchor}
        onClose={() => setPostPopupAnchor(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        elevation={0}
      >
        {session !== null && (
          <Stack
            sx={{
              width: '288px',
              position: 'relative',
              border: `2px solid ${colors.vividViolet}`,
              borderRadius: '20px',
              boxSizing: 'border-box',
            }}
          >
            <Stack
              gap='5px'
              sx={{
                padding: '30px 30px 16px 30px',
              }}
            >
              <Close
                onClick={() => setPostPopupAnchor(null)}
                sx={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  cursor: 'pointer',
                }}
              />
              <Stack direction='row' alignItems='center' justifyContent='flex-start' gap='10px'>
                <Stack
                  justifyContent='center'
                  alignItems='center'
                  sx={{
                    width: '70px',
                    height: '30px',
                    border: `1px solid ${hasPartnerContract ? colors.vividViolet : colors.red}`,
                    borderRadius: '30px',
                    boxSizing: 'border-box',
                    ...(hasPartnerContract
                      ? {
                          backgroundColor: colors.vividViolet,
                          color: colors.white,
                        }
                      : {
                          color: colors.red,
                        }),
                  }}
                >
                  <Typography variant='mediumTextB' sx={{ lineHeight: '1' }}>
                    {hasPartnerContract ? '계약중' : '미계약'}
                  </Typography>
                </Stack>
                <Typography variant='heading5B' sx={{ color: colors.gray80 }}>
                  {session.name}
                </Typography>
              </Stack>
              <Typography
                variant='normalTextR'
                sx={{
                  alignSelf: 'center',
                  color: colors.gray60,
                }}
              >
                {session.email}
              </Typography>
              {hasPartnerContract ? (
                <Typography
                  variant='normalTextR'
                  sx={{
                    alignSelf: 'center',
                    color: colors.gray60,
                  }}
                >
                  계약일: {formatYyyyMmDd(session.birthDate)}
                </Typography>
              ) : (
                <Link
                  underline='hover'
                  component={RouterLink}
                  to='/partner-contract'
                  sx={{
                    alignSelf: 'center',
                    color: colors.red,
                  }}
                >
                  <Typography variant='largeTextB'>계약하기</Typography>
                </Link>
              )}
            </Stack>
            <Stack
              direction='row'
              sx={{
                width: '288px',
                height: '40px',
                boxSizing: 'border-box',
                borderBottomLeftRadius: '20px',
                borderBottomRightRadius: '20px',
              }}
            >
              <Stack
                justifyContent='center'
                alignItems='center'
                onClick={() => setPostPopupAnchor(null)}
                component={RouterLink}
                to='/mypage/info'
                sx={{
                  flexGrow: 1,
                  borderRight: `1px solid ${colors.white}`,
                  borderBottomLeftRadius: '20px',
                  cursor: 'pointer',
                  backgroundColor: colors.vividViolet,
                  color: colors.white,
                }}
              >
                마이페이지
              </Stack>
              <Stack
                justifyContent='center'
                alignItems='center'
                component='a'
                href='/logout'
                sx={{
                  flexGrow: 1,
                  borderLeft: `1px solid ${colors.white}`,
                  borderBottomRightRadius: '20px',
                  cursor: 'pointer',
                  backgroundColor: colors.vividViolet,
                  color: colors.white,
                }}
              >
                로그아웃
              </Stack>
            </Stack>
          </Stack>
        )}
      </Popover>
    </>
  );
}

export default memo(GlobalLayout);

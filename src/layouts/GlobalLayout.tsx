import { MemberType } from '@/backend';
import { Footer } from '@/components/Footer';
import { MedipandaTextLink } from '@/custom/components/MedipandaTextLink';
import { useSession } from '@/hooks/useSession';
import { DateUtils, DATEFORMAT_YYYY_MM_DD } from '@/lib/utils/dateFormat';
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
  const hasPartnerContract =
    session?.partnerContractStatus === MemberType.ORGANIZATION || session?.partnerContractStatus === MemberType.INDIVIDUAL;
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

        <Footer />
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
        sx={{
          '& .MuiPaper-root': {
            borderRadius: '20px',
            outline: `2px solid ${colors.vividViolet}`,
          },
        }}
      >
        {session !== null && (
          <Stack
            sx={{
              width: '288px',
              position: 'relative',
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
                    borderRadius: '20px',
                    boxSizing: 'border-box',

                    ...(hasPartnerContract && { backgroundColor: colors.vividViolet }),
                  }}
                >
                  <Link
                    component={RouterLink}
                    to={'/partner-contract'}
                    onClick={() => setPostPopupAnchor(null)}
                    underline='hover'
                    sx={{
                      color: hasPartnerContract ? colors.white : colors.red,
                    }}
                  >
                    <Typography
                      variant='mediumTextB'
                      sx={{
                        lineHeight: '1',
                      }}
                    >
                      {hasPartnerContract ? '계약중' : '미계약'}
                    </Typography>
                  </Link>
                </Stack>
                <Typography variant='heading5B' sx={{ color: colors.gray80 }}>
                  {session.nickname}
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
                  계약일: {DateUtils.parseUtcAndFormatKst(session.contractDate!, DATEFORMAT_YYYY_MM_DD)}
                </Typography>
              ) : (
                <Link
                  underline='hover'
                  component={RouterLink}
                  to='/partner-contract'
                  onClick={() => setPostPopupAnchor(null)}
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
                backgroundColor: colors.vividViolet,
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

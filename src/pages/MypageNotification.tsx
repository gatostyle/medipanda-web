import { Box, Button, Checkbox, FormControlLabel, Stack, Switch, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useState } from 'react';
import { colors } from '../custom/globalStyles.ts';

const MarketingCheckbox = styled(Checkbox)({
  color: '#6B3AA0',
  '&.Mui-checked': {
    color: '#6B3AA0',
  },
});

export default function MypageNotification() {
  const [notifications, setNotifications] = useState({
    all: true,
    notice: true,
    newProducts: true,
    performance: false,
    settlement: false,
    community: false,
  });

  const [marketing, setMarketing] = useState({
    sms: true,
    email: true,
    appPush: true,
  });

  const handleNotificationChange = (key: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setNotifications(prev => ({
      ...prev,
      [key]: event.target.checked,
    }));
  };

  const handleMarketingChange = (key: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setMarketing(prev => ({
      ...prev,
      [key]: event.target.checked,
    }));
  };

  return (
    <>
      <Stack alignItems='center'>
        <Box sx={{ width: '100%' }}>
          <Typography variant='heading3M' sx={{ color: colors.gray80, mb: '30px' }}>
            수신정보
          </Typography>
        </Box>

        <Stack
          sx={{
            width: '434px',
            padding: '16px 30px',
            borderRadius: '5px',
            boxSizing: 'border-box',
            backgroundColor: colors.navy,
          }}
        >
          <Stack
            direction='row'
            alignItems='center'
            sx={{
              width: '100%',
              py: '10px',
            }}
          >
            <Typography variant='largeTextB' sx={{ color: colors.white, width: '100%' }}>
              전체 알림 받기
            </Typography>
            <Switch size='medium' />
          </Stack>
        </Stack>

        <Stack
          sx={{
            width: '434px',
            padding: '15px 30px',
            marginTop: '13px',
            boxSizing: 'border-box',
            border: `1px solid ${colors.gray30}`,
          }}
        >
          <Stack
            direction='row'
            alignItems='center'
            sx={{
              width: '100%',
              py: '10px',
            }}
          >
            <Typography variant='largeTextB' sx={{ color: colors.gray80, width: '100%' }}>
              공지사항 (제약사)
            </Typography>
            <Switch size='medium' />
          </Stack>
          <Stack
            direction='row'
            alignItems='center'
            sx={{
              width: '100%',
              py: '10px',
            }}
          >
            <Typography variant='largeTextB' sx={{ color: colors.gray80, width: '100%' }}>
              신규 영업대행상품
            </Typography>
            <Switch size='medium' />
          </Stack>
          <Stack
            direction='row'
            alignItems='center'
            sx={{
              width: '100%',
              py: '10px',
            }}
          >
            <Typography variant='largeTextB' sx={{ color: colors.gray80, width: '100%' }}>
              실적관리
            </Typography>
            <Switch size='medium' />
          </Stack>
          <Stack
            direction='row'
            alignItems='center'
            sx={{
              width: '100%',
              py: '10px',
            }}
          >
            <Typography variant='largeTextB' sx={{ color: colors.gray80, width: '100%' }}>
              정산
            </Typography>
            <Switch size='medium' />
          </Stack>
          <Stack
            direction='row'
            alignItems='center'
            sx={{
              width: '100%',
              py: '10px',
            }}
          >
            <Typography variant='largeTextB' sx={{ color: colors.gray80, width: '100%' }}>
              커뮤니티
            </Typography>
            <Switch size='medium' />
          </Stack>
        </Stack>

        <Stack
          direction='row'
          alignItems='center'
          sx={{
            width: '434px',
            paddingTop: '20px',
            borderTop: `1px solid ${colors.gray30}`,
            marginTop: '40px',
          }}
        >
          <Typography variant='largeTextB' sx={{ color: colors.gray80 }}>
            마케팅 수신 동의
          </Typography>
          <Stack
            direction='row'
            sx={{
              marginLeft: 'auto',
            }}
          >
            <FormControlLabel control={<MarketingCheckbox checked={marketing.sms} onChange={handleMarketingChange('sms')} />} label='SMS' />
            <FormControlLabel
              control={<MarketingCheckbox checked={marketing.email} onChange={handleMarketingChange('email')} />}
              label='이메일'
            />
            <FormControlLabel
              control={<MarketingCheckbox checked={marketing.appPush} onChange={handleMarketingChange('appPush')} />}
              label='App Push'
            />
          </Stack>
        </Stack>

        <Stack
          direction='row'
          gap='10px'
          sx={{
            width: '330px',
            marginTop: '40px',
          }}
        >
          <Button
            fullWidth
            variant='outlined'
            sx={{
              height: '49px',
              borderColor: colors.navy,
              color: colors.gray600,
            }}
          >
            취소
          </Button>
          <Button
            fullWidth
            variant='contained'
            sx={{
              height: '49px',
              backgroundColor: colors.navy,
            }}
          >
            수정
          </Button>
        </Stack>
      </Stack>
    </>
  );
}

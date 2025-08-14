import { Box, Button, Checkbox, FormControlLabel, Switch, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useState } from 'react';

const NotificationRow = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '20px 32px',
  backgroundColor: '#1a237e',
  borderRadius: '8px',
  marginBottom: '8px',
  color: '#fff',
});

const DisabledNotificationRow = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '20px 32px',
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  marginBottom: '8px',
  color: '#999',
});

const CustomSwitch = styled(Switch)({
  width: 80,
  height: 40,
  padding: 0,
  '& .MuiSwitch-switchBase': {
    padding: 0,
    margin: 2,
    transitionDuration: '300ms',
    '&.Mui-checked': {
      transform: 'translateX(40px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        backgroundColor: '#6B3AA0',
        opacity: 1,
        border: 0,
      },
      '&.Mui-disabled + .MuiSwitch-track': {
        opacity: 0.5,
      },
      '& .MuiSwitch-thumb': {
        color: '#fff',
        '&:before': {
          content: '"Yes!"',
          position: 'absolute',
          width: '100%',
          height: '100%',
          left: 0,
          top: 0,
          backgroundImage: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '10px',
          fontWeight: 'bold',
          color: '#6B3AA0',
        },
      },
    },
    '&.Mui-focusVisible .MuiSwitch-thumb': {
      color: '#33cf4d',
      border: '6px solid #fff',
    },
    '&.Mui-disabled .MuiSwitch-thumb': {
      color: '#bbb',
    },
    '&.Mui-disabled + .MuiSwitch-track': {
      opacity: 0.3,
    },
  },
  '& .MuiSwitch-thumb': {
    boxSizing: 'border-box',
    width: 36,
    height: 36,
    backgroundColor: '#fff',
    '&:before': {
      content: '"zzz"',
      position: 'absolute',
      width: '100%',
      height: '100%',
      left: 0,
      top: 0,
      backgroundImage: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '10px',
      fontWeight: 'bold',
      color: '#999',
    },
  },
  '& .MuiSwitch-track': {
    borderRadius: 20,
    border: '1px solid #e0e0e0',
    backgroundColor: '#e0e0e0',
    opacity: 1,
    transition: 'background-color 500ms',
  },
});

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
    <Box>
      <Typography variant='h5' sx={{ mb: 4, fontWeight: 'bold', color: '#333' }}>
        수신정보
      </Typography>

      <Box sx={{ mb: 4 }}>
        <NotificationRow>
          <Typography variant='h6' sx={{ fontWeight: 500 }}>
            전체 알림 받기
          </Typography>
          <CustomSwitch checked={notifications.all} onChange={handleNotificationChange('all')} />
        </NotificationRow>

        <NotificationRow>
          <Typography variant='h6' sx={{ fontWeight: 500 }}>
            공지사항 (제약사)
          </Typography>
          <CustomSwitch checked={notifications.notice} onChange={handleNotificationChange('notice')} />
        </NotificationRow>

        <NotificationRow>
          <Typography variant='h6' sx={{ fontWeight: 500 }}>
            신규 영업대행상품
          </Typography>
          <CustomSwitch checked={notifications.newProducts} onChange={handleNotificationChange('newProducts')} />
        </NotificationRow>

        <DisabledNotificationRow>
          <Typography variant='h6' sx={{ fontWeight: 500 }}>
            실적관리
          </Typography>
          <CustomSwitch checked={notifications.performance} onChange={handleNotificationChange('performance')} />
        </DisabledNotificationRow>

        <DisabledNotificationRow>
          <Typography variant='h6' sx={{ fontWeight: 500 }}>
            정산
          </Typography>
          <CustomSwitch checked={notifications.settlement} onChange={handleNotificationChange('settlement')} />
        </DisabledNotificationRow>

        <DisabledNotificationRow>
          <Typography variant='h6' sx={{ fontWeight: 500 }}>
            커뮤니티
          </Typography>
          <CustomSwitch checked={notifications.community} onChange={handleNotificationChange('community')} />
        </DisabledNotificationRow>
      </Box>

      <Box sx={{ mb: 4, padding: '24px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <Typography variant='h6' sx={{ mb: 3, fontWeight: 'bold', color: '#333' }}>
          마케팅 수신 동의
        </Typography>
        <Box sx={{ display: 'flex', gap: 4 }}>
          <FormControlLabel control={<MarketingCheckbox checked={marketing.sms} onChange={handleMarketingChange('sms')} />} label='SMS' />
          <FormControlLabel
            control={<MarketingCheckbox checked={marketing.email} onChange={handleMarketingChange('email')} />}
            label='이메일'
          />
          <FormControlLabel
            control={<MarketingCheckbox checked={marketing.appPush} onChange={handleMarketingChange('appPush')} />}
            label='App Push'
          />
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button
          variant='outlined'
          sx={{
            padding: '12px 32px',
            borderColor: '#e0e0e0',
            color: '#666',
            textTransform: 'none',
            '&:hover': {
              borderColor: '#6B3AA0',
              color: '#6B3AA0',
            },
          }}
        >
          취소
        </Button>
        <Button
          variant='contained'
          sx={{
            padding: '12px 32px',
            backgroundColor: '#1a237e',
            textTransform: 'none',
            '&:hover': {
              backgroundColor: '#0d47a1',
            },
          }}
        >
          수정
        </Button>
      </Box>
    </Box>
  );
}

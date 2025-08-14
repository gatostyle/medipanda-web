import { Box, Button, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router';

const CenteredContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  maxWidth: '600px',
  margin: '0 auto',
  padding: '32px 24px',
});

const PandaIcon = styled(Box)({
  width: '80px',
  height: '80px',
  borderRadius: '50%',
  backgroundColor: '#f0f0f0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '24px',
  fontSize: '40px',
});

const BenefitSection = styled(Box)({
  width: '100%',
  backgroundColor: '#f8f9fa',
  borderRadius: '12px',
  padding: '32px',
  marginBottom: '32px',
  textAlign: 'left',
});

const BenefitItem = styled(Box)({
  marginBottom: '24px',
  '&:last-child': {
    marginBottom: 0,
  },
});

const BenefitNumber = styled(Typography)({
  color: '#6B3AA0',
  fontWeight: 'bold',
  fontSize: '18px',
  marginBottom: '8px',
});

const WarningBox = styled(Box)({
  backgroundColor: '#fff3cd',
  border: '1px solid #ffeaa7',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '32px',
  textAlign: 'center',
});

const WithdrawButton = styled(Button)({
  backgroundColor: '#999',
  color: '#fff',
  padding: '12px 32px',
  textTransform: 'none',
  fontWeight: 500,
  '&:hover': {
    backgroundColor: '#777',
  },
});

const CancelButton = styled(Button)({
  backgroundColor: '#6B3AA0',
  color: '#fff',
  padding: '12px 32px',
  textTransform: 'none',
  fontWeight: 500,
  '&:hover': {
    backgroundColor: '#5a2d8a',
  },
});

const benefits = [
  {
    title: '편리한 정산업무',
    description: '매번 엑셀작업으로 정산을 하셨다면,\n전산화된 데이터로 정산관리가 가능해집니다.',
  },
  {
    title: 'CSO-MR의 커뮤니티',
    description: '제약영업에 대한 고민거리를 동료들과나누며\n영업네트워킹 및 정보 공유가 가능합니다.',
  },
  {
    title: 'CSO활동에 필요한 정보',
    description:
      '내가 거래하는 제약사의 이슈사항을 바로 바로 알림을\n받을 수 있습니다.\n\nCSO 시작부터 진행하면서 필요한 정보들을 무료로\n제공 받으실 수 있습니다.',
  },
  {
    title: '특별한 혜택',
    description: '와인, 레스토랑 등 다양한 제휴 할인 혜택을\n받으실 수 있습니다.',
  },
];

export default function MypageWithdraw() {
  return (
    <CenteredContainer>
      <PandaIcon>🐼</PandaIcon>

      <Typography variant='h4' sx={{ fontWeight: 'bold', color: '#333', mb: 2 }}>
        정말로
      </Typography>
      <Typography variant='h5' sx={{ fontWeight: 'bold', color: '#333', mb: 4 }}>
        회원을 탈퇴하시겠어요?
      </Typography>

      <BenefitSection>
        {benefits.map((benefit, index) => (
          <BenefitItem key={index}>
            <BenefitNumber>
              {index + 1}. {benefit.title}
            </BenefitNumber>
            <Typography
              variant='body2'
              sx={{
                color: '#666',
                lineHeight: 1.6,
                whiteSpace: 'pre-line',
              }}
            >
              {benefit.description}
            </Typography>
          </BenefitItem>
        ))}
      </BenefitSection>

      <WarningBox>
        <Typography variant='h6' sx={{ fontWeight: 'bold', color: '#d32f2f', mb: 2 }}>
          위 혜택들이 사라져요.
        </Typography>
        <Typography variant='body2' sx={{ color: '#d32f2f' }}>
          탈퇴할 경우, 동일한 아이디로는 재가입이 불가해요.
        </Typography>
      </WarningBox>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <WithdrawButton>탈퇴하기</WithdrawButton>
        <CancelButton component={RouterLink} to='/mypage/info'>
          취소하기
        </CancelButton>
      </Box>
    </CenteredContainer>
  );
}

import { Box, Card, CardContent, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useParams } from 'react-router';

const ContentContainer = styled(Box)({
  padding: '40px',
  maxWidth: '1000px',
  margin: '0 auto',
});

const EventTitle = styled(Typography)({
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#333',
  marginBottom: '12px',
});

const EventDescription = styled(Typography)({
  fontSize: '16px',
  color: '#666',
  marginBottom: '16px',
});

const DateAndViews = styled(Typography)({
  fontSize: '14px',
  color: '#999',
  marginBottom: '40px',
});

const EventBanner = styled(Box)({
  background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
  borderRadius: '16px',
  padding: '40px',
  color: '#fff',
  textAlign: 'center',
  marginBottom: '40px',
  position: 'relative',
  overflow: 'hidden',
});

const BannerTitle = styled(Typography)({
  fontSize: '28px',
  fontWeight: 'bold',
  marginBottom: '8px',
  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
});

const BannerSubtitle = styled(Typography)({
  fontSize: '24px',
  fontWeight: 'bold',
  marginBottom: '32px',
  color: '#a8e6cf',
});

const BenefitCard = styled(Card)({
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  borderRadius: '16px',
  padding: '24px',
  margin: '16px 0',
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
  backdropFilter: 'blur(10px)',
});

const BenefitIcon = styled(Box)({
  width: '60px',
  height: '60px',
  borderRadius: '50%',
  backgroundColor: '#e3f2fd',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: '20px',
  fontSize: '24px',
});

const BenefitNumber = styled(Typography)({
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#1976d2',
  marginBottom: '8px',
});

const BenefitTitle = styled(Typography)({
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#333',
  marginBottom: '4px',
});

const BenefitContent = styled(Typography)({
  fontSize: '14px',
  color: '#666',
  lineHeight: 1.6,
});

export default function EventDetail() {
  const { id } = useParams();

  // Mock data - would be fetched from API in real implementation
  const mockEvent = {
    id: Number(id),
    title: '메디판다 그랜드 오픈이벤트!!!!!',
    description: '해당 이벤트는 메디판다 오픈기념 이벤트입니다.',
    dateRange: '2025-06-10 ~ 2025-06-30',
    viewCount: 1260,
    benefits: [
      {
        number: '하나',
        title: '다양한 혜택제품',
        description: '다양한 혜택제품, JW 수액, 주사제, 소모품 등 병원에 필요한 제품을 원스톱 구매!',
        icon: '💊'
      },
      {
        number: '둘',
        title: '포인트 제도',
        description: '포스팀 적립 제도! 시그 가입 시 5만 포인트 지급!',
        icon: '🎁'
      }
    ]
  };

  return (
    <ContentContainer>
      <Typography variant='h4' sx={{ mb: 4, fontWeight: 'bold', color: '#333' }}>
        이벤트
      </Typography>

      <EventTitle>{mockEvent.title}</EventTitle>
      <EventDescription>{mockEvent.description}</EventDescription>
      <DateAndViews>
        {mockEvent.dateRange} · 조회수 {mockEvent.viewCount.toLocaleString()}
      </DateAndViews>

      <EventBanner>
        <BannerTitle>병원회원을 위한</BannerTitle>
        <BannerSubtitle>JUNE비코 혜택!</BannerSubtitle>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: '800px', margin: '0 auto' }}>
          {mockEvent.benefits.map((benefit, index) => (
            <BenefitCard key={index}>
              <CardContent sx={{ display: 'flex', alignItems: 'flex-start', padding: '24px !important' }}>
                <BenefitIcon>
                  {benefit.icon}
                </BenefitIcon>
                <Box sx={{ flex: 1 }}>
                  <BenefitNumber>{benefit.number}!</BenefitNumber>
                  <BenefitTitle>{benefit.title}</BenefitTitle>
                  <BenefitContent>{benefit.description}</BenefitContent>
                </Box>
              </CardContent>
            </BenefitCard>
          ))}
        </Box>
      </EventBanner>
    </ContentContainer>
  );
}

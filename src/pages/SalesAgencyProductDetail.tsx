import { Box, Button, Link, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useParams } from 'react-router';

const ContentContainer = styled(Box)({
  padding: '40px',
  maxWidth: '800px',
  margin: '0 auto',
});

const ProductCard = styled(Box)({
  backgroundColor: '#fff',
  borderRadius: '8px',
  padding: '40px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  border: '1px solid #f0f0f0',
});

const BusinessPartnerLabel = styled(Typography)({
  fontSize: '14px',
  color: '#666',
  marginBottom: '12px',
});

const ProductTitle = styled(Typography)({
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#333',
  marginBottom: '16px',
});

const DateAndViews = styled(Typography)({
  fontSize: '14px',
  color: '#999',
  marginBottom: '40px',
});

const FeeLabel = styled(Typography)({
  fontSize: '16px',
  fontWeight: 500,
  color: '#333',
  marginBottom: '8px',
});

const FeeDescription = styled(Typography)({
  fontSize: '16px',
  color: '#333',
  marginBottom: '24px',
});

const AdditionalInfo = styled(Typography)({
  fontSize: '14px',
  color: '#666',
  marginBottom: '8px',
});

const WebsiteLink = styled(Link)({
  fontSize: '14px',
  color: '#6B3AA0',
  textDecoration: 'underline',
  marginBottom: '40px',
  display: 'block',
});

const ButtonContainer = styled(Box)({
  display: 'flex',
  gap: '12px',
  justifyContent: 'center',
  marginTop: '40px',
});

const ApplyButton = styled(Button)({
  backgroundColor: '#6B3AA0',
  color: '#fff',
  padding: '12px 32px',
  fontSize: '16px',
  fontWeight: 500,
  textTransform: 'none',
  borderRadius: '6px',
  '&:hover': {
    backgroundColor: '#5a2d8a',
  },
});

const CompletedButton = styled(Button)({
  backgroundColor: '#999',
  color: '#fff',
  padding: '12px 32px',
  fontSize: '16px',
  fontWeight: 500,
  textTransform: 'none',
  borderRadius: '6px',
  '&:hover': {
    backgroundColor: '#777',
  },
});

export default function SalesAgencyProductDetail() {
  const { id } = useParams();

  // Mock data - would be fetched from API in real implementation
  const mockProduct = {
    id: Number(id),
    businessPartner: '리베스 플러리',
    title: '병원경영&마케팅',
    dateRange: '2025-06-10 ~ 2025-06-30',
    viewCount: 1260,
    feeDescription: ': 영업성사에 따른 차감제의 50%',
    website: 'www.csosales.com',
    isApplied: false,
  };

  return (
    <ContentContainer>
      <Typography variant='h4' sx={{ mb: 4, fontWeight: 'bold', color: '#333' }}>
        영업대행상품
      </Typography>

      <ProductCard>
        <BusinessPartnerLabel>{mockProduct.businessPartner}</BusinessPartnerLabel>

        <ProductTitle>{mockProduct.title}</ProductTitle>

        <DateAndViews>
          {mockProduct.dateRange} · 조회수 {mockProduct.viewCount.toLocaleString()}
        </DateAndViews>

        <Box sx={{ mb: 4 }}>
          <FeeLabel>영업대행수수료</FeeLabel>
          <FeeDescription>{mockProduct.feeDescription}</FeeDescription>
        </Box>

        <AdditionalInfo>
          자세한 상품설명은 아래 사이트 참고해주세요.
        </AdditionalInfo>

        <WebsiteLink href={`https://${mockProduct.website}`} target='_blank' rel='noopener noreferrer'>
          {mockProduct.website}
        </WebsiteLink>

        <ButtonContainer>
          {mockProduct.isApplied ? (
            <CompletedButton variant='contained'>
              영업대행 신청완료
            </CompletedButton>
          ) : (
            <ApplyButton variant='contained'>
              영업대행 신청하기
            </ApplyButton>
          )}
        </ButtonContainer>
      </ProductCard>
    </ContentContainer>
  );
}

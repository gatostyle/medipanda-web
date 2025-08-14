import { GetApp } from '@mui/icons-material';
import { Box, Card, CardContent, Link, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const ContentContainer = styled(Box)({
  padding: '40px',
  maxWidth: '600px',
  margin: '0 auto',
});

const StatusCard = styled(Card)({
  backgroundColor: '#fff',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  border: '1px solid #e0e0e0',
});

const FormRow = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  padding: '16px 0',
  borderBottom: '1px solid #f0f0f0',
  '&:last-child': {
    borderBottom: 'none',
  },
});

const FieldLabel = styled(Typography)({
  fontSize: '14px',
  color: '#666',
  width: '120px',
  flexShrink: 0,
});

const FieldValue = styled(Typography)({
  fontSize: '14px',
  color: '#333',
  flex: 1,
});

const DownloadLink = styled(Link)({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  color: '#1976d2',
  textDecoration: 'underline',
  fontSize: '14px',
  cursor: 'pointer',
  '&:hover': {
    textDecoration: 'underline',
  },
});

const CompletedStatus = styled(Typography)({
  fontSize: '14px',
  color: '#4caf50',
  fontWeight: 500,
});

const CompanyLogo = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: '40px',
  padding: '20px',
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
});

export default function RequestContractComplete() {
  const contractInfo = {
    contractType: '법인',
    companyName: '케이엠메디슨',
    businessNumber: '110-31-24415',
    settlementBank: '국민은행',
    accountNumber: '913501123525**',
    contractDate: '2025년 04월 23일',
  };

  return (
    <ContentContainer>
      <Typography variant='h5' sx={{ mb: 4, fontWeight: 'bold', color: '#333', textAlign: 'center' }}>
        파트너사 계약현황
      </Typography>

      <StatusCard>
        <CardContent sx={{ p: 4 }}>
          <FormRow>
            <FieldLabel>계약유형</FieldLabel>
            <FieldValue sx={{ backgroundColor: '#f0f0f0', padding: '8px 16px', borderRadius: '4px', display: 'inline-block' }}>
              {contractInfo.contractType}
            </FieldValue>
          </FormRow>

          <FormRow>
            <FieldLabel>회사명</FieldLabel>
            <FieldValue sx={{ backgroundColor: '#f0f0f0', padding: '8px 16px', borderRadius: '4px', display: 'inline-block' }}>
              {contractInfo.companyName}
            </FieldValue>
          </FormRow>

          <FormRow>
            <FieldLabel>사업자등록번호</FieldLabel>
            <Box sx={{ flex: 1 }}>
              <FieldValue sx={{ backgroundColor: '#f0f0f0', padding: '8px 16px', borderRadius: '4px', display: 'inline-block', mb: 1 }}>
                {contractInfo.businessNumber}
              </FieldValue>
              <br />
              <DownloadLink href='/mock-business-certificate.pdf' download>
                <GetApp sx={{ fontSize: '16px' }} />
                사업자등록증.pdf
              </DownloadLink>
            </Box>
          </FormRow>

          <FormRow>
            <FieldLabel>정산은행</FieldLabel>
            <FieldValue sx={{ backgroundColor: '#f0f0f0', padding: '8px 16px', borderRadius: '4px', display: 'inline-block' }}>
              {contractInfo.settlementBank}
            </FieldValue>
          </FormRow>

          <FormRow>
            <FieldLabel>계좌번호</FieldLabel>
            <FieldValue sx={{ backgroundColor: '#f0f0f0', padding: '8px 16px', borderRadius: '4px', display: 'inline-block' }}>
              {contractInfo.accountNumber}
            </FieldValue>
          </FormRow>

          <FormRow>
            <FieldLabel>CSO 신고증</FieldLabel>
            <DownloadLink href='/mock-cso-certificate.pdf' download>
              <GetApp sx={{ fontSize: '16px' }} />
              CSO 신고증.pdf
            </DownloadLink>
          </FormRow>

          <FormRow>
            <FieldLabel>민예심사자료/<br />교육이수증</FieldLabel>
            <DownloadLink href='/mock-education-certificate.pdf' download>
              <GetApp sx={{ fontSize: '16px' }} />
              민예심사자료 교육이수증.pdf
            </DownloadLink>
          </FormRow>

          <FormRow>
            <FieldLabel>계약일</FieldLabel>
            <CompletedStatus>{contractInfo.contractDate}</CompletedStatus>
          </FormRow>
        </CardContent>
      </StatusCard>

      <CompanyLogo>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#1976d2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '18px',
            }}
          >
            KM
          </Box>
          <Box>
            <Typography variant='h6' sx={{ fontWeight: 'bold', color: '#333' }}>
              K&Medicine
            </Typography>
            <Typography variant='body2' sx={{ color: '#666' }}>
              (주)케이엠메디슨
            </Typography>
          </Box>
        </Box>
      </CompanyLogo>
    </ContentContainer>
  );
}

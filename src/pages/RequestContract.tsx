import { GetApp } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useState } from 'react';

const CenteredContainer = styled(Box)({
  maxWidth: '800px',
  margin: '0 auto',
  padding: '32px 24px',
});

const BenefitsSection = styled(Box)({
  backgroundColor: '#f8f9fa',
  borderRadius: '12px',
  padding: '32px',
  marginBottom: '32px',
  textAlign: 'center',
});

const BenefitItem = styled(Box)({
  marginBottom: '16px',
  '&:last-child': {
    marginBottom: 0,
  },
});

const FormCard = styled(Card)({
  backgroundColor: '#fff',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  border: '1px solid #e0e0e0',
  borderRadius: '12px',
  marginBottom: '24px',
});

const FormRow = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  marginBottom: '24px',
  gap: '16px',
});

const FormLabel = styled(Typography)({
  fontSize: '16px',
  fontWeight: 500,
  color: '#333',
  minWidth: '120px',
  textAlign: 'left',
});

const FileUploadButton = styled(Button)({
  backgroundColor: '#fff',
  border: '1px solid #e0e0e0',
  color: '#666',
  padding: '12px 24px',
  textTransform: 'none',
  fontSize: '14px',
  '&:hover': {
    backgroundColor: '#f5f5f5',
    borderColor: '#6B3AA0',
    color: '#6B3AA0',
  },
});

const benefits = [
  '혜택1. 의약품 제품 검색으로 수수료 비교 정보를 빠르게 확인하세요.',
  '혜택2. AI 문자인식(OCR)으로 처방 통계를 자동으로 입력하세요.',
  '혜택3. 딜러 관리 기능으로 정산 업무를 간소화하세요.',
  '혜택4. 제휴 업체 할인으로 오프라인 혜택을 누리세요.',
];

export default function RequestContract() {
  const [contractType, setContractType] = useState('법인');
  const [formData, setFormData] = useState({
    companyName: '',
    businessNumber: '',
    bankName: '',
    accountNumber: '',
  });
  const [agreement, setAgreement] = useState(false);

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  return (
    <CenteredContainer>
      <Typography variant="h4" sx={{ textAlign: 'center', fontWeight: 'bold', color: '#333', mb: 4 }}>
        파트너사 계약신청
      </Typography>

      <BenefitsSection>
        {benefits.map((benefit, index) => (
          <BenefitItem key={index}>
            <Typography variant="body1" sx={{ color: '#333', lineHeight: 1.6 }}>
              {benefit}
            </Typography>
          </BenefitItem>
        ))}
      </BenefitsSection>

      <FormCard>
        <CardContent sx={{ p: 4 }}>
          <FormRow>
            <FormLabel>계약유형</FormLabel>
            <ToggleButtonGroup
              value={contractType}
              exclusive
              onChange={(_, newValue) => newValue && setContractType(newValue)}
              sx={{ gap: 1 }}
            >
              <ToggleButton
                value="법인"
                sx={{
                  textTransform: 'none',
                  border: '1px solid #e0e0e0',
                  color: contractType === '법인' ? '#fff' : '#666',
                  backgroundColor: contractType === '법인' ? '#6B3AA0' : '#fff',
                  '&:hover': {
                    backgroundColor: contractType === '법인' ? '#5a2d8a' : '#f5f5f5',
                  },
                }}
              >
                법인
              </ToggleButton>
              <ToggleButton
                value="개인"
                sx={{
                  textTransform: 'none',
                  border: '1px solid #e0e0e0',
                  color: contractType === '개인' ? '#fff' : '#666',
                  backgroundColor: contractType === '개인' ? '#6B3AA0' : '#fff',
                  '&:hover': {
                    backgroundColor: contractType === '개인' ? '#5a2d8a' : '#f5f5f5',
                  },
                }}
              >
                개인
              </ToggleButton>
            </ToggleButtonGroup>
          </FormRow>

          <FormRow>
            <FormLabel>회사명</FormLabel>
            <TextField
              placeholder="회사명을 입력해주세요."
              value={formData.companyName}
              onChange={handleInputChange('companyName')}
              sx={{ flex: 1 }}
            />
          </FormRow>

          <FormRow>
            <FormLabel>사업자등록번호</FormLabel>
            <TextField
              placeholder="'-'없이 입력해주세요."
              value={formData.businessNumber}
              onChange={handleInputChange('businessNumber')}
              sx={{ flex: 1 }}
            />
          </FormRow>

          <FormRow>
            <FormLabel>사업자등록증</FormLabel>
            <FileUploadButton startIcon={<GetApp />}>
              파일 올리기
            </FileUploadButton>
          </FormRow>

          <FormRow>
            <FormLabel>정산은행</FormLabel>
            <FormControl sx={{ flex: 1 }}>
              <Select
                value={formData.bankName}
                onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
                displayEmpty
              >
                <MenuItem value="">은행을 선택해주세요.</MenuItem>
                <MenuItem value="국민은행">국민은행</MenuItem>
                <MenuItem value="신한은행">신한은행</MenuItem>
                <MenuItem value="우리은행">우리은행</MenuItem>
                <MenuItem value="하나은행">하나은행</MenuItem>
              </Select>
            </FormControl>
          </FormRow>

          <FormRow>
            <FormLabel>계좌번호</FormLabel>
            <TextField
              placeholder="'-'없이 입력해주세요."
              value={formData.accountNumber}
              onChange={handleInputChange('accountNumber')}
              sx={{ flex: 1 }}
            />
          </FormRow>

          <FormRow>
            <FormLabel>CSO 신고증</FormLabel>
            <FileUploadButton startIcon={<GetApp />}>
              파일 올리기
            </FileUploadButton>
          </FormRow>

          <FormRow>
            <FormLabel>판매위수탁<br />교육이수증</FormLabel>
            <FileUploadButton startIcon={<GetApp />}>
              파일 올리기
            </FileUploadButton>
          </FormRow>

          <Box sx={{ textAlign: 'center', mt: 4, mb: 3 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={agreement}
                  onChange={(e) => setAgreement(e.target.checked)}
                  sx={{ color: '#6B3AA0', '&.Mui-checked': { color: '#6B3AA0' } }}
                />
              }
              label="파트너사 계약을 신청합니다."
              sx={{ color: '#333' }}
            />
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            <Button
              variant="contained"
              disabled={!agreement}
              sx={{
                backgroundColor: agreement ? '#999' : '#e0e0e0',
                color: '#fff',
                padding: '16px 48px',
                borderRadius: '8px',
                textTransform: 'none',
                fontSize: '16px',
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: agreement ? '#777' : '#e0e0e0',
                },
              }}
            >
              계약신청완료
            </Button>
          </Box>
        </CardContent>
      </FormCard>
    </CenteredContainer>
  );
}

import { MedipandaButton } from '@/custom/components/MedipandaButton';
import { MedipandaCheckbox } from '@/custom/components/MedipandaCheckbox';
import { colors, typography } from '@/themes';
import { Box, Button, CircularProgress, FormControlLabel, OutlinedInput, Stack, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { ArrowDown2 } from 'iconsax-reactjs';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const PartnerContractFormRow = styled(Stack)({
  flexDirection: 'row',
  alignItems: 'center',
  gap: '20px',
  height: '50px',
});

const PartnerContractFormLabel = styled(Typography)({
  ...typography.largeTextM,
  color: colors.gray80,
  width: '100px',
});

const PartnerContractFormInput = styled(Stack)({
  width: '327px',
});

const PartnerContractOutlinedInput = styled(OutlinedInput)({
  ...typography.largeTextR,
  borderRadius: '5px',

  '&.Mui-disabled': {
    borderColor: colors.navy,
    backgroundColor: colors.gray40,
    color: colors.navy,
  },

  '& .MuiOutlinedInput-input': {
    height: '50px',
    boxSizing: 'border-box',

    '&::placeholder': {
      color: colors.gray50,
      opacity: 1,
    },
  },
});

const PartnerContractFormButton = styled(Button)({
  ...typography.largeTextR,
  color: colors.gray50,
  borderRadius: '5px',

  height: '50px',
  borderColor: colors.gray40,

  '&.Mui-disabled': {
    borderColor: colors.navy,
    backgroundColor: colors.gray40,
    color: colors.navy,
  },
});

export default function PartnerContract() {
  const [searchParams] = useSearchParams();
  const contractStatus = searchParams.get('status');
  const isIndividual = contractStatus === 'INDIVIDUAL';
  const isCorporate = contractStatus === 'CORPORATE';

  const [contractType, setContractType] = useState<'CONTRACT' | 'NON_CONTRACT' | null>(null);
  const [formData, setFormData] = useState({
    companyName: '',
    businessNumber: '',
    bankName: '',
    accountNumber: '',
  });
  const [agreement, setAgreement] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, string>>({});

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleFileUpload = (fileType: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.jpeg,.png';
    input.onchange = e => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setUploadedFiles(prev => ({ ...prev, [fileType]: file.name }));
        alert(`${fileType} 파일이 업로드되었습니다.`, 'success');
      }
    };
    input.click();
  };

  const handleSubmit = () => {
    if (!formData.companyName.trim()) {
      alert('회사명을 입력해주세요.', 'warning');
      return;
    }
    if (!formData.businessNumber.trim()) {
      alert('사업자등록번호를 입력해주세요.', 'warning');
      return;
    }
    if (!formData.bankName) {
      alert('정산은행을 선택해주세요.', 'warning');
      return;
    }
    if (!formData.accountNumber.trim()) {
      alert('계좌번호를 입력해주세요.', 'warning');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert('파트너사 계약 신청이 성공적으로 접수되었습니다.');
    }, 2500);
  };

  return (
    <>
      <Stack
        alignItems='center'
        sx={{
          padding: '60px 180px',
        }}
      >
        <Typography variant='heading3M' sx={{ color: colors.gray80 }}>
          파트너사 계약신청
        </Typography>
        {!isIndividual && !isCorporate && (
          <Typography variant='mediumTextR' sx={{ color: colors.gray80, marginTop: '20px' }}>
            혜택1. 의약품 제품 검색으로 수수료 비교 정보를 빠르게 확인하세요.
            <br />
            혜택2. AI 문자인식(OCR)으로 처방 통계를 자동으로 입력하세요.
            <br />
            혜택3. 딜러 관리 기능으로 정산 업무를 간소화하세요.
            <br />
            혜택4. 제휴 업체 할인으로 오프라인 혜택을 누리세요.
            <br />
          </Typography>
        )}

        <Stack gap={'20px'} sx={{ marginTop: '40px' }}>
          <PartnerContractFormRow>
            <PartnerContractFormLabel>계약유형</PartnerContractFormLabel>
            <PartnerContractFormInput direction='row' gap='10px'>
              {!isIndividual && (
                <PartnerContractFormButton
                  fullWidth
                  variant='outlined'
                  onClick={() => setContractType('CONTRACT')}
                  disabled={isCorporate}
                  sx={{
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: contractType === 'CONTRACT' ? colors.vividViolet : colors.gray40,
                    color: contractType === 'CONTRACT' ? colors.vividViolet : colors.gray50,
                  }}
                >
                  법인
                </PartnerContractFormButton>
              )}
              {!isCorporate && (
                <PartnerContractFormButton
                  fullWidth
                  variant='outlined'
                  onClick={() => setContractType('NON_CONTRACT')}
                  disabled={isIndividual}
                  sx={{
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: contractType === 'NON_CONTRACT' ? colors.vividViolet : colors.gray40,
                    color: contractType === 'NON_CONTRACT' ? colors.vividViolet : colors.gray50,
                  }}
                >
                  개인
                </PartnerContractFormButton>
              )}
            </PartnerContractFormInput>
          </PartnerContractFormRow>

          <PartnerContractFormRow>
            <PartnerContractFormLabel>회사명</PartnerContractFormLabel>
            <PartnerContractFormInput>
              <PartnerContractOutlinedInput
                value={formData.companyName}
                placeholder='회사명을 입력해주세요.'
                onChange={handleInputChange('companyName')}
                disabled={isCorporate}
                sx={{ flex: 1 }}
              />
            </PartnerContractFormInput>
          </PartnerContractFormRow>

          <PartnerContractFormRow>
            <PartnerContractFormLabel>사업자등록번호</PartnerContractFormLabel>
            <PartnerContractFormInput>
              <PartnerContractOutlinedInput
                placeholder="'-'없이 입력해주세요."
                value={formData.businessNumber}
                onChange={handleInputChange('businessNumber')}
                sx={{ flex: 1 }}
              />
            </PartnerContractFormInput>
          </PartnerContractFormRow>

          <PartnerContractFormRow>
            <PartnerContractFormLabel />
            <PartnerContractFormInput>
              <PartnerContractFormButton
                variant='outlined'
                startIcon={<img src='/assets/icons/icon-file-upload.svg' />}
                onClick={() => handleFileUpload('사업자등록증')}
              >
                파일 올리기
              </PartnerContractFormButton>
              {uploadedFiles['사업자등록증'] && <Typography sx={{ color: 'colors.gray500' }}>{uploadedFiles['사업자등록증']}</Typography>}
            </PartnerContractFormInput>
          </PartnerContractFormRow>

          <PartnerContractFormRow>
            <PartnerContractFormLabel>정산은행</PartnerContractFormLabel>
            <PartnerContractFormInput>
              <PartnerContractFormButton variant='outlined'>
                <Typography variant='largeTextR'>은행을 선택해주세요</Typography>
                <ArrowDown2 style={{ marginLeft: 'auto' }} />
              </PartnerContractFormButton>
            </PartnerContractFormInput>
          </PartnerContractFormRow>

          <PartnerContractFormRow>
            <PartnerContractFormLabel>계좌번호</PartnerContractFormLabel>
            <PartnerContractFormInput>
              <PartnerContractOutlinedInput
                placeholder="'-'없이 입력해주세요."
                value={formData.accountNumber}
                onChange={handleInputChange('accountNumber')}
                sx={{ flex: 1 }}
              />
            </PartnerContractFormInput>
          </PartnerContractFormRow>

          <PartnerContractFormRow>
            <PartnerContractFormLabel>CSO 신고증</PartnerContractFormLabel>
            <PartnerContractFormInput>
              <PartnerContractFormButton
                variant='outlined'
                startIcon={<img src='/assets/icons/icon-file-upload.svg' />}
                onClick={() => handleFileUpload('CSO 신고증')}
              >
                파일 올리기
              </PartnerContractFormButton>
              {uploadedFiles['CSO 신고증'] && <Typography sx={{ color: 'colors.gray500' }}>{uploadedFiles['CSO 신고증']}</Typography>}
            </PartnerContractFormInput>
          </PartnerContractFormRow>

          <PartnerContractFormRow>
            <PartnerContractFormLabel>
              판매위수탁
              <br />
              교육이수증
            </PartnerContractFormLabel>
            <PartnerContractFormInput>
              <PartnerContractFormButton
                variant='outlined'
                startIcon={<img src='/assets/icons/icon-file-upload.svg' />}
                onClick={() => handleFileUpload('판매위수탁 교육이수증')}
              >
                파일 올리기
              </PartnerContractFormButton>
              {uploadedFiles['판매위수탁 교육이수증'] && (
                <Typography sx={{ color: 'colors.gray500' }}>{uploadedFiles['판매위수탁 교육이수증']}</Typography>
              )}
            </PartnerContractFormInput>
          </PartnerContractFormRow>

          <Box sx={{ textAlign: 'center', mt: 4, marginBottom: 3 }}>
            <FormControlLabel
              control={<MedipandaCheckbox checked={agreement} onChange={e => setAgreement(e.target.checked)} />}
              label='파트너사 계약을 신청합니다.'
              sx={{ color: colors.gray700 }}
            />
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            <MedipandaButton
              onClick={handleSubmit}
              disabled={!agreement || loading}
              variant='contained'
              size='large'
              sx={{
                width: '327px',
              }}
            >
              {loading ? <CircularProgress size={20} color='inherit' sx={{ mr: 1 }} /> : null}
              계약신청완료
            </MedipandaButton>
          </Box>
        </Stack>
      </Stack>
    </>
  );
}

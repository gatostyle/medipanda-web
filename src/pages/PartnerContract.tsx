import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  OutlinedInput,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { ArrowDown2 } from 'iconsax-reactjs';
import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { MedipandaButton } from '../custom/components/MedipandaButton.tsx';
import { colors, typography } from '../custom/globalStyles.ts';

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
  const [searchParams, setSearchParams] = useSearchParams();
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
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning'>('success');
  const [successDialog, setSuccessDialog] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: string }>({});

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

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
        showSnackbar(`${fileType} 파일이 업로드되었습니다.`, 'success');
      }
    };
    input.click();
  };

  const handleSubmit = () => {
    if (!formData.companyName.trim()) {
      showSnackbar('회사명을 입력해주세요.', 'warning');
      return;
    }
    if (!formData.businessNumber.trim()) {
      showSnackbar('사업자등록번호를 입력해주세요.', 'warning');
      return;
    }
    if (!formData.bankName) {
      showSnackbar('정산은행을 선택해주세요.', 'warning');
      return;
    }
    if (!formData.accountNumber.trim()) {
      showSnackbar('계좌번호를 입력해주세요.', 'warning');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccessDialog(true);
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

          <Box sx={{ textAlign: 'center', mt: 4, mb: 3 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={agreement}
                  onChange={e => setAgreement(e.target.checked)}
                  sx={{ color: colors.vividViolet, '&.Mui-checked': { color: colors.vividViolet } }}
                />
              }
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

      {/* Success Dialog */}
      <Dialog open={successDialog} onClose={() => setSuccessDialog(false)} maxWidth='md' fullWidth>
        <DialogTitle sx={{ textAlign: 'center', color: colors.primary, fontWeight: 'bold', fontSize: '24px' }}>계약 신청 완료!</DialogTitle>
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          <Typography sx={{ mb: 3, fontSize: '18px', fontWeight: 500 }}>파트너사 계약 신청이 성공적으로 접수되었습니다.</Typography>
          <Box sx={{ backgroundColor: colors.gray100, borderRadius: '8px', p: 3, mb: 3 }}>
            <Typography sx={{ color: colors.gray700, mb: 2, fontWeight: 500 }}>다음 단계 안내:</Typography>
            <Typography sx={{ color: 'colors.gray500', mb: 1, textAlign: 'left' }}>
              1. 담당자가 제출된 서류를 검토합니다 (2-3일 소요)
            </Typography>
            <Typography sx={{ color: 'colors.gray500', mb: 1, textAlign: 'left' }}>
              2. 검토 완료 후 승인/반려 결과를 알려드립니다
            </Typography>
            <Typography sx={{ color: 'colors.gray500', textAlign: 'left' }}>3. 승인 시 바로 서비스 이용이 가능합니다</Typography>
          </Box>
          <Typography sx={{ color: 'colors.gray500' }}>문의사항이 있으시면 고객센터로 연락해 주세요.</Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            variant='contained'
            onClick={() => setSuccessDialog(false)}
            sx={{
              backgroundColor: colors.primary,
              px: 6,
              py: 1.5,
              '&:hover': { backgroundColor: colors.primaryDark },
            }}
          >
            확인
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}

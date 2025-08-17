import { GetApp } from '@mui/icons-material';
import { Alert, Box, Button, CircularProgress, FormControl, MenuItem, Select, Snackbar, Stack, TextField, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useState } from 'react';
import { MedipandaTab, MedipandaTabElse, MedipandaTabs } from '../components/MedipandaTab.tsx';
import { colors, typography } from '../globalStyles.ts';

const MypageFormRow = styled(Stack)({
  alignItems: 'center',
  marginTop: '20px',
});

const MypageFormLabel = styled(Typography)({
  ...typography.largeTextM,
  width: '104px',
  color: colors.gray80,
  textAlign: 'left',
});

const MypageFormInput = styled(Stack)({
  width: '330px',
});

const MypageFormExtra = styled(Box)({
  width: '100px',
  marginLeft: '10px',
});

const FileUploadButton = styled(Button)({
  backgroundColor: colors.white,
  border: `1px solid ${colors.gray300}`,
  color: colors.gray600,
  padding: '12px 24px',
  textTransform: 'none',
  fontSize: '14px',
  '&:hover': {
    backgroundColor: colors.gray50,
    borderColor: colors.primary,
    color: colors.primary,
  },
});

export default function MypageInfo() {
  const [formData, setFormData] = useState({
    id: 'kandm',
    password: '••••••••',
    name: '김판다',
    phone: '01099887766',
    emailId: 'kandm',
    emailDomain: 'naver.com',
    nickname: 'CSO가 좋아요',
    referralCode: 'cx312',
  });
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning'>('success');
  const [uploadedFileName, setUploadedFileName] = useState('');

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

  const handlePasswordChange = () => {
    if (!newPassword.trim()) {
      showSnackbar('새 비밀번호를 입력해주세요.', 'warning');
      return;
    }
    if (newPassword.length < 8) {
      showSnackbar('비밀번호는 8자 이상이어야 합니다.', 'warning');
      return;
    }
    showSnackbar('비밀번호가 성공적으로 변경되었습니다.', 'success');
    setNewPassword('');
  };

  const handlePhoneChange = () => {
    if (!formData.phone.trim()) {
      showSnackbar('휴대폰 번호를 입력해주세요.', 'warning');
      return;
    }
    showSnackbar('휴대폰 번호가 성공적으로 변경되었습니다.', 'success');
  };

  const handleFileUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.jpg,.jpeg,.pdf,.png';
    input.onchange = e => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setUploadedFileName(file.name);
        showSnackbar('CSO 등록증 파일이 업로드되었습니다.', 'success');
      }
    };
    input.click();
  };

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showSnackbar('내 정보가 성공적으로 수정되었습니다!', 'success');
    }, 1500);
  };

  const handleCancel = () => {
    showSnackbar('수정이 취소되었습니다.', 'info');
  };

  return (
    <>
      <Stack alignItems='center'>
        <Box sx={{ width: '100%' }}>
          <Typography
            sx={{
              ...typography.heading3M,
              color: colors.gray80,
              mb: '30px',
            }}
          >
            내정보관리
          </Typography>
        </Box>

        <MedipandaTabs value={0} sx={{ width: '100%' }}>
          <MedipandaTab label={'기본정보'}></MedipandaTab>
          <MedipandaTabElse />
        </MedipandaTabs>

        <Stack
          sx={{
            alignItems: 'center',
            mt: '20px',
            mb: '60px',
          }}
        >
          <Stack sx={{ width: '544px' }}>
            <MypageFormRow direction='row'>
              <MypageFormLabel>ID*</MypageFormLabel>
              <MypageFormInput>
                <TextField
                  value={formData.id}
                  disabled
                  sx={{
                    flex: 1,
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#f8f9fa',
                    },
                  }}
                />
              </MypageFormInput>
            </MypageFormRow>

            <MypageFormRow direction='row'>
              <MypageFormLabel>Password*</MypageFormLabel>
              <MypageFormInput gap={'5px'}>
                <TextField
                  type='password'
                  value={formData.password}
                  disabled
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#f8f9fa',
                    },
                  }}
                />
              </MypageFormInput>
              <MypageFormExtra>
                <Button
                  fullWidth
                  variant='contained'
                  onClick={handlePasswordChange}
                  sx={{
                    height: '56px',
                    backgroundColor: colors.vividViolet,
                  }}
                >
                  변경
                </Button>
              </MypageFormExtra>
            </MypageFormRow>

            <MypageFormRow
              direction='row'
              sx={{
                marginTop: '5px',
              }}
            >
              <MypageFormLabel />
              <MypageFormInput>
                <TextField
                  type='password'
                  placeholder='새 비밀번호를 입력해주세요'
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {},
                  }}
                />
              </MypageFormInput>
              <MypageFormExtra />
            </MypageFormRow>

            <MypageFormRow direction='row'>
              <MypageFormLabel>이름*</MypageFormLabel>
              <MypageFormInput>
                <TextField value={formData.name} onChange={handleInputChange('name')} sx={{ flex: 1 }} />
              </MypageFormInput>
            </MypageFormRow>

            <MypageFormRow direction='row'>
              <MypageFormLabel>휴대폰 번호</MypageFormLabel>
              <MypageFormInput>
                <TextField value={formData.phone} onChange={handleInputChange('phone')} sx={{ flex: 1 }} />
              </MypageFormInput>
              <MypageFormExtra>
                <Button
                  fullWidth
                  variant='contained'
                  onClick={handlePhoneChange}
                  sx={{
                    height: '56px',
                    backgroundColor: colors.vividViolet,
                  }}
                >
                  변경
                </Button>
              </MypageFormExtra>
            </MypageFormRow>

            <MypageFormRow direction='row'>
              <MypageFormLabel>이메일*</MypageFormLabel>
              <MypageFormInput
                direction='row'
                gap={'6px'}
                sx={{
                  alignItems: 'center',
                }}
              >
                <TextField value={formData.emailId} onChange={handleInputChange('emailId')} sx={{ flex: 1 }} />
                <Typography sx={{ color: '#666' }}>@</Typography>
                <FormControl sx={{ minWidth: 140 }}>
                  <Select value={formData.emailDomain} onChange={e => setFormData(prev => ({ ...prev, emailDomain: e.target.value }))}>
                    <MenuItem value='naver.com'>naver.com</MenuItem>
                    <MenuItem value='gmail.com'>gmail.com</MenuItem>
                    <MenuItem value='daum.net'>daum.net</MenuItem>
                    <MenuItem value='hanmail.net'>hanmail.net</MenuItem>
                  </Select>
                </FormControl>
              </MypageFormInput>
            </MypageFormRow>
          </Stack>
        </Stack>

        <MedipandaTabs value={0} sx={{ width: '100%' }}>
          <MedipandaTab label={'추가정보'}></MedipandaTab>
          <MedipandaTabElse />
        </MedipandaTabs>

        <Stack
          sx={{
            alignItems: 'center',
            mt: '20px',
            mb: '60px',
          }}
        >
          <Stack sx={{ width: '544px' }}>
            <MypageFormRow direction='row'>
              <MypageFormLabel>닉네임</MypageFormLabel>
              <MypageFormInput>
                <TextField value={formData.nickname} onChange={handleInputChange('nickname')} fullWidth sx={{ mb: 1 }} />
                <Typography sx={{ color: '#f44336', fontSize: '12px' }}>닉네임 변경은 1달에 1회 가능합니다.</Typography>
              </MypageFormInput>
            </MypageFormRow>

            <MypageFormRow direction='row'>
              <MypageFormLabel>CSO 등록증</MypageFormLabel>
              <MypageFormInput>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <FileUploadButton startIcon={<GetApp />} onClick={handleFileUpload}>
                    파일 올리기
                  </FileUploadButton>
                  {uploadedFileName && <Typography sx={{ color: '#666' }}>{uploadedFileName}</Typography>}
                </Box>
                <Typography sx={{ color: '#f44336', fontSize: '12px', display: 'block' }}>
                  jpg, jpeg, pdf, png 파일만 업로드 가능합니다
                </Typography>
              </MypageFormInput>
            </MypageFormRow>

            <MypageFormRow direction='row'>
              <MypageFormLabel>추천인 코드</MypageFormLabel>
              <MypageFormInput>
                <TextField value={formData.referralCode} onChange={handleInputChange('referralCode')} sx={{ flex: 1 }} />
              </MypageFormInput>
            </MypageFormRow>
          </Stack>
        </Stack>

        <Stack direction='row' gap='10px' sx={{ width: '330px' }}>
          <Button
            fullWidth
            variant='outlined'
            onClick={handleCancel}
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
            onClick={handleSave}
            disabled={loading}
            sx={{
              height: '49px',
              backgroundColor: colors.navy,
            }}
          >
            {loading ? <CircularProgress size={20} color='inherit' sx={{ mr: 1 }} /> : null}
            수정
          </Button>
        </Stack>
      </Stack>

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

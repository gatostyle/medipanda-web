import { GetApp } from '@mui/icons-material';
import { Box, Button, FormControl, MenuItem, Select, Tab, Tabs, TextField, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useState } from 'react';

const StyledTabs = styled(Tabs)({
  marginBottom: '32px',
  '& .MuiTabs-indicator': {
    backgroundColor: '#6B3AA0',
    height: '3px',
  },
});

const StyledTab = styled(Tab)({
  textTransform: 'none',
  fontSize: '16px',
  fontWeight: 500,
  padding: '16px 32px',
  color: '#666',
  '&.Mui-selected': {
    color: '#6B3AA0',
    fontWeight: 'bold',
  },
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

const ChangeButton = styled(Button)({
  backgroundColor: '#6B3AA0',
  color: '#fff',
  padding: '8px 16px',
  textTransform: 'none',
  fontSize: '14px',
  '&:hover': {
    backgroundColor: '#5a2d8a',
  },
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

export default function MypageInfo() {
  const [currentTab, setCurrentTab] = useState(0);
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

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  return (
    <Box>
      <Typography variant='h5' sx={{ mb: 4, fontWeight: 'bold', color: '#333' }}>
        내정보관리
      </Typography>

      <StyledTabs value={currentTab} onChange={handleTabChange}>
        <StyledTab label='기본정보' />
        <StyledTab label='추가정보' />
      </StyledTabs>

      {currentTab === 0 && (
        <Box>
          <FormRow>
            <FormLabel>ID*</FormLabel>
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
          </FormRow>

          <FormRow>
            <FormLabel>Password*</FormLabel>
            <TextField
              type='password'
              value={formData.password}
              disabled
              sx={{
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#f8f9fa',
                },
              }}
            />
            <ChangeButton>변경</ChangeButton>
          </FormRow>

          <FormRow>
            <FormLabel>이름*</FormLabel>
            <TextField value={formData.name} onChange={handleInputChange('name')} sx={{ flex: 1 }} />
          </FormRow>

          <FormRow>
            <FormLabel>휴대폰 번호</FormLabel>
            <TextField value={formData.phone} onChange={handleInputChange('phone')} sx={{ flex: 1 }} />
            <ChangeButton>변경</ChangeButton>
          </FormRow>

          <FormRow>
            <FormLabel>이메일*</FormLabel>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
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
            </Box>
          </FormRow>
        </Box>
      )}

      {currentTab === 1 && (
        <Box>
          <FormRow>
            <FormLabel>닉네임</FormLabel>
            <Box sx={{ flex: 1 }}>
              <TextField value={formData.nickname} onChange={handleInputChange('nickname')} fullWidth sx={{ mb: 1 }} />
              <Typography variant='caption' sx={{ color: '#f44336', fontSize: '12px' }}>
                닉네임 변경은 1달에 1회 가능합니다.
              </Typography>
            </Box>
          </FormRow>

          <FormRow>
            <FormLabel>CSO 등록증</FormLabel>
            <Box sx={{ flex: 1 }}>
              <FileUploadButton startIcon={<GetApp />}>파일 올리기</FileUploadButton>
              <Typography variant='caption' sx={{ color: '#f44336', fontSize: '12px', display: 'block', mt: 1 }}>
                jpg, jpeg, pdf, png 파일만 업로드 가능합니다
              </Typography>
            </Box>
          </FormRow>

          <FormRow>
            <FormLabel>추천인 코드</FormLabel>
            <TextField value={formData.referralCode} onChange={handleInputChange('referralCode')} sx={{ flex: 1 }} />
          </FormRow>
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
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

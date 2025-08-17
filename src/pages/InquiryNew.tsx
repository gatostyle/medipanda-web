import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router';
import { useState } from 'react';
import { MedipandaTab, MedipandaTabElse, MedipandaTabs } from '../components/MedipandaTab.tsx';
import { colors, typography } from '../globalStyles.ts';

export default function InquiryNew() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning'>('success');
  const [successDialog, setSuccessDialog] = useState(false);

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleFileUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.jpeg,.png';
    input.onchange = e => {
      const files = (e.target as HTMLInputElement).files;
      if (files) {
        setAttachedFiles(Array.from(files));
        showSnackbar(`${files.length}개 파일이 선택되었습니다.`, 'success');
      }
    };
    input.click();
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      showSnackbar('제목을 입력해주세요.', 'warning');
      return;
    }
    if (!content.trim()) {
      showSnackbar('문의내용을 입력해주세요.', 'warning');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccessDialog(true);
    }, 2000);
  };

  return (
    <Stack alignItems='center'>
      <Box sx={{ width: '100%' }}>
        <Typography
          sx={{
            ...typography.heading3M,
            color: colors.gray80,
            mb: '30px',
          }}
        >
          1:1 문의내역
        </Typography>
      </Box>

      <MedipandaTabs value={0} sx={{ width: '100%' }}>
        <MedipandaTab label='문의하기' />
        <MedipandaTabElse />
      </MedipandaTabs>

      <Stack gap='20px' sx={{ width: '600px', marginTop: '40px' }}>
        <Stack direction='row' alignItems='flex=start'>
          <Typography sx={{ ...typography.largeTextM, color: colors.gray80, lineHeight: '56px' }}>제목*</Typography>
          <TextField
            fullWidth
            placeholder='제목을 입력해주세요'
            value={title}
            onChange={e => setTitle(e.target.value)}
            sx={{
              width: '500px',
              marginLeft: 'auto',
            }}
          />
        </Stack>

        <Stack direction='row' alignItems='flex=start'>
          <Typography sx={{ ...typography.largeTextM, color: colors.gray80, lineHeight: '56px' }}>문의내용*</Typography>
          <TextField
            fullWidth
            multiline
            rows={8}
            placeholder='내용을 입력해주세요'
            value={content}
            onChange={e => setContent(e.target.value)}
            sx={{
              width: '500px',
              marginLeft: 'auto',
            }}
          />
        </Stack>

        <Stack direction='row' alignItems='flex=start'>
          <Typography sx={{ ...typography.largeTextM, color: colors.gray80, lineHeight: '56px' }}>파일 첨부</Typography>
          <Stack
            gap='5px'
            sx={{
              width: '500px',
              marginLeft: 'auto',
            }}
          >
            <Button
              variant='outlined'
              startIcon={<img src='/assets/icons/icon-file-upload.svg' />}
              onClick={() => handleFileUpload()}
              sx={{
                width: '500px',
                height: '100%',
                marginLeft: 'auto',
                borderColor: colors.gray40,
                color: colors.gray50,
              }}
            >
              파일 올리기
            </Button>
            {attachedFiles.length > 0 && `${attachedFiles.length}개 파일 선택됨`}
          </Stack>
        </Stack>
      </Stack>

      <Stack
        direction='row'
        gap='10px'
        sx={{
          marginTop: '60px',
        }}
      >
        <Button
          component={RouterLink}
          to='/customer-service/inquiry'
          variant='outlined'
          sx={{
            width: '160px',
            height: '50px',
            borderColor: colors.navy,
            color: colors.navy,
          }}
        >
          취소
        </Button>
        <Button
          variant='contained'
          onClick={handleSubmit}
          disabled={!title.trim() || !content.trim() || loading}
          sx={{
            width: '160px',
            height: '50px',
            backgroundColor: colors.vividViolet,
          }}
          component={RouterLink}
          to='/mypage/info'
        >
          {loading ? <CircularProgress size={20} color='inherit' sx={{ mr: 1 }} /> : null}
          문의하기
        </Button>
      </Stack>

      {/* Success Dialog */}
      <Dialog open={successDialog} onClose={() => setSuccessDialog(false)} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ textAlign: 'center', color: '#6B3AA0', fontWeight: 'bold' }}>문의 접수 완료</DialogTitle>
        <DialogContent sx={{ textAlign: 'center', py: 3 }}>
          <Typography sx={{ mb: 2, fontSize: '18px' }}>문의가 성공적으로 접수되었습니다!</Typography>
          <Typography sx={{ color: '#666', mb: 1 }}>담당자가 확인 후 빠른 시일 내에 답변드리겠습니다.</Typography>
          <Typography sx={{ color: '#666' }}>답변은 문의내역 페이지에서 확인하실 수 있습니다.</Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            component={RouterLink}
            to='/customer-service/inquiry'
            variant='contained'
            onClick={() => setSuccessDialog(false)}
            sx={{
              backgroundColor: '#6B3AA0',
              px: 4,
              '&:hover': { backgroundColor: '#5a2d8a' },
            }}
          >
            문의내역 보기
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
    </Stack>
  );
}

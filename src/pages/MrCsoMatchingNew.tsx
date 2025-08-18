import { FormatBold, FormatListBulleted, Image } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router';
import { colors } from '../custom/globalStyles.ts';

const ContentContainer = styled(Box)({
  padding: '24px',
  maxWidth: '800px',
  margin: '0 auto',
});

const TabButton = styled(Button)({
  padding: '12px 24px',
  borderRadius: '4px',
  textTransform: 'none',
  fontSize: '14px',
  fontWeight: 500,
  minWidth: 'auto',
  '&.selected': {
    backgroundColor: colors.gray300,
    color: colors.gray700,
    '&:hover': {
      backgroundColor: colors.gray300,
    },
  },
  '&:not(.selected)': {
    backgroundColor: 'transparent',
    color: colors.gray500,
    '&:hover': {
      backgroundColor: colors.gray100,
    },
  },
});

const FormCard = styled(Card)({
  boxShadow: 'none',
  border: `1px solid ${colors.gray300}`,
  borderRadius: '8px',
  marginTop: '24px',
});

const ToolbarContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  borderTop: `1px solid ${colors.gray300}`,
  padding: '12px 16px',
  backgroundColor: colors.gray100,
});

const ActionButtons = styled(Box)({
  display: 'flex',
  gap: '12px',
  justifyContent: 'center',
  marginTop: '24px',
});

export default function MrCsoMatchingNew() {
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning'>('success');
  const [successDialog, setSuccessDialog] = useState(false);
  const navigate = useNavigate();

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      showSnackbar('제목을 입력해주세요.', 'warning');
      return;
    }
    if (!content.trim()) {
      showSnackbar('내용을 입력해주세요.', 'warning');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccessDialog(true);
    }, 2000);
  };

  return (
    <ContentContainer>
      <Typography sx={{ mb: 4, fontWeight: 'bold', color: colors.gray700 }}>커뮤니티</Typography>

      <Box sx={{ mb: 3 }}>
        <TabButton onClick={() => navigate('/community/anonymous')}>익명게시판</TabButton>
        <TabButton className='selected'>MR-CSO 매칭</TabButton>
      </Box>

      <FormCard>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ mb: 3 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isAnonymous}
                  onChange={e => setIsAnonymous(e.target.checked)}
                  sx={{
                    color: colors.primary,
                    '&.Mui-checked': {
                      color: colors.primary,
                    },
                  }}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography sx={{ fontWeight: 500 }}>익명</Typography>
                  <Typography sx={{ color: colors.gray500 }}>닉네임 숨기기</Typography>
                </Box>
              }
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography sx={{ mb: 1, fontWeight: 500, color: colors.gray700 }}>제목*</Typography>
            <TextField
              fullWidth
              placeholder='제목을 입력해주세요'
              value={title}
              onChange={e => setTitle(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {},
              }}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography sx={{ mb: 1, fontWeight: 500, color: colors.gray700 }}>문의내용*</Typography>
            <TextField
              fullWidth
              multiline
              rows={12}
              placeholder='내용을 입력해주세요'
              value={content}
              onChange={e => setContent(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  padding: 0,
                },
                '& .MuiInputBase-input': {
                  padding: '16px',
                },
              }}
            />
            <ToolbarContainer>
              <IconButton size='small' sx={{ color: colors.gray500 }}>
                <FormatBold />
              </IconButton>
              <IconButton size='small' sx={{ color: colors.gray500 }}>
                <FormatListBulleted />
              </IconButton>
              <IconButton size='small' sx={{ color: colors.gray500 }}>
                <Image />
              </IconButton>
            </ToolbarContainer>
          </Box>
        </CardContent>
      </FormCard>

      <ActionButtons>
        <Button
          component={RouterLink}
          to='/community/mrcso-matching'
          variant='outlined'
          sx={{
            padding: '12px 32px',
            borderColor: colors.gray300,
            color: colors.gray500,
            textTransform: 'none',
            '&:hover': {
              borderColor: colors.primary,
              color: colors.primary,
            },
          }}
        >
          취소
        </Button>
        <Button
          variant='contained'
          onClick={handleSubmit}
          disabled={!title.trim() || !content.trim() || loading}
          sx={{
            padding: '12px 32px',
            backgroundColor: colors.primary,
            textTransform: 'none',
            '&:hover': {
              backgroundColor: colors.primaryDark,
            },
          }}
        >
          {loading ? <CircularProgress size={20} color='inherit' sx={{ mr: 1 }} /> : null}
          작성하기
        </Button>
      </ActionButtons>

      {/* Success Dialog */}
      <Dialog open={successDialog} onClose={() => setSuccessDialog(false)} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ textAlign: 'center', color: colors.primary, fontWeight: 'bold' }}>게시글 등록 완료</DialogTitle>
        <DialogContent sx={{ textAlign: 'center', py: 3 }}>
          <Typography sx={{ mb: 2, fontSize: '18px' }}>MR-CSO 매칭 게시글이 성공적으로 등록되었습니다!</Typography>
          <Typography sx={{ color: colors.gray500, mb: 1 }}>{isAnonymous ? '익명으로' : '닉네임과 함께'} 게시되었습니다.</Typography>
          <Typography sx={{ color: colors.gray500 }}>다른 CSO들과 소통하며 좋은 매칭 기회를 만들어보세요.</Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            component={RouterLink}
            to='/community/mrcso-matching'
            variant='contained'
            onClick={() => setSuccessDialog(false)}
            sx={{
              backgroundColor: colors.primary,
              px: 4,
              '&:hover': { backgroundColor: colors.primaryDark },
            }}
          >
            목록 보기
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
    </ContentContainer>
  );
}

import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

interface PasswordChangeDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (newPassword: string) => Promise<void>;
}

export default function PasswordChangeDialog({ open, onClose, onSave }: PasswordChangeDialogProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    setNewPassword('');
    setConfirmPassword('');
    onClose();
  };

  const handleSave = async () => {
    if (newPassword !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (newPassword.length < 6) {
      alert('비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    try {
      setIsLoading(true);
      await onSave(newPassword);
      handleClose();
    } catch (error) {
      console.error('비밀번호 변경 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isPasswordMatch = newPassword === confirmPassword && newPassword.length > 0;
  const canSave = isPasswordMatch && newPassword.length >= 6;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
        }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', fontSize: '18px', fontWeight: 600, py: 3 }}>비밀번호 변경</DialogTitle>
      <DialogContent sx={{ px: 4, pb: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box>
            <Typography sx={{ mb: 1, fontSize: '14px', fontWeight: 500 }}>새 비밀번호</Typography>
            <TextField
              fullWidth
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="새 비밀번호를 입력하세요"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  backgroundColor: '#FAFAFA'
                }
              }}
            />
          </Box>
          <Box>
            <Typography sx={{ mb: 1, fontSize: '14px', fontWeight: 500 }}>비밀번호 확인</Typography>
            <TextField
              fullWidth
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="비밀번호를 다시 입력하세요"
              error={confirmPassword.length > 0 && !isPasswordMatch}
              helperText={confirmPassword.length > 0 && !isPasswordMatch ? '비밀번호가 일치하지 않습니다.' : ''}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  backgroundColor: '#FAFAFA'
                }
              }}
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 4, pb: 3, justifyContent: 'center', gap: 1 }}>
        <Button
          onClick={handleClose}
          variant="contained"
          sx={{
            minWidth: 80,
            backgroundColor: '#9CA3AF',
            '&:hover': {
              backgroundColor: '#6B7280'
            }
          }}
        >
          취소
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!canSave || isLoading}
          sx={{
            minWidth: 80,
            backgroundColor: '#10B981',
            '&:hover': {
              backgroundColor: '#059669'
            }
          }}
        >
          저장
        </Button>
      </DialogActions>
    </Dialog>
  );
}

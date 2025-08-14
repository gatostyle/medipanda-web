import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Box, Button, IconButton, InputAdornment, TextField, Typography } from '@mui/material';
import { useState } from 'react';

export default function MypageGuard() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        textAlign: 'center',
      }}
    >
      <Typography variant='h6' sx={{ mb: 4, color: '#333', fontWeight: 500 }}>
        회원님의 정보를 보호하기 위해 비밀번호를 다시 확인합니다.
      </Typography>

      <Box component='form' onSubmit={handleSubmit} sx={{ width: '100%', maxWidth: '400px' }}>
        <TextField
          fullWidth
          type={showPassword ? 'text' : 'password'}
          placeholder='비밀번호를 입력해주세요.'
          value={password}
          onChange={e => setPassword(e.target.value)}
          sx={{
            mb: 3,
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#fff',
              borderRadius: '8px',
            },
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position='end'>
                <IconButton onClick={() => setShowPassword(!showPassword)} edge='end' sx={{ color: '#999' }}>
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Button
          type='submit'
          variant='contained'
          disabled={!password.trim()}
          sx={{
            backgroundColor: '#1a237e',
            color: '#fff',
            padding: '12px 48px',
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 500,
            '&:hover': {
              backgroundColor: '#0d47a1',
            },
            '&:disabled': {
              backgroundColor: '#e0e0e0',
              color: '#999',
            },
          }}
        >
          확인
        </Button>
      </Box>
    </Box>
  );
}

import { colors } from '@/themes';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Box, Button, IconButton, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';

export default function MypageGuard() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <>
      <Stack>
        <Typography variant='heading3B' sx={{ color: colors.gray80 }}>
          마이페이지
        </Typography>
        <Box sx={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', display: 'flex', my: '100px' }}>
          <Stack>
            <Typography
              variant='largeTextM'
              sx={{
                color: colors.gray80,
                fontWeight: 400,
                fontSize: '16px',
                lineHeight: 1.5,
              }}
            >
              회원님의 정보를 보호하기 위해 비밀번호를 다시 확인합니다.
            </Typography>

            <Stack
              direction='row'
              component='form'
              onSubmit={handleSubmit}
              sx={{
                width: '440px',
                marginTop: '20px',
              }}
            >
              <TextField
                fullWidth
                type={showPassword ? 'text' : 'password'}
                placeholder='비밀번호를 입력해주세요.'
                value={password}
                onChange={e => setPassword(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: colors.white,
                    borderRadius: '8px',
                    fontSize: '14px',
                    height: '48px',
                    '& fieldset': {
                      borderColor: colors.gray300,
                      borderWidth: '1px',
                    },
                    '&:hover fieldset': {
                      borderColor: colors.gray400,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: colors.primary,
                      borderWidth: '2px',
                    },
                  },
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge='end' sx={{ color: colors.gray400 }}>
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
                  width: '100px',
                  ml: '10px',
                  backgroundColor: colors.navy,
                }}
              >
                확인
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </>
  );
}

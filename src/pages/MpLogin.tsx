import { Box, Button, Card, IconButton, InputAdornment, Stack, TextField } from '@mui/material';
import { isAxiosError } from 'axios';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { Eye, EyeSlash } from 'iconsax-reactjs';
import { NotAdminError, useSession } from '@/hooks/useSession';
import { useSnackbar } from 'notistack';
import { type SyntheticEvent, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { RequiredDeep } from 'type-fest';

export default function MpLogin() {
  const { login } = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const authError = params.get('authError');

    if (authError === 'true') {
      enqueueSnackbar('인증이 만료되었습니다. 다시 로그인하세요.', {
        variant: 'warning',
        autoHideDuration: 5000,
        preventDuplicate: true,
      });
    }
  }, [location.search, enqueueSnackbar]);

  const form = useForm({
    defaultValues: {
      userId: '',
      password: '',
    },
  });

  const submitHandler: SubmitHandler<RequiredDeep<(typeof form)['control']['_defaultValues']>> = async values => {
    if (values.userId === '') {
      form.setError('userId', { message: '아이디를 입력해 주세요.' });
      return;
    }

    if (values.password === '') {
      form.setError('password', { message: '비밀번호를 입력해 주세요.' });
      return;
    }

    form.clearErrors();

    try {
      await login(values.userId, values.password);

      const params = new URLSearchParams(location.search);
      const redirectTo = params.get('redirectTo');

      navigate(redirectTo ?? '/', { replace: true });
    } catch (e) {
      if (isAxiosError(e) && e.response?.status === 401) {
        form.setError('password', { message: '아이디 또는 비밀번호가 올바르지 않습니다.' });
      } else if (e instanceof NotAdminError) {
        form.setError('password', { message: '관리자 권한이 없습니다.' });
      } else if (e instanceof Error) {
        form.setError('password', { message: e.message });
      } else {
        form.setError('password', { message: `오류: ${JSON.stringify(e)}` });
      }
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event: SyntheticEvent) => {
    event.preventDefault();
  };

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Box
        sx={{
          position: 'absolute',
          filter: 'blur(140px)',
          zIndex: -1,
          bottom: 0,
          left: 0,
          top: 0,
          right: 0,
          overflow: 'hidden',
          '&:before': {
            content: `" "`,
            width: 300,
            height: 300,
            borderRadius: '50%',
            bgcolor: 'warning.lighter',
            position: 'absolute',
            top: 0,
            right: 0,
            opacity: 1,
          },
        }}
      >
        <Box
          sx={{
            width: 250,
            height: 250,
            borderRadius: '50%',
            bgcolor: 'success.lighter',
            ml: 20,
            position: 'absolute',
            bottom: 180,
            opacity: 1,
          }}
        />
        <Box
          sx={{
            width: 200,
            height: 200,
            borderRadius: '50%',
            bgcolor: 'error.light',
            position: 'absolute',
            bottom: 0,
            left: -50,
            opacity: 1,
          }}
        />
      </Box>
      <Stack
        sx={{
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <Card sx={{ padding: 3 }}>
          <Stack component='form' noValidate onSubmit={form.handleSubmit(submitHandler)} sx={{ width: '415px', gap: 3 }}>
            <h3 style={{ textAlign: 'center' }}>로그인</h3>
            <Controller
              control={form.control}
              name={'userId'}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label='이메일'
                  fullWidth
                  error={fieldState.error !== undefined}
                  helperText={fieldState.error?.message ?? ''}
                />
              )}
            />
            <Controller
              control={form.control}
              name={'password'}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  type={showPassword ? 'text' : 'password'}
                  label='비밀번호'
                  fullWidth
                  error={fieldState.error !== undefined}
                  helperText={fieldState.error?.message ?? ''}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          aria-label='toggle password visibility'
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge='end'
                          color='secondary'
                        >
                          {showPassword ? <Eye /> : <EyeSlash />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
            <Button fullWidth size='large' type='submit' variant='contained' color='primary'>
              로그인
            </Button>
          </Stack>
        </Card>
      </Stack>
    </Box>
  );
}

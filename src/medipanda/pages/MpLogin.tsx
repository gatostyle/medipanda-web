import { Box, Button, Card, FormHelperText, IconButton, InputAdornment, Stack, TextField } from '@mui/material';
import { isAxiosError } from 'axios';
import { useFormik } from 'formik';
import { Eye, EyeSlash } from 'iconsax-react';
import { NotAdminError, useSession } from '@/medipanda/hooks/useSession';
import { useSnackbar } from 'notistack';
import { SyntheticEvent, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';

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

  const { values, touched, errors, isSubmitting, handleChange, handleBlur, handleSubmit } = useFormik({
    initialValues: {
      userId: '',
      password: '',
      submit: null,
    },
    validationSchema: Yup.object().shape({
      userId: Yup.string().required('아이디를 입력해 주세요.'),
      password: Yup.string().required('비밀번호를 입력해 주세요.'),
    }),
    onSubmit: async (values, { setErrors }) => {
      try {
        await login(values.userId, values.password);

        const params = new URLSearchParams(location.search);
        const redirectTo = params.get('redirectTo');

        navigate(redirectTo ?? '/', { replace: true });
      } catch (e) {
        if (isAxiosError(e) && e.response?.status === 401) {
          setErrors({ submit: '아이디 또는 비밀번호가 올바르지 않습니다.' });
        } else if (e instanceof NotAdminError) {
          setErrors({ submit: '관리자 권한이 없습니다.' });
        } else if (e instanceof Error) {
          setErrors({ submit: e.message });
        } else {
          setErrors({ submit: `오류: ${JSON.stringify(e)}` });
        }
      }
    },
  });

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
          <Stack component='form' noValidate onSubmit={handleSubmit} sx={{ width: '415px', gap: 3 }}>
            <h3 style={{ textAlign: 'center' }}>로그인</h3>
            <TextField
              type='userId'
              value={values.userId}
              name='userId'
              onBlur={handleBlur}
              onChange={handleChange}
              label='이메일'
              fullWidth
              error={Boolean(touched.userId && errors.userId)}
              helperText={touched.userId ? errors.userId : ''}
            />
            <TextField
              fullWidth
              type={showPassword ? 'text' : 'password'}
              value={values.password}
              name='password'
              onBlur={handleBlur}
              onChange={handleChange}
              error={Boolean(touched.password && errors.password)}
              helperText={touched.password ? errors.password : ''}
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
              label='비밀번호'
            />
            {errors.submit && <FormHelperText error>{errors.submit}</FormHelperText>}
            <Button disabled={isSubmitting} fullWidth size='large' type='submit' variant='contained' color='primary'>
              로그인
            </Button>
          </Stack>
        </Card>
      </Stack>
    </Box>
  );
}

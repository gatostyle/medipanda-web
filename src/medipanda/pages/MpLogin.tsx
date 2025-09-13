import { Button, FormHelperText, Grid, InputAdornment, OutlinedInput, Stack } from '@mui/material';
import { isAxiosError } from 'axios';
import IconButton from 'components/@extended/IconButton';
import { useFormik } from 'formik';
import { Eye, EyeSlash } from 'iconsax-react';
import { NotAdminError, useSession } from '@/medipanda/hooks/useSession';
import { useSnackbar } from 'notistack';
import { SyntheticEvent, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthWrapper from 'sections/auth/AuthWrapper';
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
      enqueueSnackbar('인증이 만료되었습니다. 다시 로그인해주세요.', {
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
    <AuthWrapper>
      <Grid container spacing={3} component='form' noValidate onSubmit={handleSubmit}>
        <Grid item xs={12} sx={{ textAlign: 'center' }}>
          <h3>로그인</h3>
        </Grid>
        <Grid item xs={12}>
          <Stack spacing={1}>
            <OutlinedInput
              type='userId'
              value={values.userId}
              name='userId'
              onBlur={handleBlur}
              onChange={handleChange}
              label='이메일'
              fullWidth
              error={Boolean(touched.userId && errors.userId)}
            />
          </Stack>
          {touched.userId && errors.userId && <FormHelperText error>{errors.userId}</FormHelperText>}
        </Grid>
        <Grid item xs={12}>
          <Stack spacing={1}>
            <OutlinedInput
              fullWidth
              error={Boolean(touched.password && errors.password)}
              type={showPassword ? 'text' : 'password'}
              value={values.password}
              name='password'
              onBlur={handleBlur}
              onChange={handleChange}
              endAdornment={
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
              }
              label='비밀번호'
            />
          </Stack>
          {touched.password && errors.password && <FormHelperText error>{errors.password}</FormHelperText>}
        </Grid>
        {errors.submit && (
          <Grid item xs={12}>
            <FormHelperText error>{errors.submit}</FormHelperText>
          </Grid>
        )}
        <Grid item xs={12} sx={{ pointerEvents: isSubmitting ? 'none' : undefined }}>
          <Button disabled={isSubmitting} fullWidth size='large' type='submit' variant='contained' color='primary'>
            로그인
          </Button>
        </Grid>
      </Grid>
    </AuthWrapper>
  );
}

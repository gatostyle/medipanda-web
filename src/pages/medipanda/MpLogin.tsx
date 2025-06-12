import Grid from '@mui/material/Grid';
import AuthWrapper from 'sections/auth/AuthWrapper';
import { SyntheticEvent, useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Stack from '@mui/material/Stack';
import OutlinedInput from '@mui/material/OutlinedInput';
import FormHelperText from '@mui/material/FormHelperText';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from 'components/@extended/IconButton';
import { Eye, EyeSlash } from 'iconsax-react';
import Button from '@mui/material/Button';
import { useMpSession } from 'hooks/medipanda/useMpSession';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSnackbar } from 'notistack';

export default function MpLogin() {
  const { login } = useMpSession();
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
        preventDuplicate: true
      });
    }
  }, [location.search, enqueueSnackbar]);

  const { values, touched, errors, isSubmitting, handleChange, handleBlur, handleSubmit } = useFormik({
    initialValues: {
      userId: '',
      password: '',
      submit: null
    },
    validationSchema: Yup.object().shape({
      userId: Yup.string().required('아이디를 입력해 주세요.'),
      password: Yup.string().required('비밀번호를 입력해 주세요.')
    }),
    onSubmit: async (values, { setErrors }) => {
      try {
        await login(values.userId, values.password);

        const params = new URLSearchParams(location.search);
        const redirectTo = params.get('redirectTo');

        navigate(redirectTo || '/', { replace: true });
      } catch (e: any) {
        setErrors({ submit: `오류: ${JSON.stringify(e)}` });
      }
    }
  });

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event: SyntheticEvent) => {
    event.preventDefault();
  };

  return (
    <AuthWrapper>
      <Grid container spacing={3} component="form" noValidate onSubmit={handleSubmit}>
        <Grid item xs={12} sx={{ textAlign: 'center' }}>
          <h3>로그인</h3>
        </Grid>
        <Grid item xs={12}>
          <Stack spacing={1}>
            <OutlinedInput
              type="userId"
              value={values.userId}
              name="userId"
              onBlur={handleBlur}
              onChange={handleChange}
              placeholder="이메일"
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
              name="password"
              onBlur={handleBlur}
              onChange={handleChange}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                    color="secondary"
                  >
                    {showPassword ? <Eye /> : <EyeSlash />}
                  </IconButton>
                </InputAdornment>
              }
              placeholder="비밀번호"
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
          <Button disabled={isSubmitting} fullWidth size="large" type="submit" variant="contained" color="primary">
            로그인
          </Button>
        </Grid>
      </Grid>
    </AuthWrapper>
  );
}

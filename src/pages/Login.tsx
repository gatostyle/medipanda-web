import { MedipandaButton } from '@/custom/components/MedipandaButton';
import { MedipandaOutlinedInput } from '@/custom/components/MedipandaOutlinedInput';
import { useSession } from '@/hooks/useSession';
import { FixedLinearProgress } from '@/lib/components/FixedLinearProgress';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Box, Card, FormControl, FormHelperText, IconButton, InputAdornment, Stack, Typography } from '@mui/material';
import { isAxiosError } from 'axios';
import { useFormik } from 'formik';
import { type SyntheticEvent, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import * as Yup from 'yup';

export default function Login() {
  const { session, login } = useSession();
  const navigate = useNavigate();
  const [urlSearchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);

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
      if (values.userId === '') {
        setErrors({ userId: '아이디를 입력해 주세요.' });
        return;
      }

      if (values.password === '') {
        setErrors({ password: '비밀번호를 입력해 주세요.' });
        return;
      }

      try {
        await login(values.userId, values.password);

        onLoginSuccess(urlSearchParams);
      } catch (e) {
        if (isAxiosError(e) && e.response?.status === 401) {
          setErrors({ password: '아이디 또는 비밀번호가 올바르지 않습니다.' });
        } else if (e instanceof Error) {
          setErrors({ password: e.message });
        } else {
          setErrors({ password: `오류: ${JSON.stringify(e)}` });
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

  const onLoginSuccess = (urlSearchParams: URLSearchParams) => {
    navigate(urlSearchParams.get('redirectTo') ?? '/', { replace: true });
  };

  useEffect(() => {
    if (session !== null) {
      onLoginSuccess(urlSearchParams);
    }
  }, [session, navigate, urlSearchParams]);

  if (session !== null) {
    return <FixedLinearProgress />;
  }

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
        justifyContent='center'
        alignItems='center'
        sx={{
          minHeight: '100vh',
        }}
      >
        <Card
          sx={{
            maxWidth: { xs: 400, md: 480 },
            margin: { xs: 2.5, md: 3 },
            '& > *': {
              flexGrow: 1,
              flexBasis: '50%',
            },
          }}
        >
          <Box sx={{ p: { xs: 2, sm: 3, md: 4, xl: 5 } }}>
            <Stack
              gap='20px'
              component='form'
              noValidate
              onSubmit={handleSubmit}
              sx={{
                width: '400px',
              }}
            >
              <Typography variant='heading4B' sx={{ alignSelf: 'center' }}>
                로그인
              </Typography>
              <FormControl>
                <MedipandaOutlinedInput
                  type='userId'
                  value={values.userId}
                  name='userId'
                  onBlur={handleBlur}
                  onChange={handleChange}
                  placeholder='이메일'
                  fullWidth
                  error={Boolean(touched.userId && errors.userId)}
                  sx={{
                    height: '50px',
                  }}
                />
                <FormHelperText error>{(touched.userId && errors.userId && errors.userId) || ' '}</FormHelperText>
              </FormControl>
              <FormControl>
                <MedipandaOutlinedInput
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
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  }
                  placeholder='비밀번호'
                  sx={{
                    height: '50px',
                  }}
                />
                <FormHelperText error>{(touched.password && errors.password && errors.password) || ' '}</FormHelperText>
              </FormControl>
              <Stack sx={{ pointerEvents: isSubmitting ? 'none' : undefined }}>
                <MedipandaButton type='submit' disabled={isSubmitting} fullWidth size='large' variant='contained' color='secondary'>
                  로그인
                </MedipandaButton>
                <FormHelperText error>{errors.submit}</FormHelperText>
              </Stack>
            </Stack>
          </Box>
        </Card>
      </Stack>
    </Box>
  );
}

import { MedipandaButton } from '@/custom/components/MedipandaButton';
import { MedipandaCheckbox } from '@/custom/components/MedipandaCheckbox';
import { MedipandaOutlinedInput } from '@/custom/components/MedipandaOutlinedInput';
import { useSession } from '@/hooks/useSession';
import { FixedLinearProgress } from '@/lib/components/FixedLinearProgress';
import { colors } from '@/themes';
import { CheckCircle, CheckCircleOutline, Visibility, VisibilityOff } from '@mui/icons-material';
import { Box, FormControl, FormControlLabel, FormHelperText, IconButton, InputAdornment, Stack } from '@mui/material';
import { isAxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { RequiredDeep } from 'type-fest';

export default function Login() {
  const { session, login } = useSession();
  const navigate = useNavigate();
  const [urlSearchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState(' ');

  const form = useForm({
    defaultValues: {
      userId: '',
      password: '',
      autoLogin: false,
    },
  });

  const submitHandler: SubmitHandler<RequiredDeep<(typeof form)['control']['_defaultValues']>> = async values => {
    setFormError(' ');

    if (values.userId === '') {
      setFormError('아이디를 입력해 주세요.');
      return;
    }

    if (values.password === '') {
      setFormError('비밀번호를 입력해 주세요.');
      return;
    }

    try {
      await login(values.userId, values.password);

      if (values.autoLogin) {
        localStorage.setItem('autoLogin', JSON.stringify({ userId: btoa(values.userId), password: btoa(values.password) }));
      }

      onLoginSuccess(urlSearchParams);
    } catch (e) {
      if (isAxiosError(e) && e.response?.status === 401) {
        setFormError('아이디 또는 비밀번호가 올바르지 않습니다.');
      } else if (e instanceof Error) {
        setFormError(e.message);
      } else {
        setFormError(`오류: ${JSON.stringify(e)}`);
      }
    }
  };

  const onLoginSuccess = (urlSearchParams: URLSearchParams) => {
    navigate(urlSearchParams.get('redirectTo') ?? '/', { replace: true });
  };

  useEffect(() => {
    if (session !== null) {
      onLoginSuccess(urlSearchParams);
    }
  }, [session, navigate, urlSearchParams]);

  useEffect(() => {
    try {
      const { userId: base64UserId, password: base64Password } = JSON.parse(localStorage.getItem('autoLogin')!);

      const userId = atob(base64UserId);
      const password = atob(base64Password);

      form.setValue('userId', userId);
      form.setValue('password', password);
      form.setValue('autoLogin', true);

      if (userId !== '' && password !== '') {
        form.handleSubmit(submitHandler)();
      }
    } catch {
      localStorage.removeItem('autoLogin');
    }
  }, []);

  if (session !== null) {
    return <FixedLinearProgress />;
  }

  return (
    <Stack justifyContent='center' alignItems='center' sx={{ flex: '1 0' }}>
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
      <Stack justifyContent='center' alignItems='center'>
        <Box
          sx={{
            padding: '60px 265px 60px 297px',
            border: `1px solid ${colors.gray80}`,
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
              onSubmit={form.handleSubmit(submitHandler)}
              sx={{
                alignItems: 'center',
                width: '350px',
              }}
            >
              <img src='/assets/logo.svg' alt='medipanda' width='230' height='43' />
              <FormControl fullWidth>
                <Controller
                  control={form.control}
                  name={'userId'}
                  render={({ field }) => (
                    <MedipandaOutlinedInput
                      {...field}
                      placeholder='ID'
                      sx={{
                        height: '50px',
                      }}
                    />
                  )}
                />
              </FormControl>
              <FormControl fullWidth>
                <Controller
                  control={form.control}
                  name={'password'}
                  render={({ field }) => (
                    <MedipandaOutlinedInput
                      {...field}
                      type={showPassword ? 'text' : 'password'}
                      name='password'
                      endAdornment={
                        <InputAdornment position='end'>
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge='end'>
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      }
                      placeholder='Password'
                      sx={{
                        height: '50px',
                      }}
                    />
                  )}
                />
              </FormControl>
              <Controller
                control={form.control}
                name={'autoLogin'}
                render={({ field }) => (
                  <FormControlLabel
                    {...field}
                    control={<MedipandaCheckbox defaultChecked icon={<CheckCircleOutline />} checkedIcon={<CheckCircle />} />}
                    label='로그인 상태 유지 (자동 로그인)'
                    checked={field.value}
                  />
                )}
              />
              <Stack sx={{ width: '100%' }}>
                <MedipandaButton
                  type='submit'
                  fullWidth
                  size='large'
                  variant='contained'
                  color='secondary'
                  sx={{
                    borderRadius: '20px',
                  }}
                >
                  Login
                </MedipandaButton>
                <FormHelperText error>{formError}</FormHelperText>
              </Stack>
            </Stack>
          </Box>
        </Box>
      </Stack>
    </Stack>
  );
}

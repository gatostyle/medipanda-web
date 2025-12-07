import { MedipandaButton } from '@/custom/components/MedipandaButton';
import { MedipandaCheckbox } from '@/custom/components/MedipandaCheckbox';
import { MedipandaOutlinedInput } from '@/custom/components/MedipandaOutlinedInput';
import { useSession } from '@/hooks/useSession';
import { FixedLinearProgress } from '@/lib/components/FixedLinearProgress';
import { colors } from '@/themes';
import { CheckCircle, CheckCircleOutline, Visibility, VisibilityOff } from '@mui/icons-material';
import { FormControl, FormControlLabel, FormHelperText, IconButton, InputAdornment, Link, Stack, Typography } from '@mui/material';
import { isAxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom';
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
  const formUserId = form.watch('userId');
  const formPassword = form.watch('password');

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
    <Stack
      justifyContent='center'
      alignItems='center'
      sx={{
        flex: '1 0',
        gap: '30px',
      }}
    >
      <Stack
        sx={{
          alignItems: 'center',
          width: '912px',
          padding: '60px',
          border: `1px solid ${colors.gray80}`,
          boxSizing: 'border-box',
          '& > *': {
            flexGrow: 1,
            flexBasis: '50%',
          },
        }}
      >
        <Stack
          component='form'
          onSubmit={form.handleSubmit(submitHandler)}
          sx={{
            alignItems: 'center',
            width: '350px',
            gap: '20px',
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
                  inputProps={{
                    maxLength: 20,
                  }}
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
                  inputProps={{
                    maxLength: 30,
                  }}
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
              disabled={formUserId === '' || formPassword === ''}
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
      </Stack>
      <Stack
        direction='row'
        sx={{
          gap: '10px',
        }}
      >
        <Link underline={'hover'} component={RouterLink} to={'/find-account'} sx={{ color: colors.gray80 }}>
          <Typography variant={'largeTextR'}>아이디 찾기</Typography>
        </Link>
        <Typography variant={'mediumTextL'} sx={{ color: colors.gray40 }}>
          |
        </Typography>
        <Link underline={'hover'} component={RouterLink} to={'/find-password'} sx={{ color: colors.gray80 }}>
          <Typography variant={'largeTextR'}>비밀번호 찾기</Typography>
        </Link>
        <Typography variant={'mediumTextL'} sx={{ color: colors.gray40 }}>
          |
        </Typography>
        <Link underline={'hover'} component={RouterLink} to={'/signup'} sx={{ color: colors.gray80 }}>
          <Typography variant={'largeTextEB'}>회원가입</Typography>
        </Link>
      </Stack>
    </Stack>
  );
}

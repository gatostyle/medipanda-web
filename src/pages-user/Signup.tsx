import { checkPhone, isUserIdAvailable, signup } from '@/backend';
import { MedipandaButton } from '@/custom/components/MedipandaButton';
import { MedipandaFileUploadButton } from '@/custom/components/MedipandaFileUploadButton';
import { MedipandaOutlinedInput } from '@/custom/components/MedipandaOutlinedInput';
import { isValidEmail } from '@/lib/utils/form';
import { colors } from '@/themes';
import { isValidPassword, isValidUserId } from '@/utils/form';
import { requestKmcAuth } from '@/utils/kmc';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Checkbox, FormControlLabel, IconButton, InputAdornment, Link, Stack, Typography } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

export default function Signup() {
  const AVAILABLE_FILE_EXTENSIONS = ['jpg', 'jpeg', 'pdf', 'png'];

  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      userId: '',
      userIdAvailable: false,
      password: '',
      showPassword: false,
      passwordConfirm: '',
      showPasswordConfirm: false,
      phoneNumber: '',
      name: '',
      gender: 'MALE' as 'MALE' | 'FEMALE',
      birthDate: '',
      email: '',
      csoCertFile: null as File | null,
      referralCode: '',
      agreeToTerms: false,
      agreeToPrivacy: false,
      agreeToMarketingSms: false,
      agreeToMarketingEmail: false,
      agreeToMarketingPush: false,
    },
  });
  const formUserId = form.watch('userId');
  const formUserIdAvailable = form.watch('userIdAvailable');
  const formPassword = form.watch('password');
  const formShowPassword = form.watch('showPassword');
  const formPasswordConfirm = form.watch('passwordConfirm');
  const formShowPasswordConfirm = form.watch('showPasswordConfirm');
  const formPhoneNumber = form.watch('phoneNumber');
  const formEmail = form.watch('email');
  const formCsoCertFile = form.watch('csoCertFile');
  const formAgreeToTerms = form.watch('agreeToTerms');
  const formAgreeToPrivacy = form.watch('agreeToPrivacy');
  const formAgreeToMarketingSms = form.watch('agreeToMarketingSms');
  const formAgreeToMarketingEmail = form.watch('agreeToMarketingEmail');
  const formAgreeToMarketingPush = form.watch('agreeToMarketingPush');

  const userIdValidation = isValidUserId(formUserId);
  const userIdError = userIdValidation === true ? (formUserIdAvailable ? null : '아이디 중복확인을 해주세요.') : userIdValidation;
  const passwordValidation = isValidPassword(formPassword);
  const passwordError =
    passwordValidation === true ? (formPassword === formPasswordConfirm ? null : '비밀번호가 일치하지 않습니다.') : passwordValidation;
  const emailValidation = isValidEmail(formEmail);
  const emailError = emailValidation === true ? null : emailValidation;

  const handleCheckUseridAvailable = async () => {
    const userId = form.getValues('userId');

    if (userId === '') {
      alert('아이디를 입력하세요.');
      return;
    }

    const userIdValidation = isValidUserId(formUserId);

    if (userIdValidation !== true) {
      alert(userIdValidation);
      return;
    }

    try {
      const available = await isUserIdAvailable(userId);
      if (available) {
        alert('사용 가능한 아이디입니다.');
        form.setValue('userIdAvailable', true);
      } else {
        alert('이미 사용 중인 아이디입니다.');
      }
    } catch (e) {
      console.error('Failed to check user ID availability:', e);
      alert('아이디 확인 중 오류가 발생했습니다.');
    }
  };

  const handleRequestAuth = async () => {
    const authResult = await requestKmcAuth();

    try {
      const phoneNumberAvailable = await checkPhone({ phone: authResult.phone });

      if (!phoneNumberAvailable) {
        alert('이미 가입된 휴대폰 번호입니다.');
        return;
      }

      form.setValue('phoneNumber', authResult.phone);
      form.setValue('name', authResult.name);
      form.setValue('gender', authResult.gender);
      form.setValue('birthDate', authResult.birth);
    } catch (e) {
      console.error('Failed to check phone:', e);
      alert('휴대폰 인증 중 오류가 발생했습니다.');
    }
  };

  const handleFileUpload = (files: File[]) => {
    const file = files[0];

    if (AVAILABLE_FILE_EXTENSIONS.map(ext => `.${ext}`).includes(file.name.slice(file.name.lastIndexOf('.')).toLowerCase()) === false) {
      alert(`${AVAILABLE_FILE_EXTENSIONS.join(', ')} 파일만 업로드 가능합니다.`);
      return;
    }

    form.setValue('csoCertFile', file);
  };

  const handleSignup = async () => {
    const userId = form.getValues('userId');
    const password = form.getValues('password');
    const passwordConfirm = form.getValues('passwordConfirm');
    const phoneNumber = form.getValues('phoneNumber');
    const name = form.getValues('name');
    const gender = form.getValues('gender');
    const birthDate = form.getValues('birthDate');
    const email = form.getValues('email');
    const csoCertFile = form.getValues('csoCertFile');
    const referralCode = form.getValues('referralCode');
    const agreeToTerms = form.getValues('agreeToTerms');
    const agreeToPrivacy = form.getValues('agreeToPrivacy');
    const agreeToMarketingSms = form.getValues('agreeToMarketingSms');
    const agreeToMarketingEmail = form.getValues('agreeToMarketingEmail');
    const agreeToMarketingPush = form.getValues('agreeToMarketingPush');

    if (userId === '') {
      alert('아이디를 입력하세요.');
      return;
    }

    if (userIdError !== null) {
      alert(userIdError);
      return;
    }

    if (password === '') {
      alert('비밀번호를 입력하세요.');
      return;
    }

    if (password !== passwordConfirm) {
      alert('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    if (passwordError !== null) {
      alert(passwordError);
      return;
    }

    if (phoneNumber === '') {
      alert('휴대폰 번호를 인증하세요.');
      return;
    }

    if (email === '') {
      alert('이메일을 입력하세요.');
      return;
    }

    if (!agreeToTerms) {
      alert('이용약관에 동의하세요.');
      return;
    }

    if (!agreeToPrivacy) {
      alert('개인정보처리방침에 동의하세요.');
      return;
    }

    try {
      await signup({
        file: csoCertFile ?? undefined,
        request: {
          userId,
          password,
          phoneNumber,
          name,
          gender,
          birthDate,
          email,
          referralCode: referralCode !== '' ? referralCode : null,
          marketingAgreement: {
            sms: agreeToMarketingSms,
            smsAgreedAt: null,
            email: agreeToMarketingEmail,
            emailAgreedAt: null,
            push: agreeToMarketingPush,
            pushAgreedAt: null,
          },
          nickname: null,
        },
      });
      alert('회원가입이 완료되었습니다.');
      navigate('/login');
    } catch (e) {
      console.error('Failed to signup:', e);
      alert('회원가입 중 오류가 발생했습니다.');
    }
  };

  return (
    <>
      <Stack sx={{ alignSelf: 'center' }}>
        <Typography variant='headingPc3M' sx={{ color: colors.black, textAlign: 'center', marginBottom: '40px' }}>
          회원가입
        </Typography>
        <Stack sx={{ gap: '30px', width: '421px' }}>
          <Stack sx={{ gap: '8px' }}>
            <Stack direction='row'>
              <Typography variant='largeTextM' sx={{ color: colors.gray80 }}>
                ID*
              </Typography>
              <Typography variant='smallTextR' sx={{ color: userIdError !== null ? colors.red : colors.blue, marginLeft: 'auto' }}>
                {userIdError !== null ? userIdError : '✓ ID가 확인되었습니다.'}
              </Typography>
            </Stack>
            <Controller
              control={form.control}
              name={'userId'}
              render={({ field }) => (
                <MedipandaOutlinedInput
                  {...field}
                  onChange={event => {
                    field.onChange(event);
                    form.setValue('userIdAvailable', false);
                  }}
                  placeholder='아이디를 입력해주세요.'
                  endAdornment={
                    <MedipandaButton
                      onClick={handleCheckUseridAvailable}
                      disabled={formUserIdAvailable}
                      variant='contained'
                      size='small'
                      color='secondary'
                      sx={{
                        paddingX: '20px',
                      }}
                    >
                      중복확인
                    </MedipandaButton>
                  }
                  sx={{
                    height: '50px',
                  }}
                />
              )}
            />
          </Stack>

          <Stack sx={{ gap: '8px' }}>
            <Stack direction='row'>
              <Typography variant='largeTextM' sx={{ color: colors.gray80 }}>
                Password*
              </Typography>
              <Typography variant='smallTextR' sx={{ color: passwordError !== null ? colors.red : colors.blue, marginLeft: 'auto' }}>
                {passwordError !== null ? passwordError : '✓ 비밀번호가 확인되었습니다.'}
              </Typography>
            </Stack>
            <Stack sx={{ gap: '5px' }}>
              <Controller
                control={form.control}
                name={'password'}
                render={({ field }) => (
                  <MedipandaOutlinedInput
                    {...field}
                    placeholder='비밀번호를 입력해주세요.'
                    type={formShowPassword ? 'text' : 'password'}
                    endAdornment={
                      <InputAdornment position='end'>
                        <IconButton onClick={() => form.setValue('showPassword', !formShowPassword)} edge='end'>
                          {formShowPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    }
                    sx={{
                      height: '50px',
                    }}
                  />
                )}
              />
              <Controller
                control={form.control}
                name={'passwordConfirm'}
                render={({ field }) => (
                  <MedipandaOutlinedInput
                    {...field}
                    type={formShowPasswordConfirm ? 'text' : 'password'}
                    placeholder='비밀번호를 다시 입력해주세요.'
                    endAdornment={
                      <InputAdornment position='end'>
                        <IconButton onClick={() => form.setValue('showPasswordConfirm', !formShowPasswordConfirm)} edge='end'>
                          {formShowPasswordConfirm ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    }
                    sx={{
                      height: '50px',
                    }}
                  />
                )}
              />
            </Stack>
          </Stack>

          <Stack sx={{ gap: '8px' }}>
            <Typography variant='largeTextM' sx={{ color: colors.gray80 }}>
              휴대폰
            </Typography>
            {formPhoneNumber !== '' ? (
              <MedipandaOutlinedInput value={formPhoneNumber} disabled sx={{ height: '50px' }} />
            ) : (
              <MedipandaButton
                onClick={handleRequestAuth}
                disabled={formPhoneNumber !== ''}
                variant='contained'
                color='primary'
                size='large'
              >
                인증요청
              </MedipandaButton>
            )}
          </Stack>

          <Stack sx={{ gap: '8px' }}>
            <Stack direction='row'>
              <Typography variant='largeTextM' sx={{ color: colors.gray80 }}>
                이메일*
              </Typography>
              <Typography variant='smallTextR' sx={{ color: emailError !== null ? colors.red : colors.blue, marginLeft: 'auto' }}>
                {emailError !== null ? emailError : '✓ 이메일이 확인되었습니다.'}
              </Typography>
            </Stack>
            <Controller
              control={form.control}
              name={'email'}
              render={({ field }) => (
                <MedipandaOutlinedInput
                  {...field}
                  placeholder='이메일을 입력해주세요.'
                  sx={{
                    height: '50px',
                  }}
                />
              )}
            />
          </Stack>

          <Stack sx={{ gap: '8px' }}>
            <Typography variant='largeTextM' sx={{ color: colors.gray80 }}>
              CSO 신고증
            </Typography>
            <Stack>
              <MedipandaFileUploadButton onChange={handleFileUpload} />
              {formCsoCertFile !== null && <Typography sx={{ color: colors.gray60 }}>{formCsoCertFile.name}</Typography>}
            </Stack>
            <Typography variant='smallTextR' sx={{ color: colors.red }}>
              {AVAILABLE_FILE_EXTENSIONS.join(', ')} 파일만 업로드 가능합니다.
            </Typography>
          </Stack>

          <Stack sx={{ gap: '8px' }}>
            <Typography variant='largeTextM' sx={{ color: colors.gray80 }}>
              추천인 코드
            </Typography>
            <Controller
              control={form.control}
              name={'referralCode'}
              render={({ field }) => (
                <MedipandaOutlinedInput
                  {...field}
                  sx={{
                    height: '50px',
                  }}
                />
              )}
            />
          </Stack>

          <Stack>
            <FormControlLabel
              control={
                <Checkbox
                  checked={
                    formAgreeToTerms &&
                    formAgreeToPrivacy &&
                    formAgreeToMarketingSms &&
                    formAgreeToMarketingEmail &&
                    formAgreeToMarketingPush
                  }
                  indeterminate={
                    (formAgreeToTerms ||
                      formAgreeToPrivacy ||
                      formAgreeToMarketingSms ||
                      formAgreeToMarketingEmail ||
                      formAgreeToMarketingPush) &&
                    (!formAgreeToTerms ||
                      !formAgreeToPrivacy ||
                      !formAgreeToMarketingSms ||
                      !formAgreeToMarketingEmail ||
                      !formAgreeToMarketingPush)
                  }
                  onChange={(_, checked) => {
                    form.setValue('agreeToTerms', checked);
                    form.setValue('agreeToPrivacy', checked);
                    form.setValue('agreeToMarketingSms', checked);
                    form.setValue('agreeToMarketingEmail', checked);
                    form.setValue('agreeToMarketingPush', checked);
                  }}
                  icon={<img src={'/assets/icons/icon-checkbox-unchecked.svg'} />}
                  indeterminateIcon={<img src={'/assets/icons/icon-checkbox-indeterminate.svg'} />}
                  checkedIcon={<img src={'/assets/icons/icon-checkbox-checked.svg'} />}
                />
              }
              label={'전체 동의'}
            />
            <Stack direction='row'>
              <FormControlLabel
                control={
                  <Controller
                    control={form.control}
                    name={'agreeToTerms'}
                    render={({ field }) => (
                      <Checkbox
                        {...field}
                        checked={field.value}
                        icon={<img src={'/assets/icons/icon-checkbox-unchecked.svg'} />}
                        checkedIcon={<img src={'/assets/icons/icon-checkbox-checked.svg'} />}
                      />
                    )}
                  />
                }
                label={'[필수] 이용약관'}
              />
              <Link
                underline='hover'
                component={RouterLink}
                to={'/terms'}
                target='_blank'
                sx={{ marginLeft: 'auto', color: colors.gray50 }}
              >
                <Typography variant='smallTextR'>보기</Typography>
              </Link>
            </Stack>
            <Stack direction='row'>
              <FormControlLabel
                control={
                  <Controller
                    control={form.control}
                    name={'agreeToPrivacy'}
                    render={({ field }) => (
                      <Checkbox
                        {...field}
                        checked={field.value}
                        icon={<img src={'/assets/icons/icon-checkbox-unchecked.svg'} />}
                        checkedIcon={<img src={'/assets/icons/icon-checkbox-checked.svg'} />}
                      />
                    )}
                  />
                }
                label={'[필수] 개인정보 처리방침'}
              />
              <Link
                underline='hover'
                component={RouterLink}
                to={'/privacy'}
                target='_blank'
                sx={{ marginLeft: 'auto', color: colors.gray50 }}
              >
                <Typography variant='smallTextR'>보기</Typography>
              </Link>
            </Stack>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formAgreeToMarketingSms && formAgreeToMarketingEmail && formAgreeToMarketingPush}
                  indeterminate={
                    (formAgreeToMarketingSms || formAgreeToMarketingEmail || formAgreeToMarketingPush) &&
                    (!formAgreeToMarketingSms || !formAgreeToMarketingEmail || !formAgreeToMarketingPush)
                  }
                  onChange={(_, checked) => {
                    form.setValue('agreeToMarketingSms', checked);
                    form.setValue('agreeToMarketingEmail', checked);
                    form.setValue('agreeToMarketingPush', checked);
                  }}
                  icon={<img src={'/assets/icons/icon-checkbox-unchecked.svg'} />}
                  indeterminateIcon={<img src={'/assets/icons/icon-checkbox-indeterminate.svg'} />}
                  checkedIcon={<img src={'/assets/icons/icon-checkbox-checked.svg'} />}
                />
              }
              label={'[선택] 마케팅 활용 및 광고성 정보 수신 동의'}
            />
            <Stack direction={'row'} sx={{ gap: '30px', marginLeft: '40px' }}>
              <FormControlLabel
                control={
                  <Controller
                    control={form.control}
                    name={'agreeToMarketingSms'}
                    render={({ field }) => (
                      <Checkbox
                        {...field}
                        checked={field.value}
                        icon={<img src={'/assets/icons/icon-checkbox-unchecked.svg'} />}
                        checkedIcon={<img src={'/assets/icons/icon-checkbox-checked.svg'} />}
                      />
                    )}
                  />
                }
                label={'SMS'}
              />
              <FormControlLabel
                control={
                  <Controller
                    control={form.control}
                    name={'agreeToMarketingEmail'}
                    render={({ field }) => (
                      <Checkbox
                        {...field}
                        checked={field.value}
                        icon={<img src={'/assets/icons/icon-checkbox-unchecked.svg'} />}
                        checkedIcon={<img src={'/assets/icons/icon-checkbox-checked.svg'} />}
                      />
                    )}
                  />
                }
                label={'e-mail'}
              />
              <FormControlLabel
                control={
                  <Controller
                    control={form.control}
                    name={'agreeToMarketingPush'}
                    render={({ field }) => (
                      <Checkbox
                        {...field}
                        checked={field.value}
                        icon={<img src={'/assets/icons/icon-checkbox-unchecked.svg'} />}
                        checkedIcon={<img src={'/assets/icons/icon-checkbox-checked.svg'} />}
                      />
                    )}
                  />
                }
                label={'app push'}
              />
            </Stack>
          </Stack>

          <MedipandaButton
            onClick={handleSignup}
            disabled={formUserId === '' || formPassword === '' || formPasswordConfirm === '' || formPhoneNumber === '' || formEmail === ''}
            variant='contained'
            color='primary'
            size='large'
            fullWidth
          >
            가입완료
          </MedipandaButton>
        </Stack>
      </Stack>
    </>
  );
}

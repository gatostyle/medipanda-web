import { changePassword_1, sendVerificationCodeForFindAccount, verifyCodeForFindPassword } from '@/backend';
import { MedipandaButton } from '@/custom/components/MedipandaButton';
import { MedipandaOutlinedInput } from '@/custom/components/MedipandaOutlinedInput';
import { normalizePhoneNumber } from '@/lib/utils/form';
import { colors } from '@/themes';
import { isValidPassword } from '@/utils/form';
import { Link, Stack, Typography } from '@mui/material';
import { isAxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

export default function FindPassword() {
  const VERFICATION_CODE_EXPIRATION = 3 * 60 * 1000;

  const navigate = useNavigate();

  const [fixedUserId, setFixedUserId] = useState<string | null>(null);

  const [verificationCodeExpiration, setVerificationCodeExpiration] = useState(0);
  const [codeVerified, setCodeVerified] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setVerificationCodeExpiration(v => v - 1_000), 1_000);

    return () => clearInterval(interval);
  });

  const form = useForm({
    defaultValues: {
      userId: '',
      phoneNumber: '',
      verificationCode: '',
      password: '',
      passwordConfirm: '',
    },
  });
  const formPhoneNumber = form.watch('phoneNumber');
  const formVerificationCode = form.watch('verificationCode');

  const handleSendVerificationCode = async () => {
    const phoneNumber = form.getValues('phoneNumber').replace(/[^0-9]/g, '');

    if (phoneNumber === '') {
      alert('휴대폰 번호를 입력해 주세요.');
      return;
    }

    try {
      await sendVerificationCodeForFindAccount({ phoneNumber });

      setVerificationCodeExpiration(VERFICATION_CODE_EXPIRATION);
    } catch (e) {
      switch (true) {
        case isAxiosError(e) && typeof e.response?.data === 'string' && e.response.data.startsWith('Invalid Korean phone number format:'):
          alert('휴대폰 번호 형식이 올바르지 않습니다. 다시 시도해 주세요.');
          break;
        case isAxiosError(e) && typeof e.response?.data === 'string' && e.response.data.startsWith('phone not found:'):
          alert('등록된 휴대폰 번호가 아닙니다. 다시 시도해 주세요.');
          break;
        default:
          console.error('Error sending verification code:', e);
          alert('인증번호 발송에 실패했습니다. 다시 시도해 주세요.');
          break;
      }
    }
  };

  const handleVerifyCode = async () => {
    const userId = form.getValues('userId');
    const phoneNumber = form.getValues('phoneNumber').replace(/[^0-9]/g, '');
    const verificationCode = form.getValues('verificationCode').replace(/[^0-9]/g, '');

    if (userId === '') {
      alert('아이디를 입력해 주세요.');
      return;
    }

    if (verificationCode === '') {
      alert('인증번호를 입력해 주세요.');
      return;
    }

    try {
      await verifyCodeForFindPassword({ userId, phoneNumber, verificationCode });
      setCodeVerified(true);
    } catch (e) {
      console.error('Error verifying code:', e);
      alert('인증번호 확인에 실패했습니다. 다시 시도해 주세요.');
    }
  };

  const handleFindPassword = async () => {
    setFixedUserId(form.getValues('userId'));
  };

  const handleChangePassword = async () => {
    const password = form.getValues('password');
    const passwordConfirm = form.getValues('passwordConfirm');

    if (password === '') {
      alert('새 비밀번호를 입력해 주세요.');
      return;
    }

    const passwordValidation = isValidPassword(password);

    if (passwordValidation !== true) {
      alert(passwordValidation);
      return;
    }

    if (password !== passwordConfirm) {
      alert('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      await changePassword_1(fixedUserId!, { userId: fixedUserId!, newPassword: password });
      alert('비밀번호가 성공적으로 변경되었습니다.');
      navigate('/login');
    } catch (e) {
      console.error('Error changing password:', e);
      alert('비밀번호 변경에 실패했습니다. 다시 시도해 주세요.');
    }
  };

  return (
    <Stack
      sx={{
        justifyContent: 'center',
        alignItems: 'center',
        flex: '1 0',
      }}
    >
      <Stack>
        <Stack direction={'row'}>
          <Link
            underline={'none'}
            component={RouterLink}
            to={'/find-account'}
            sx={{
              flexGrow: 1,

              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100px',
              border: `1px solid ${colors.gray40}`,
              borderRight: 'none',
              borderBottom: `1px solid ${colors.gray80}`,
              boxSizing: 'border-box',

              color: colors.gray80,
            }}
          >
            아이디 찾기
          </Link>
          <Link
            underline={'none'}
            component={RouterLink}
            to={'/find-password'}
            sx={{
              flexGrow: 1,

              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100px',
              border: `1px solid ${colors.gray80}`,
              borderBottom: 'none',
              boxSizing: 'border-box',

              color: colors.gray80,
            }}
          >
            비밀번호 찾기
          </Link>
        </Stack>
        <Stack
          sx={{
            gap: '50px',

            padding: '80px 174px',
            border: `1px solid ${colors.gray80}`,
            borderTop: 'none',
          }}
        >
          {fixedUserId === null ? (
            <>
              <Typography variant={'largeTextB'} sx={{ textAlign: 'center', color: colors.gray80 }}>
                회원정보에 등록된 정보로 비밀번호를 찾을 수 있습니다.
              </Typography>

              <table>
                <tbody>
                  <tr>
                    <td style={{ width: '100px' }}>아이디</td>
                    <td style={{ width: '330px' }}>
                      <Controller
                        control={form.control}
                        name={'userId'}
                        render={({ field }) => (
                          <MedipandaOutlinedInput
                            {...field}
                            disabled={codeVerified}
                            fullWidth
                            sx={{
                              height: '50px',
                              border: `1px solid ${colors.gray40}`,
                            }}
                          />
                        )}
                      />
                    </td>
                    <td style={{ width: '120px' }} />
                  </tr>
                  <tr>
                    <td>휴대폰 번호</td>
                    <td>
                      <Controller
                        control={form.control}
                        name={'phoneNumber'}
                        render={({ field }) => (
                          <MedipandaOutlinedInput
                            {...field}
                            onChange={event => field.onChange(normalizePhoneNumber(event.target.value.replace(/[^0-9]/g, ''), field.value))}
                            disabled={verificationCodeExpiration > 0 || codeVerified}
                            placeholder="'-' 없이 입력"
                            fullWidth
                            sx={{
                              height: '50px',
                              border: `1px solid ${colors.gray40}`,
                            }}
                          />
                        )}
                      />
                    </td>
                    <td>
                      <MedipandaButton
                        onClick={handleSendVerificationCode}
                        size='medium'
                        variant='contained'
                        disabled={formPhoneNumber === '' || verificationCodeExpiration > 0 || codeVerified}
                        fullWidth
                        sx={{
                          height: '50px',
                        }}
                      >
                        {!codeVerified && verificationCodeExpiration > 0
                          ? `${Math.floor(verificationCodeExpiration / 1000)}초`
                          : '인증번호 발송'}
                      </MedipandaButton>
                    </td>
                  </tr>
                  <tr>
                    <td>인증번호</td>
                    <td>
                      <Controller
                        control={form.control}
                        name={'verificationCode'}
                        render={({ field }) => (
                          <MedipandaOutlinedInput
                            {...field}
                            fullWidth
                            disabled={verificationCodeExpiration <= 0 || codeVerified}
                            sx={{
                              height: '50px',
                              border: `1px solid ${colors.gray40}`,
                            }}
                          />
                        )}
                      />
                    </td>
                    <td>
                      <MedipandaButton
                        onClick={handleVerifyCode}
                        size='medium'
                        variant='outlined'
                        disabled={formVerificationCode === '' || verificationCodeExpiration <= 0 || codeVerified}
                        fullWidth
                        sx={{
                          height: '50px',
                        }}
                      >
                        확인
                      </MedipandaButton>
                    </td>
                  </tr>
                </tbody>
              </table>

              <MedipandaButton
                onClick={handleFindPassword}
                size='medium'
                variant='contained'
                disabled={!codeVerified}
                sx={{
                  height: '50px',
                }}
              >
                비밀번호 재설정
              </MedipandaButton>
            </>
          ) : (
            <>
              <Typography variant={'largeTextB'} sx={{ textAlign: 'center', color: colors.gray80 }}>
                영문/숫자/특수기호 사용, 8자 이상
              </Typography>

              <table>
                <tbody>
                  <tr>
                    <td style={{ width: '100px' }}>비밀번호</td>
                    <td style={{ width: '330px' }}>
                      <Controller
                        control={form.control}
                        name={'password'}
                        render={({ field }) => (
                          <MedipandaOutlinedInput
                            {...field}
                            type='password'
                            placeholder='새로운 비밀번호를 입력해주세요'
                            fullWidth
                            sx={{
                              height: '50px',
                              border: `1px solid ${colors.gray40}`,
                            }}
                          />
                        )}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>비밀번호 확인</td>
                    <td>
                      <Controller
                        control={form.control}
                        name={'passwordConfirm'}
                        render={({ field }) => (
                          <MedipandaOutlinedInput
                            {...field}
                            type='password'
                            placeholder='새로운 비밀번호와 동일하게 입력해주세요'
                            fullWidth
                            sx={{
                              height: '50px',
                              border: `1px solid ${colors.gray40}`,
                            }}
                          />
                        )}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>

              <MedipandaButton
                onClick={handleChangePassword}
                size='medium'
                variant='contained'
                sx={{
                  height: '50px',
                }}
              >
                비밀번호 변경
              </MedipandaButton>
            </>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
}

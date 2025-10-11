import { sendVerificationCodeForFindAccount, verifyCodeForFindId } from '@/backend';
import { MedipandaButton } from '@/custom/components/MedipandaButton';
import { MedipandaOutlinedInput } from '@/custom/components/MedipandaOutlinedInput';
import { normalizePhoneNumber } from '@/lib/utils/form';
import { colors } from '@/themes';
import { Link, Stack, Typography } from '@mui/material';
import { isAxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link as RouterLink } from 'react-router-dom';

export default function FindAccount() {
  const VERFICATION_CODE_EXPIRATION = 3 * 60 * 1000;

  const [foundUserId, setFoundUserId] = useState<string | null>(null);
  const [guarded, setGuarded] = useState(true);

  const [verificationCodeExpiration, setVerificationCodeExpiration] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setVerificationCodeExpiration(v => v - 1_000), 1_000);

    return () => clearInterval(interval);
  });

  const form = useForm({
    defaultValues: {
      phoneNumber: '',
      verificationCode: '',
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
    const phoneNumber = form.getValues('phoneNumber').replace(/[^0-9]/g, '');
    const verificationCode = form.getValues('verificationCode').replace(/[^0-9]/g, '');

    if (verificationCode === '') {
      alert('인증번호를 입력해 주세요.');
      return;
    }

    try {
      const userId = await verifyCodeForFindId({ phoneNumber, verificationCode });

      if (userId === '') {
        alert('인증번호가 올바르지 않습니다. 다시 시도해 주세요.');
        return;
      }

      setFoundUserId(userId);
    } catch (e) {
      console.error('Error verifying code:', e);
      alert('인증번호 확인에 실패했습니다. 다시 시도해 주세요.');
    }
  };

  const handleFindAccount = async () => {
    setGuarded(false);
  };

  return (
    <Stack
      sx={{
        justifyContent: 'center',
        alignItems: 'center',
        flex: '1 0',
      }}
    >
      {guarded ? (
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
                border: `1px solid ${colors.gray80}`,
                borderBottom: 'none',
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
                border: `1px solid ${colors.gray40}`,
                borderBottom: `1px solid ${colors.gray80}`,
                borderLeft: 'none',
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
            <Typography variant={'largeTextB'} sx={{ textAlign: 'center', color: colors.gray80 }}>
              회원정보에 등록된 정보로 아이디를 찾을 수 있습니다.
            </Typography>

            <table>
              <tbody>
                <tr>
                  <td style={{ width: '100px' }}>휴대폰 번호</td>
                  <td style={{ width: '330px' }}>
                    <Controller
                      control={form.control}
                      name={'phoneNumber'}
                      render={({ field }) => (
                        <MedipandaOutlinedInput
                          {...field}
                          onChange={event => field.onChange(normalizePhoneNumber(event.target.value.replace(/[^0-9]/g, ''), field.value))}
                          disabled={verificationCodeExpiration > 0 || foundUserId !== null}
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
                  <td style={{ width: '120px' }}>
                    <MedipandaButton
                      onClick={handleSendVerificationCode}
                      size='large'
                      variant='contained'
                      disabled={formPhoneNumber === '' || verificationCodeExpiration > 0 || foundUserId !== null}
                      fullWidth
                    >
                      {foundUserId === null && verificationCodeExpiration > 0
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
                          disabled={verificationCodeExpiration <= 0 || foundUserId !== null}
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
                      size='large'
                      variant='outlined'
                      disabled={formVerificationCode === '' || verificationCodeExpiration <= 0 || foundUserId !== null}
                      fullWidth
                    >
                      확인
                    </MedipandaButton>
                  </td>
                </tr>
              </tbody>
            </table>

            <MedipandaButton onClick={handleFindAccount} size='large' variant='contained' disabled={foundUserId === null}>
              아이디 찾기
            </MedipandaButton>
          </Stack>
        </Stack>
      ) : (
        <Stack
          sx={{
            gap: '50px',
            padding: '80px 151px',
            border: `1px solid ${colors.gray80}`,
          }}
        >
          <Stack sx={{ textAlign: 'center' }}>
            <Typography variant={'heading5R'} sx={{ color: colors.gray80 }}>
              고객님 명의로 가입하신 아이디는
            </Typography>
            <Typography variant={'heading5R'} sx={{ color: colors.gray80 }}>
              &apos;<span style={{ color: colors.vividViolet }}>{foundUserId!.replace(/(?<=.{4})./g, 'x')}</span>&apos; 입니다.
            </Typography>
          </Stack>
          <Stack direction='row' sx={{ gap: '10px' }}>
            <MedipandaButton
              size='large'
              variant='contained'
              component={RouterLink}
              to='/login'
              sx={{
                width: '300px',
              }}
            >
              로그인
            </MedipandaButton>
            <MedipandaButton
              onClick={() => {
                setGuarded(true);
                setFoundUserId(null);
                form.reset();
              }}
              size='large'
              variant='contained'
              component={RouterLink}
              to='/find-password'
              sx={{
                width: '300px',

                backgroundColor: colors.gray50,
              }}
            >
              비밀번호 찾기
            </MedipandaButton>
          </Stack>
        </Stack>
      )}
    </Stack>
  );
}

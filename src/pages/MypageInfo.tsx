import { changePassword_1, createAuthRequest, isAvailableNickname, result as getAuthResult, updateMember, updateNickname } from '@/backend';
import { MedipandaButton } from '@/custom/components/MedipandaButton';
import { MedipandaFileUploadButton } from '@/custom/components/MedipandaFileUploadButton';
import { MedipandaTab, MedipandaTabElse, MedipandaTabs } from '@/custom/components/MedipandaTab';
import { useSession } from '@/hooks/useSession';
import { colors, typography } from '@/themes';
import { Box, FormControl, IconButton, InputAdornment, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { AxiosError } from 'axios';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { Link as RouterLink } from 'react-router-dom';
import type { RequiredDeep } from 'type-fest';

const MypageFormRow = styled(Stack)({
  alignItems: 'center',
  marginTop: '20px',
});

const MypageFormLabel = styled(Typography)({
  ...typography.largeTextM,
  width: '104px',
  color: colors.gray80,
  textAlign: 'left',
});

const MypageFormInput = styled(Stack)({
  width: '330px',
});

const MypageFormExtra = styled(Box)({
  width: '100px',
  marginLeft: '10px',
});

export default function MypageInfo() {
  const AVAILABLE_FILE_EXTENSIONS = ['jpg', 'jpeg', 'pdf', 'png'];

  const { session } = useSession();

  const form = useForm({
    defaultValues: {
      userId: session?.userId || '',
      password: '',
      passwordConfirm: '',
      name: session?.name || '',
      phoneNumber: session?.phoneNumber || '',
      emailId: session?.email ? session.email.split('@')[0] : '',
      emailDomain: session?.email ? session.email.split('@')[1] : '',
      nickname: session?.nickname || '',
      csoRegistrationFile: null as File | null,
      referralCode: session?.referralCode || '',
    },
  });
  const formCsoRegistrationFile = form.watch('csoRegistrationFile');

  const submitHandler: SubmitHandler<RequiredDeep<(typeof form)['control']['_defaultValues']>> = async values => {
    if (values.name === '') {
      alert('이름을 입력해주세요.');
      return;
    }

    if (values.phoneNumber === '') {
      alert('휴대폰 번호를 입력해주세요.');
      return;
    }

    if (values.emailId === '' || values.emailDomain === '') {
      alert('이메일 정보를 입력해주세요.');
      return;
    }

    if (values.nickname === '') {
      alert('닉네임을 입력해주세요.');
      return;
    }

    if (values.nickname !== session!.nickname) {
      try {
        const nicknameCheckResponse = await isAvailableNickname({
          nickname: values.nickname,
        });

        if (nicknameCheckResponse.recentlyChanged) {
          alert('닉네임은 1달에 1회만 변경할 수 있습니다.');
          return;
        }

        if (nicknameCheckResponse.duplicated) {
          alert('이미 사용 중인 닉네임입니다.');
          return;
        }
        await updateNickname({
          nickname: values.nickname,
        });
      } catch (error) {
        console.error(error);
        return;
      }
    }

    try {
      await updateMember(session!.userId, {
        request: {
          accountStatus: null,
          password: null,
          name: values.name,
          birthDate: null,
          phoneNumber: null,
          email: `${values.emailId}@${values.emailDomain}`,
          nickname: null,
          referralCode: null,
          note: null,
          marketingAgreement: null,
        },
        file: values.csoRegistrationFile ?? undefined,
      });

      alert('정보가 수정되었습니다.');
    } catch (e) {
      console.error(e);
      alert('정보 수정 중 오류가 발생했습니다.');
    }
  };

  const handlePhoneChange = async () => {
    const { certNum } = await createAuthRequest({
      cpId: 'XQWT1001',
      urlCode: '001001',
      certMet: 'M',
      plusInfo: 'WEB',
    });

    const certUrl = `https://prod.api.medipanda.co.kr/v1/kmc/auth/launch?certNum=${certNum}`;

    const popup = window.open(certUrl, '_blank', 'width=500,height=700');

    const authResult = await new Promise<Record<string, unknown>>(resolve => {
      const interval = setInterval(async () => {
        getAuthResult({ certNum })
          .then(result => {
            if (result.status == 'SUCCESS' || result.status == 'FAIL' || result.status == 'NOT_FOUND') {
              clearInterval(interval);
              popup?.close();
              resolve(result);
            }
          })
          .catch();
      }, 500);
    });

    form.setValue('phoneNumber', authResult.phone as string);
  };

  const handlePasswordChange = async () => {
    const password = form.getValues('password');
    const passwordConfirm = form.getValues('passwordConfirm');

    if (password === '' || passwordConfirm === '') {
      alert('비밀번호를 입력해주세요.');
      return;
    }

    if (password !== passwordConfirm) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      await changePassword_1(session!.userId, {
        userId: session!.userId,
        newPassword: password,
      });

      alert('비밀번호가 변경되었습니다.');
      form.setValue('password', '');
      form.setValue('passwordConfirm', '');
    } catch (e) {
      if (e instanceof AxiosError && e.response?.status === 400) {
        alert('현재 비밀번호가 일치하지 않습니다.');
      } else {
        console.error(e);
        alert('비밀번호 변경 중 오류가 발생했습니다.');
      }
    }
  };

  const handleCopyReferralCode = () => {
    navigator.clipboard.writeText(form.getValues('referralCode'));
    alert('추천인 코드가 복사되었습니다.');
  };

  const handleFileUpload = (files: File[]) => {
    const file = files[0];

    if (AVAILABLE_FILE_EXTENSIONS.map(ext => `.${ext}`).includes(file.name.slice(file.name.lastIndexOf('.')).toLowerCase()) === false) {
      alert(`${AVAILABLE_FILE_EXTENSIONS.join(', ')} 파일만 업로드 가능합니다.`);
      return;
    }

    form.setValue('csoRegistrationFile', file);
  };

  return (
    <>
      <>
        <Typography variant='heading3M' sx={{ color: colors.gray80 }}>
          내정보관리
        </Typography>

        <MedipandaTabs value={0} sx={{ marginTop: '30px' }}>
          <MedipandaTab label={'기본정보'}></MedipandaTab>
          <MedipandaTabElse />
        </MedipandaTabs>

        <Stack
          sx={{
            alignItems: 'center',
            mt: '20px',
            marginBottom: '60px',
          }}
        >
          <Stack sx={{ width: '544px' }}>
            <MypageFormRow direction='row'>
              <MypageFormLabel>ID*</MypageFormLabel>
              <MypageFormInput>
                <Controller
                  control={form.control}
                  name={'userId'}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      disabled
                      sx={{
                        flex: 1,
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#f8f9fa',
                        },
                      }}
                    />
                  )}
                />
              </MypageFormInput>
            </MypageFormRow>

            <MypageFormRow direction='row'>
              <MypageFormLabel>Password*</MypageFormLabel>
              <MypageFormInput gap={'5px'}>
                <Controller
                  control={form.control}
                  name={'password'}
                  render={({ field }) => <TextField {...field} type='password' placeholder='비밀번호를 입력해주세요' />}
                />
              </MypageFormInput>
              <MypageFormExtra>
                <MedipandaButton fullWidth variant='contained' size='large' onClick={handlePasswordChange}>
                  변경
                </MedipandaButton>
              </MypageFormExtra>
            </MypageFormRow>

            <MypageFormRow
              direction='row'
              sx={{
                marginTop: '5px',
              }}
            >
              <MypageFormLabel />
              <MypageFormInput>
                <Controller
                  control={form.control}
                  name={'passwordConfirm'}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type='password'
                      placeholder='새 비밀번호를 입력해주세요'
                      sx={{
                        '& .MuiOutlinedInput-root': {},
                      }}
                    />
                  )}
                />
              </MypageFormInput>
              <MypageFormExtra />
            </MypageFormRow>

            <MypageFormRow direction='row'>
              <MypageFormLabel>이름*</MypageFormLabel>
              <MypageFormInput>
                <Controller control={form.control} name={'name'} render={({ field }) => <TextField {...field} sx={{ flex: 1 }} />} />
              </MypageFormInput>
            </MypageFormRow>

            <MypageFormRow direction='row'>
              <MypageFormLabel>휴대폰 번호</MypageFormLabel>
              <MypageFormInput>
                <Controller
                  control={form.control}
                  name={'phoneNumber'}
                  render={({ field }) => <TextField {...field} disabled sx={{ flex: 1 }} />}
                />
              </MypageFormInput>
              <MypageFormExtra>
                <MedipandaButton fullWidth variant='contained' size='large' onClick={handlePhoneChange}>
                  변경
                </MedipandaButton>
              </MypageFormExtra>
            </MypageFormRow>

            <MypageFormRow direction='row'>
              <MypageFormLabel>이메일*</MypageFormLabel>
              <MypageFormInput
                direction='row'
                gap={'6px'}
                sx={{
                  alignItems: 'center',
                }}
              >
                <Controller control={form.control} name={'emailId'} render={({ field }) => <TextField {...field} sx={{ flex: 1 }} />} />
                <Typography sx={{ color: '#666' }}>@</Typography>
                <Controller
                  control={form.control}
                  name={'emailDomain'}
                  render={({ field }) => (
                    <FormControl sx={{ minWidth: 140 }}>
                      <Select {...field}>
                        <MenuItem value='naver.com'>naver.com</MenuItem>
                        <MenuItem value='gmail.com'>gmail.com</MenuItem>
                        <MenuItem value='daum.net'>daum.net</MenuItem>
                        <MenuItem value='hanmail.net'>hanmail.net</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </MypageFormInput>
            </MypageFormRow>
          </Stack>
        </Stack>

        <MedipandaTabs value={0}>
          <MedipandaTab label={'추가정보'}></MedipandaTab>
          <MedipandaTabElse />
        </MedipandaTabs>

        <Stack
          sx={{
            alignItems: 'center',
            mt: '20px',
            marginBottom: '60px',
          }}
        >
          <Stack sx={{ width: '544px' }}>
            <MypageFormRow direction='row'>
              <MypageFormLabel>닉네임</MypageFormLabel>
              <MypageFormInput>
                <Controller
                  control={form.control}
                  name={'nickname'}
                  render={({ field }) => <TextField {...field} fullWidth sx={{ marginBottom: 1 }} />}
                />
                <Typography sx={{ color: '#f44336', fontSize: '12px' }}>닉네임 변경은 1달에 1회 가능합니다.</Typography>
              </MypageFormInput>
            </MypageFormRow>

            <MypageFormRow direction='row'>
              <MypageFormLabel>CSO 등록증</MypageFormLabel>
              <MypageFormInput>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 1 }}>
                  <MedipandaFileUploadButton onChange={handleFileUpload} />
                  {formCsoRegistrationFile !== null && <Typography sx={{ color: '#666' }}>{formCsoRegistrationFile.name}</Typography>}
                </Box>
                <Typography sx={{ color: '#f44336', fontSize: '12px', display: 'block' }}>
                  {AVAILABLE_FILE_EXTENSIONS.join(', ')} 파일만 업로드 가능합니다.
                </Typography>
              </MypageFormInput>
            </MypageFormRow>

            <MypageFormRow direction='row'>
              <MypageFormLabel>추천인 코드</MypageFormLabel>
              <MypageFormInput>
                <Controller
                  control={form.control}
                  name={'referralCode'}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      disabled
                      InputProps={{
                        readOnly: true,
                        endAdornment: (
                          <InputAdornment position='end'>
                            <IconButton onClick={handleCopyReferralCode}>
                              <img src='/assets/icons/icon-send.svg' />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        flex: 1,
                      }}
                    />
                  )}
                />
              </MypageFormInput>
            </MypageFormRow>
          </Stack>
        </Stack>

        <Stack
          direction='row'
          gap='10px'
          component='form'
          onSubmit={form.handleSubmit(submitHandler)}
          sx={{
            alignSelf: 'center',
            width: '330px',
          }}
        >
          <MedipandaButton variant='outlined' size='large' color='secondary' fullWidth component={RouterLink} to={'/'}>
            취소
          </MedipandaButton>
          <MedipandaButton type='submit' variant='contained' fullWidth size='large' color='secondary'>
            수정
          </MedipandaButton>
        </Stack>
      </>
    </>
  );
}

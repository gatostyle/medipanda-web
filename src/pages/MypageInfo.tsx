import { changePassword, createAuthRequest, result as getAuthResult, updateMember } from '@/backend';
import { MedipandaButton } from '@/custom/components/MedipandaButton';
import { MedipandaFileUploadButton } from '@/custom/components/MedipandaFileUploadButton';
import { MedipandaTab, MedipandaTabElse, MedipandaTabs } from '@/custom/components/MedipandaTab';
import { useSession } from '@/hooks/useSession';
import { colors, typography } from '@/themes';
import { Box, FormControl, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { AxiosError } from 'axios';
import { useFormik } from 'formik';
import { Link as RouterLink } from 'react-router-dom';

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
  const { session } = useSession();

  const formik = useFormik({
    initialValues: {
      userId: session?.userId || '',
      password: '',
      passwordConfirm: '',
      name: session?.name || '',
      phoneNumber: session?.phoneNumber || '',
      emailId: session?.email ? session.email.split('@')[0] : '',
      emailDomain: session?.email ? session.email.split('@')[1] : '',
      csoRegistrationFile: null as File | null,
    },
    onSubmit: async values => {
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
    },
  });

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

    formik.setFieldValue('phoneNumber', authResult.phone);
  };

  const handlePasswordChange = async () => {
    if (formik.values.password === '' || formik.values.passwordConfirm === '') {
      alert('비밀번호를 입력해주세요.');
      return;
    }

    if (formik.values.password !== formik.values.passwordConfirm) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      await changePassword(session!.userId, {
        userId: session!.userId,
        currentPassword: formik.values.password,
        newPassword: formik.values.passwordConfirm,
      });

      alert('비밀번호가 변경되었습니다.');
      formik.setFieldValue('password', '');
      formik.setFieldValue('passwordConfirm', '');
    } catch (e) {
      if (e instanceof AxiosError && e.response?.status === 400) {
        alert('현재 비밀번호가 일치하지 않습니다.');
      } else {
        console.error(e);
        alert('비밀번호 변경 중 오류가 발생했습니다.');
      }
    }
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
                <TextField
                  value={formik.values.userId}
                  disabled
                  sx={{
                    flex: 1,
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#f8f9fa',
                    },
                  }}
                />
              </MypageFormInput>
            </MypageFormRow>

            <MypageFormRow direction='row'>
              <MypageFormLabel>Password*</MypageFormLabel>
              <MypageFormInput gap={'5px'}>
                <TextField
                  type='password'
                  name='password'
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  placeholder='비밀번호를 입력해주세요'
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
                <TextField
                  type='password'
                  name='passwordConfirm'
                  value={formik.values.passwordConfirm}
                  onChange={formik.handleChange}
                  placeholder='새 비밀번호를 입력해주세요'
                  sx={{
                    '& .MuiOutlinedInput-root': {},
                  }}
                />
              </MypageFormInput>
              <MypageFormExtra />
            </MypageFormRow>

            <MypageFormRow direction='row'>
              <MypageFormLabel>이름*</MypageFormLabel>
              <MypageFormInput>
                <TextField name='name' value={formik.values.name} onChange={formik.handleChange} sx={{ flex: 1 }} />
              </MypageFormInput>
            </MypageFormRow>

            <MypageFormRow direction='row'>
              <MypageFormLabel>휴대폰 번호</MypageFormLabel>
              <MypageFormInput>
                <TextField name='phoneNumber' value={formik.values.phoneNumber} disabled sx={{ flex: 1 }} />
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
                <TextField name='emailId' value={formik.values.emailId} onChange={formik.handleChange} sx={{ flex: 1 }} />
                <Typography sx={{ color: '#666' }}>@</Typography>
                <FormControl sx={{ minWidth: 140 }}>
                  <Select name='emailDomain' value={formik.values.emailDomain} onChange={formik.handleChange}>
                    <MenuItem value='naver.com'>naver.com</MenuItem>
                    <MenuItem value='gmail.com'>gmail.com</MenuItem>
                    <MenuItem value='daum.net'>daum.net</MenuItem>
                    <MenuItem value='hanmail.net'>hanmail.net</MenuItem>
                  </Select>
                </FormControl>
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
            {/*<MypageFormRow direction='row'>*/}
            {/*  <MypageFormLabel>닉네임</MypageFormLabel>*/}
            {/*  <MypageFormInput>*/}
            {/*    <TextField value={formData.nickname} onChange={handleInputChange('nickname')} fullWidth sx={{ marginBottom: 1 }} />*/}
            {/*    <Typography sx={{ color: '#f44336', fontSize: '12px' }}>닉네임 변경은 1달에 1회 가능합니다.</Typography>*/}
            {/*  </MypageFormInput>*/}
            {/*</MypageFormRow>*/}

            <MypageFormRow direction='row'>
              <MypageFormLabel>CSO 등록증</MypageFormLabel>
              <MypageFormInput>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 1 }}>
                  <MedipandaFileUploadButton
                    onChange={files => {
                      formik.setFieldValue('csoRegistrationFile', files[0] ?? null);
                    }}
                  />
                  {formik.values.csoRegistrationFile !== null && (
                    <Typography sx={{ color: '#666' }}>{formik.values.csoRegistrationFile.name}</Typography>
                  )}
                </Box>
                <Typography sx={{ color: '#f44336', fontSize: '12px', display: 'block' }}>
                  jpg, jpeg, pdf, png 파일만 업로드 가능합니다
                </Typography>
              </MypageFormInput>
            </MypageFormRow>

            {/*<MypageFormRow direction='row'>*/}
            {/*  <MypageFormLabel>추천인 코드</MypageFormLabel>*/}
            {/*  <MypageFormInput>*/}
            {/*    <TextField value={formData.referralCode} onChange={handleInputChange('referralCode')} sx={{ flex: 1 }} />*/}
            {/*  </MypageFormInput>*/}
            {/*</MypageFormRow>*/}
          </Stack>
        </Stack>

        <Stack
          direction='row'
          gap='10px'
          component='form'
          onSubmit={formik.handleSubmit}
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

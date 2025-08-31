import { checkPassword } from '@/backend';
import { MedipandaButton } from '@/custom/components/MedipandaButton';
import { MedipandaOutlinedInput } from '@/custom/components/MedipandaOutlinedInput';
import { colors } from '@/themes';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Box, IconButton, InputAdornment, Stack, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { type ReactNode, useState } from 'react';

export default function MypageGuard({ children }: { children: ReactNode }) {
  const [passwordChecked, setPasswordChecked] = useState(false);

  const formik = useFormik({
    initialValues: {
      password: '',
      showPassword: false,
    },
    onSubmit: async values => {
      try {
        const result = await checkPassword({ password: values.password });

        if (result) {
          setPasswordChecked(true);
        } else {
          alert('비밀번호가 일치하지 않습니다.');
        }
      } catch (e) {
        console.error(e);
        alert('비밀번호를 확인하는 중 오류가 발생했습니다.');
      }
    },
  });

  return (
    <>
      {passwordChecked ? (
        children
      ) : (
        <Stack>
          <Typography variant='heading3B' sx={{ color: colors.gray80 }}>
            마이페이지
          </Typography>
          <Box sx={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', display: 'flex', my: '100px' }}>
            <Stack>
              <Typography
                variant='largeTextM'
                sx={{
                  color: colors.gray80,
                  fontWeight: 400,
                  fontSize: '16px',
                  lineHeight: 1.5,
                }}
              >
                회원님의 정보를 보호하기 위해 비밀번호를 다시 확인합니다.
              </Typography>

              <Stack
                direction='row'
                component='form'
                onSubmit={formik.handleSubmit}
                sx={{
                  width: '440px',
                  marginTop: '20px',
                }}
              >
                <MedipandaOutlinedInput
                  name='password'
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  fullWidth
                  type={formik.values.showPassword ? 'text' : 'password'}
                  placeholder='비밀번호를 입력해주세요.'
                  endAdornment={
                    <InputAdornment position='end'>
                      <IconButton
                        onClick={() => {
                          formik.setFieldValue('showPassword', !formik.values.showPassword);
                        }}
                        edge='end'
                        sx={{ color: colors.gray400 }}
                      >
                        {formik.values.showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  }
                  sx={
                    {
                      // '& .MuiOutlinedInput-root': {
                      //   backgroundColor: colors.white,
                      //   borderRadius: '8px',
                      //   fontSize: '14px',
                      //   height: '48px',
                      //   '& fieldset': {
                      //     borderColor: colors.gray300,
                      //     borderWidth: '1px',
                      //   },
                      //   '&:hover fieldset': {
                      //     borderColor: colors.gray400,
                      //   },
                      //   '&.Mui-focused fieldset': {
                      //     borderColor: colors.vividViolet,
                      //     borderWidth: '2px',
                      //   },
                      // },
                    }
                  }
                />

                <MedipandaButton
                  type='submit'
                  variant='contained'
                  size='large'
                  color='secondary'
                  sx={{
                    width: '100px',
                    ml: '10px',
                  }}
                >
                  확인
                </MedipandaButton>
              </Stack>
            </Stack>
          </Box>
        </Stack>
      )}
    </>
  );
}

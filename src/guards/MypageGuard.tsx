import { checkPassword } from '@/backend';
import { MedipandaButton } from '@/custom/components/MedipandaButton';
import { MedipandaOutlinedInput } from '@/custom/components/MedipandaOutlinedInput';
import { colors } from '@/themes';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Box, IconButton, InputAdornment, Stack, Typography } from '@mui/material';
import { type ReactNode, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import type { RequiredDeep } from 'type-fest';

export default function MypageGuard({ children }: { children: ReactNode }) {
  const [passwordChecked, setPasswordChecked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm({
    defaultValues: {
      password: '',
    },
  });

  const submitHandler: SubmitHandler<RequiredDeep<(typeof form)['control']['_defaultValues']>> = async values => {
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
  };

  return (
    <>
      {passwordChecked ? (
        children
      ) : (
        <Stack>
          <Typography variant='headingPc3B' sx={{ color: colors.gray80 }}>
            마이페이지
          </Typography>
          <Box sx={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', display: 'flex', my: '100px' }}>
            <Stack>
              <Typography variant='largeTextM' sx={{ color: colors.gray80 }}>
                회원님의 정보를 보호하기 위해 비밀번호를 다시 확인합니다.
              </Typography>

              <Stack
                direction='row'
                component='form'
                onSubmit={form.handleSubmit(submitHandler)}
                sx={{
                  width: '440px',
                  marginTop: '20px',
                }}
              >
                <Controller
                  control={form.control}
                  name={'password'}
                  render={({ field }) => (
                    <MedipandaOutlinedInput
                      {...field}
                      fullWidth
                      type={showPassword ? 'text' : 'password'}
                      placeholder='비밀번호를 입력해주세요.'
                      endAdornment={
                        <InputAdornment position='end'>
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge='end' sx={{ color: colors.gray400 }}>
                            {showPassword ? <VisibilityOff /> : <Visibility />}
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
                  )}
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

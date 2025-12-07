import { getPushPreferences, patchPushPreferences, updateMember } from '@/backend';
import { MedipandaCheckbox } from '@/custom/components/MedipandaCheckbox';
import { MedipandaSwitch } from '@/custom/components/MedipandaSwitch';
import { useSession } from '@/hooks/useSession';
import { colors } from '@/themes';
import { Button, FormControlLabel, Stack, Typography } from '@mui/material';
import { useEffect } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { Link as RouterLink } from 'react-router-dom';
import type { RequiredDeep } from 'type-fest';

export default function MypageNotification() {
  const { session, refreshSession } = useSession();

  const form = useForm({
    defaultValues: {
      allowCommunity: false,
      allowNotice: false,
      allowPrescription: false,
      allowSalesAgency: false,
      allowSettlement: false,
      marketingEmail: false,
      marketingPush: false,
      marketingSms: false,
    },
  });
  const formAllowCommunity = form.watch('allowCommunity');
  const formAllowNotice = form.watch('allowNotice');
  const formAllowPrescription = form.watch('allowPrescription');
  const formAllowSalesAgency = form.watch('allowSalesAgency');
  const formAllowSettlement = form.watch('allowSettlement');

  const submitHandler: SubmitHandler<RequiredDeep<(typeof form)['control']['_defaultValues']>> = async values => {
    try {
      await Promise.all([
        updateMember(session!.userId, {
          request: {
            accountStatus: null,
            password: null,
            name: null,
            birthDate: null,
            phoneNumber: null,
            email: null,
            nickname: null,
            referralCode: null,
            note: null,
            marketingAgreement: {
              sms: values.marketingSms,
              smsAgreedAt: null,
              email: values.marketingEmail,
              emailAgreedAt: null,
              push: values.marketingPush,
              pushAgreedAt: null,
            },
          },
        }),
        patchPushPreferences({
          allowNotice: values.allowNotice,
          allowSalesAgency: values.allowSalesAgency,
          allowPrescription: values.allowPrescription,
          allowSettlement: values.allowSettlement,
          allowCommunity: values.allowCommunity,
        }),
      ]);

      alert('수신 정보가 수정되었습니다.');
      refreshSession();
    } catch (e) {
      console.error(e);
      alert('수신 정보 수정 중 오류가 발생했습니다.');
    }
  };
  useEffect(() => {
    fetchPushReferences();
  }, [session]);

  const fetchPushReferences = async () => {
    const { allowNotice, allowSalesAgency, allowPrescription, allowSettlement, allowCommunity } = await getPushPreferences();

    form.setValue('allowNotice', allowNotice);
    form.setValue('allowSalesAgency', allowSalesAgency);
    form.setValue('allowPrescription', allowPrescription);
    form.setValue('allowSettlement', allowSettlement);
    form.setValue('allowCommunity', allowCommunity);
    form.setValue('marketingSms', session!.marketingAgreements.sms);
    form.setValue('marketingEmail', session!.marketingAgreements.email);
    form.setValue('marketingPush', session!.marketingAgreements.push);
  };

  return (
    <>
      <Typography variant='headingPc3M' sx={{ color: colors.gray80 }}>
        수신정보
      </Typography>

      <Stack
        component='form'
        onSubmit={form.handleSubmit(submitHandler)}
        sx={{
          alignSelf: 'center',
          width: '434px',
          marginTop: '30px',
        }}
      >
        <Stack
          sx={{
            padding: '16px 30px',
            borderRadius: '5px',
            boxSizing: 'border-box',
            backgroundColor: colors.navy,
          }}
        >
          <Stack
            direction='row'
            alignItems='center'
            sx={{
              paddingY: '10px',
            }}
          >
            <Typography variant='largeTextB' sx={{ color: colors.white }}>
              전체 알림 받기
            </Typography>
            <MedipandaSwitch
              checked={[formAllowCommunity, formAllowNotice, formAllowPrescription, formAllowSalesAgency, formAllowSettlement].every(
                v => v,
              )}
              onChange={(_, checked) => {
                form.setValue('allowCommunity', checked);
                form.setValue('allowNotice', checked);
                form.setValue('allowPrescription', checked);
                form.setValue('allowSalesAgency', checked);
                form.setValue('allowSettlement', checked);
              }}
              size='medium'
              sx={{ marginLeft: 'auto' }}
            />
          </Stack>
        </Stack>

        <Stack
          sx={{
            padding: '15px 30px',
            marginTop: '13px',
            boxSizing: 'border-box',
            border: `1px solid ${colors.gray30}`,
          }}
        >
          <Stack
            direction='row'
            alignItems='center'
            sx={{
              paddingY: '10px',
            }}
          >
            <Typography variant='largeTextB' sx={{ color: colors.gray80 }}>
              공지사항 (제약사)
            </Typography>
            <Controller
              control={form.control}
              name={'allowNotice'}
              render={({ field }) => <MedipandaSwitch {...field} checked={field.value} size='medium' sx={{ marginLeft: 'auto' }} />}
            />
          </Stack>
          <Stack
            direction='row'
            alignItems='center'
            sx={{
              paddingY: '10px',
            }}
          >
            <Typography variant='largeTextB' sx={{ color: colors.gray80 }}>
              신규 영업대행상품
            </Typography>
            <Controller
              control={form.control}
              name={'allowSalesAgency'}
              render={({ field }) => <MedipandaSwitch {...field} checked={field.value} size='medium' sx={{ marginLeft: 'auto' }} />}
            />
          </Stack>
          <Stack
            direction='row'
            alignItems='center'
            sx={{
              paddingY: '10px',
            }}
          >
            <Typography variant='largeTextB' sx={{ color: colors.gray80 }}>
              실적관리
            </Typography>
            <Controller
              control={form.control}
              name={'allowPrescription'}
              render={({ field }) => <MedipandaSwitch {...field} checked={field.value} size='medium' sx={{ marginLeft: 'auto' }} />}
            />
          </Stack>
          <Stack
            direction='row'
            alignItems='center'
            sx={{
              paddingY: '10px',
            }}
          >
            <Typography variant='largeTextB' sx={{ color: colors.gray80 }}>
              정산
            </Typography>
            <Controller
              control={form.control}
              name={'allowSettlement'}
              render={({ field }) => <MedipandaSwitch {...field} checked={field.value} size='medium' sx={{ marginLeft: 'auto' }} />}
            />
          </Stack>
          <Stack
            direction='row'
            alignItems='center'
            sx={{
              paddingY: '10px',
            }}
          >
            <Typography variant='largeTextB' sx={{ color: colors.gray80 }}>
              커뮤니티
            </Typography>
            <Controller
              control={form.control}
              name={'allowCommunity'}
              render={({ field }) => <MedipandaSwitch {...field} checked={field.value} size='medium' sx={{ marginLeft: 'auto' }} />}
            />
          </Stack>
        </Stack>

        <Stack
          direction='row'
          alignItems='center'
          sx={{
            paddingTop: '20px',
            borderTop: `1px solid ${colors.gray30}`,
            marginTop: '40px',
          }}
        >
          <Typography variant='largeTextB' sx={{ color: colors.gray80 }}>
            마케팅 수신 동의
          </Typography>
          <Stack
            direction='row'
            sx={{
              marginLeft: 'auto',
            }}
          >
            <FormControlLabel
              control={
                <Controller
                  control={form.control}
                  name={'marketingSms'}
                  render={({ field }) => <MedipandaCheckbox {...field} checked={field.value} />}
                />
              }
              label='SMS'
            />
            <FormControlLabel
              control={
                <Controller
                  control={form.control}
                  name={'marketingEmail'}
                  render={({ field }) => <MedipandaCheckbox {...field} checked={field.value} />}
                />
              }
              label='이메일'
            />
            <FormControlLabel
              control={
                <Controller
                  control={form.control}
                  name={'marketingPush'}
                  render={({ field }) => <MedipandaCheckbox {...field} checked={field.value} />}
                />
              }
              label='App Push'
            />
          </Stack>
        </Stack>

        <Stack
          direction='row'
          justifyContent='center'
          gap='10px'
          sx={{
            marginTop: '40px',
          }}
        >
          <Button
            fullWidth
            variant='outlined'
            component={RouterLink}
            to={'/'}
            sx={{
              width: '160px',
              height: '49px',
              borderColor: colors.navy,
              color: colors.gray600,
            }}
          >
            취소
          </Button>
          <Button
            type='submit'
            fullWidth
            variant='contained'
            sx={{
              width: '160px',
              height: '49px',
              backgroundColor: colors.navy,
            }}
          >
            수정
          </Button>
        </Stack>
      </Stack>
    </>
  );
}

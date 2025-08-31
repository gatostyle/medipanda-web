import { getPushPreferences, patchPushPreferences, updateMember } from '@/backend';
import { MedipandaCheckbox } from '@/custom/components/MedipandaCheckbox';
import { MedipandaSwitch } from '@/custom/components/MedipandaSwitch';
import { useSession } from '@/hooks/useSession';
import { colors } from '@/themes';
import { Button, FormControlLabel, Stack, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { useEffect } from 'react';
import { Link as RouterLink } from 'react-router';

export default function MypageNotification() {
  const { session } = useSession();

  const formik = useFormik({
    initialValues: {
      notice: true,
      newProduct: true,
      prescription: true,
      settlement: true,
      community: true,
      marketingSms: true,
      marketingEmail: true,
      marketingAppPush: true,
    },
    onSubmit: async values => {
      try {
        await Promise.all([
          updateMember(session!.userId, {
            request: {
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
                email: values.marketingEmail,
                push: values.marketingAppPush,
              },
            },
          }),
          patchPushPreferences({
            allowNotice: values.notice,
            allowSalesAgency: values.newProduct,
            allowPrescription: values.prescription,
            allowSettlement: values.settlement,
            allowCommunity: values.community,
          }),
        ]);

        alert('수신 정보가 수정되었습니다.');
        fetchPushReferences();
      } catch (e) {
        console.error(e);
        alert('수신 정보 수정 중 오류가 발생했습니다.');
      }
    },
  });

  useEffect(() => {
    fetchPushReferences();
  }, []);

  const fetchPushReferences = async () => {
    const { allowNotice, allowSalesAgency, allowPrescription, allowSettlement, allowCommunity } = await getPushPreferences();

    formik.setValues({
      notice: allowNotice,
      newProduct: allowSalesAgency,
      prescription: allowPrescription,
      settlement: allowSettlement,
      community: allowCommunity,
      marketingSms: session!.marketingAgreements.sms,
      marketingEmail: session!.marketingAgreements.email,
      marketingAppPush: session!.marketingAgreements.push,
    });
  };

  return (
    <>
      <Typography variant='heading3M' sx={{ color: colors.gray80 }}>
        수신정보
      </Typography>

      <Stack
        component='form'
        onSubmit={formik.handleSubmit}
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
              checked={(['notice', 'newProduct', 'prescription', 'settlement', 'community'] as const).every(key => formik.values[key])}
              onChange={(_, checked) => {
                formik.setValues({
                  ...formik.values,
                  notice: checked,
                  newProduct: checked,
                  prescription: checked,
                  settlement: checked,
                  community: checked,
                });
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
            <MedipandaSwitch
              checked={formik.values.notice}
              onChange={(_, checked) => formik.setFieldValue('notice', checked)}
              size='medium'
              sx={{ marginLeft: 'auto' }}
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
            <MedipandaSwitch
              checked={formik.values.newProduct}
              onChange={(_, checked) => formik.setFieldValue('newProduct', checked)}
              size='medium'
              sx={{ marginLeft: 'auto' }}
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
            <MedipandaSwitch
              checked={formik.values.prescription}
              onChange={(_, checked) => formik.setFieldValue('prescription', checked)}
              size='medium'
              sx={{ marginLeft: 'auto' }}
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
            <MedipandaSwitch
              checked={formik.values.settlement}
              onChange={(_, checked) => formik.setFieldValue('settlement', checked)}
              size='medium'
              sx={{ marginLeft: 'auto' }}
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
            <MedipandaSwitch
              checked={formik.values.community}
              onChange={(_, checked) => formik.setFieldValue('community', checked)}
              size='medium'
              sx={{ marginLeft: 'auto' }}
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
                <MedipandaCheckbox
                  checked={formik.values.marketingSms}
                  onChange={(_, checked) => formik.setFieldValue('marketingSms', checked)}
                />
              }
              label='SMS'
            />
            <FormControlLabel
              control={
                <MedipandaCheckbox
                  checked={formik.values.marketingEmail}
                  onChange={(_, checked) => formik.setFieldValue('marketingEmail', checked)}
                />
              }
              label='이메일'
            />
            <FormControlLabel
              control={
                <MedipandaCheckbox
                  checked={formik.values.marketingAppPush}
                  onChange={(_, checked) => formik.setFieldValue('marketingAppPush', checked)}
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

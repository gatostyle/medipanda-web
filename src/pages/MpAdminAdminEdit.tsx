import { normalizePhoneNumber } from '@/lib/utils/form';
import { useMpModal } from '@/hooks/useMpModal';
import { Box, Button, Card, Checkbox, FormControlLabel, Stack, Switch, TextField, Typography } from '@mui/material';
import { isAxiosError } from 'axios';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { AdminPermission, getMemberDetails, getPermissions, type MemberDetailsResponse, signupByAdmin, updateByAdmin } from '@/backend';
import { isSuperAdmin, useSession } from '@/hooks/useSession';
import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import type { RequiredDeep } from 'type-fest';

export default function MpAdminAdminEdit() {
  const navigate = useNavigate();
  const { userId: paramUserId } = useParams();
  const isNew = paramUserId === undefined;
  const userId = paramUserId!;

  const { session } = useSession();
  const [, setLoading] = useState(false);
  const { alert, alertError } = useMpModal();
  const [detail, setDetail] = useState<MemberDetailsResponse | null>(null);

  useEffect(() => {
    (async () => {
      if (!isNew && session && !isSuperAdmin(session)) {
        await alert('최고관리자만 관리자 편집이 가능합니다.');
        return window.history.back();
      }
    })();
  }, [session, isNew, navigate]);

  const form = useForm({
    defaultValues: {
      status: true,
      name: '',
      userId: '',
      password: '',
      passwordConfirm: '',
      email: '',
      phoneNumber: '',
      permissions: [] as (keyof typeof AdminPermission)[],
    },
  });
  const formStatus = form.watch('status');
  const formPermissions = form.watch('permissions');

  const submitHandler: SubmitHandler<RequiredDeep<(typeof form)['control']['_defaultValues']>> = async values => {
    if (values.name === '') {
      await alert('관리자 명은 필수입니다');
      return;
    }

    if (values.userId === '') {
      await alert('아이디는 필수입니다');
      return;
    }

    if (isNew && values.password === '') {
      await alert('패스워드는 필수입니다');
      return;
    }

    if (isNew && values.password.length < 8) {
      await alert('패스워드는 최소 8자 이상이어야 합니다');
      return;
    }

    if (isNew && values.password !== values.passwordConfirm) {
      await alert('패스워드가 일치하지 않습니다');
      return;
    }

    if (values.email === '') {
      await alert('이메일은 필수입니다');
      return;
    }

    if (values.phoneNumber !== detail?.phoneNumber && values.phoneNumber === '') {
      await alert('연락처를 입력하세요.');
      return;
    }

    if (values.permissions.length === 0) {
      await alert('최소 하나 이상의 권한을 선택하세요');
      return;
    }

    try {
      if (isNew) {
        await signupByAdmin({
          status: values.status,
          name: values.name,
          userId: values.userId,
          password: values.password,
          email: values.email,
          phoneNumber: values.phoneNumber.replace(/-/g, ''),
          permissions: [...values.permissions, AdminPermission.PERMISSION_MANAGEMENT],
        });
        await alert('관리자가 등록되었습니다.');
        navigate('/admin/admins');
      } else {
        await updateByAdmin(userId, {
          name: values.name,
          userId: values.userId,
          password: values.password !== '' ? values.password : null,
          email: values.email,
          phoneNumber: values.phoneNumber.replace(/-/g, ''),
          permissions: [...values.permissions, AdminPermission.PERMISSION_MANAGEMENT],
        });
        await alert('관리자 권한이 수정되었습니다.');
        navigate('/admin/admins');
      }
    } catch (e) {
      switch (true) {
        case isAxiosError(e) && /Bad request: phone number \w+ already exists./.test(e.response?.data ?? ''):
          await alert('이미 사용중인 연락처입니다.');
          break;
        default:
          console.error('Failed to save admin:', e);
          await alertError('저장 중 오류가 발생했습니다.');
          break;
      }
    }
  };

  useEffect(() => {
    if (!isNew) {
      fetchDetail(userId);
    }
  }, [userId]);

  const fetchDetail = async (userId: string) => {
    setLoading(true);
    try {
      const [detail, permissionData] = await Promise.all([getMemberDetails(userId), getPermissions(userId)]);
      setDetail(detail);

      form.reset({
        userId: detail.userId,
        name: detail.name,
        email: detail.email,
        phoneNumber: normalizePhoneNumber(detail.phoneNumber),
        status: true,
        permissions: permissionData.permissions as (keyof typeof AdminPermission)[],
      });
    } catch (error) {
      if (isAxiosError(error)) {
        switch (true) {
          case typeof error.response?.data === 'string' && error.response.data.startsWith('Bad request: user id already exists.'):
            await alert(`아이디 ${userId}는 이미 존재하는 계정입니다.`);
            return;
          default:
            break;
        }
      }

      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (permission: keyof typeof AdminPermission) => {
    const currentPermissions = [...form.getValues('permissions')];
    const index = currentPermissions.indexOf(permission);

    if (index > -1) {
      currentPermissions.splice(index, 1);
    } else {
      currentPermissions.push(permission);
    }

    form.setValue('permissions', currentPermissions);
  };

  return (
    <Stack sx={{ gap: 3 }}>
      <Typography variant='h4'>관리자 권한등록</Typography>

      <Card component={Stack} sx={{ padding: 3, gap: 3 }}>
        <FormControlLabel
          control={
            <Controller
              control={form.control}
              name='status'
              render={({ field }) => <Switch {...field} checked={field.value} color='primary' />}
            />
          }
          label={formStatus ? '활성' : '비활성'}
        />

        <Stack direction='row' sx={{ gap: 2 }}>
          <Controller
            control={form.control}
            name='name'
            render={({ field }) => <TextField {...field} label='관리자 명' fullWidth required sx={{ flex: '1 0' }} />}
          />

          <Controller
            control={form.control}
            name='userId'
            render={({ field }) => <TextField {...field} label='아이디' fullWidth required disabled={!isNew} sx={{ flex: '1 0' }} />}
          />
        </Stack>

        <Stack direction='row' sx={{ gap: 2 }}>
          <Controller
            control={form.control}
            name='password'
            render={({ field }) => (
              <TextField {...field} label='패스워드' type='password' fullWidth required={isNew} sx={{ flex: '1 0' }} />
            )}
          />

          <Controller
            control={form.control}
            name='passwordConfirm'
            render={({ field }) => (
              <TextField {...field} label='패스워드 확인' type='password' fullWidth required={isNew} sx={{ flex: '1 0' }} />
            )}
          />
        </Stack>

        <Controller
          control={form.control}
          name={'email'}
          render={({ field }) => <TextField {...field} label='이메일' type='email' fullWidth required />}
        />

        <Controller
          control={form.control}
          name={'phoneNumber'}
          render={({ field }) => (
            <TextField {...field} fullWidth label='연락처*' onChange={e => field.onChange(normalizePhoneNumber(e.target.value))} />
          )}
        />

        <Stack sx={{ gap: 1 }}>
          <Typography variant='subtitle2' color='text.secondary'>
            관리메뉴
          </Typography>
          <Stack direction='row' sx={{ gap: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formPermissions.includes(AdminPermission.MEMBER_MANAGEMENT)}
                  onChange={() => handlePermissionChange(AdminPermission.MEMBER_MANAGEMENT)}
                />
              }
              label='회원관리'
              sx={{ flex: '1 0' }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formPermissions.includes(AdminPermission.PRODUCT_MANAGEMENT)}
                  onChange={() => handlePermissionChange(AdminPermission.PRODUCT_MANAGEMENT)}
                />
              }
              label='제품관리'
              sx={{ flex: '1 0' }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formPermissions.includes(AdminPermission.TRANSACTION_MANAGEMENT)}
                  onChange={() => handlePermissionChange(AdminPermission.TRANSACTION_MANAGEMENT)}
                />
              }
              label='거래선관리'
              sx={{ flex: '1 0' }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formPermissions.includes(AdminPermission.CONTRACT_MANAGEMENT)}
                  onChange={() => handlePermissionChange(AdminPermission.CONTRACT_MANAGEMENT)}
                />
              }
              label='계약관리'
              sx={{ flex: '1 0' }}
            />
          </Stack>
          <Stack direction='row' sx={{ gap: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formPermissions.includes(AdminPermission.PRESCRIPTION_MANAGEMENT)}
                  onChange={() => handlePermissionChange(AdminPermission.PRESCRIPTION_MANAGEMENT)}
                />
              }
              label='처방관리'
              sx={{ flex: '1 0' }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formPermissions.includes(AdminPermission.SETTLEMENT_MANAGEMENT)}
                  onChange={() => handlePermissionChange(AdminPermission.SETTLEMENT_MANAGEMENT)}
                />
              }
              label='정산관리'
              sx={{ flex: '1 0' }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formPermissions.includes(AdminPermission.EXPENSE_REPORT_MANAGEMENT)}
                  onChange={() => handlePermissionChange(AdminPermission.EXPENSE_REPORT_MANAGEMENT)}
                />
              }
              label='지출보고관리'
              sx={{ flex: '1 0' }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formPermissions.includes(AdminPermission.COMMUNITY_MANAGEMENT)}
                  onChange={() => handlePermissionChange(AdminPermission.COMMUNITY_MANAGEMENT)}
                />
              }
              label='커뮤니티'
              sx={{ flex: '1 0' }}
            />
          </Stack>
          <Stack direction='row' sx={{ gap: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formPermissions.includes(AdminPermission.CONTENT_MANAGEMENT)}
                  onChange={() => handlePermissionChange(AdminPermission.CONTENT_MANAGEMENT)}
                />
              }
              label='콘텐츠관리'
              sx={{ flex: '1 0' }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formPermissions.includes(AdminPermission.CUSTOMER_SERVICE)}
                  onChange={() => handlePermissionChange(AdminPermission.CUSTOMER_SERVICE)}
                />
              }
              label='고객센터'
              sx={{ flex: '1 0' }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formPermissions.includes(AdminPermission.BANNER_MANAGEMENT)}
                  onChange={() => handlePermissionChange(AdminPermission.BANNER_MANAGEMENT)}
                />
              }
              label='배너관리'
              sx={{ flex: '1 0' }}
            />
            <Box sx={{ flex: '1 0' }} />
          </Stack>
        </Stack>

        <Stack direction='row' sx={{ justifyContent: 'center', gap: 2 }}>
          <Button variant='outlined' size='large' component={RouterLink} to='/admin/admins'>
            취소
          </Button>
          <Button variant='contained' size='large' onClick={form.handleSubmit(submitHandler)}>
            저장
          </Button>
        </Stack>
      </Card>
    </Stack>
  );
}

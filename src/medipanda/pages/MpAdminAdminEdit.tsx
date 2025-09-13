import { useMpModal } from '@/medipanda/hooks/useMpModal';
import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import MainCard from 'components/MainCard';
import { useFormik } from 'formik';
import { AdminPermission, getMemberDetails, getPermissions, signupByAdmin, updateByAdmin } from '@/backend';
import { isSuperAdmin, useSession } from '@/medipanda/hooks/useSession';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function MpAdminAdminEdit() {
  const navigate = useNavigate();
  const { userId: paramUserId } = useParams();
  const isNew = paramUserId === undefined;
  const userId = paramUserId!;

  const { session } = useSession();
  const [, setLoading] = useState(false);
  const { alert, alertError } = useMpModal();

  useEffect(() => {
    (async () => {
      if (!isNew && session && !isSuperAdmin(session)) {
        await alert('최고관리자만 관리자 편집이 가능합니다.');
        navigate('/admin/admins');
      }
    })();
  }, [session, isNew, navigate]);

  const formik = useFormik({
    initialValues: {
      status: true,
      name: '',
      userId: '',
      password: '',
      passwordConfirm: '',
      email: '',
      phoneNumber1: '010',
      phoneNumber2: '',
      phoneNumber3: '',
      permissions: [] as AdminPermission[],
    },
    onSubmit: async values => {
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

      if (values.phoneNumber1 === '' || values.phoneNumber2 === '' || values.phoneNumber3 === '') {
        await alert('연락처를 입력해주세요');
        return;
      }

      if (values.permissions.length === 0) {
        await alert('최소 하나 이상의 권한을 선택해주세요');
        return;
      }

      try {
        const phoneNumber = `${values.phoneNumber1}-${values.phoneNumber2}-${values.phoneNumber3}`;

        if (isNew) {
          await signupByAdmin({
            status: values.status,
            name: values.name,
            userId: values.userId,
            password: values.password,
            email: values.email,
            phoneNumber,
            permissions: values.permissions,
          });
          await alert('관리자가 등록되었습니다.');
          navigate('/admin/admins');
        } else {
          await updateByAdmin(userId, {
            name: values.name,
            userId: values.userId,
            password: values.password !== '' ? values.password : null,
            email: values.email,
            phoneNumber,
            permissions: values.permissions,
          });
          await alert('관리자 권한이 수정되었습니다.');
          navigate('/admin/admins');
        }
      } catch (error) {
        console.error('Failed to save admin:', error);
        await alertError('저장 중 오류가 발생했습니다.');
      }
    },
  });

  useEffect(() => {
    if (!isNew) {
      fetchDetail(userId);
    }
  }, [userId]);

  const fetchDetail = async (userId: string) => {
    setLoading(true);
    try {
      const [detail, permissionData] = await Promise.all([getMemberDetails(userId), getPermissions(userId)]);

      const phoneParts = detail.phoneNumber.includes('-')
        ? detail.phoneNumber.split('-')
        : [detail.phoneNumber.slice(0, 3), detail.phoneNumber.slice(3, 7), detail.phoneNumber.slice(7)];

      formik.setValues({
        ...formik.values,
        userId: detail.userId,
        name: detail.name,
        email: detail.email,
        phoneNumber1: phoneParts[0] !== '' ? phoneParts[0] : '010',
        phoneNumber2: phoneParts[1] ?? '',
        phoneNumber3: phoneParts[2] ?? '',
        status: true,
        permissions: permissionData.permissions as AdminPermission[],
      });
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (permission: AdminPermission) => {
    const currentPermissions = [...formik.values.permissions];
    const index = currentPermissions.indexOf(permission);

    if (index > -1) {
      currentPermissions.splice(index, 1);
    } else {
      currentPermissions.push(permission);
    }

    formik.setFieldValue('permissions', currentPermissions);
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant='h4' gutterBottom>
          관리자 권한등록
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <MainCard>
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      name='status'
                      checked={formik.values.status}
                      onChange={e => formik.setFieldValue('status', e.target.checked)}
                      color='primary'
                    />
                  }
                  label={formik.values.status ? '활성' : '비활성'}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField name='name' label='관리자 명' fullWidth required value={formik.values.name} onChange={formik.handleChange} />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  name='userId'
                  label='아이디'
                  fullWidth
                  required
                  disabled={!isNew}
                  value={formik.values.userId}
                  onChange={formik.handleChange}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  name='password'
                  label='패스워드'
                  type='password'
                  fullWidth
                  required={isNew}
                  value={formik.values.password}
                  onChange={formik.handleChange}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  name='passwordConfirm'
                  label='패스워드 확인'
                  type='password'
                  fullWidth
                  required={isNew}
                  value={formik.values.passwordConfirm}
                  onChange={formik.handleChange}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  name='email'
                  label='이메일'
                  type='email'
                  fullWidth
                  required
                  value={formik.values.email}
                  onChange={formik.handleChange}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant='subtitle1' gutterBottom>
                  연락처
                </Typography>
                <Stack direction='row' spacing={2} alignItems='center'>
                  <FormControl size='small' sx={{ minWidth: 100 }}>
                    <Select name='phoneNumber1' value={formik.values.phoneNumber1} onChange={formik.handleChange}>
                      <MenuItem value='010'>010</MenuItem>
                      <MenuItem value='011'>011</MenuItem>
                      <MenuItem value='016'>016</MenuItem>
                      <MenuItem value='017'>017</MenuItem>
                      <MenuItem value='018'>018</MenuItem>
                      <MenuItem value='019'>019</MenuItem>
                    </Select>
                  </FormControl>
                  <Typography>-</Typography>
                  <TextField
                    name='phoneNumber2'
                    size='small'
                    sx={{ width: 100 }}
                    value={formik.values.phoneNumber2}
                    onChange={formik.handleChange}
                  />
                  <Typography>-</Typography>
                  <TextField
                    name='phoneNumber3'
                    size='small'
                    sx={{ width: 100 }}
                    value={formik.values.phoneNumber3}
                    onChange={formik.handleChange}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12}>
                <Typography variant='subtitle1' gutterBottom>
                  관리메뉴
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={3}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formik.values.permissions.includes(AdminPermission.MEMBER_MANAGEMENT)}
                          onChange={() => handlePermissionChange(AdminPermission.MEMBER_MANAGEMENT)}
                        />
                      }
                      label='회원관리'
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formik.values.permissions.includes(AdminPermission.PRODUCT_MANAGEMENT)}
                          onChange={() => handlePermissionChange(AdminPermission.PRODUCT_MANAGEMENT)}
                        />
                      }
                      label='제품관리'
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formik.values.permissions.includes(AdminPermission.TRANSACTION_MANAGEMENT)}
                          onChange={() => handlePermissionChange(AdminPermission.TRANSACTION_MANAGEMENT)}
                        />
                      }
                      label='거래선관리'
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formik.values.permissions.includes(AdminPermission.CONTRACT_MANAGEMENT)}
                          onChange={() => handlePermissionChange(AdminPermission.CONTRACT_MANAGEMENT)}
                        />
                      }
                      label='계약관리'
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formik.values.permissions.includes(AdminPermission.PRESCRIPTION_MANAGEMENT)}
                          onChange={() => handlePermissionChange(AdminPermission.PRESCRIPTION_MANAGEMENT)}
                        />
                      }
                      label='처방관리'
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formik.values.permissions.includes(AdminPermission.SETTLEMENT_MANAGEMENT)}
                          onChange={() => handlePermissionChange(AdminPermission.SETTLEMENT_MANAGEMENT)}
                        />
                      }
                      label='정산관리'
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formik.values.permissions.includes(AdminPermission.EXPENSE_REPORT_MANAGEMENT)}
                          onChange={() => handlePermissionChange(AdminPermission.EXPENSE_REPORT_MANAGEMENT)}
                        />
                      }
                      label='지출보고관리'
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formik.values.permissions.includes(AdminPermission.COMMUNITY_MANAGEMENT)}
                          onChange={() => handlePermissionChange(AdminPermission.COMMUNITY_MANAGEMENT)}
                        />
                      }
                      label='커뮤니티'
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formik.values.permissions.includes(AdminPermission.CONTENT_MANAGEMENT)}
                          onChange={() => handlePermissionChange(AdminPermission.CONTENT_MANAGEMENT)}
                        />
                      }
                      label='콘텐츠관리'
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formik.values.permissions.includes(AdminPermission.CUSTOMER_SERVICE)}
                          onChange={() => handlePermissionChange(AdminPermission.CUSTOMER_SERVICE)}
                        />
                      }
                      label='고객센터'
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formik.values.permissions.includes(AdminPermission.BANNER_MANAGEMENT)}
                          onChange={() => handlePermissionChange(AdminPermission.BANNER_MANAGEMENT)}
                        />
                      }
                      label='배너관리'
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formik.values.permissions.includes(AdminPermission.PERMISSION_MANAGEMENT)}
                          onChange={() => handlePermissionChange(AdminPermission.PERMISSION_MANAGEMENT)}
                        />
                      }
                      label='권한관리'
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Stack direction='row' spacing={2} justifyContent='center'>
                  <Button variant='outlined' size='large' onClick={() => window.history.back()}>
                    취소
                  </Button>
                  <Button variant='contained' size='large' type='submit'>
                    저장
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </form>
        </MainCard>
      </Grid>
    </Grid>
  );
}

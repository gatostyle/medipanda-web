import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import MainCard from 'components/MainCard';
import { useFormik } from 'formik';
import { getMemberDetails, getPermissions, signupByAdmin, updateByAdmin } from 'medipanda/backend';
import { useMpErrorDialog } from 'medipanda/hooks/useMpErrorDialog';
import { useMpInfoDialog } from 'medipanda/hooks/useMpInfoDialog';
import { isMpSuperAdmin, useMpSession } from 'medipanda/hooks/useMpSession';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as yup from 'yup';

const createValidationSchema = (isNew: boolean) =>
  yup.object({
    name: yup.string().required('관리자 명은 필수입니다'),
    userId: yup.string().required('아이디는 필수입니다'),
    password: isNew
      ? yup.string().required('패스워드는 필수입니다').min(8, '패스워드는 최소 8자 이상이어야 합니다')
      : yup.string().test('password-match', '패스워드가 일치하지 않습니다', function (value) {
          const { passwordConfirm } = this.parent;
          if (!value && !passwordConfirm) return true; // Both empty is OK for edit mode
          if (value && !passwordConfirm) return false; // Password filled but confirm empty
          if (!value && passwordConfirm) return false; // Password empty but confirm filled
          return value === passwordConfirm; // Both filled, must match
        }),
    passwordConfirm: isNew
      ? yup
          .string()
          .required('패스워드 확인은 필수입니다')
          .oneOf([yup.ref('password')], '패스워드가 일치하지 않습니다')
      : yup.string().test('password-confirm-match', '패스워드가 일치하지 않습니다', function (value) {
          const { password } = this.parent;
          if (!value && !password) return true; // Both empty is OK for edit mode
          if (value && !password) return false; // Confirm filled but password empty
          if (!value && password) return false; // Confirm empty but password filled
          return value === password; // Both filled, must match
        }),
    email: yup.string().required('이메일은 필수입니다').email('올바른 이메일 형식이 아닙니다'),
    phoneNumber2: yup
      .string()
      .required('연락처를 입력해주세요')
      .matches(/^\d{3,4}$/, '올바른 번호 형식이 아닙니다'),
    phoneNumber3: yup
      .string()
      .required('연락처를 입력해주세요')
      .matches(/^\d{4}$/, '올바른 번호 형식이 아닙니다'),
    permissions: yup.array().min(1, '최소 하나 이상의 권한을 선택해주세요')
  });

export default function MpAdminAdminEdit() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { session } = useMpSession();
  const [, setLoading] = useState(false);
  const errorDialog = useMpErrorDialog();
  const infoDialog = useMpInfoDialog();
  const isNew = userId === undefined;

  useEffect(() => {
    if (!isNew && session && !isMpSuperAdmin(session)) {
      infoDialog.showInfo('최고관리자만 관리자 편집이 가능합니다.');
      navigate('/admin/admins');
    }
  }, [session, isNew, navigate, infoDialog]);

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
      permissions: [] as (
        | 'MEMBER_MANAGEMENT'
        | 'PRODUCT_MANAGEMENT'
        | 'TRANSACTION_MANAGEMENT'
        | 'CONTRACT_MANAGEMENT'
        | 'PRESCRIPTION_MANAGEMENT'
        | 'SETTLEMENT_MANAGEMENT'
        | 'EXPENSE_REPORT_MANAGEMENT'
        | 'COMMUNITY_MANAGEMENT'
        | 'CONTENT_MANAGEMENT'
        | 'CUSTOMER_SERVICE'
        | 'BANNER_MANAGEMENT'
        | 'PERMISSION_MANAGEMENT'
        | 'ALL'
      )[]
    },
    validationSchema: createValidationSchema(isNew),
    onSubmit: async (values) => {
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
            permissions: values.permissions
          });
          infoDialog.showInfo('관리자가 등록되었습니다.');
          navigate('/admin/admins');
        } else {
          await updateByAdmin(userId!, {
            name: values.name,
            userId: values.userId,
            password: values.password !== '' ? values.password : null,
            email: values.email,
            phoneNumber,
            permissions: values.permissions
          });
          infoDialog.showInfo('관리자 권한이 수정되었습니다.');
          navigate('/admin/admins');
        }
      } catch (error) {
        console.error('Failed to save admin:', error);
        errorDialog.showError('저장 중 오류가 발생했습니다.');
      }
    }
  });

  useEffect(() => {
    const fetchAdminData = async () => {
      if (userId === undefined || isNew) return;

      setLoading(true);
      try {
        const [memberData, permissionData] = await Promise.all([getMemberDetails(userId), getPermissions(userId)]);

        const phoneParts = memberData.phoneNumber.includes('-')
          ? memberData.phoneNumber.split('-')
          : [memberData.phoneNumber.slice(0, 3), memberData.phoneNumber.slice(3, 7), memberData.phoneNumber.slice(7)];

        formik.setValues({
          ...formik.values,
          userId: memberData.userId,
          name: memberData.name,
          email: memberData.email,
          phoneNumber1: phoneParts[0] !== '' ? phoneParts[0] : '010',
          phoneNumber2: phoneParts[1] ?? '',
          phoneNumber3: phoneParts[2] ?? '',
          status: true,
          permissions: permissionData.permissions
        });
      } catch (error) {
        console.error('Failed to fetch admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [userId]);

  const handlePermissionChange = (
    permission:
      | 'MEMBER_MANAGEMENT'
      | 'PRODUCT_MANAGEMENT'
      | 'TRANSACTION_MANAGEMENT'
      | 'CONTRACT_MANAGEMENT'
      | 'PRESCRIPTION_MANAGEMENT'
      | 'SETTLEMENT_MANAGEMENT'
      | 'EXPENSE_REPORT_MANAGEMENT'
      | 'COMMUNITY_MANAGEMENT'
      | 'CONTENT_MANAGEMENT'
      | 'CUSTOMER_SERVICE'
      | 'BANNER_MANAGEMENT'
      | 'PERMISSION_MANAGEMENT'
      | 'ALL'
  ) => {
    const currentPermissions = [...formik.values.permissions];
    const index = currentPermissions.indexOf(permission);

    if (index > -1) {
      currentPermissions.splice(index, 1);
    } else {
      currentPermissions.push(permission);
    }

    formik.setFieldValue('permissions', currentPermissions);
  };

  const handleCancel = () => {
    navigate('/admin/admins');
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
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
                      name="status"
                      checked={formik.values.status}
                      onChange={(e) => formik.setFieldValue('status', e.target.checked)}
                      color="primary"
                    />
                  }
                  label={formik.values.status ? '활성' : '비활성'}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  name="name"
                  label="관리자 명"
                  fullWidth
                  required
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  name="userId"
                  label="아이디"
                  fullWidth
                  required
                  disabled={!isNew}
                  value={formik.values.userId}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.userId && Boolean(formik.errors.userId)}
                  helperText={formik.touched.userId && formik.errors.userId}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  name="password"
                  label="패스워드"
                  type="password"
                  fullWidth
                  required={isNew}
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={
                    formik.touched.password && formik.errors.password
                      ? formik.errors.password
                      : !isNew
                        ? '변경하지 않으려면 비워두세요'
                        : ''
                  }
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  name="passwordConfirm"
                  label="패스워드 확인"
                  type="password"
                  fullWidth
                  required={isNew}
                  value={formik.values.passwordConfirm}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.passwordConfirm && Boolean(formik.errors.passwordConfirm)}
                  helperText={formik.touched.passwordConfirm && formik.errors.passwordConfirm}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  name="email"
                  label="이메일"
                  type="email"
                  fullWidth
                  required
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  연락처
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <FormControl size="small" sx={{ minWidth: 100 }}>
                    <Select name="phoneNumber1" value={formik.values.phoneNumber1} onChange={formik.handleChange}>
                      <MenuItem value="010">010</MenuItem>
                      <MenuItem value="011">011</MenuItem>
                      <MenuItem value="016">016</MenuItem>
                      <MenuItem value="017">017</MenuItem>
                      <MenuItem value="018">018</MenuItem>
                      <MenuItem value="019">019</MenuItem>
                    </Select>
                  </FormControl>
                  <Typography>-</Typography>
                  <TextField
                    name="phoneNumber2"
                    size="small"
                    sx={{ width: 100 }}
                    value={formik.values.phoneNumber2}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.phoneNumber2 && Boolean(formik.errors.phoneNumber2)}
                    helperText={formik.touched.phoneNumber2 && formik.errors.phoneNumber2}
                  />
                  <Typography>-</Typography>
                  <TextField
                    name="phoneNumber3"
                    size="small"
                    sx={{ width: 100 }}
                    value={formik.values.phoneNumber3}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.phoneNumber3 && Boolean(formik.errors.phoneNumber3)}
                    helperText={formik.touched.phoneNumber3 && formik.errors.phoneNumber3}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  관리메뉴
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={3}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formik.values.permissions.includes('MEMBER_MANAGEMENT')}
                          onChange={() => handlePermissionChange('MEMBER_MANAGEMENT')}
                        />
                      }
                      label="회원관리"
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formik.values.permissions.includes('PRODUCT_MANAGEMENT')}
                          onChange={() => handlePermissionChange('PRODUCT_MANAGEMENT')}
                        />
                      }
                      label="제품관리"
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formik.values.permissions.includes('TRANSACTION_MANAGEMENT')}
                          onChange={() => handlePermissionChange('TRANSACTION_MANAGEMENT')}
                        />
                      }
                      label="거래선관리"
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formik.values.permissions.includes('CONTRACT_MANAGEMENT')}
                          onChange={() => handlePermissionChange('CONTRACT_MANAGEMENT')}
                        />
                      }
                      label="계약관리"
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formik.values.permissions.includes('PRESCRIPTION_MANAGEMENT')}
                          onChange={() => handlePermissionChange('PRESCRIPTION_MANAGEMENT')}
                        />
                      }
                      label="처방관리"
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formik.values.permissions.includes('SETTLEMENT_MANAGEMENT')}
                          onChange={() => handlePermissionChange('SETTLEMENT_MANAGEMENT')}
                        />
                      }
                      label="정산관리"
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formik.values.permissions.includes('EXPENSE_REPORT_MANAGEMENT')}
                          onChange={() => handlePermissionChange('EXPENSE_REPORT_MANAGEMENT')}
                        />
                      }
                      label="지출보고관리"
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formik.values.permissions.includes('COMMUNITY_MANAGEMENT')}
                          onChange={() => handlePermissionChange('COMMUNITY_MANAGEMENT')}
                        />
                      }
                      label="커뮤니티"
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formik.values.permissions.includes('CONTENT_MANAGEMENT')}
                          onChange={() => handlePermissionChange('CONTENT_MANAGEMENT')}
                        />
                      }
                      label="콘텐츠관리"
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formik.values.permissions.includes('CUSTOMER_SERVICE')}
                          onChange={() => handlePermissionChange('CUSTOMER_SERVICE')}
                        />
                      }
                      label="고객센터"
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formik.values.permissions.includes('BANNER_MANAGEMENT')}
                          onChange={() => handlePermissionChange('BANNER_MANAGEMENT')}
                        />
                      }
                      label="배너관리"
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formik.values.permissions.includes('PERMISSION_MANAGEMENT')}
                          onChange={() => handlePermissionChange('PERMISSION_MANAGEMENT')}
                        />
                      }
                      label="권한관리"
                    />
                  </Grid>
                </Grid>
                {formik.touched.permissions && formik.errors.permissions && (
                  <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                    {formik.errors.permissions}
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12}>
                <Stack direction="row" spacing={2} justifyContent="center">
                  <Button variant="outlined" size="large" onClick={handleCancel}>
                    취소
                  </Button>
                  <Button variant="contained" size="large" color="success" type="submit">
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

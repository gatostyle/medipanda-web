import {
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  CircularProgress,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  Link as MuiLink,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { useFormik } from 'formik';
import { mpUpdateMemberFile } from 'medipanda/api-definitions/MpMember';
import { NotImplementedError } from 'medipanda/api-definitions/NotImplementedError';
import { approveOrRejectCso, getContractDetails, getMemberDetails } from 'medipanda/backend';
import { useMpErrorDialog } from 'medipanda/hooks/useMpErrorDialog';
import { useMpInfoDialog } from 'medipanda/hooks/useMpInfoDialog';
import { useMpNotImplementedDialog } from 'medipanda/hooks/useMpNotImplementedDialog';
import { mockString } from 'medipanda/mockup';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { formatYyyyMmDd } from '../utils/dateFormat';

export default function MpAdminMemberEdit() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const notImplementedDialog = useMpNotImplementedDialog();
  const infoDialog = useMpInfoDialog();
  const errorDialog = useMpErrorDialog();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [hasPartnerContract, setHasPartnerContract] = useState(false);
  const [isContractApproved, setIsContractApproved] = useState(false);

  const formik = useFormik({
    initialValues: {
      memberId: -1,
      userId: '',
      password: '',
      confirmPassword: '',
      name: '',
      phoneNumber: '',
      birthDate: '',
      gender: '',
      email: '',
      referralCode: '',
      registrationDate: '',
      lastLoginDate: '',
      accountStatus: 'ACTIVATED',
      csoLicenseFile: '',
      contractType: 'ORGANIZATION',
      contractStatus: '미계약',
      companyName: '',
      businessNumber: '',
      settlementBank: '',
      subcontractFile: '',
      educationCertificate: '',
      contractDate: '',
      commissionRate: 0,
      note: '',
      marketingAgreements: {
        sms: false,
        email: false,
        push: false
      }
    },
    onSubmit: async (values) => {
      console.log('Form submitted:', values);
      navigate('/admin/members');
    }
  });

  useEffect(() => {
    const fetchMemberData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const memberDetail = await getMemberDetails(userId);
        let formikValues = formik.values;

        formikValues = {
          ...formikValues,
          memberId: memberDetail.id,
          userId: memberDetail.userId,
          name: memberDetail.name,
          phoneNumber: memberDetail.phoneNumber,
          birthDate: memberDetail.birthDate,
          gender: memberDetail.gender ?? '',
          email: memberDetail.email,
          referralCode: memberDetail.referralCode ?? '',
          registrationDate: memberDetail.registrationDate,
          lastLoginDate: memberDetail.lastLoginDate,
          accountStatus: 'ACTIVATED',
          csoLicenseFile: memberDetail.csoCertUrl ?? '',
          note: memberDetail.note ?? '',
          marketingAgreements: memberDetail.marketingAgreements || {
            sms: false,
            email: false,
            push: false
          }
        };

        try {
          const contractData = await getContractDetails(userId);
          setHasPartnerContract(true);
          setIsContractApproved(contractData.status === 'APPROVED');

          formikValues = {
            ...formikValues,
            contractType: contractData.contractType || 'ORGANIZATION',
            contractStatus: contractData.status === 'APPROVED' ? '계약' : '미계약',
            companyName: contractData.companyName ?? '',
            businessNumber: contractData.businessNumber ?? '',
            settlementBank: `${contractData.bankName ?? ''} ${contractData.accountNumber ?? ''}`.trim(),
            subcontractFile: contractData.fileUrls?.subcontractAgreement ?? '',
            educationCertificate: contractData.fileUrls?.educationCertificate ?? '',
            contractDate: contractData.contractDate?.toString() ?? '',
            commissionRate: 0
          };
        } catch (e) {
          setHasPartnerContract(false);
          console.log('No partner contract found for member:', userId);
        }

        formik.setValues(formikValues);
      } catch (error) {
        console.error('Failed to fetch member data:', error);
        enqueueSnackbar('회원 정보를 불러오는데 실패했습니다.', { variant: 'error' });
        navigate('/admin/members');
      } finally {
        setLoading(false);
      }
    };

    fetchMemberData();
  }, [userId]);

  const handleCancel = () => {
    navigate('/admin/members');
  };

  const handleCsoApprove = async () => {
    try {
      await approveOrRejectCso(userId!, { isApproved: true });
      infoDialog.showInfo('CSO 신고증이 승인되었습니다.');
    } catch (error) {
      if (error instanceof NotImplementedError) {
        notImplementedDialog.open(error.message);
      } else {
        console.error('Failed to approve CSO report:', error);
        errorDialog.showError('CSO 신고증 승인 중 오류가 발생했습니다.');
      }
    }
  };

  const handleCsoReject = async () => {
    try {
      await approveOrRejectCso(userId!, { isApproved: false });
      infoDialog.showInfo('CSO 신고증이 반려되었습니다.');
    } catch (error) {
      if (error instanceof NotImplementedError) {
        notImplementedDialog.open(error.message);
      } else {
        console.error('Failed to reject CSO report:', error);
        errorDialog.showError('CSO 신고증 반려 중 오류가 발생했습니다.');
      }
    }
  };

  const handleContractApprove = () => {
    setIsContractApproved(true);
    formik.setFieldValue('contractStatus', '계약');
  };

  const handleFileChange = async (field: string) => {
    try {
      const file = new File([], mockString('placeholder.pdf'));
      await mpUpdateMemberFile(
        userId!,
        {
          password: null,
          name: formik.values.name,
          nickname: null,
          birthDate: formik.values.birthDate,
          phoneNumber: formik.values.phoneNumber,
          email: formik.values.email,
          referralCode: formik.values.referralCode || null,
          marketingAgreement: formik.values.marketingAgreements,
          note: mockString(`${field} 파일 업데이트`)
        },
        file
      );
      infoDialog.showInfo('파일이 변경되었습니다.');
    } catch (error) {
      if (error instanceof NotImplementedError) {
        notImplementedDialog.open(error.message);
      } else {
        console.error('Failed to change file:', error);
        errorDialog.showError('파일 변경 중 오류가 발생했습니다.');
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        회원정보
      </Typography>

      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                    기본정보
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        회원번호
                      </Typography>
                      <Typography variant="body1">{formik.values.memberId}</Typography>
                    </Grid>

                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        아이디
                      </Typography>
                      <Typography variant="body1">{formik.values.userId}</Typography>
                    </Grid>

                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="비밀번호"
                        name="password"
                        type="password"
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        size="small"
                      />
                    </Grid>

                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="비밀번호 확인"
                        name="confirmPassword"
                        type="password"
                        value={formik.values.confirmPassword}
                        onChange={formik.handleChange}
                        size="small"
                      />
                    </Grid>

                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        회원명
                      </Typography>
                      <Typography variant="body1">{formik.values.name}</Typography>
                    </Grid>

                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="휴대폰번호"
                        name="phoneNumber"
                        value={formik.values.phoneNumber}
                        onChange={formik.handleChange}
                        size="small"
                      />
                    </Grid>

                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        생년월일
                      </Typography>
                      <Typography variant="body1">
                        {formatYyyyMmDd(formik.values.birthDate)} {formik.values.gender}
                      </Typography>
                    </Grid>

                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="E-mail"
                        name="email"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        size="small"
                      />
                    </Grid>

                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        추천코드
                      </Typography>
                      <Typography variant="body1">{formik.values.referralCode}</Typography>
                    </Grid>

                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        가입일
                      </Typography>
                      <Typography variant="body1">{formatYyyyMmDd(formik.values.registrationDate)}</Typography>
                    </Grid>

                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        최종접속일
                      </Typography>
                      <Typography variant="body1">{formatYyyyMmDd(formik.values.lastLoginDate)}</Typography>
                    </Grid>

                    <Grid item xs={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel>계정상태</InputLabel>
                        <Select name="accountStatus" value={formik.values.accountStatus} onChange={formik.handleChange}>
                          <MenuItem value={'ACTIVATED'}>활성</MenuItem>
                          <MenuItem value={'BLOCKED'}>비활성</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    {formik.values.csoLicenseFile !== '' && (
                      <Grid item xs={12}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Typography variant="subtitle2" color="text.secondary">
                            CSO 신고증
                          </Typography>
                          <MuiLink href={formik.values.csoLicenseFile} download target="_blank" rel="noopener noreferrer" underline="hover">
                            {new URL(formik.values.csoLicenseFile).pathname.split('/').pop()}
                          </MuiLink>
                          <Button variant="text" color="primary" size="small"></Button>
                          <Button variant="outlined" color="error" size="small" onClick={handleCsoReject}>
                            반려
                          </Button>
                          <Button variant="contained" color="success" size="small" onClick={handleCsoApprove}>
                            승인
                          </Button>
                        </Stack>
                      </Grid>
                    )}
                  </Grid>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Stack spacing={3}>
                  {hasPartnerContract && (
                    <Card sx={{ p: 3 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                        <Typography variant="h6">파트너사 계약</Typography>
                        {!isContractApproved && (
                          <Button variant="contained" color="success" size="small" onClick={handleContractApprove}>
                            승인
                          </Button>
                        )}
                        {isContractApproved && <Chip label="승인" color="success" size="small" />}
                      </Stack>

                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <FormControl fullWidth size="small">
                            <InputLabel>유형</InputLabel>
                            <Select name="contractType" value={formik.values.contractType} onChange={formik.handleChange}>
                              <MenuItem value={'ORGANIZATION'}>법인계약</MenuItem>
                              <MenuItem value={'INDIVIDUAL'}>개인계약</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>

                        <Grid item xs={6}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            계약상태
                          </Typography>
                          <Typography variant="body1">{formik.values.contractStatus}</Typography>
                        </Grid>

                        <Grid item xs={6}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            회사명
                          </Typography>
                          <Typography variant="body1">{formik.values.companyName}</Typography>
                        </Grid>

                        <Grid item xs={6}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            사업자등록번호
                          </Typography>
                          <Typography variant="body1">{formik.values.businessNumber}</Typography>
                        </Grid>

                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="정산은행"
                            name="settlementBank"
                            value={formik.values.settlementBank}
                            onChange={formik.handleChange}
                            size="small"
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Typography variant="subtitle2" color="text.secondary">
                              재위탁계약서
                            </Typography>
                            <Button variant="text" color="primary" size="small">
                              {formik.values.subcontractFile}
                            </Button>
                            <Button variant="outlined" size="small" onClick={() => handleFileChange('subcontractFile')}>
                              파일변경
                            </Button>
                          </Stack>
                        </Grid>

                        <Grid item xs={12}>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Typography variant="subtitle2" color="text.secondary">
                              판매위수탁 교육이수증
                            </Typography>
                            <Button variant="text" color="primary" size="small">
                              {formik.values.educationCertificate}
                            </Button>
                            <Button variant="outlined" size="small" onClick={() => handleFileChange('educationCertificate')}>
                              파일변경
                            </Button>
                          </Stack>
                        </Grid>

                        <Grid item xs={6}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            계약일
                          </Typography>
                          <Typography variant="body1">{formatYyyyMmDd(formik.values.contractDate)}</Typography>
                        </Grid>

                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            label="구간수수료"
                            name="commissionRate"
                            type="number"
                            value={formik.values.commissionRate}
                            onChange={formik.handleChange}
                            size="small"
                            InputProps={{
                              endAdornment: <Typography>%</Typography>
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Card>
                  )}

                  <Card sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                      비고
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      name="note"
                      value={formik.values.note}
                      onChange={formik.handleChange}
                      placeholder="메모를 입력하세요"
                    />
                  </Card>
                </Stack>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                마케팅 수신동의
              </Typography>
              <Stack spacing={1}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formik.values.marketingAgreements.sms}
                      onChange={(e) => formik.setFieldValue('marketingAgreements.sms', e.target.checked)}
                    />
                  }
                  label="SMS"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formik.values.marketingAgreements.email}
                      onChange={(e) => formik.setFieldValue('marketingAgreements.email', e.target.checked)}
                    />
                  }
                  label="이메일"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formik.values.marketingAgreements.push}
                      onChange={(e) => formik.setFieldValue('marketingAgreements.push', e.target.checked)}
                    />
                  }
                  label={`App Push`}
                />
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 3 }}>
              <Button variant="outlined" size="large" onClick={handleCancel} sx={{ minWidth: 120 }}>
                취소
              </Button>
              <Button variant="contained" size="large" color="success" type="submit" sx={{ minWidth: 120 }}>
                저장
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
}

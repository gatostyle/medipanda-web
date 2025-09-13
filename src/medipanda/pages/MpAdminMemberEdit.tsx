import { MedipandaUrlFileName } from '@/lib/url';
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
  Link,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { isAxiosError } from 'axios';
import { useFormik } from 'formik';
import {
  approveContract,
  approveOrRejectCso,
  getContractDetails,
  getMemberDetails,
  MemberDetailsResponse,
  PartnerContractDetailsResponse,
  updateContract,
  updateMember,
} from '@/backend';
import { useMpErrorDialog } from '@/medipanda/hooks/useMpErrorDialog';
import { useMpInfoDialog } from '@/medipanda/hooks/useMpInfoDialog';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import { formatYyyyMmDd } from '../utils/dateFormat';

export default function MpAdminMemberEdit() {
  const navigate = useNavigate();
  const { userId: paramUserId } = useParams();
  const isNew = paramUserId === undefined;
  const userId = paramUserId!;

  const infoDialog = useMpInfoDialog();
  const errorDialog = useMpErrorDialog();
  const { enqueueSnackbar } = useSnackbar();
  const [isContractApproved, setIsContractApproved] = useState(false);
  const [detail, setDetail] = useState<MemberDetailsResponse | null>(null);
  const [contractDetail, setContractDetail] = useState<PartnerContractDetailsResponse | null>(null);

  const formik = useFormik({
    initialValues: {
      password: '',
      confirmPassword: '',
      phoneNumber: '',
      email: '',
      accountStatus: 'ACTIVATED' as 'ACTIVATED' | 'BLOCKED' | 'DELETED',
      contractType: 'INDIVIDUAL' as 'INDIVIDUAL' | 'ORGANIZATION',
      bankName: '',
      commissionRate: 0,
      note: '',
      marketingAgreementsSms: false,
      marketingAgreementsEmail: false,
      marketingAgreementsPush: false,
    },
    onSubmit: async values => {
      if (values.password !== '' && values.password !== values.confirmPassword) {
        alert('입력한 비밀번호가 불일치합니다.');
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
        alert('올바른 이메일 형식이 아닙니다.');
        return;
      }

      if (values.phoneNumber !== detail?.phoneNumber && values.phoneNumber === '') {
        alert('휴대폰번호를 입력하세요.');
        return;
      }

      try {
        await updateMember(userId, {
          request: {
            password: values.password !== '' ? values.password : null,
            name: null,
            birthDate: null,
            accountStatus: values.accountStatus,
            phoneNumber: values.phoneNumber !== detail?.phoneNumber ? values.phoneNumber : null,
            email: values.email,
            nickname: null,
            referralCode: null,
            note: values.note,
            marketingAgreement: {
              sms: values.marketingAgreementsSms,
              email: values.marketingAgreementsEmail,
              push: values.marketingAgreementsPush,
            },
          },
        });

        if (contractDetail !== null) {
          await updateContract(contractDetail.id, {
            request: {
              contractType: values.contractType,
              companyName: null,
              businessNumber: null,
              bankName: values.bankName,
              accountNumber: null,
            },
            business_registration: undefined,
            subcontract_agreement: undefined,
            cso_certificate: undefined,
            education_certificate: undefined,
          });
        }

        alert('회원정보가 수정되었습니다.');
        navigate('/admin/members');
      } catch (e) {
        switch (true) {
          case isAxiosError(e) && e.response?.data === `Bad request: phone number ${values.phoneNumber} already exists.`:
            alert('이미 사용중인 휴대폰번호입니다.');
            break;
          default:
            console.error(e);
            alert('회원정보 수정 중 오류가 발생했습니다.');
            break;
        }
      }
    },
  });

  useEffect(() => {
    if (!isNew) {
      fetchDetail(userId);
    }
  }, [isNew, userId]);

  const fetchDetail = async (userId: string) => {
    try {
      const detail = await getMemberDetails(userId);
      setDetail(detail);
      const values: (typeof formik)['values'] = {
        password: '',
        confirmPassword: '',
        phoneNumber: detail.phoneNumber,
        email: detail.email,
        accountStatus: detail.accountStatus,
        contractType: 'INDIVIDUAL',
        bankName: '',
        commissionRate: 0,
        note: detail.note ?? '',
        marketingAgreementsSms: detail.marketingAgreements?.sms ?? false,
        marketingAgreementsEmail: detail.marketingAgreements?.email ?? false,
        marketingAgreementsPush: detail.marketingAgreements?.push ?? false,
      };

      formik.resetForm({
        values,
      });

      await fetchContractDetail(values);
    } catch (error) {
      console.error('Failed to fetch member data:', error);
      enqueueSnackbar('회원 정보를 불러오는데 실패했습니다.', { variant: 'error' });
      navigate('/admin/members');
    }
  };

  const fetchContractDetail = async (values: (typeof formik)['values']) => {
    try {
      const contractDetail = await getContractDetails(userId);
      setContractDetail(contractDetail);
      setIsContractApproved(contractDetail.status === 'APPROVED');

      formik.resetForm({
        values: {
          ...values,
          contractType: contractDetail.contractType,
          bankName: `${contractDetail.bankName ?? ''} ${contractDetail.accountNumber ?? ''}`.trim(),
          commissionRate: 0,
        },
      });
    } catch (e) {
      setContractDetail(null);
      console.log('No partner contract found for member:', userId);
    }
  };

  const handleCsoApprove = async () => {
    try {
      await approveOrRejectCso(userId, { isApproved: true });
      infoDialog.showInfo('CSO 신고증이 승인되었습니다.');
      await fetchDetail(userId);
    } catch (error) {
      console.error('Failed to approve CSO report:', error);
      errorDialog.showError('CSO 신고증 승인 중 오류가 발생했습니다.');
    }
  };

  const handleCsoReject = async () => {
    try {
      await approveOrRejectCso(userId, { isApproved: false });
      infoDialog.showInfo('CSO 신고증이 반려되었습니다.');
      await fetchDetail(userId);
    } catch (error) {
      console.error('Failed to reject CSO report:', error);
      errorDialog.showError('CSO 신고증 반려 중 오류가 발생했습니다.');
    }
  };

  const handleCsoUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = async (event: any) => {
      const file = event.target.files[0];
      if (!file) return;

      try {
        await updateMember(userId, {
          request: {
            password: null,
            name: null,
            birthDate: null,
            accountStatus: null,
            phoneNumber: null,
            email: null,
            nickname: null,
            referralCode: null,
            note: null,
            marketingAgreement: null,
          },
          file: file,
        });

        alert('CSO 신고증이 업로드되었습니다.');
        await fetchDetail(userId);
      } catch (e) {
        console.error('Failed to upload CSO report:', e);
        alert('CSO 신고증 업로드 중 오류가 발생했습니다.');
      }
    };
    input.click();
  };

  const handleContractApprove = async () => {
    try {
      await approveContract(contractDetail!.id);
      infoDialog.showInfo('파트너사 계약이 승인되었습니다.');
      await fetchContractDetail(formik.values);
    } catch (error) {
      console.error('Failed to approve partner contract:', error);
      errorDialog.showError('파트너사 계약 승인 중 오류가 발생했습니다.');
    }
  };

  if (detail === null) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant='h4' gutterBottom sx={{ mb: 3 }}>
        회원정보
      </Typography>

      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 3 }}>
                  <Typography variant='h6' gutterBottom sx={{ mb: 3 }}>
                    기본정보
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                        회원번호
                      </Typography>
                      <Typography variant='body1'>{detail.id}</Typography>
                    </Grid>

                    <Grid item xs={6}>
                      <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                        아이디
                      </Typography>
                      <Typography variant='body1'>{detail.userId}</Typography>
                    </Grid>

                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label='비밀번호'
                        name='password'
                        type='password'
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        size='small'
                      />
                    </Grid>

                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label='비밀번호 확인'
                        name='confirmPassword'
                        type='password'
                        value={formik.values.confirmPassword}
                        onChange={formik.handleChange}
                        size='small'
                      />
                    </Grid>

                    <Grid item xs={6}>
                      <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                        회원명
                      </Typography>
                      <Typography variant='body1'>{detail.name}</Typography>
                    </Grid>

                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label='휴대폰번호'
                        name='phoneNumber'
                        value={formik.values.phoneNumber}
                        onChange={formik.handleChange}
                        size='small'
                      />
                    </Grid>

                    <Grid item xs={6}>
                      <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                        생년월일
                      </Typography>
                      <Typography variant='body1'>
                        {formatYyyyMmDd(detail.birthDate)} {detail.gender}
                      </Typography>
                    </Grid>

                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label='E-mail'
                        name='email'
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        size='small'
                      />
                    </Grid>

                    <Grid item xs={6}>
                      <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                        추천코드
                      </Typography>
                      <Typography variant='body1'>{detail.referralCode}</Typography>
                    </Grid>

                    <Grid item xs={6}>
                      <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                        가입일
                      </Typography>
                      <Typography variant='body1'>{formatYyyyMmDd(detail.registrationDate)}</Typography>
                    </Grid>

                    <Grid item xs={6}>
                      <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                        최종접속일
                      </Typography>
                      <Typography variant='body1'>{formatYyyyMmDd(detail.lastLoginDate)}</Typography>
                    </Grid>

                    <Grid item xs={6}>
                      <FormControl fullWidth size='small'>
                        <InputLabel>계정상태</InputLabel>
                        <Select name='accountStatus' value={formik.values.accountStatus} onChange={formik.handleChange}>
                          <MenuItem value={'ACTIVATED'}>활성</MenuItem>
                          <MenuItem value={'BLOCKED'}>비활성</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                      <Stack direction='row' spacing={2} alignItems='center'>
                        <Typography variant='subtitle2' color='text.secondary'>
                          CSO 신고증
                        </Typography>
                        {detail.csoCertUrl !== null ? (
                          <Link href={detail.csoCertUrl} download target='_blank' rel='noopener noreferrer' underline='hover'>
                            {MedipandaUrlFileName(detail.csoCertUrl)}
                          </Link>
                        ) : (
                          <Button variant='outlined' color='primary' size='small' onClick={handleCsoUpload}>
                            업로드
                          </Button>
                        )}
                        {detail.csoCertUrl !== null && detail.partnerContractStatus === 'NONE' && (
                          <>
                            <Button variant='outlined' color='error' size='small' onClick={handleCsoReject}>
                              반려
                            </Button>
                            <Button variant='contained' size='small' onClick={handleCsoApprove}>
                              승인
                            </Button>
                          </>
                        )}
                      </Stack>
                    </Grid>
                  </Grid>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Stack spacing={3}>
                  {contractDetail !== null && (
                    <Card sx={{ p: 3 }}>
                      <Stack direction='row' justifyContent='space-between' alignItems='center' sx={{ mb: 3 }}>
                        <Typography variant='h6'>파트너사 계약</Typography>
                        {!isContractApproved && (
                          <Button variant='contained' size='small' onClick={handleContractApprove}>
                            승인
                          </Button>
                        )}
                        {isContractApproved && <Chip label='승인완료' color='success' size='small' />}
                      </Stack>

                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <FormControl fullWidth size='small'>
                            <InputLabel>유형</InputLabel>
                            <Select name='contractType' value={formik.values.contractType} onChange={formik.handleChange}>
                              <MenuItem value={'ORGANIZATION'}>법인계약</MenuItem>
                              <MenuItem value={'INDIVIDUAL'}>개인계약</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>

                        <Grid item xs={6}>
                          <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                            계약상태
                          </Typography>
                          <Typography variant='body1'>{contractDetail.status}</Typography>
                        </Grid>

                        <Grid item xs={6}>
                          <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                            회사명
                          </Typography>
                          <Typography variant='body1'>{contractDetail.companyName}</Typography>
                        </Grid>

                        <Grid item xs={6}>
                          <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                            사업자등록번호
                          </Typography>
                          <Typography variant='body1'>{contractDetail.businessNumber}</Typography>
                        </Grid>

                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label='정산은행'
                            name='bankName'
                            value={formik.values.bankName}
                            onChange={formik.handleChange}
                            size='small'
                          />
                        </Grid>

                        {contractDetail.fileUrls['CSO_CERTIFICATE'] !== null && (
                          <Grid item xs={12}>
                            <Stack direction='row' spacing={2} alignItems='center'>
                              <Typography variant='subtitle2' color='text.secondary'>
                                CSO 신고증
                              </Typography>
                              <Link component={RouterLink} to={contractDetail.fileUrls['CSO_CERTIFICATE']} target='_blank'>
                                {MedipandaUrlFileName(contractDetail.fileUrls['CSO_CERTIFICATE'])}
                              </Link>
                            </Stack>
                          </Grid>
                        )}

                        {contractDetail.fileUrls['SUBCONTRACT_AGREEMENT'] !== null && (
                          <Grid item xs={12}>
                            <Stack direction='row' spacing={2} alignItems='center'>
                              <Typography variant='subtitle2' color='text.secondary'>
                                재위탁계약서
                              </Typography>
                              <Link component={RouterLink} to={contractDetail.fileUrls['SUBCONTRACT_AGREEMENT']} target='_blank'>
                                {MedipandaUrlFileName(contractDetail.fileUrls['SUBCONTRACT_AGREEMENT'])}
                              </Link>
                            </Stack>
                          </Grid>
                        )}

                        {contractDetail.fileUrls['SALES_EDUCATION_CERT'] !== null && (
                          <Grid item xs={12}>
                            <Stack direction='row' spacing={2} alignItems='center'>
                              <Typography variant='subtitle2' color='text.secondary'>
                                판매위수탁 교육이수증
                              </Typography>
                              <Link component={RouterLink} to={contractDetail.fileUrls['SALES_EDUCATION_CERT']} target='_blank'>
                                {MedipandaUrlFileName(contractDetail.fileUrls['SALES_EDUCATION_CERT'])}
                              </Link>
                            </Stack>
                          </Grid>
                        )}

                        <Grid item xs={6}>
                          <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                            계약일
                          </Typography>
                          <Typography variant='body1'>{formatYyyyMmDd(contractDetail.contractDate)}</Typography>
                        </Grid>

                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            label='구간수수료'
                            name='commissionRate'
                            value={formik.values.commissionRate}
                            onChange={formik.handleChange}
                            size='small'
                            InputProps={{
                              endAdornment: <Typography>%</Typography>,
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Card>
                  )}

                  <Card sx={{ p: 3 }}>
                    <Typography variant='h6' gutterBottom sx={{ mb: 2 }}>
                      비고
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      name='note'
                      value={formik.values.note}
                      onChange={formik.handleChange}
                      placeholder='메모를 입력하세요'
                    />
                  </Card>
                </Stack>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Card sx={{ p: 3 }}>
              <Typography variant='h6' gutterBottom sx={{ mb: 2 }}>
                마케팅 수신동의
              </Typography>
              <Stack spacing={1}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formik.values.marketingAgreementsSms}
                      onChange={e => formik.setFieldValue('marketingAgreementsSms', e.target.checked)}
                    />
                  }
                  label='SMS'
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formik.values.marketingAgreementsEmail}
                      onChange={e => formik.setFieldValue('marketingAgreementsEmail', e.target.checked)}
                    />
                  }
                  label='이메일'
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formik.values.marketingAgreementsPush}
                      onChange={e => formik.setFieldValue('marketingAgreementsPush', e.target.checked)}
                    />
                  }
                  label={`App Push`}
                />
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Stack direction='row' spacing={2} justifyContent='center' sx={{ mt: 3 }}>
              <Button variant='outlined' size='large' onClick={() => window.history.back()} sx={{ minWidth: 120 }}>
                취소
              </Button>
              <Button variant='contained' size='large' type='submit' sx={{ minWidth: 120 }}>
                저장
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
}

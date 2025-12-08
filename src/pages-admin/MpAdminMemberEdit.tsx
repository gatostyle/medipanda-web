import { normalizeBusinessNumber, normalizePhoneNumber } from '@/lib/utils/form';
import { useMpModal } from '@/hooks/useMpModal';
import { MedipandaUrlFileName } from '@/utils/url';
import {
  Box,
  Button,
  Card,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  InputLabel,
  Link,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { isAxiosError } from 'axios';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import {
  AccountStatus,
  AccountStatusLabel,
  approveContract,
  approveOrRejectCso,
  getContractDetails,
  getMemberDetails,
  type MemberDetailsResponse,
  MemberType,
  type PartnerContractDetailsResponse,
  PartnerContractFileType,
  PartnerContractFileTypeLabel,
  PartnerContractStatus,
  PartnerContractStatusLabel,
  PartnerContractType,
  PartnerContractTypeLabel,
  rejectContract,
  updateContract,
  updateMember,
} from '@/backend';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import type { RequiredDeep } from 'type-fest';
import { DATEFORMAT_YYYY_MM_DD, DATEFORMAT_YYYY_MM_DD_HH_MM, DateUtils } from '@/lib/utils/dateFormat';

export default function MpAdminMemberEdit() {
  const navigate = useNavigate();
  const { userId: paramUserId } = useParams();
  const isNew = paramUserId === undefined;
  const userId = paramUserId!;

  const { alert, alertError } = useMpModal();
  const { enqueueSnackbar } = useSnackbar();
  const [detail, setDetail] = useState<MemberDetailsResponse | null>(null);
  const [contractDetail, setContractDetail] = useState<PartnerContractDetailsResponse | null>(null);

  const form = useForm({
    defaultValues: {
      password: '',
      confirmPassword: '',
      phoneNumber: '',
      email: '',
      accountStatus: AccountStatus.ACTIVATED as keyof typeof AccountStatus,
      contractType: PartnerContractType.INDIVIDUAL as keyof typeof PartnerContractType,
      bankName: '',
      accountNumber: '',
      note: '',
      marketingAgreementsSms: false,
      marketingAgreementsEmail: false,
      marketingAgreementsPush: false,
    },
  });

  const submitHandler: SubmitHandler<RequiredDeep<(typeof form)['control']['_defaultValues']>> = async values => {
    if (values.password !== '' && values.password !== values.confirmPassword) {
      await alert('입력한 비밀번호가 불일치합니다.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      await alert('올바른 이메일 형식이 아닙니다.');
      return;
    }

    if (values.phoneNumber !== detail?.phoneNumber && values.phoneNumber === '') {
      await alert('연락처를 입력하세요.');
      return;
    }

    if (contractDetail !== null) {
      if (values.bankName === '') {
        await alert('정산은행을 입력하세요.');
        return;
      }

      if (values.accountNumber === '') {
        await alert('계좌번호를 입력하세요.');
        return;
      }
    }

    try {
      await updateMember(userId, {
        request: {
          password: values.password !== '' ? values.password : null,
          name: null,
          birthDate: null,
          accountStatus: values.accountStatus,
          phoneNumber: values.phoneNumber.replace(/-/g, ''),
          email: values.email,
          nickname: null,
          referralCode: null,
          note: values.note,
          marketingAgreement: {
            sms: values.marketingAgreementsSms,
            emailAgreedAt: null,
            email: values.marketingAgreementsEmail,
            pushAgreedAt: null,
            push: values.marketingAgreementsPush,
            smsAgreedAt: null,
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
            accountNumber: values.accountNumber,
          },
          business_registration: undefined,
          subcontract_agreement: undefined,
          cso_certificate: undefined,
          education_certificate: undefined,
        });
      }

      await alert('회원정보가 수정되었습니다.');
      navigate('/admin/members');
    } catch (e) {
      switch (true) {
        case isAxiosError(e) && /Bad request: phone number \w+ already exists./.test(e.response?.data ?? ''):
          await alert('이미 사용중인 연락처입니다.');
          break;
        default:
          console.error(e);
          await alertError('회원정보 수정 중 오류가 발생했습니다.');
          break;
      }
    }
  };

  useEffect(() => {
    if (!isNew) {
      fetchDetail(userId);
    }
  }, [isNew, userId]);

  const fetchDetail = async (userId: string) => {
    try {
      const [detail, contractDetail] = await Promise.all([getMemberDetails(userId), fetchContractDetail(userId)]);
      setDetail(detail);
      setContractDetail(contractDetail ?? null);

      form.reset({
        password: '',
        confirmPassword: '',
        phoneNumber: normalizePhoneNumber(detail.phoneNumber),
        email: detail.email,
        accountStatus: detail.accountStatus,
        contractType: contractDetail?.contractType ?? PartnerContractType.INDIVIDUAL,
        bankName: contractDetail?.bankName ?? '',
        accountNumber: contractDetail?.accountNumber ?? '',
        note: detail.note ?? '',
        marketingAgreementsSms: detail.marketingAgreements?.sms ?? false,
        marketingAgreementsEmail: detail.marketingAgreements?.email ?? false,
        marketingAgreementsPush: detail.marketingAgreements?.push ?? false,
      });
    } catch (error) {
      console.error('Failed to fetch member data:', error);
      enqueueSnackbar('회원 정보를 불러오는데 실패했습니다.', { variant: 'error' });
      return window.history.back();
    }
  };

  const fetchContractDetail = async (userId: string): Promise<PartnerContractDetailsResponse | null> => {
    let contractDetail: PartnerContractDetailsResponse | null = null;

    try {
      contractDetail = await getContractDetails(userId);
    } catch {
      console.log('No partner contract found for member:', userId);
    }

    return contractDetail ?? null;
  };

  const handleCsoApprove = async () => {
    try {
      await approveOrRejectCso(userId, { isApproved: true });
      await alert('CSO 신고증이 승인되었습니다.');
      await fetchDetail(userId);
    } catch (error) {
      console.error('Failed to approve CSO report:', error);
      await alertError('CSO 신고증 승인 중 오류가 발생했습니다.');
    }
  };

  const handleCsoReject = async () => {
    try {
      await approveOrRejectCso(userId, { isApproved: false });
      await alert('CSO 신고증이 반려되었습니다.');
      await fetchDetail(userId);
    } catch (error) {
      console.error('Failed to reject CSO report:', error);
      await alertError('CSO 신고증 반려 중 오류가 발생했습니다.');
    }
  };

  const handleCsoUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf';
    input.onchange = async event => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      if (file.type !== 'application/pdf') {
        await alert('PDF 파일만 업로드할 수 있습니다.');
        return;
      }

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

        await alert('CSO 신고증이 업로드되었습니다.');
        await fetchDetail(userId);
      } catch (e) {
        console.error('Failed to upload CSO report:', e);
        await alertError('CSO 신고증 업로드 중 오류가 발생했습니다.');
      }
    };
    input.click();
  };

  const handleContractApprove = async () => {
    try {
      await approveContract(contractDetail!.id);
      await alert('파트너사 계약이 승인되었습니다.');
      await fetchDetail(userId);
    } catch (error) {
      console.error('Failed to approve partner contract:', error);
      await alertError('파트너사 계약 승인 중 오류가 발생했습니다.');
    }
  };

  const handleContractReject = async () => {
    try {
      await rejectContract(contractDetail!.id);
      await alert('파트너사 계약이 종료되었습니다.');
      await fetchDetail(userId);
    } catch (error) {
      console.error('Failed to reject partner contract:', error);
      await alertError('파트너사 계약 종료 중 오류가 발생했습니다.');
    }
  };

  if (detail === null) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  const isEditable = detail.accountStatus !== AccountStatus.DELETED;

  return (
    <Stack sx={{ gap: 3 }}>
      <Typography variant='h4'>회원정보</Typography>

      <Stack sx={{ gap: 3 }}>
        <Stack direction='row' sx={{ gap: 3 }}>
          <Stack sx={{ flex: '1 0', overflow: 'hidden' }}>
            <Card component={Stack} sx={{ p: 3, gap: 3 }}>
              <Typography variant='h6'>기본정보</Typography>

              <Stack direction='row' sx={{ gap: 2 }}>
                <Stack sx={{ flex: '1 0', gap: 1 }}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    회원번호
                  </Typography>
                  <Typography variant='body1'>{detail.id}</Typography>
                </Stack>

                <Stack sx={{ flex: '1 0', gap: 1 }}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    아이디
                  </Typography>
                  <Typography variant='body1'>{detail.userId}</Typography>
                </Stack>
              </Stack>

              <Stack direction='row' sx={{ gap: 2 }}>
                <Stack sx={{ flex: '1 0' }}>
                  <Controller
                    control={form.control}
                    name={'password'}
                    render={({ field }) => (
                      <TextField {...field} fullWidth label='비밀번호' type='password' disabled={!isEditable} size='small' />
                    )}
                  />
                </Stack>
                <Stack sx={{ flex: '1 0' }}>
                  <Controller
                    control={form.control}
                    name={'confirmPassword'}
                    render={({ field }) => (
                      <TextField {...field} fullWidth label='비밀번호 확인' type='password' disabled={!isEditable} size='small' />
                    )}
                  />
                </Stack>
              </Stack>

              <Stack direction='row' sx={{ gap: 2 }}>
                <Stack sx={{ flex: '1 0', gap: 1 }}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    회원명
                  </Typography>
                  <Typography variant='body1'>{detail.name}</Typography>
                </Stack>

                <Stack sx={{ flex: '1 0' }}>
                  <Controller
                    control={form.control}
                    name='phoneNumber'
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label='연락처'
                        disabled={!isEditable}
                        onChange={event => field.onChange(normalizePhoneNumber(event.target.value, field.value))}
                        size='small'
                      />
                    )}
                  />
                </Stack>
              </Stack>

              <Stack direction='row' sx={{ gap: 2 }}>
                <Stack sx={{ flex: '1 0', gap: 1 }}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    생년월일
                  </Typography>
                  <Typography variant='body1'>
                    {DateUtils.parseUtcAndFormatKst(detail.birthDate, DATEFORMAT_YYYY_MM_DD)} {detail.gender}
                  </Typography>
                </Stack>

                <Stack sx={{ flex: '1 0' }}>
                  <Controller
                    control={form.control}
                    name='email'
                    render={({ field }) => <TextField {...field} fullWidth label='E-mail' disabled={!isEditable} size='small' />}
                  />
                </Stack>
              </Stack>

              <Stack direction='row' sx={{ gap: 2 }}>
                <Stack sx={{ flex: '1 0', gap: 1 }}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    추천코드
                  </Typography>
                  <Typography variant='body1'>{detail.referralCode}</Typography>
                </Stack>

                <Stack sx={{ flex: '1 0', gap: 1 }}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    가입일
                  </Typography>
                  <Typography variant='body1'>{DateUtils.parseUtcAndFormatKst(detail.registrationDate, DATEFORMAT_YYYY_MM_DD)}</Typography>
                </Stack>
              </Stack>

              <Stack direction='row' sx={{ gap: 2 }}>
                <Stack sx={{ flex: '1 0', gap: 1 }}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    최종접속일
                  </Typography>
                  <Typography variant='body1'>{DateUtils.parseUtcAndFormatKst(detail.lastLoginDate, DATEFORMAT_YYYY_MM_DD)}</Typography>
                </Stack>

                <Stack sx={{ flex: '1 0' }}>
                  <FormControl fullWidth size='small' disabled={!isEditable}>
                    <InputLabel>계정상태</InputLabel>
                    <Controller
                      control={form.control}
                      name={'accountStatus'}
                      render={({ field }) => (
                        <Select {...field}>
                          {Object.keys(AccountStatus).map(accountStatus => (
                            <MenuItem key={accountStatus} value={accountStatus}>
                              {AccountStatusLabel[accountStatus]}
                            </MenuItem>
                          ))}
                        </Select>
                      )}
                    />
                  </FormControl>
                </Stack>
              </Stack>

              <Stack direction='row' spacing={2} alignItems='center'>
                <Typography variant='subtitle2' color='text.secondary'>
                  CSO 신고증
                </Typography>
                {detail.csoCertUrl !== null ? (
                  <Link
                    href={detail.csoCertUrl}
                    download
                    target='_blank'
                    rel='noopener noreferrer'
                    underline='hover'
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {MedipandaUrlFileName(detail.csoCertUrl)}
                  </Link>
                ) : (
                  <Button variant='outlined' color='primary' size='small' disabled={!isEditable} onClick={handleCsoUpload}>
                    업로드
                  </Button>
                )}
                {detail.csoCertUrl !== null && detail.partnerContractStatus === MemberType.NONE && (
                  <>
                    <Button variant='outlined' color='error' size='small' disabled={!isEditable} onClick={handleCsoReject}>
                      반려
                    </Button>
                    <Button variant='contained' size='small' disabled={!isEditable} onClick={handleCsoApprove}>
                      승인
                    </Button>
                  </>
                )}
              </Stack>
            </Card>
          </Stack>

          <Stack sx={{ flex: '1 0', gap: 3, overflow: 'hidden' }}>
            {contractDetail !== null && (
              <Card component={Stack} sx={{ p: 3, gap: 3 }}>
                <Stack direction='row' justifyContent='space-between' alignItems='center'>
                  <Typography variant='h6'>파트너사 계약</Typography>
                  {contractDetail.status !== PartnerContractStatus.APPROVED ? (
                    <Button variant='contained' size='small' disabled={!isEditable} onClick={handleContractApprove}>
                      계약 승인
                    </Button>
                  ) : (
                    <Button variant='contained' size='small' color='error' disabled={!isEditable} onClick={handleContractReject}>
                      계약 종료
                    </Button>
                  )}
                </Stack>

                <Stack direction='row' sx={{ gap: 2 }}>
                  <Stack sx={{ flex: '1 0' }}>
                    <FormControl fullWidth size='small' disabled={!isEditable}>
                      <InputLabel>유형</InputLabel>
                      <Controller
                        control={form.control}
                        name={'contractType'}
                        render={({ field }) => (
                          <Select {...field}>
                            {Object.keys(PartnerContractType).map(contractType => (
                              <MenuItem key={contractType} value={contractType}>
                                {PartnerContractTypeLabel[contractType]}
                              </MenuItem>
                            ))}
                          </Select>
                        )}
                      />
                    </FormControl>
                  </Stack>

                  <Stack sx={{ flex: '1 0', gap: 1 }}>
                    <Typography variant='subtitle2' color='text.secondary'>
                      계약상태
                    </Typography>
                    <Typography variant='body1'>{PartnerContractStatusLabel[contractDetail.status]}</Typography>
                  </Stack>
                </Stack>

                <Stack direction='row' sx={{ gap: 2 }}>
                  <Stack sx={{ flex: '1 0', gap: 1 }}>
                    <Typography variant='subtitle2' color='text.secondary'>
                      회사명
                    </Typography>
                    <Typography variant='body1'>{contractDetail.companyName}</Typography>
                  </Stack>

                  <Stack sx={{ flex: '1 0', gap: 1 }}>
                    <Typography variant='subtitle2' color='text.secondary'>
                      사업자등록번호
                    </Typography>
                    <Typography variant='body1'>{normalizeBusinessNumber(contractDetail.businessNumber)}</Typography>
                  </Stack>
                </Stack>

                <Controller
                  control={form.control}
                  name='bankName'
                  render={({ field }) => <TextField {...field} fullWidth label='정산은행' disabled={!isEditable} size='small' />}
                />

                <Controller
                  control={form.control}
                  name='accountNumber'
                  render={({ field }) => <TextField {...field} fullWidth label='계좌번호' disabled={!isEditable} size='small' />}
                />

                {contractDetail.fileUrls[PartnerContractFileType.CSO_CERTIFICATE] !== null && (
                  <Stack direction='row' spacing={2} alignItems='center'>
                    <Typography variant='subtitle2' color='text.secondary'>
                      {PartnerContractFileTypeLabel[PartnerContractFileType.CSO_CERTIFICATE]}
                    </Typography>
                    <Link
                      component={RouterLink}
                      to={contractDetail.fileUrls[PartnerContractFileType.CSO_CERTIFICATE]}
                      target='_blank'
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {MedipandaUrlFileName(contractDetail.fileUrls[PartnerContractFileType.CSO_CERTIFICATE])}
                    </Link>
                  </Stack>
                )}

                {contractDetail.fileUrls[PartnerContractFileType.SALES_EDUCATION_CERT] !== null && (
                  <Stack direction='row' spacing={2} alignItems='center'>
                    <Typography variant='subtitle2' color='text.secondary'>
                      {PartnerContractFileTypeLabel[PartnerContractFileType.SALES_EDUCATION_CERT]}
                    </Typography>
                    <Link
                      component={RouterLink}
                      to={contractDetail.fileUrls[PartnerContractFileType.SALES_EDUCATION_CERT]}
                      target='_blank'
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {MedipandaUrlFileName(contractDetail.fileUrls[PartnerContractFileType.SALES_EDUCATION_CERT])}
                    </Link>
                  </Stack>
                )}

                <Stack sx={{ flex: '1 0', gap: 1 }}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    계약일
                  </Typography>
                  <Typography variant='body1'>
                    {DateUtils.parseUtcAndFormatKst(contractDetail.contractDate, DATEFORMAT_YYYY_MM_DD)}
                  </Typography>
                </Stack>
              </Card>
            )}

            <Card component={Stack} sx={{ p: 3, gap: 3 }}>
              <Typography variant='h6'>비고</Typography>
              <Controller
                control={form.control}
                name={'note'}
                render={({ field }) => (
                  <TextField {...field} fullWidth multiline rows={4} disabled={!isEditable} placeholder='메모를 입력하세요' />
                )}
              />
            </Card>
          </Stack>
        </Stack>

        <Card component={Stack} sx={{ p: 3, gap: 3 }}>
          <Typography variant='h6'>마케팅 수신동의</Typography>
          <Stack spacing={1}>
            <FormControlLabel
              control={
                <Controller
                  control={form.control}
                  name={'marketingAgreementsSms'}
                  render={({ field }) => <Checkbox {...field} disabled={!isEditable} checked={field.value} />}
                />
              }
              label={
                'SMS' +
                (detail.marketingAgreements.sms && detail.marketingAgreements.smsAgreedAt !== null
                  ? ` (${DateUtils.parseUtcAndFormatKst(detail.marketingAgreements.smsAgreedAt, DATEFORMAT_YYYY_MM_DD_HH_MM)})`
                  : '')
              }
            />
            <FormControlLabel
              control={
                <Controller
                  control={form.control}
                  name={'marketingAgreementsEmail'}
                  render={({ field }) => <Checkbox {...field} disabled={!isEditable} checked={field.value} />}
                />
              }
              label={
                '이메일' +
                (detail.marketingAgreements.email && detail.marketingAgreements.emailAgreedAt !== null
                  ? ` (${DateUtils.parseUtcAndFormatKst(detail.marketingAgreements.emailAgreedAt, DATEFORMAT_YYYY_MM_DD_HH_MM)})`
                  : '')
              }
            />
            <FormControlLabel
              control={
                <Controller
                  control={form.control}
                  name={'marketingAgreementsPush'}
                  render={({ field }) => <Checkbox {...field} disabled={!isEditable} checked={field.value} />}
                />
              }
              label={
                `App Push` +
                (detail.marketingAgreements.push && detail.marketingAgreements.pushAgreedAt !== null
                  ? ` (${DateUtils.parseUtcAndFormatKst(detail.marketingAgreements.pushAgreedAt, DATEFORMAT_YYYY_MM_DD_HH_MM)})`
                  : '')
              }
            />
          </Stack>
        </Card>

        <Stack direction='row' spacing={2} justifyContent='center' sx={{ mt: 3 }}>
          <Button variant='outlined' size='large' component={RouterLink} to='/admin/members' sx={{ minWidth: 120 }}>
            {isEditable ? '취소' : '뒤로'}
          </Button>
          {isEditable && (
            <Button variant='contained' size='large' onClick={form.handleSubmit(submitHandler)} sx={{ minWidth: 120 }}>
              저장
            </Button>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
}

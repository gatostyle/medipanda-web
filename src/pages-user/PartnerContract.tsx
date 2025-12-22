import {
  applyContract,
  getContractDetails,
  MemberType,
  type PartnerContractDetailsResponse,
  PartnerContractStatus,
  PartnerContractType,
} from '@/backend';
import { MedipandaButton } from '@/custom/components/MedipandaButton';
import { MedipandaCheckbox } from '@/custom/components/MedipandaCheckbox';
import { MedipandaDialog, MedipandaDialogTitle } from '@/custom/components/MedipandaDialog';
import { MedipandaFileUploadButton } from '@/custom/components/MedipandaFileUploadButton';
import { MedipandaTab, MedipandaTabs } from '@/custom/components/MedipandaTab';
import { useSession } from '@/hooks/useSession';
import { DateUtils, DATEFORMAT_YYYY년_MM월_DD일 } from '@/lib/utils/dateFormat';
import { normalizeBusinessNumber } from '@/lib/utils/form';
import { colors, typography } from '@/themes';
import { Box, Button, FormControlLabel, Link, OutlinedInput, Stack, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { ArrowDown2 } from 'iconsax-reactjs';
import { useEffect, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { Link as RouterLink } from 'react-router-dom';
import type { RequiredDeep } from 'type-fest';

const PartnerContractFormRow = styled(Stack)({
  flexDirection: 'row',
  alignItems: 'center',
  gap: '20px',
  height: '50px',
});

const PartnerContractFormLabel = styled(Typography)({
  ...typography.largeTextM,
  color: colors.gray80,
  width: '100px',
});

const PartnerContractFormInput = styled(Stack)({
  width: '327px',
});

const PartnerContractOutlinedInput = styled(OutlinedInput)({
  ...typography.largeTextR,
  borderRadius: '5px',

  '&.Mui-disabled': {
    borderColor: colors.navy,
    backgroundColor: colors.gray10,

    '& .MuiOutlinedInput-input': {
      color: colors.navy,
      '-webkit-text-fill-color': colors.navy,
    },
  },

  '& .MuiOutlinedInput-input': {
    height: '50px',
    boxSizing: 'border-box',

    '&::placeholder': {
      color: colors.gray50,
      opacity: 1,
    },
  },
});

const PartnerContractFormButton = styled(Button)({
  ...typography.largeTextR,
  color: colors.gray50,
  borderRadius: '5px',

  height: '50px',
  borderColor: colors.gray40,

  '&.Mui-disabled': {
    borderColor: colors.navy,
    backgroundColor: colors.gray10,
    color: colors.navy,
  },
});

const PartnerContractFileLink = styled(Stack)({
  alignItems: 'center',

  height: '50px',
  paddingLeft: '15px',
  border: `1px solid ${colors.gray40}`,
  borderRadius: '5px',
  boxSizing: 'border-box',
});

function extractFileName(url: string) {
  const lastPath = new URL(url).pathname.split('/').pop();
  const uuidRemoved = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}_(.+)$/.exec(lastPath || '');
  return decodeURIComponent(uuidRemoved?.[1] ?? '');
}

export default function PartnerContract() {
  const { session } = useSession();
  const [contractDetails, setContractDetails] = useState<PartnerContractDetailsResponse | null>(null);

  const [bankSelectDialogOpen, setBankSelectDialogOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      contractType: '' as keyof typeof PartnerContractType,
      companyName: '',
      businessNumber: '',
      businessRegistration: null as File | null,
      bankName: '',
      accountNumber: '',
      csoCertificate: null as File | null,
      educationCertificate: null as File | null,
      agreement: false,
    },
  });
  const submitHandler: SubmitHandler<RequiredDeep<(typeof form)['control']['_defaultValues']>> = async values => {
    if (values.companyName.trim() === '') {
      alert('회사명을 입력해주세요.');
      return;
    }

    if (values.businessNumber.trim() === '') {
      alert('사업자등록번호를 입력해주세요.');
      return;
    }

    if (values.businessRegistration === null) {
      alert('사업자등록증을 첨부해주세요.');
      return;
    }

    if (values.bankName.trim() === '') {
      alert('정산은행을 선택해주세요.');
      return;
    }

    if (values.accountNumber.trim() === '') {
      alert('계좌번호를 입력해주세요.');
      return;
    }

    const isCsoApproved = session?.partnerContractStatus === MemberType.CSO;
    if (!isCsoApproved && values.csoCertificate === null) {
      alert('CSO 신고증을 첨부해주세요.');
      return;
    }

    if (values.educationCertificate === null) {
      alert('판매위수탁 교육이수증을 첨부해주세요.');
      return;
    }

    try {
      await applyContract({
        request: {
          contractType: values.contractType,
          companyName: values.companyName,
          businessNumber: values.businessNumber,
          bankName: values.bankName,
          accountNumber: values.accountNumber,
        },
        business_registration: values.businessRegistration,
        cso_certificate: isCsoApproved ? undefined : values.csoCertificate!,
        education_certificate: values.educationCertificate,
      });
      alert('파트너사 계약 신청이 완료되었습니다.');
      fetchContractDetails();
    } catch (e) {
      console.error(e);
      alert('파트너사 계약 신청 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  useEffect(() => {
    fetchContractDetails();
  }, [session]);

  const fetchContractDetails = async () => {
    try {
      const detail = await getContractDetails(session!.userId);
      if (detail.status === PartnerContractStatus.REJECTED || detail.status === PartnerContractStatus.CANCELLED) {
        return;
      }

      setContractDetails(detail);

      form.setValue('contractType', detail.contractType);
      form.setValue('companyName', detail.companyName);
      form.setValue('businessNumber', detail.businessNumber);
      form.setValue('businessRegistration', null);
      form.setValue('bankName', detail.bankName);
      form.setValue('accountNumber', detail.accountNumber);
      form.setValue('csoCertificate', null);
      form.setValue('educationCertificate', null);
      form.setValue('agreement', false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleBankSelect = (name: string) => {
    form.setValue('bankName', name);
    setBankSelectDialogOpen(false);
  };

  return (
    <>
      <Stack
        alignItems='center'
        component='form'
        onSubmit={form.handleSubmit(submitHandler)}
        sx={{
          padding: '60px 180px',
        }}
      >
        <Typography variant='headingPc3M' sx={{ color: colors.gray80 }}>
          {contractDetails !== null ? '파트너사 계약현황' : '파트너사 계약신청'}
        </Typography>
        {contractDetails === null && (
          <Typography variant='mediumTextR' sx={{ color: colors.gray80, marginTop: '20px' }}>
            혜택1. 의약품 제품 검색으로 수수료 비교 정보를 빠르게 확인하세요.
            <br />
            혜택2. AI 문자인식(OCR)으로 처방 통계를 자동으로 입력하세요.
            <br />
            혜택3. 딜러 관리 기능으로 정산 업무를 간소화하세요.
            <br />
            혜택4. 제휴 업체 할인으로 오프라인 혜택을 누리세요.
            <br />
          </Typography>
        )}

        <Stack gap={'20px'} sx={{ marginTop: '40px' }}>
          <PartnerContractFormRow>
            <PartnerContractFormLabel>계약유형</PartnerContractFormLabel>
            <Controller
              control={form.control}
              name={'contractType'}
              render={({ field }) => (
                <PartnerContractFormInput direction='row' gap='10px'>
                  {(contractDetails === null || contractDetails.contractType === PartnerContractType.ORGANIZATION) && (
                    <PartnerContractFormButton
                      fullWidth
                      variant='outlined'
                      onClick={() => field.onChange(PartnerContractType.ORGANIZATION)}
                      disabled={contractDetails !== null}
                      sx={{
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        borderColor: field.value === PartnerContractType.ORGANIZATION ? colors.vividViolet : colors.gray40,
                        color: field.value === PartnerContractType.ORGANIZATION ? colors.vividViolet : colors.gray50,
                      }}
                    >
                      법인
                    </PartnerContractFormButton>
                  )}
                  {(contractDetails === null || contractDetails.contractType === PartnerContractType.INDIVIDUAL) && (
                    <PartnerContractFormButton
                      fullWidth
                      variant='outlined'
                      onClick={() => field.onChange(PartnerContractType.INDIVIDUAL)}
                      disabled={contractDetails !== null}
                      sx={{
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        borderColor: field.value === PartnerContractType.INDIVIDUAL ? colors.vividViolet : colors.gray40,
                        color: field.value === PartnerContractType.INDIVIDUAL ? colors.vividViolet : colors.gray50,
                      }}
                    >
                      개인
                    </PartnerContractFormButton>
                  )}
                </PartnerContractFormInput>
              )}
            />
          </PartnerContractFormRow>

          <PartnerContractFormRow>
            <PartnerContractFormLabel>회사명</PartnerContractFormLabel>
            <PartnerContractFormInput>
              <Controller
                control={form.control}
                name={'companyName'}
                render={({ field }) => (
                  <PartnerContractOutlinedInput
                    {...field}
                    disabled={contractDetails !== null}
                    placeholder='회사명을 입력해주세요.'
                    sx={{ flex: 1 }}
                  />
                )}
              />
            </PartnerContractFormInput>
          </PartnerContractFormRow>

          <PartnerContractFormRow>
            <PartnerContractFormLabel>사업자등록번호</PartnerContractFormLabel>
            <PartnerContractFormInput>
              <Controller
                control={form.control}
                name={'businessNumber'}
                render={({ field }) => (
                  <PartnerContractOutlinedInput
                    {...field}
                    onChange={e => field.onChange(normalizeBusinessNumber(e.target.value, field.value))}
                    disabled={contractDetails !== null}
                    placeholder="'-'없이 입력해주세요."
                    sx={{ flex: 1 }}
                  />
                )}
              />
            </PartnerContractFormInput>
          </PartnerContractFormRow>

          <PartnerContractFormRow sx={{ height: 'auto', minHeight: '50px' }}>
            <PartnerContractFormLabel />
            {contractDetails === null ? (
              <Controller
                control={form.control}
                name={'businessRegistration'}
                render={({ field }) => (
                  <PartnerContractFormInput>
                    <MedipandaFileUploadButton onChange={files => field.onChange(files[0])} />
                    {field.value && <Typography sx={{ color: colors.gray80 }}>{field.value.name}</Typography>}
                  </PartnerContractFormInput>
                )}
              />
            ) : (
              <PartnerContractFormInput>
                <PartnerContractFileLink direction='row'>
                  <Link component={RouterLink} to={contractDetails.fileUrls.BUSINESS_REGISTRATION} target='_blank'>
                    {extractFileName(contractDetails.fileUrls.BUSINESS_REGISTRATION)}
                  </Link>
                </PartnerContractFileLink>
              </PartnerContractFormInput>
            )}
          </PartnerContractFormRow>

          <PartnerContractFormRow>
            <PartnerContractFormLabel>정산은행</PartnerContractFormLabel>
            <Controller
              control={form.control}
              name={'bankName'}
              render={({ field }) =>
                contractDetails === null ? (
                  <PartnerContractFormInput>
                    <PartnerContractFormButton variant='outlined' onClick={() => setBankSelectDialogOpen(true)}>
                      <Typography variant='largeTextR'>{field.value !== '' ? field.value : '은행을 선택해주세요'}</Typography>
                      <ArrowDown2 style={{ marginLeft: 'auto' }} />
                    </PartnerContractFormButton>
                  </PartnerContractFormInput>
                ) : (
                  <PartnerContractFormInput>
                    <Typography variant='largeTextR'>{field.value}</Typography>
                  </PartnerContractFormInput>
                )
              }
            />
          </PartnerContractFormRow>

          <PartnerContractFormRow>
            <PartnerContractFormLabel>계좌번호</PartnerContractFormLabel>
            <PartnerContractFormInput>
              <Controller
                control={form.control}
                name={'accountNumber'}
                render={({ field }) => (
                  <PartnerContractOutlinedInput
                    {...field}
                    disabled={contractDetails !== null}
                    placeholder="'-'없이 입력해주세요."
                    sx={{ flex: 1 }}
                  />
                )}
              />
            </PartnerContractFormInput>
          </PartnerContractFormRow>

          <PartnerContractFormRow sx={{ height: 'auto', minHeight: '50px' }}>
            <PartnerContractFormLabel>CSO 신고증</PartnerContractFormLabel>
            {session?.partnerContractStatus === MemberType.CSO ? (
              <PartnerContractFormInput>
                <Stack
                  direction='row'
                  sx={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '50px',
                    border: `1px solid ${colors.gray40}`,
                    borderRadius: '5px',
                    backgroundColor: colors.gray10,
                  }}
                >
                  <Typography variant='largeTextR' sx={{ color: colors.navy }}>
                    ✓ 승인 완료되었습니다.
                  </Typography>
                </Stack>
              </PartnerContractFormInput>
            ) : contractDetails !== null ? (
              <PartnerContractFormInput>
                <PartnerContractFileLink direction='row'>
                  <Link component={RouterLink} to={contractDetails.fileUrls.CSO_CERTIFICATE} target='_blank'>
                    {extractFileName(contractDetails.fileUrls.CSO_CERTIFICATE)}
                  </Link>
                </PartnerContractFileLink>
              </PartnerContractFormInput>
            ) : (
              <Controller
                control={form.control}
                name={'csoCertificate'}
                render={({ field }) => (
                  <PartnerContractFormInput>
                    <MedipandaFileUploadButton onChange={files => field.onChange(files[0])} />
                    {field.value && <Typography sx={{ color: colors.gray80 }}>{field.value.name}</Typography>}
                  </PartnerContractFormInput>
                )}
              />
            )}
          </PartnerContractFormRow>

          <PartnerContractFormRow sx={{ height: 'auto', minHeight: '50px' }}>
            <PartnerContractFormLabel>
              판매위수탁
              <br />
              교육이수증
            </PartnerContractFormLabel>
            {contractDetails === null ? (
              <Controller
                control={form.control}
                name={'educationCertificate'}
                render={({ field }) => (
                  <PartnerContractFormInput>
                    <MedipandaFileUploadButton onChange={files => field.onChange(files[0])} />
                    {field.value && <Typography sx={{ color: colors.gray80 }}>{field.value.name}</Typography>}
                  </PartnerContractFormInput>
                )}
              />
            ) : (
              <PartnerContractFormInput>
                <PartnerContractFileLink direction='row'>
                  <Link component={RouterLink} to={contractDetails.fileUrls.SALES_EDUCATION_CERT} target='_blank'>
                    {extractFileName(contractDetails.fileUrls.SALES_EDUCATION_CERT)}
                  </Link>
                </PartnerContractFileLink>
              </PartnerContractFormInput>
            )}
          </PartnerContractFormRow>

          {contractDetails !== null && (
            <PartnerContractFormRow>
              <PartnerContractFormLabel>계약일</PartnerContractFormLabel>
              <PartnerContractFormInput>
                <PartnerContractOutlinedInput
                  value={
                    contractDetails.status === PartnerContractStatus.PENDING
                      ? '계약서 검토중'
                      : DateUtils.parseUtcAndFormatKst(contractDetails.contractDate, DATEFORMAT_YYYY년_MM월_DD일)
                  }
                  disabled
                  placeholder="'-'없이 입력해주세요."
                  sx={{
                    flex: 1,
                    ...(contractDetails.status === PartnerContractStatus.PENDING && {
                      '& input': {
                        color: `${colors.red} !important`,
                        '-webkit-text-fill-color': `${colors.red} !important`,
                        textAlign: 'center',
                      },
                    }),
                  }}
                />
              </PartnerContractFormInput>
            </PartnerContractFormRow>
          )}

          {contractDetails === null ? (
            <Controller
              control={form.control}
              name={'agreement'}
              render={({ field }) => (
                <>
                  <Box sx={{ textAlign: 'center', mt: 4, marginBottom: 3 }}>
                    <FormControlLabel
                      control={<MedipandaCheckbox {...field} />}
                      label='파트너사 계약을 신청합니다.'
                      sx={{ color: colors.gray700 }}
                    />
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <MedipandaButton
                      type='submit'
                      disabled={!field.value}
                      variant='contained'
                      size='large'
                      sx={{
                        width: '327px',
                      }}
                    >
                      계약신청완료
                    </MedipandaButton>
                  </Box>
                </>
              )}
            />
          ) : (
            <img
              src='/assets/logos/logo-kmedicine.png'
              style={{
                alignSelf: 'center',
                width: '237px',
                height: '64px',
                marginTop: '20px',
              }}
            />
          )}
        </Stack>
      </Stack>

      <BankSelectModal open={bankSelectDialogOpen} onClose={() => setBankSelectDialogOpen(false)} onSelect={handleBankSelect} />
    </>
  );
}

const banks = [
  '카카오뱅크',
  '국민은행',
  '기업은행',
  '농협은행',
  '신한은행',
  'iM뱅크',
  '산업은행',
  '우리은행',
  '한국씨티은행',
  '하나은행',
  'SC제일은행',
  '경남은행',
  '광주은행',
  '도이치은행',
  '뱅크오브아메리카',
  '부산은행',
  '산림조합중앙회',
  '저축은행',
  '새마을금고',
  '수협은행',
  '신협중앙회',
  '우체국',
  '전북은행',
  '제주은행',
  '중국건설은행',
  '중국공상은행',
  '중국은행',
  'BNP파리바은행',
  'HSBC은행',
  'JP모간체이스은행',
  '케이뱅크',
  '토스뱅크',
];

const securities = [
  '교보증권',
  '대신증권',
  'DB증권',
  '메리츠증권',
  '미래에셋증권',
  '부국증권',
  '삼성증권',
  '신영증권',
  '신한투자증권',
  '에스케이증권',
  '현대차증권',
  '유안타증권',
  '유진투자증권',
  'LS증권',
  '케이프투자증권',
  '키움증권',
  '우리투자증권',
  '하나증권',
  'iM증권',
  '한국투자증권',
  '상상인증권',
  '한화투자증권',
  'KB증권',
  '다올투자증권',
  'BNK투자증권',
  'NH투자증권',
  '카카오페이증권',
  'IBK투자증권',
  '토스증권',
];

function BankSelectModal({ open, onClose, onSelect }: { open?: boolean; onClose?: () => void; onSelect?: (name: string) => void }) {
  const [tab, setTab] = useState(0);

  if (!open) {
    return null;
  }

  return (
    <MedipandaDialog open onClose={onClose} width='660px'>
      <MedipandaDialogTitle title='기관선택' onClose={onClose} />
      <Stack
        sx={{
          padding: '40px 30px',
        }}
      >
        <MedipandaTabs
          value={tab}
          sx={{
            marginBottom: '30px',
          }}
        >
          <MedipandaTab
            label='은행'
            onClick={() => setTab(0)}
            sx={{
              flex: 1,
              maxWidth: 'unset',
            }}
          />
          <MedipandaTab
            label='증권사'
            onClick={() => setTab(1)}
            sx={{
              flex: 1,
              maxWidth: 'unset',
            }}
          />
        </MedipandaTabs>

        <Stack
          direction='row'
          sx={{
            flexWrap: 'wrap',
            gap: '25px 0px',

            '& > div': {
              display: 'inline-block',
              width: '150px',
              height: '24px',
            },
          }}
        >
          {(tab === 0 ? banks : securities).map(name => (
            <Box key={name} onClick={() => onSelect?.(name)} sx={{ cursor: 'pointer' }}>
              <Stack direction='row' sx={{ alignItems: 'center' }}>
                <img src={`/assets/icons/financial/${name}.png`} style={{ width: '24px', height: '24px' }} />
                <Typography variant='mediumTextM' sx={{ color: colors.gray80, marginLeft: '8px' }}>
                  {name}
                </Typography>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Stack>
    </MedipandaDialog>
  );
}

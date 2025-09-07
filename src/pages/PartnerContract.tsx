import { applyContract, getContractDetails, type PartnerContractDetailsResponse } from '@/backend';
import { MedipandaButton } from '@/custom/components/MedipandaButton';
import { MedipandaCheckbox } from '@/custom/components/MedipandaCheckbox';
import { MedipandaFileUploadButton } from '@/custom/components/MedipandaFileUploadButton';
import { useSession } from '@/hooks/useSession';
import { colors, typography } from '@/themes';
import { Box, Button, FormControlLabel, Link, OutlinedInput, Stack, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useFormik } from 'formik';
import { ArrowDown2 } from 'iconsax-reactjs';
import { useEffect, useState } from 'react';
import { useSearchParams, Link as RouterLink } from 'react-router-dom';

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
    backgroundColor: colors.gray40,
    color: colors.navy,
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
    backgroundColor: colors.gray40,
    color: colors.navy,
  },
});

export default function PartnerContract() {
  const { session } = useSession();
  const [contractDetails, setContractDetails] = useState<PartnerContractDetailsResponse | null>(null);

  const formik = useFormik({
    initialValues: {
      contractType: '' as 'INDIVIDUAL' | 'ORGANIZATION',
      companyName: '',
      businessNumber: '',
      businessRegistration: null as File | null,
      bankName: '',
      accountNumber: '',
      csoCertificate: null as File | null,
      subcontractAgreement: null as File | null,
      educationCertificate: null as File | null,
      agreement: false,
    },
    onSubmit: async values => {
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

      if (values.csoCertificate === null) {
        alert('CSO 신고증을 첨부해주세요.');
        return;
      }

      if (values.subcontractAgreement === null) {
        alert('재위탁계약서를 첨부해주세요.');
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
          subcontract_agreement: values.csoCertificate,
          cso_certificate: values.subcontractAgreement,
          education_certificate: values.educationCertificate,
        });
      } catch (e) {
        console.error(e);
        alert('파트너사 계약 신청 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    },
  });

  useEffect(() => {
    fetchContractDetails();
  }, [session]);

  const fetchContractDetails = async () => {
    try {
      const detail = await getContractDetails(session!!.userId);
      setContractDetails(detail);

      formik.setValues({
        contractType: detail.contractType,
        companyName: detail.companyName,
        businessNumber: detail.businessNumber,
        businessRegistration: null,
        bankName: detail.bankName,
        accountNumber: detail.accountNumber,
        csoCertificate: null,
        subcontractAgreement: null,
        educationCertificate: null,
        agreement: false,
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <Stack
        alignItems='center'
        component='form'
        onSubmit={formik.handleSubmit}
        sx={{
          padding: '60px 180px',
        }}
      >
        <Typography variant='heading3M' sx={{ color: colors.gray80 }}>
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
            <PartnerContractFormInput direction='row' gap='10px'>
              {contractDetails?.contractType !== 'ORGANIZATION' && (
                <PartnerContractFormButton
                  fullWidth
                  variant='outlined'
                  onClick={() => formik.setFieldValue('contractType', 'ORGANIZATION')}
                  disabled={contractDetails !== null}
                  sx={{
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: formik.values.contractType === 'ORGANIZATION' ? colors.vividViolet : colors.gray40,
                    color: formik.values.contractType === 'ORGANIZATION' ? colors.vividViolet : colors.gray50,
                  }}
                >
                  법인
                </PartnerContractFormButton>
              )}
              {contractDetails?.contractType !== 'INDIVIDUAL' && (
                <PartnerContractFormButton
                  fullWidth
                  variant='outlined'
                  onClick={() => formik.setFieldValue('contractType', 'INDIVIDUAL')}
                  disabled={contractDetails !== null}
                  sx={{
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: formik.values.contractType === 'INDIVIDUAL' ? colors.vividViolet : colors.gray40,
                    color: formik.values.contractType === 'INDIVIDUAL' ? colors.vividViolet : colors.gray50,
                  }}
                >
                  개인
                </PartnerContractFormButton>
              )}
            </PartnerContractFormInput>
          </PartnerContractFormRow>

          <PartnerContractFormRow>
            <PartnerContractFormLabel>회사명</PartnerContractFormLabel>
            <PartnerContractFormInput>
              <PartnerContractOutlinedInput
                name='companyName'
                value={formik.values.companyName}
                onChange={formik.handleChange}
                disabled={contractDetails !== null}
                placeholder='회사명을 입력해주세요.'
                sx={{ flex: 1 }}
              />
            </PartnerContractFormInput>
          </PartnerContractFormRow>

          <PartnerContractFormRow>
            <PartnerContractFormLabel>사업자등록번호</PartnerContractFormLabel>
            <PartnerContractFormInput>
              <PartnerContractOutlinedInput
                name='businessNumber'
                value={formik.values.businessNumber}
                onChange={formik.handleChange}
                disabled={contractDetails !== null}
                placeholder="'-'없이 입력해주세요."
                sx={{ flex: 1 }}
              />
            </PartnerContractFormInput>
          </PartnerContractFormRow>

          <PartnerContractFormRow>
            <PartnerContractFormLabel />
            {contractDetails !== null ? (
              <PartnerContractFormInput>
                <Link component={RouterLink} to={contractDetails.fileUrls.BUSINESS_REGISTRATION} target='_blank'>
                  {new URL(contractDetails.fileUrls.BUSINESS_REGISTRATION).pathname.split('/').pop()}
                </Link>
              </PartnerContractFormInput>
            ) : (
              <PartnerContractFormInput>
                <MedipandaFileUploadButton
                  onChange={files => {
                    formik.setFieldValue('businessRegistration', files[0]);
                  }}
                />
                {formik.values.businessRegistration && (
                  <Typography sx={{ color: colors.gray80 }}>{formik.values.businessRegistration.name}</Typography>
                )}
              </PartnerContractFormInput>
            )}
          </PartnerContractFormRow>

          <PartnerContractFormRow>
            <PartnerContractFormLabel>정산은행</PartnerContractFormLabel>
            {contractDetails !== null ? (
              <PartnerContractFormInput>
                <Typography variant='largeTextR'>{formik.values.bankName}</Typography>
              </PartnerContractFormInput>
            ) : (
              <PartnerContractFormInput>
                <PartnerContractFormButton variant='outlined'>
                  <Typography variant='largeTextR'>
                    {formik.values.bankName !== '' ? formik.values.bankName : '은행을 선택해주세요'}
                  </Typography>
                  <ArrowDown2 style={{ marginLeft: 'auto' }} />
                </PartnerContractFormButton>
              </PartnerContractFormInput>
            )}
          </PartnerContractFormRow>

          <PartnerContractFormRow>
            <PartnerContractFormLabel>계좌번호</PartnerContractFormLabel>
            <PartnerContractFormInput>
              <PartnerContractOutlinedInput
                name='accountNumber'
                value={formik.values.accountNumber}
                onChange={formik.handleChange}
                disabled={contractDetails !== null}
                placeholder="'-'없이 입력해주세요."
                sx={{ flex: 1 }}
              />
            </PartnerContractFormInput>
          </PartnerContractFormRow>

          <PartnerContractFormRow>
            <PartnerContractFormLabel>CSO 신고증</PartnerContractFormLabel>
            {contractDetails !== null ? (
              <PartnerContractFormInput>
                <Link component={RouterLink} to={contractDetails.fileUrls.CSO_CERTIFICATE} target='_blank'>
                  {new URL(contractDetails.fileUrls.CSO_CERTIFICATE).pathname.split('/').pop()}
                </Link>
              </PartnerContractFormInput>
            ) : (
              <PartnerContractFormInput>
                <MedipandaFileUploadButton
                  onChange={files => {
                    formik.setFieldValue('csoCertificate', files[0]);
                  }}
                />
                {formik.values.csoCertificate && <Typography sx={{ color: colors.gray80 }}>{formik.values.csoCertificate.name}</Typography>}
              </PartnerContractFormInput>
            )}
          </PartnerContractFormRow>

          <PartnerContractFormRow>
            <PartnerContractFormLabel>재위탁계약서</PartnerContractFormLabel>
            {contractDetails !== null ? (
              <PartnerContractFormInput>
                <Link component={RouterLink} to={contractDetails.fileUrls.SUBCONTRACT_AGREEMENT} target='_blank'>
                  {new URL(contractDetails.fileUrls.SUBCONTRACT_AGREEMENT).pathname.split('/').pop()}
                </Link>
              </PartnerContractFormInput>
            ) : (
              <PartnerContractFormInput>
                <MedipandaFileUploadButton
                  onChange={files => {
                    formik.setFieldValue('subcontractAgreement', files[0]);
                  }}
                />
                {formik.values.subcontractAgreement && (
                  <Typography sx={{ color: colors.gray80 }}>{formik.values.subcontractAgreement.name}</Typography>
                )}
              </PartnerContractFormInput>
            )}
          </PartnerContractFormRow>

          <PartnerContractFormRow>
            <PartnerContractFormLabel>
              판매위수탁
              <br />
              교육이수증
            </PartnerContractFormLabel>
            {contractDetails !== null ? (
              <PartnerContractFormInput>
                <Link component={RouterLink} to={contractDetails.fileUrls.SALES_EDUCATION_CERT} target='_blank'>
                  {new URL(contractDetails.fileUrls.SALES_EDUCATION_CERT).pathname.split('/').pop()}
                </Link>
              </PartnerContractFormInput>
            ) : (
              <PartnerContractFormInput>
                <MedipandaFileUploadButton
                  onChange={files => {
                    formik.setFieldValue('educationCertificate', files[0]);
                  }}
                />
                {formik.values.educationCertificate && (
                  <Typography sx={{ color: colors.gray80 }}>{formik.values.educationCertificate.name}</Typography>
                )}
              </PartnerContractFormInput>
            )}
          </PartnerContractFormRow>

          {contractDetails === null && (
            <Box sx={{ textAlign: 'center', mt: 4, marginBottom: 3 }}>
              <FormControlLabel
                control={<MedipandaCheckbox name='agreement' checked={formik.values.agreement} onChange={formik.handleChange} />}
                label='파트너사 계약을 신청합니다.'
                sx={{ color: colors.gray700 }}
              />
            </Box>
          )}

          {contractDetails === null && (
            <Box sx={{ textAlign: 'center' }}>
              <MedipandaButton
                type='submit'
                disabled={!formik.values.agreement}
                variant='contained'
                size='large'
                sx={{
                  width: '327px',
                }}
              >
                계약신청완료
              </MedipandaButton>
            </Box>
          )}
        </Stack>
      </Stack>
    </>
  );
}

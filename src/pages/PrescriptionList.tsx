import {
  DateTimeString,
  type DealerResponse,
  type DrugCompanyResponse,
  type FileValidationErrorDto,
  type PartnerResponse,
  searchPrescriptions,
  uploadEdiZip,
  uploadPartnerEdiFiles,
} from '@/backend';
import { DealerSelectDialog } from '@/custom/components/DealerSelectDialog';
import { DrugCompanySelectDialog } from '@/custom/components/DrugCompanySelectDialog';
import { MedipandaButton } from '@/custom/components/MedipandaButton';
import { MedipandaDatePicker } from '@/custom/components/MedipandaDatePicker';
import { MedipandaFileUploadButton } from '@/custom/components/MedipandaFileUploadButton';
import { MedipandaOutlinedInput } from '@/custom/components/MedipandaOutlinedInput';
import { MedipandaPagination } from '@/custom/components/MedipandaPagination';
import { MedipandaTable } from '@/custom/components/MedipandaTable';
import { PartnerSelectDialog } from '@/custom/components/PartnerSelectDialog';
import { usePageFetchFormik } from '@/lib/components/usePageFetchFormik';
import { colors } from '@/themes';
import { DATEFORMAT_YYYY_MM, formatYyyyMm, formatYyyyMmDd, formatYyyy년Mm월 } from '@/lib/utils/dateFormat';
import { Search } from '@mui/icons-material';
import { Dialog, DialogTitle, FormControl, InputAdornment, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useFormik } from 'formik';
import { useState } from 'react';
import * as Yup from 'yup';

export default function PrescriptionList() {
  const [individualUpload, setIndividualUpload] = useState(true);

  const {
    content: page,
    pageCount: totalPages,
    formik: pageFormik,
  } = usePageFetchFormik({
    initialFormValues: {
      searchType: 'companyName' as 'companyName' | 'dealerName',
      searchKeyword: '',
    },
    fetcher: async values => {
      return searchPrescriptions({
        companyName: values.searchType === 'companyName' ? values.searchKeyword : undefined,
        dealerName: values.searchType === 'dealerName' ? values.searchKeyword : undefined,
        page: values.pageIndex,
        size: values.pageSize,
      });
    },
    contentSelector: response => response.content,
    pageCountSelector: response => response.totalPages,
    initialContent: [],
  });

  const table = useReactTable({
    data: page,
    columns: [
      {
        header: '구분',
        cell: ({ row }) => row.original.type,
      },
      {
        header: '딜러명',
        cell: ({ row }) => row.original.dealerName,
      },
      {
        header: '거래처명',
        cell: ({ row }) => row.original.companyName,
      },
      {
        header: '처방월',
        cell: ({ row }) => formatYyyyMmDd(row.original.prescriptionMonth),
      },
      {
        header: '등록처리',
        cell: ({ row }) => row.original.status,
      },
    ],
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <Typography variant='heading4B' sx={{ alignSelf: 'center', color: colors.gray80 }}>
        {formatYyyy년Mm월(new Date())}
      </Typography>
      <Stack
        direction='row'
        alignItems='center'
        gap='10px'
        component='form'
        onSubmit={pageFormik.handleSubmit}
        sx={{
          alignSelf: 'center',
          marginTop: '40px',
        }}
      >
        <FormControl sx={{ width: '320px' }}>
          <Select value={pageFormik.values.searchType} onChange={pageFormik.handleChange}>
            <MenuItem value='companyName'>거래처명</MenuItem>
            <MenuItem value='dealerName'>딜러명</MenuItem>
          </Select>
        </FormControl>
        <TextField
          name='searchKeyword'
          value={pageFormik.values.searchKeyword}
          onChange={pageFormik.handleChange}
          placeholder='거래처명을 검색하세요.'
          sx={{
            width: '478px',
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position='end'>
                <Search />
              </InputAdornment>
            ),
          }}
        />
        <button type='submit' hidden />
      </Stack>
      <Stack direction='row' alignItems='center' gap='10px' sx={{ marginTop: '40px' }}>
        <MedipandaButton
          variant={individualUpload ? 'contained' : 'outlined'}
          rounded
          onClick={() => setIndividualUpload(true)}
          sx={{
            width: '140px',
            marginLeft: 'auto',
          }}
        >
          거래처별 업로드
        </MedipandaButton>
        <MedipandaButton
          variant={!individualUpload ? 'contained' : 'outlined'}
          rounded
          onClick={() => setIndividualUpload(false)}
          sx={{
            width: '140px',
          }}
        >
          한번에 업로드
        </MedipandaButton>
      </Stack>
      <Stack direction='row' alignItems='flex-start' gap='24px' sx={{ marginTop: '10px' }}>
        <Stack sx={{ width: '600px' }}>
          <MedipandaTable table={table} />
          <MedipandaPagination
            count={totalPages}
            page={pageFormik.values.pageIndex + 1}
            showFirstButton
            showLastButton
            onChange={(_, page) => {
              pageFormik.setFieldValue('pageIndex', page - 1);
            }}
            sx={{
              alignSelf: 'center',
              marginTop: '40px',
            }}
          />
        </Stack>
        <Stack
          gap='10px'
          sx={{
            width: '600px',
            padding: '40px 75px',
            border: `1px solid ${colors.gray30}`,
            boxSizing: 'border-box',
          }}
        >
          {individualUpload ? <EdiIndividualUploadForm /> : <EdiBatchUploadForm />}
        </Stack>
      </Stack>
    </>
  );
}

function EdiIndividualUploadForm() {
  const [dealerSelectDialogOpen, setDealerSelectDialogOpen] = useState(false);
  const [partnerSelectDialogOpen, setPartnerSelectDialogOpen] = useState(false);
  const [drugCompanySearchDialogOpen, setDrugCompanySearchDialogOpen] = useState(false);

  const formik = useFormik({
    initialValues: {
      dealer: null as DealerResponse | null,
      prescriptionMonth: null as Date | null,
      partner: null as PartnerResponse | null,
      drugCompanies: [] as DrugCompanyResponse[],
      files: [] as File[],
    },
    validationSchema: Yup.object().shape({
      dealer: Yup.object().required('딜러를 선택해 주세요.'),
      prescriptionMonth: Yup.date().required('처방월을 선택해 주세요.'),
      partner: Yup.object().required('거래처를 선택해 주세요.'),
      drugCompanies: Yup.array().min(1, '거래제약사를 선택해 주세요.'),
      files: Yup.array().min(1, 'EDI 파일을 선택해 주세요.'),
    }),
    onSubmit: async values => {
      try {
        await uploadPartnerEdiFiles({
          request: {
            settlementMonth: new DateTimeString(new Date()),
            dealerId: values.dealer!.id,
            prescriptionMonth: new DateTimeString(values.prescriptionMonth!),
            partnerId: values.partner!.id,
            drugCompanyId: values.drugCompanies.map(drugCompany => drugCompany.id)[0],
          },
          files: values.files,
        });
        alert('EDI 파일이 성공적으로 업로드되었습니다.');
        formik.resetForm();
      } catch (error) {
        console.error('Error uploading EDI files:', error);
        alert('EDI 파일 업로드 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    },
  });

  return (
    <>
      <Stack alignItems='center'>
        <Typography variant='heading2B' sx={{ color: colors.gray80 }}>
          실적(EDI) 입력
        </Typography>
      </Stack>
      <Stack direction='row' alignItems='center' sx={{ marginTop: '20px' }}>
        <Typography variant='largeTextM' sx={{ color: colors.gray80, width: '120px' }}>
          딜러명
        </Typography>
        <Stack direction='row' alignItems='center' gap='10px' sx={{ width: '330px' }}>
          <MedipandaOutlinedInput
            value={formik.values.dealer?.dealerName ?? ''}
            disabled
            sx={{
              height: '50px',
              backgroundColor: colors.gray10,
            }}
          />
          <MedipandaButton onClick={() => setDealerSelectDialogOpen(true)} variant='contained' size='large' color='secondary'>
            딜러 선택
          </MedipandaButton>
        </Stack>
      </Stack>
      <Stack direction='row' alignItems='center' sx={{ height: '40px' }}>
        <Typography variant='largeTextM' sx={{ color: colors.gray80, width: '120px' }}>
          정산월
        </Typography>
        <Typography variant='largeTextM' sx={{ color: colors.gray80, width: '330px' }}>
          {formatYyyyMm(new Date())}
        </Typography>
      </Stack>
      <Stack direction='row' alignItems='center'>
        <Typography variant='largeTextM' sx={{ color: colors.gray80, width: '120px' }}>
          처방월
        </Typography>
        <MedipandaDatePicker
          value={formik.values.prescriptionMonth}
          onChange={date => formik.setFieldValue('prescriptionMonth', date)}
          label='처방월'
          format={DATEFORMAT_YYYY_MM}
          views={['year', 'month']}
          sx={{
            width: '330px',
            backgroundColor: colors.gray10,
          }}
        />
      </Stack>
      <Stack direction='row' alignItems='center'>
        <Typography variant='largeTextM' sx={{ color: colors.gray80, width: '120px' }}>
          거래처명
        </Typography>
        <Stack direction='row' alignItems='center' gap='10px' sx={{ width: '330px' }}>
          <MedipandaOutlinedInput
            value={formik.values.partner?.institutionName ?? ''}
            disabled
            sx={{
              height: '50px',
              backgroundColor: colors.gray10,
            }}
          />
          <MedipandaButton onClick={() => setPartnerSelectDialogOpen(true)} variant='contained' size='large' color='secondary'>
            거래처 선택
          </MedipandaButton>
        </Stack>
      </Stack>
      {(formik.values.drugCompanies as (DrugCompanyResponse | null)[]).concat(null).map((drugCompany, index) => (
        <Stack key={drugCompany?.id ?? ''} direction='row' alignItems='center'>
          <Typography variant='largeTextM' sx={{ color: colors.gray80, width: '120px' }}>
            {index === 0 ? '거래제약사' : ''}
          </Typography>
          <Stack direction='row' alignItems='center' gap='10px' sx={{ width: '330px' }}>
            <MedipandaOutlinedInput
              value={drugCompany !== null ? drugCompany.name : ''}
              disabled
              sx={{
                flexGrow: 1,
                height: '50px',
                backgroundColor: colors.gray10,
              }}
            />
            {drugCompany === null && (
              <MedipandaButton onClick={() => setDrugCompanySearchDialogOpen(true)} variant='contained' size='large' color='secondary'>
                거래제약사 추가
              </MedipandaButton>
            )}
          </Stack>
        </Stack>
      ))}
      {(formik.values.files as (File | null)[]).concat([null]).map((file, index) => (
        <Stack key={file?.webkitRelativePath ?? ''} direction='row' alignItems='center'>
          <Typography variant='largeTextM' sx={{ color: colors.gray80, width: '120px' }}>
            {index === 0 ? '파일업로드' : ''}
          </Typography>
          {file !== null ? (
            <MedipandaOutlinedInput
              value={file.name}
              disabled
              sx={{
                flexGrow: 1,
                height: '50px',
                backgroundColor: colors.gray10,
              }}
            />
          ) : (
            <MedipandaFileUploadButton
              onChange={files => {
                formik.setFieldValue('files', [...formik.values.files, ...files]);
              }}
              sx={{ width: '330px' }}
            />
          )}
        </Stack>
      ))}
      <Typography variant='smallTextR' sx={{ color: 'red', whiteSpace: 'pre-wrap' }}>
        파일 업로드시 주의사항
        <br />
        1. png, jpg, jpeg, png, pdf파일만 업로드 가능해요.
        <br />
        2. 파일은 최대 5개까지 가능하니, 5개가 초과할 경우에는 &apos한번에 업로드&apos; 기능을 이용해주세요.
        <br />
        3. 파일명의 처방월이 선택한 처방월과 일치하게 해주세요.
      </Typography>
      {Object.keys(formik.errors).map(key => {
        return (
          <Typography key={key} variant='smallTextR' sx={{ color: 'red' }}>
            {formik.errors[key] as string}
          </Typography>
        );
      })}
      <Stack
        direction='row'
        justifyContent='center'
        gap='10px'
        sx={{
          marginTop: '10px',
        }}
      >
        <MedipandaButton
          onClick={() => formik.resetForm()}
          disabled={formik.isSubmitting}
          variant='outlined'
          size='large'
          color='secondary'
          sx={{
            width: '160px',
          }}
        >
          취소
        </MedipandaButton>
        <MedipandaButton
          onClick={() => formik.submitForm()}
          disabled={formik.isSubmitting}
          variant='contained'
          size='large'
          color='secondary'
          sx={{
            width: '160px',
          }}
        >
          등록
        </MedipandaButton>
      </Stack>
      <DealerSelectDialog
        open={dealerSelectDialogOpen}
        onClose={() => setDealerSelectDialogOpen(false)}
        onSelect={dealer => {
          formik.setFieldValue('dealer', dealer);
          setDealerSelectDialogOpen(false);
        }}
      />
      <PartnerSelectDialog
        open={partnerSelectDialogOpen}
        onClose={() => setPartnerSelectDialogOpen(false)}
        onSelect={partner => {
          formik.setFieldValue('partner', partner);
          setPartnerSelectDialogOpen(false);
        }}
      />
      <DrugCompanySelectDialog
        open={drugCompanySearchDialogOpen}
        onClose={() => setDrugCompanySearchDialogOpen(false)}
        onSelect={drugCompany => {
          formik.setFieldValue('drugCompanies', [...formik.values.drugCompanies, drugCompany]);
          setDrugCompanySearchDialogOpen(false);
        }}
        excludedIds={formik.values.drugCompanies.map(company => company.id)}
      />
    </>
  );
}

function EdiBatchUploadForm() {
  const [uploadErrors, setUploadErrors] = useState<FileValidationErrorDto[]>([]);

  const formik = useFormik({
    initialValues: {
      settlementMonth: null as Date | null,
      prescriptionMonth: null as Date | null,
      file: null as File | null,
    },
    validationSchema: Yup.object().shape({
      settlementMonth: Yup.date().required('정산월을 선택해 주세요.'),
      prescriptionMonth: Yup.date().required('처방월을 선택해 주세요.'),
      file: Yup.mixed().required('EDI 파일을 선택해 주세요.'),
    }),
    onSubmit: async values => {
      try {
        const result = await uploadEdiZip({
          settlementMonth: formatYyyyMmDd(values.prescriptionMonth!),
          prescriptionMonth: formatYyyyMmDd(values.prescriptionMonth!),
          file: values.file!,
        });

        if (result.success) {
          alert('EDI 파일이 성공적으로 업로드되었습니다.');
          formik.resetForm();
        } else {
          setUploadErrors(result.errors);
        }
      } catch (error) {
        console.error('Error uploading EDI zip file:', error);
        alert('EDI 파일 업로드 중 오류가 발생했습니다. 다시 시도해 주세요.');
      }
    },
  });

  return (
    <>
      <Stack alignItems='center'>
        <Typography variant='heading2B' sx={{ color: colors.gray80 }}>
          실적(EDI) 입력
        </Typography>
      </Stack>
      <Stack direction='row' alignItems='center' sx={{ marginTop: '20px' }}>
        <Typography variant='largeTextM' sx={{ color: colors.gray80, width: '120px' }}>
          정산월
        </Typography>
        <MedipandaDatePicker
          value={formik.values.settlementMonth}
          onChange={date => formik.setFieldValue('settlementMonth', date)}
          label='정산월'
          format={DATEFORMAT_YYYY_MM}
          views={['year', 'month']}
          sx={{
            width: '330px',
            backgroundColor: colors.gray10,
          }}
        />
      </Stack>
      <Stack direction='row' alignItems='center'>
        <Typography variant='largeTextM' sx={{ color: colors.gray80, width: '120px' }}>
          처방월
        </Typography>
        <MedipandaDatePicker
          value={formik.values.prescriptionMonth}
          onChange={date => formik.setFieldValue('prescriptionMonth', date)}
          label='처방월'
          format={DATEFORMAT_YYYY_MM}
          views={['year', 'month']}
          sx={{
            width: '330px',
            backgroundColor: colors.gray10,
          }}
        />
      </Stack>
      <Stack direction='row' alignItems='center'>
        <Typography variant='largeTextM' sx={{ color: colors.gray80, width: '120px' }}>
          파일업로드
        </Typography>
        {formik.values.file !== null ? (
          <MedipandaOutlinedInput
            value={formik.values.file.name}
            disabled
            sx={{
              flexGrow: 1,
              height: '50px',
              backgroundColor: colors.gray10,
            }}
          />
        ) : (
          <MedipandaFileUploadButton onChange={files => formik.setFieldValue('file', files[0] ?? null)} sx={{ width: '330px' }} />
        )}
      </Stack>
      <Typography variant='smallTextR' sx={{ color: 'red', whiteSpace: 'pre-wrap' }}>
        파일 업로드시 주의사항
        <br />
        1. 한번에 업로드시 zip파일로 업로드 해주세요
        <br />
        2. zip 파일 내 각 파일명: 딜러명_거래처명_처방월 (ex. 홍길동_메디판다_202504)으로 저장해주세요
        <br />
        3. png, jpg, jpeg, png, pdf파일만 업로드 가능해요
        <br />
        4. 파일명내에 처방월이 선택한 처방월과 일치하게 해주세요
        <br />
      </Typography>
      {Object.keys(formik.errors).map(key => {
        return (
          <Typography key={key} variant='smallTextR' sx={{ color: 'red' }}>
            {formik.errors[key] as string}
          </Typography>
        );
      })}
      <Stack
        direction='row'
        justifyContent='center'
        gap='10px'
        sx={{
          marginTop: '10px',
        }}
      >
        <MedipandaButton
          onClick={() => formik.resetForm()}
          disabled={formik.isSubmitting}
          variant='outlined'
          size='large'
          color='secondary'
          sx={{
            width: '160px',
          }}
        >
          취소
        </MedipandaButton>
        <MedipandaButton
          onClick={() => formik.submitForm()}
          disabled={formik.isSubmitting}
          variant='contained'
          size='large'
          color='secondary'
          sx={{
            width: '160px',
          }}
        >
          등록
        </MedipandaButton>
      </Stack>

      <EdiBatchUploadErrorDialog open={uploadErrors.length > 0} onClose={() => setUploadErrors([])} errors={uploadErrors} />
    </>
  );
}

function EdiBatchUploadErrorDialog({ open, onClose, errors }: { open?: boolean; onClose?: () => void; errors: FileValidationErrorDto[] }) {
  return (
    <Dialog
      open={open ?? false}
      onClose={onClose}
      sx={{
        '& .MuiDialog-paper': {
          width: '600px',
          borderRadius: '20px',
        },
      }}
    >
      <DialogTitle
        sx={{
          padding: '40px 30px',
          backgroundColor: colors.gray20,
        }}
      >
        <Typography variant='heading2R' sx={{ color: colors.gray80 }}>
          업로드한 파일중에 <span style={{ color: colors.red }}>{errors.length}</span>개의 잘못된 파일이 있습니다.
          <br />
          확인 후 업로드 부탁드립니다.
        </Typography>
        <Stack sx={{ marginTop: '20px' }}>
          {errors.map(error => (
            <Typography key={error.message} variant='largeTextR' sx={{ color: colors.red }}>
              {error.message}
            </Typography>
          ))}
        </Stack>
      </DialogTitle>
      <Stack
        sx={{
          padding: '40px 30px',
        }}
      >
        <Typography variant='heading1.7B' sx={{ color: colors.gray80 }}>
          파일명
        </Typography>
        <Stack sx={{ marginTop: '20px' }}>
          {errors.map(error => (
            <Typography
              key={error.error}
              variant='heading2R'
              sx={{
                color: colors.red,
              }}
            >
              {error.fileName}
            </Typography>
          ))}
          <MedipandaButton variant='contained' size='large' color='secondary' sx={{ marginTop: '40px' }} onClick={onClose}>
            닫기
          </MedipandaButton>
        </Stack>
      </Stack>
    </Dialog>
  );
}

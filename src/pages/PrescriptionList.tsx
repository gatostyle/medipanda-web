import {
  DateTimeString,
  type DealerResponse,
  type DrugCompanyResponse,
  type FileValidationErrorDto,
  type PartnerResponse,
  type PrescriptionResponse,
  PrescriptionStatusLabel,
  PrescriptionTypeLabel,
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
import { useSession } from '@/hooks/useSession';
import { useSearchParamsOrDefault } from '@/lib/hooks/useSearchParamsOrDefault';
import { setUrlParams } from '@/lib/utils/url';
import { colors } from '@/themes';
import { DATEFORMAT_YYYY_MM, DATEFORMAT_YYYY년_MM월 } from '@/lib/utils/dateFormat';
import { Search } from '@mui/icons-material';
import {
  Dialog,
  DialogTitle,
  FormControl,
  IconButton,
  InputAdornment,
  MenuItem,
  PaginationItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import type { RequiredDeep } from 'type-fest';

export default function PrescriptionList() {
  const navigate = useNavigate();

  const [contents, setContents] = useState<PrescriptionResponse[]>([]);
  const [totalPages, setTotalPages] = useState(0);

  const initialSearchParams = {
    searchType: 'companyName' as 'companyName' | 'userId' | 'dealerName' | 'drugCompanyName',
    searchKeyword: '',
    page: '1',
  };

  const { searchType, searchKeyword, page: paramPage } = useSearchParamsOrDefault(initialSearchParams);
  const page = Number(paramPage);
  const pageSize = 10;

  const form = useForm({
    defaultValues: {
      ...initialSearchParams,
    },
  });

  const submitHandler: SubmitHandler<RequiredDeep<(typeof form)['control']['_defaultValues']>> = async values => {
    const url = setUrlParams(
      {
        ...values,
        page: 1,
      },
      initialSearchParams,
    );

    navigate(url);
  };

  const fetchContents = async () => {
    try {
      const response = await searchPrescriptions({
        [searchType]: searchKeyword,
        page: page - 1,
        size: pageSize,
      });

      setContents(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch prescription list:', error);
      alert('처방내역 목록을 불러오는 중 오류가 발생했습니다.');
      setContents([]);
      setTotalPages(0);
    }
  };

  useEffect(() => {
    form.setValue('searchType', searchType);
    form.setValue('searchKeyword', searchKeyword);
    fetchContents();
  }, [searchType, searchKeyword, page]);

  const [individualUpload, setIndividualUpload] = useState(true);

  const table = useReactTable({
    data: contents,
    columns: [
      {
        header: '구분',
        cell: ({ row }) => PrescriptionTypeLabel[row.original.type],
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
        cell: ({ row }) => format(row.original.prescriptionMonth, DATEFORMAT_YYYY_MM),
      },
      {
        header: '등록처리',
        cell: ({ row }) => PrescriptionStatusLabel[row.original.status],
      },
    ],
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <Typography variant='heading1.7B' sx={{ alignSelf: 'center', color: colors.gray80 }}>
        {format(new Date(), DATEFORMAT_YYYY년_MM월)}
      </Typography>
      <Stack
        direction='row'
        alignItems='center'
        gap='10px'
        component='form'
        onSubmit={form.handleSubmit(submitHandler)}
        sx={{
          alignSelf: 'center',
          marginTop: '40px',
        }}
      >
        <FormControl sx={{ width: '320px' }}>
          <Controller
            control={form.control}
            name={'searchType'}
            render={({ field }) => (
              <Select {...field}>
                <MenuItem value='companyName'>거래처명</MenuItem>
                <MenuItem value='dealerName'>딜러명</MenuItem>
              </Select>
            )}
          />
        </FormControl>
        <Controller
          control={form.control}
          name='searchKeyword'
          render={({ field }) => (
            <TextField
              {...field}
              placeholder='거래처명을 검색하세요.'
              sx={{
                width: '478px',
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton edge='end' type='submit'>
                      <Search />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          )}
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
      </Stack>
      <Stack direction='row' alignItems='flex-start' gap='24px' sx={{ marginTop: '10px' }}>
        <Stack sx={{ width: '600px' }}>
          <MedipandaTable table={table} />
          <MedipandaPagination
            count={totalPages}
            page={page}
            showFirstButton
            showLastButton
            renderItem={item => (
              <PaginationItem {...item} component={RouterLink} to={setUrlParams({ page: item.page }, initialSearchParams)} />
            )}
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
  const AVAILABLE_FILE_EXTENSIONS = ['png', 'jpg', 'jpeg'];

  const [dealerSelectDialogOpen, setDealerSelectDialogOpen] = useState(false);
  const [partnerSelectDialogOpen, setPartnerSelectDialogOpen] = useState(false);
  const [drugCompanySearchDialogOpen, setDrugCompanySearchDialogOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      dealer: null as DealerResponse | null,
      prescriptionMonth: null as Date | null,
      partner: null as PartnerResponse | null,
      drugCompanies: [] as DrugCompanyResponse[],
      files: [] as File[],
    },
  });

  const submitHandler: SubmitHandler<RequiredDeep<(typeof form)['control']['_defaultValues']>> = async values => {
    if (values.dealer == null) {
      alert('딜러를 선택해 주세요.');
      return;
    }

    if (values.prescriptionMonth == null) {
      alert('처방월을 선택해 주세요.');
      return;
    }

    if (values.partner == null) {
      alert('거래처를 선택해 주세요.');
      return;
    }

    if (values.drugCompanies.length === 0) {
      alert('거래제약사를 선택해 주세요.');
      return;
    }

    if (values.files.length === 0) {
      alert('EDI 파일을 선택해 주세요.');
      return;
    }

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
      form.reset();
    } catch (error) {
      console.error('Error uploading EDI files:', error);
      alert('EDI 파일 업로드 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const handleFileUpload = (files: File[]) => {
    if (files && files.length > 0) {
      const validFiles = files.filter(file =>
        AVAILABLE_FILE_EXTENSIONS.map(ext => `.${ext}`).some(extension => file.name.toLowerCase().endsWith(extension)),
      );

      if (validFiles.length !== files.length) {
        alert(`${AVAILABLE_FILE_EXTENSIONS.join(', ')} 파일만 업로드 가능합니다.`);
      }

      form.setValue('files', [...(form.getValues('files') ?? []), ...validFiles]);
    }
  };

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
          <Controller
            control={form.control}
            name={'dealer'}
            render={({ field }) => (
              <MedipandaOutlinedInput
                value={field.value?.dealerName ?? ''}
                disabled
                sx={{
                  height: '50px',
                  backgroundColor: colors.gray10,
                }}
              />
            )}
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
          {format(new Date(), DATEFORMAT_YYYY_MM)}
        </Typography>
      </Stack>
      <Stack direction='row' alignItems='center'>
        <Typography variant='largeTextM' sx={{ color: colors.gray80, width: '120px' }}>
          처방월
        </Typography>
        <Controller
          control={form.control}
          name={'prescriptionMonth'}
          render={({ field }) => (
            <MedipandaDatePicker
              {...field}
              label='처방월'
              format={DATEFORMAT_YYYY_MM}
              views={['year', 'month']}
              sx={{
                width: '330px',
                backgroundColor: colors.gray10,
              }}
            />
          )}
        />
      </Stack>
      <Stack direction='row' alignItems='center'>
        <Typography variant='largeTextM' sx={{ color: colors.gray80, width: '120px' }}>
          거래처명
        </Typography>
        <Stack direction='row' alignItems='center' gap='10px' sx={{ width: '330px' }}>
          <Controller
            control={form.control}
            name={'partner'}
            render={({ field }) => (
              <MedipandaOutlinedInput
                value={field.value?.institutionName ?? ''}
                disabled
                sx={{
                  height: '50px',
                  backgroundColor: colors.gray10,
                }}
              />
            )}
          />
          <MedipandaButton onClick={() => setPartnerSelectDialogOpen(true)} variant='contained' size='large' color='secondary'>
            거래처 선택
          </MedipandaButton>
        </Stack>
      </Stack>
      <Controller
        control={form.control}
        name={'drugCompanies'}
        render={({ field }) => (
          <>
            {(field.value as (DrugCompanyResponse | null)[]).concat(null).map((drugCompany, index) => (
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
                    <MedipandaButton
                      onClick={() => setDrugCompanySearchDialogOpen(true)}
                      variant='contained'
                      size='large'
                      color='secondary'
                    >
                      거래제약사 추가
                    </MedipandaButton>
                  )}
                </Stack>
              </Stack>
            ))}
          </>
        )}
      />
      <Controller
        control={form.control}
        name={'files'}
        render={({ field }) => (
          <>
            {(field.value as (File | null)[]).concat([null]).map((file, index) => (
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
                  <MedipandaFileUploadButton onChange={handleFileUpload} sx={{ width: '330px' }} />
                )}
              </Stack>
            ))}
          </>
        )}
      />
      <Typography variant='smallTextR' sx={{ color: 'red', whiteSpace: 'pre-wrap' }}>
        파일 업로드시 주의사항
        <br />
        1. {AVAILABLE_FILE_EXTENSIONS.join(', ')}파일만 업로드 가능해요.
        <br />
        2. 파일은 최대 5개까지 가능하니, 5개가 초과할 경우에는 &apos;한번에 업로드&apos; 기능을 이용해주세요.
        <br />
        3. 파일명의 처방월이 선택한 처방월과 일치하게 해주세요.
      </Typography>
      {Object.keys(form.formState.errors).map(key => {
        return (
          <Typography key={key} variant='smallTextR' sx={{ color: 'red' }}>
            {form.formState.errors[key]?.message}
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
          onClick={() => form.reset()}
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
          onClick={form.handleSubmit(submitHandler)}
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
      <Controller
        control={form.control}
        name={'dealer'}
        render={({ field }) => (
          <DealerSelectDialog
            open={dealerSelectDialogOpen}
            onClose={() => setDealerSelectDialogOpen(false)}
            onSelect={dealer => {
              field.onChange(dealer);
              setDealerSelectDialogOpen(false);
            }}
          />
        )}
      />
      <Controller
        control={form.control}
        name={'partner'}
        render={({ field }) => (
          <PartnerSelectDialog
            open={partnerSelectDialogOpen}
            onClose={() => setPartnerSelectDialogOpen(false)}
            onSelect={partner => {
              field.onChange(partner);
              setPartnerSelectDialogOpen(false);
            }}
          />
        )}
      />
      <Controller
        control={form.control}
        name={'drugCompanies'}
        render={({ field }) => (
          <DrugCompanySelectDialog
            open={drugCompanySearchDialogOpen}
            onClose={() => setDrugCompanySearchDialogOpen(false)}
            onSelect={drugCompany => {
              field.onChange([...field.value, drugCompany]);
              setDrugCompanySearchDialogOpen(false);
            }}
            excludedIds={field.value.map(company => company.id)}
          />
        )}
      />
    </>
  );
}

function EdiBatchUploadForm() {
  const { session } = useSession();
  const [uploadErrors, setUploadErrors] = useState<FileValidationErrorDto[]>([]);

  const form = useForm({
    defaultValues: {
      settlementMonth: null as Date | null,
      prescriptionMonth: null as Date | null,
      file: null as File | null,
    },
  });

  const submitHandler: SubmitHandler<RequiredDeep<(typeof form)['control']['_defaultValues']>> = async values => {
    if (values.settlementMonth == null) {
      alert('정산월을 선택해 주세요.');
      return;
    }

    if (values.prescriptionMonth == null) {
      alert('처방월을 선택해 주세요.');
      return;
    }

    if (values.file == null) {
      alert('EDI 파일을 선택해 주세요.');
      return;
    }

    try {
      const result = await uploadEdiZip({
        partnerUserId: session!.userId,
        settlementMonth: format(values.prescriptionMonth!, DATEFORMAT_YYYY_MM),
        prescriptionMonth: format(values.prescriptionMonth!, DATEFORMAT_YYYY_MM),
        file: values.file!,
      });

      if (result.success) {
        alert('EDI 파일이 성공적으로 업로드되었습니다.');
        form.reset();
      } else {
        setUploadErrors(result.errors);
      }
    } catch (error) {
      console.error('Error uploading EDI zip file:', error);
      alert('EDI 파일 업로드 중 오류가 발생했습니다. 다시 시도해 주세요.');
    }
  };

  const handleFileUpload = (files: File[]) => {
    if (files && files.length > 0) {
      const file = files[0];

      if (!file.name.toLowerCase().endsWith('.zip')) {
        alert('zip 파일만 업로드 가능합니다.');
        return;
      }

      form.setValue('file', files[0]);
    }
  };

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
        <Controller
          control={form.control}
          name={'settlementMonth'}
          render={({ field }) => (
            <MedipandaDatePicker
              {...field}
              label='정산월'
              format={DATEFORMAT_YYYY_MM}
              views={['year', 'month']}
              sx={{
                width: '330px',
                backgroundColor: colors.gray10,
              }}
            />
          )}
        />
      </Stack>
      <Stack direction='row' alignItems='center'>
        <Typography variant='largeTextM' sx={{ color: colors.gray80, width: '120px' }}>
          처방월
        </Typography>
        <Controller
          control={form.control}
          name={'prescriptionMonth'}
          render={({ field }) => (
            <MedipandaDatePicker
              {...field}
              label='처방월'
              format={DATEFORMAT_YYYY_MM}
              views={['year', 'month']}
              sx={{
                width: '330px',
                backgroundColor: colors.gray10,
              }}
            />
          )}
        />
      </Stack>
      <Stack direction='row' alignItems='center'>
        <Typography variant='largeTextM' sx={{ color: colors.gray80, width: '120px' }}>
          파일업로드
        </Typography>
        <Controller
          control={form.control}
          name={'file'}
          render={({ field }) =>
            field.value !== null ? (
              <MedipandaOutlinedInput
                value={field.value.name}
                disabled
                sx={{
                  flexGrow: 1,
                  height: '50px',
                  backgroundColor: colors.gray10,
                }}
              />
            ) : (
              <MedipandaFileUploadButton onChange={handleFileUpload} sx={{ width: '330px' }} />
            )
          }
        />
      </Stack>
      <Typography variant='smallTextR' sx={{ color: 'red', whiteSpace: 'pre-wrap' }}>
        파일 업로드시 주의사항
        <br />
        1. 한번에 업로드시 zip파일로 업로드 해주세요
        <br />
        2. zip 파일 내 각 파일명: 딜러명_거래처명_처방월 (ex. 홍길동_메디판다_202504)으로 저장해주세요
        <br />
        3. png, jpg, jpeg, pdf파일만 업로드 가능해요
        <br />
        4. 파일명내에 처방월이 선택한 처방월과 일치하게 해주세요
        <br />
      </Typography>
      {Object.keys(form.formState.errors).map(key => {
        return (
          <Typography key={key} variant='smallTextR' sx={{ color: 'red' }}>
            {form.formState.errors[key]?.message}
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
          onClick={() => form.reset()}
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
          onClick={form.handleSubmit(submitHandler)}
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

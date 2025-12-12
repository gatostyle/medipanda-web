import {
  DateTimeString,
  type AttachmentResponse,
  type DealerResponse,
  deletePrescriptionPartner,
  getPrescriptionPartner,
  getPrescriptionPartnerList,
  type PartnerResponse,
  type PrescriptionPartnerResponse,
  PrescriptionStatusLabel,
  updatePartnerEdiFiles,
  uploadPartnerEdiFiles,
} from '@/backend';
import { DealerSelectDialog } from '@/custom/components/DealerSelectDialog';
import { MedipandaButton } from '@/custom/components/MedipandaButton';
import { MedipandaDatePicker } from '@/custom/components/MedipandaDatePicker';
import { MedipandaFileUploadButton } from '@/custom/components/MedipandaFileUploadButton';
import { MedipandaOutlinedInput } from '@/custom/components/MedipandaOutlinedInput';
import { MedipandaPagination } from '@/custom/components/MedipandaPagination';
import { MedipandaTable } from '@/custom/components/MedipandaTable';
import { PartnerSelectDialog } from '@/custom/components/PartnerSelectDialog';
import { useSearchParamsOrDefault } from '@/lib/hooks/useSearchParamsOrDefault';
import { setUrlParams } from '@/lib/utils/url';
import { colors } from '@/themes';
import { DATEFORMAT_YYYY_MM, DATEFORMAT_YYYY년_MM월 } from '@/lib/utils/dateFormat';
import { Search, Close } from '@mui/icons-material';
import {
  FormControl,
  IconButton,
  InputAdornment,
  MenuItem,
  PaginationItem,
  Select,
  Stack,
  TextField,
  Typography,
  Box,
} from '@mui/material';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { format } from 'date-fns';
import { useCallback, useEffect, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import type { RequiredDeep } from 'type-fest';

export default function PrescriptionList() {
  const navigate = useNavigate();

  const [contents, setContents] = useState<PrescriptionPartnerResponse[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedItem, setSelectedItem] = useState<PrescriptionPartnerResponse | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const initialSearchParams = {
    searchType: 'institutionName' as 'institutionName' | 'dealerName',
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

  const fetchContents = useCallback(async () => {
    try {
      const response = await getPrescriptionPartnerList({
        [searchType]: searchKeyword !== '' ? searchKeyword : undefined,
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
  }, [searchType, searchKeyword, page, pageSize]);

  useEffect(() => {
    form.setValue('searchType', searchType);
    form.setValue('searchKeyword', searchKeyword);
    fetchContents();
  }, [searchType, searchKeyword, page, form, fetchContents]);

  const handleInstitutionClick = (item: PrescriptionPartnerResponse) => {
    setSelectedItem(item);
    setDetailDialogOpen(true);
  };

  const handleDetailClose = () => {
    setDetailDialogOpen(false);
    setSelectedItem(null);
  };

  const handleDetailUpdate = () => {
    fetchContents();
    handleDetailClose();
  };

  const table = useReactTable({
    data: contents,
    columns: [
      {
        header: '딜러명',
        cell: ({ row }) => `${row.original.dealerName}(${row.original.drugCompany})`,
      },
      {
        header: '거래처명',
        cell: ({ row }) => {
          const isSelected = selectedItem?.id === row.original.id && detailDialogOpen;
          return (
            <Typography
              component='span'
              sx={{
                textDecoration: 'underline',
                cursor: 'pointer',
                color: colors.gray80,
                fontWeight: isSelected ? 'bold' : 'normal',
                '&:hover': {
                  fontWeight: 'bold',
                },
              }}
              onClick={() => handleInstitutionClick(row.original)}
            >
              {row.original.institutionName}
            </Typography>
          );
        },
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

  const MEDIPANDA_DOWNLOAD_LINK = 'https://cdn.medipanda.co.kr/app/windows/setup.exe';

  return (
    <>
      <Typography variant='heading1.7B' sx={{ alignSelf: 'center', color: colors.gray80, marginTop: '20px' }}>
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
                <MenuItem value='institutionName'>거래처명</MenuItem>
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

      <Stack direction='row' justifyContent='flex-end' alignItems='center' gap='16px' sx={{ marginTop: '40px', width: '100%' }}>
        <Typography variant='smallTextB' sx={{ color: '#000000' }}>
          한번에 업로드를 원하는 회원님들은 우측의 프로그램을 통해 진행부탁드립니다.
        </Typography>
        <MedipandaButton
          component='a'
          href={MEDIPANDA_DOWNLOAD_LINK}
          variant='contained'
          sx={{
            width: '215px',
            height: '40px',
            backgroundColor: colors.vividViolet,
            borderRadius: '30px',
            '&:hover': {
              backgroundColor: colors.vividViolet,
            },
          }}
        >
          <Typography variant='largeTextB' sx={{ color: 'white' }}>
            메디판다 프로그램 다운로드
          </Typography>
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
          sx={{
            width: '600px',
            position: 'relative',
          }}
        >
          <Stack
            gap='10px'
            sx={{
              width: '100%',
              padding: '40px 75px',
              border: `1px solid ${colors.gray30}`,
              boxSizing: 'border-box',
              visibility: detailDialogOpen ? 'hidden' : 'visible',
            }}
          >
            <EdiIndividualUploadForm onSuccess={fetchContents} />
          </Stack>

          {detailDialogOpen && <EdiDetailOverlay item={selectedItem} onClose={handleDetailClose} onUpdate={handleDetailUpdate} />}
        </Stack>
      </Stack>
    </>
  );
}

interface EdiDetailOverlayProps {
  item: PrescriptionPartnerResponse | null;
  onClose: () => void;
  onUpdate: () => void;
}

function EdiDetailOverlay({ item, onClose, onUpdate }: EdiDetailOverlayProps) {
  const AVAILABLE_FILE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'pdf'];
  const MAX_PRESCRIPTION_FILES = 30;

  const [dealerSelectDialogOpen, setDealerSelectDialogOpen] = useState(false);
  const [partnerSelectDialogOpen, setPartnerSelectDialogOpen] = useState(false);
  const [existingFiles, setExistingFiles] = useState<AttachmentResponse[]>([]);
  const [keepFileIds, setKeepFileIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [detailData, setDetailData] = useState<PrescriptionPartnerResponse | null>(null);

  const isEditable = detailData?.status === 'PENDING';

  const form = useForm({
    defaultValues: {
      dealer: null as DealerResponse | null,
      prescriptionMonth: null as Date | null,
      partner: null as PartnerResponse | null,
      newFiles: [] as File[],
    },
  });

  const selectedDealer = form.watch('dealer');

  const handleDealerSelect = (dealer: DealerResponse) => {
    const currentPartner = form.getValues('partner');

    if (currentPartner && currentPartner.drugCompanyName !== dealer.drugCompanyName) {
      form.setValue('partner', null);
    }

    form.setValue('dealer', dealer);
    setDealerSelectDialogOpen(false);
  };

  const fetchDetailData = useCallback(async () => {
    if (!item) return;

    try {
      setIsLoading(true);
      const detail = await getPrescriptionPartner(item.id);
      setDetailData(detail);

      form.setValue('dealer', {
        id: detail.dealerId,
        displayName: detail.dealerName,
        drugCompanyId: detail.drugCompanyId,
        drugCompanyName: detail.drugCompany,
        dealerName: detail.dealerName,
        createdAt: '',
      } as DealerResponse);
      form.setValue('prescriptionMonth', new Date(detail.prescriptionMonth));
      form.setValue('partner', {
        id: detail.partnerId,
        institutionName: detail.institutionName,
        businessNumber: detail.businessNumber,
        companyName: detail.companyName,
        drugCompanyName: detail.drugCompany,
      } as PartnerResponse);

      setExistingFiles(detail.ediFiles || []);
      setKeepFileIds(detail.ediFiles?.map(f => f.s3fileId) || []);
      form.setValue('newFiles', []);
    } catch (error) {
      console.error('Failed to fetch detail:', error);
      alert('상세 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [item, form]);

  useEffect(() => {
    if (item) {
      fetchDetailData();
    }
  }, [item, fetchDetailData]);

  const handleClose = () => {
    form.reset();
    setExistingFiles([]);
    setKeepFileIds([]);
    setDetailData(null);
    onClose();
  };

  const handleDelete = async () => {
    if (!item) return;

    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      setIsLoading(true);
      await deletePrescriptionPartner(item.id);
      alert('삭제되었습니다.');
      onUpdate();
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('삭제 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const submitHandler: SubmitHandler<RequiredDeep<(typeof form)['control']['_defaultValues']>> = async values => {
    if (!item || !detailData) return;

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

    const totalFiles = keepFileIds.length + values.newFiles.length;
    if (totalFiles === 0) {
      alert('최소 1개 이상의 파일이 필요합니다.');
      return;
    }

    const { dealer, prescriptionMonth, partner } = values;
    if (!dealer.drugCompanyId) {
      alert('딜러의 제약사 정보가 없습니다.');
      return;
    }

    const utcPrescriptionMonth = new Date(Date.UTC(prescriptionMonth.getFullYear(), prescriptionMonth.getMonth(), 1));

    try {
      setIsLoading(true);
      await updatePartnerEdiFiles({
        request: {
          prescriptionPartnerId: item.id,
          dealerId: dealer.id,
          prescriptionMonth: new DateTimeString(utcPrescriptionMonth),
          partnerId: partner.id,
          drugCompanyId: dealer.drugCompanyId,
          keepFileIds: keepFileIds,
        },
        files: values.newFiles.length > 0 ? values.newFiles : undefined,
      });
      alert('수정되었습니다.');
      onUpdate();
    } catch (error) {
      console.error('Error updating EDI:', error);
      alert('수정 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
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

      const currentNewFiles = form.getValues('newFiles') ?? [];
      const totalAfterAdd = keepFileIds.length + currentNewFiles.length + validFiles.length;

      if (totalAfterAdd > MAX_PRESCRIPTION_FILES) {
        alert(`파일은 최대 ${MAX_PRESCRIPTION_FILES}개까지 가능합니다.`);
        const allowedCount = MAX_PRESCRIPTION_FILES - keepFileIds.length - currentNewFiles.length;
        if (allowedCount > 0) {
          form.setValue('newFiles', [...currentNewFiles, ...validFiles.slice(0, allowedCount)]);
        }
        return;
      }

      form.setValue('newFiles', [...currentNewFiles, ...validFiles]);
    }
  };

  const handleExistingFileDelete = (fileId: number) => {
    setKeepFileIds(prev => prev.filter(id => id !== fileId));
  };

  const handleNewFileDelete = (index: number) => {
    const currentFiles = form.getValues('newFiles');
    form.setValue(
      'newFiles',
      currentFiles.filter((_, i) => i !== index),
    );
  };

  const remainingExistingFiles = existingFiles.filter(f => keepFileIds.includes(f.s3fileId));
  const newFiles = form.watch('newFiles');
  const totalFileCount = keepFileIds.length + newFiles.length;
  const canAddMoreFiles = totalFileCount < MAX_PRESCRIPTION_FILES;

  if (!item) return null;

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'white',
        border: `1px solid ${colors.gray30}`,
        boxSizing: 'border-box',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <IconButton
        onClick={handleClose}
        sx={{
          position: 'absolute',
          top: '8px',
          right: '20px',
          zIndex: 1,
        }}
      >
        <Close />
      </IconButton>

      <Stack
        gap='10px'
        sx={{
          padding: '40px 75px',
          overflowY: 'auto',
          flex: 1,
        }}
      >
        <Stack alignItems='center'>
          <Typography variant='heading2B' sx={{ color: colors.gray80 }}>
            실적(EDI)상세
          </Typography>
        </Stack>

        {isLoading && !detailData ? (
          <Stack alignItems='center' sx={{ padding: '40px' }}>
            <Typography>로딩 중...</Typography>
          </Stack>
        ) : (
          <>
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
                      value={field.value?.displayName ?? ''}
                      disabled
                      sx={{
                        height: '50px',
                        backgroundColor: colors.gray10,
                        flexGrow: 1,
                      }}
                    />
                  )}
                />
                {isEditable && (
                  <MedipandaButton onClick={() => setDealerSelectDialogOpen(true)} variant='contained' size='large' color='secondary'>
                    딜러 변경
                  </MedipandaButton>
                )}
              </Stack>
            </Stack>

            <Stack direction='row' alignItems='center'>
              <Typography variant='largeTextM' sx={{ color: colors.gray80, width: '120px' }}>
                정산월
              </Typography>
              <Typography
                variant='largeTextM'
                sx={{
                  color: colors.gray80,
                  width: '330px',
                  height: '50px',
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: '14px',
                }}
              >
                {detailData?.settlementMonth
                  ? format(new Date(detailData.settlementMonth), DATEFORMAT_YYYY_MM)
                  : format(new Date(), DATEFORMAT_YYYY_MM)}
              </Typography>
            </Stack>

            <Stack direction='row' alignItems='center'>
              <Typography variant='largeTextM' sx={{ color: colors.gray80, width: '120px' }}>
                처방월
              </Typography>
              <Controller
                control={form.control}
                name={'prescriptionMonth'}
                render={({ field }) => {
                  const settlementDate = detailData?.settlementMonth ? new Date(detailData.settlementMonth) : new Date();
                  const maxDate = new Date(settlementDate.getFullYear(), settlementDate.getMonth() - 1, 1);

                  return (
                    <MedipandaDatePicker
                      {...field}
                      format={DATEFORMAT_YYYY_MM}
                      views={['year', 'month']}
                      maxDate={maxDate}
                      disabled={!isEditable}
                      sx={{
                        width: '330px',
                        backgroundColor: colors.gray10,
                      }}
                    />
                  );
                }}
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
                        flexGrow: 1,
                      }}
                    />
                  )}
                />
                {isEditable && (
                  <MedipandaButton
                    onClick={() => setPartnerSelectDialogOpen(true)}
                    variant='contained'
                    size='large'
                    color='secondary'
                    disabled={!selectedDealer}
                  >
                    거래처 변경
                  </MedipandaButton>
                )}
              </Stack>
            </Stack>

            {isEditable && canAddMoreFiles && (
              <Stack direction='row' alignItems='center'>
                <Typography variant='largeTextM' sx={{ color: colors.gray80, width: '120px' }}>
                  파일업로드
                </Typography>
                <MedipandaFileUploadButton onChange={handleFileUpload} sx={{ width: '330px' }} multiple />
              </Stack>
            )}

            <Stack direction='row' alignItems='center'>
              <Typography variant='largeTextM' sx={{ color: colors.gray80, width: '120px' }}>
                {!isEditable ? '파일목록' : ''}
              </Typography>
              <Typography variant='smallTextR' sx={{ color: colors.gray60 }}>
                파일첨부({totalFileCount}/{MAX_PRESCRIPTION_FILES})
              </Typography>
            </Stack>

            {remainingExistingFiles.length > 0 && (
              <Stack direction='row' alignItems='flex-start'>
                <Typography variant='largeTextM' sx={{ color: colors.gray80, width: '120px' }}>
                  기존이미지
                </Typography>
                <Stack gap='8px' sx={{ flexGrow: 1 }}>
                  {remainingExistingFiles.map(file => (
                    <Stack key={file.s3fileId} direction='row' alignItems='center' gap='8px'>
                      <Typography
                        variant='largeTextR'
                        sx={{
                          color: colors.navy,
                          textDecoration: 'underline',
                          cursor: 'pointer',
                        }}
                        onClick={() => file.fileUrl && window.open(file.fileUrl, '_blank')}
                      >
                        {file.originalFileName}
                      </Typography>
                      {isEditable && (
                        <Typography
                          component='span'
                          sx={{
                            cursor: 'pointer',
                            color: colors.gray60,
                            '&:hover': { color: 'red' },
                          }}
                          onClick={() => handleExistingFileDelete(file.s3fileId)}
                        >
                          x
                        </Typography>
                      )}
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            )}

            {newFiles.length > 0 && (
              <Stack direction='row' alignItems='flex-start'>
                <Typography variant='largeTextM' sx={{ color: colors.gray80, width: '120px' }}>
                  새 파일
                </Typography>
                <Stack gap='8px' sx={{ flexGrow: 1 }}>
                  {newFiles.map((file, index) => (
                    <Stack key={`new-${index}`} direction='row' alignItems='center' gap='8px'>
                      <MedipandaOutlinedInput
                        value={file.name}
                        disabled
                        sx={{
                          height: '40px',
                          backgroundColor: colors.gray10,
                          flexGrow: 1,
                        }}
                      />
                      {isEditable && (
                        <Typography
                          component='span'
                          sx={{
                            cursor: 'pointer',
                            color: colors.gray60,
                            '&:hover': { color: 'red' },
                          }}
                          onClick={() => handleNewFileDelete(index)}
                        >
                          x
                        </Typography>
                      )}
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            )}

            <Typography variant='smallTextR' sx={{ color: 'red', whiteSpace: 'pre-wrap', marginTop: '10px' }}>
              파일 업로드시 주의사항
              <br />
              1. {AVAILABLE_FILE_EXTENSIONS.join(', ')} 파일만 업로드 가능해요.
              <br />
              2. 파일은 최대 {MAX_PRESCRIPTION_FILES}개까지 가능하니, {MAX_PRESCRIPTION_FILES}개가 초과할 경우에는 &#39;한번에 업로드&#39;
              기능을 이용해주세요.
              <br />
              3. 파일명의 처방월과 선택한 처방월을 일치하게 해주세요.
            </Typography>

            {Object.entries(form.formState.errors).map(([key, error]) => (
              <Typography key={key} variant='smallTextR' sx={{ color: 'red' }}>
                {error?.message as string}
              </Typography>
            ))}

            <Stack
              direction='row'
              justifyContent='center'
              gap='10px'
              sx={{
                marginTop: '10px',
              }}
            >
              {isEditable ? (
                <>
                  <MedipandaButton
                    onClick={handleDelete}
                    variant='outlined'
                    size='large'
                    color='secondary'
                    disabled={isLoading}
                    sx={{
                      width: '160px',
                    }}
                  >
                    삭제
                  </MedipandaButton>
                  <MedipandaButton
                    onClick={form.handleSubmit(submitHandler)}
                    variant='contained'
                    size='large'
                    color='secondary'
                    disabled={isLoading}
                    sx={{
                      width: '160px',
                    }}
                  >
                    수정
                  </MedipandaButton>
                </>
              ) : (
                <MedipandaButton
                  onClick={handleClose}
                  variant='contained'
                  size='large'
                  color='secondary'
                  sx={{
                    width: '160px',
                  }}
                >
                  닫기
                </MedipandaButton>
              )}
            </Stack>

            <DealerSelectDialog
              open={dealerSelectDialogOpen}
              onClose={() => setDealerSelectDialogOpen(false)}
              onSelect={handleDealerSelect}
            />

            <PartnerSelectDialog
              open={partnerSelectDialogOpen}
              onClose={() => setPartnerSelectDialogOpen(false)}
              drugCompanyName={selectedDealer?.drugCompanyName ?? undefined}
              onSelect={partner => {
                form.setValue('partner', partner);
                setPartnerSelectDialogOpen(false);
              }}
            />
          </>
        )}
      </Stack>
    </Box>
  );
}

interface EdiIndividualUploadFormProps {
  onSuccess: () => void;
}

function EdiIndividualUploadForm({ onSuccess }: EdiIndividualUploadFormProps) {
  const AVAILABLE_FILE_EXTENSIONS = ['png', 'jpg', 'jpeg'];
  const MAX_PRESCRIPTION_FILES = 30;

  const [dealerSelectDialogOpen, setDealerSelectDialogOpen] = useState(false);
  const [partnerSelectDialogOpen, setPartnerSelectDialogOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      dealer: null as DealerResponse | null,
      prescriptionMonth: null as Date | null,
      partner: null as PartnerResponse | null,
      files: [] as File[],
    },
  });

  const selectedDealer = form.watch('dealer');

  const handleDealerSelect = (dealer: DealerResponse) => {
    const currentPartner = form.getValues('partner');

    if (currentPartner && currentPartner.drugCompanyName !== dealer.drugCompanyName) {
      form.setValue('partner', null);
    }

    form.setValue('dealer', dealer);
    setDealerSelectDialogOpen(false);
  };

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

    if (values.files.length === 0) {
      alert('EDI 파일을 선택해 주세요.');
      return;
    }

    const { dealer, prescriptionMonth, partner } = values;
    if (!dealer.drugCompanyId) {
      alert('딜러의 제약사 정보가 없습니다.');
      return;
    }

    const now = new Date();
    const utcSettlementMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
    const utcPrescriptionMonth = new Date(Date.UTC(prescriptionMonth.getFullYear(), prescriptionMonth.getMonth(), 1));

    try {
      await uploadPartnerEdiFiles({
        request: {
          settlementMonth: new DateTimeString(utcSettlementMonth),
          dealerId: dealer.id,
          prescriptionMonth: new DateTimeString(utcPrescriptionMonth),
          partnerId: partner.id,
          drugCompanyId: dealer.drugCompanyId,
        },
        files: values.files,
      });
      alert('EDI 파일이 성공적으로 업로드되었습니다.');
      form.reset();
      onSuccess();
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
                value={field.value?.displayName ?? ''}
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
      <Stack direction='row' alignItems='center'>
        <Typography variant='largeTextM' sx={{ color: colors.gray80, width: '120px' }}>
          정산월
        </Typography>
        <Typography
          variant='largeTextM'
          sx={{
            color: colors.gray80,
            width: '330px',
            height: '50px',
            display: 'flex',
            alignItems: 'center',
            paddingLeft: '14px',
          }}
        >
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
          render={({ field }) => {
            const now = new Date();
            const maxDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);

            return (
              <MedipandaDatePicker
                {...field}
                format={DATEFORMAT_YYYY_MM}
                views={['year', 'month']}
                maxDate={maxDate}
                sx={{
                  width: '330px',
                  backgroundColor: colors.gray10,
                }}
              />
            );
          }}
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
          <MedipandaButton
            onClick={() => setPartnerSelectDialogOpen(true)}
            variant='contained'
            size='large'
            color='secondary'
            disabled={!selectedDealer}
          >
            거래처 선택
          </MedipandaButton>
        </Stack>
      </Stack>
      <Controller
        control={form.control}
        name={'files'}
        render={({ field }) => (
          <>
            {(field.value as (File | null)[]).concat([null]).map((file, index) => (
              <Stack key={file?.name ?? `upload-${index}`} direction='row' alignItems='center'>
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
                  field.value.length < MAX_PRESCRIPTION_FILES && (
                    <MedipandaFileUploadButton onChange={handleFileUpload} sx={{ width: '330px' }} />
                  )
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
        2. 파일은 최대 {MAX_PRESCRIPTION_FILES}개까지 가능하니, {MAX_PRESCRIPTION_FILES}개가 초과할 경우에는 &#39;메디판다 프로그램&#39;을
        이용해주세요.
        <br />
        3. 파일의 처방월과 선택한 처방월을 일치하게 해주세요.
      </Typography>
      {Object.entries(form.formState.errors).map(([key, error]) => (
        <Typography key={key} variant='smallTextR' sx={{ color: 'red' }}>
          {error?.message as string}
        </Typography>
      ))}
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

      <DealerSelectDialog open={dealerSelectDialogOpen} onClose={() => setDealerSelectDialogOpen(false)} onSelect={handleDealerSelect} />

      <PartnerSelectDialog
        open={partnerSelectDialogOpen}
        onClose={() => setPartnerSelectDialogOpen(false)}
        onSelect={partner => {
          form.setValue('partner', partner);
          setPartnerSelectDialogOpen(false);
        }}
        drugCompanyName={selectedDealer?.drugCompanyName ?? undefined}
      />
    </>
  );
}

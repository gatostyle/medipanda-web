import { setUrlParams } from '@/lib/utils/url';
import { useSearchParamsOrDefault } from '@/lib/hooks/useSearchParamsOrDefault';
import { MpEdiUploadModal } from '@/components/MpEdiUploadModal';
import { useMpModal } from '@/hooks/useMpModal';
import {
  Button,
  Card,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Pagination,
  PaginationItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import {
  confirmPrescription,
  DateTimeString,
  type PrescriptionResponse,
  PrescriptionStatus,
  PrescriptionStatusLabel,
  searchPrescriptions,
} from '@/backend';
import { SearchFilterActions, MpSearchFilterBar, SearchFilterItem } from '@/components/MpSearchFilterBar';
import { DATEFORMAT_YYYY_MM_DD, formatYyyyMm, formatYyyyMmDd, formatYyyyMmDdHhMm, SafeDate } from '@/lib/utils/dateFormat';
import { type Sequenced, withSequence } from '@/lib/utils/withSequence';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';
import type { RequiredDeep } from 'type-fest';

export default function MpAdminPrescriptionReceptionList() {
  const navigate = useNavigate();

  const initialSearchParams = {
    searchType: '' as 'companyName' | 'userId' | 'dealerName' | 'dealerId' | '',
    searchKeyword: '',
    startAt: '',
    endAt: '',
    status: '' as keyof typeof PrescriptionStatus | '',
    page: '1',
  };

  const {
    searchType,
    searchKeyword,
    startAt: paramStartAt,
    endAt: paramEndAt,
    status,
    page: paramPage,
  } = useSearchParamsOrDefault(initialSearchParams);
  const startAt = useMemo(() => SafeDate(paramStartAt) ?? null, [paramStartAt]);
  const endAt = useMemo(() => SafeDate(paramEndAt) ?? null, [paramEndAt]);
  const page = Number(paramPage);
  const pageSize = 20;

  const [loading, setLoading] = useState(false);
  const [contents, setContents] = useState<Sequenced<PrescriptionResponse>[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const { alert, alertError } = useMpModal();
  const { enqueueSnackbar } = useSnackbar();

  const [ediUploadModalOpen, setEdiUploadModalOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      ...initialSearchParams,
      startAt: null as Date | null,
      endAt: null as Date | null,
    },
  });
  const formStartAt = form.watch('startAt');
  const formEndAt = form.watch('endAt');

  const submitHandler: SubmitHandler<RequiredDeep<(typeof form)['control']['_defaultValues']>> = async values => {
    if (values.searchType === '' && values.searchKeyword !== '') {
      await alert('검색유형을 선택하세요.');
      return;
    }

    if (values.searchType === 'dealerId' && values.searchKeyword !== '' && Number.isNaN(Number(values.searchKeyword))) {
      await alert('딜러번호는 숫자만 입력할 수 있습니다.');
      return;
    }

    const url = setUrlParams(
      {
        ...values,
        startAt: values.startAt !== null ? formatYyyyMmDd(values.startAt) : undefined,
        endAt: values.endAt !== null ? formatYyyyMmDd(values.endAt) : undefined,
        page: 1,
      },
      initialSearchParams,
    );

    navigate(url);
  };

  const handleReset = () => {
    navigate('');
    form.reset();
  };

  const fetchContents = async () => {
    setLoading(true);
    try {
      const response = await searchPrescriptions({
        status: status !== '' ? status : undefined,
        companyName: searchType === 'companyName' && searchKeyword !== '' ? searchKeyword : undefined,
        userId: searchType === 'userId' && searchKeyword !== '' ? searchKeyword : undefined,
        dealerName: searchType === 'dealerName' && searchKeyword !== '' ? searchKeyword : undefined,
        dealerId: searchType === 'dealerId' && searchKeyword !== '' ? Number(searchKeyword) : undefined,
        startAt: startAt ? new DateTimeString(startAt) : undefined,
        endAt: endAt ? new DateTimeString(endAt) : undefined,
        page: page - 1,
        size: pageSize,
      });

      setContents(withSequence(response).content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch prescription reception list:', error);
      await alertError('처방접수 목록을 불러오는 중 오류가 발생했습니다.');
      setContents([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContents();
  }, [searchType, searchKeyword, startAt, endAt, status, page]);

  const handleConfirm = async (id: number) => {
    try {
      await confirmPrescription(id);
      enqueueSnackbar('접수 확인되었습니다.', { variant: 'success' });
      fetchContents();
    } catch (error) {
      console.error('Failed to confirm reception:', error);
      await alertError('접수 확인 중 오류가 발생했습니다.');
    }
  };

  const handleEdiUploadSuccess = async () => {
    setEdiUploadModalOpen(false);
    await fetchContents();
  };

  return (
    <>
      <Stack sx={{ gap: 3 }}>
        <Typography variant='h4'>처방접수</Typography>

        <Card sx={{ padding: 3 }}>
          <MpSearchFilterBar component='form' onSubmit={form.handleSubmit(submitHandler)}>
            <SearchFilterItem minWidth={140}>
              <FormControl fullWidth size='small'>
                <InputLabel>접수상태</InputLabel>
                <Controller
                  control={form.control}
                  name={'status'}
                  render={({ field }) => (
                    <Select {...field}>
                      {Object.keys(PrescriptionStatus).map(prescriptionStatus => (
                        <MenuItem key={prescriptionStatus} value={prescriptionStatus}>
                          {PrescriptionStatusLabel[prescriptionStatus]}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
              </FormControl>
            </SearchFilterItem>
            <SearchFilterItem minWidth={140}>
              <FormControl fullWidth size='small'>
                <InputLabel>검색유형</InputLabel>
                <Controller
                  control={form.control}
                  name='searchType'
                  render={({ field }) => (
                    <Select {...field}>
                      <MenuItem value={'companyName'}>회사명</MenuItem>
                      <MenuItem value={'userId'}>아이디</MenuItem>
                      <MenuItem value={'dealerName'}>딜러명</MenuItem>
                      <MenuItem value={'dealerId'}>딜러번호</MenuItem>
                    </Select>
                  )}
                />
              </FormControl>
            </SearchFilterItem>
            <SearchFilterItem minWidth={140}>
              <Controller
                control={form.control}
                name={'startAt'}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    format={DATEFORMAT_YYYY_MM_DD}
                    views={['year', 'month', 'day']}
                    maxDate={formEndAt ?? undefined}
                    label='시작일'
                    slotProps={{
                      textField: {
                        size: 'small',
                      },
                    }}
                  />
                )}
              />
            </SearchFilterItem>
            <SearchFilterItem minWidth={140}>
              <Controller
                control={form.control}
                name={'endAt'}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    format={DATEFORMAT_YYYY_MM_DD}
                    views={['year', 'month', 'day']}
                    minDate={formStartAt ?? undefined}
                    label='종료일'
                    slotProps={{
                      textField: {
                        size: 'small',
                      },
                    }}
                  />
                )}
              />
            </SearchFilterItem>
            <SearchFilterItem flexGrow={1} minWidth={200}>
              <Controller
                control={form.control}
                name='searchKeyword'
                render={({ field }) => <TextField {...field} size='small' label='검색어' fullWidth />}
              />
            </SearchFilterItem>
            <SearchFilterActions>
              <Button variant='contained' size='small' type='submit'>
                검색
              </Button>
              <Button variant='outlined' size='small' onClick={handleReset}>
                초기화
              </Button>
            </SearchFilterActions>
          </MpSearchFilterBar>
        </Card>

        <Card sx={{ padding: 3 }}>
          <Stack direction='row' justifyContent='space-between' alignItems='center' mb={2}>
            <Stack direction='row' spacing={2}>
              <Typography variant='subtitle1'>검색결과: {totalElements.toLocaleString()} 건</Typography>
            </Stack>
            <Stack direction='row' spacing={1}>
              <Button variant='contained' color='success' size='small' onClick={() => setEdiUploadModalOpen(true)}>
                EDI 등록
              </Button>
            </Stack>
          </Stack>

          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell width={60}>No</TableCell>
                  <TableCell width={100}>딜러번호</TableCell>
                  <TableCell width={120}>아이디</TableCell>
                  <TableCell width={150}>회사명</TableCell>
                  <TableCell width={100}>딜러명</TableCell>
                  <TableCell width={100}>처방월</TableCell>
                  <TableCell width={100}>정산월</TableCell>
                  <TableCell width={120}>접수신청일</TableCell>
                  <TableCell width={120}>접수파일</TableCell>
                  <TableCell width={100}>접수상태</TableCell>
                  <TableCell width={120}>관리자확인</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={11} align='center' sx={{ py: 3 }}>
                      <Typography variant='body2' color='text.secondary'>
                        데이터를 로드하는 중입니다.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : contents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} align='center' sx={{ py: 3 }}>
                      <Typography variant='body2' color='text.secondary'>
                        검색 결과가 없습니다.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  contents.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>{item.sequence}</TableCell>
                      <TableCell>{item.dealerId}</TableCell>
                      <TableCell>{item.userId}</TableCell>
                      <TableCell>{item.companyName}</TableCell>
                      <TableCell>{item.dealerName}</TableCell>
                      <TableCell>{formatYyyyMm(item.prescriptionMonth)}</TableCell>
                      <TableCell>{formatYyyyMm(item.settlementMonth)}</TableCell>
                      <TableCell>{formatYyyyMmDd(item.submittedAt)}</TableCell>
                      <TableCell>
                        <Button
                          variant='contained'
                          color='success'
                          size='small'
                          href={`/v1/prescriptions/partners/${item.id}/edi-files/download`}
                          target='_blank'
                        >
                          다운로드
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Chip label={PrescriptionStatusLabel[item.status]} size='small' color='success' />
                      </TableCell>
                      <TableCell>
                        {item.status === PrescriptionStatus.PENDING ? (
                          <Button variant='contained' color='success' size='small' onClick={() => handleConfirm(item.id)}>
                            접수확인
                          </Button>
                        ) : (
                          <Typography variant='body2'>{item.checkedAt ? formatYyyyMmDdHhMm(item.checkedAt) : '-'}</Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Stack direction='row' justifyContent='center' sx={{ mt: 2 }}>
            <Pagination
              count={totalPages}
              page={page}
              renderItem={item => (
                <PaginationItem
                  {...item}
                  color='primary'
                  variant='outlined'
                  component={RouterLink}
                  to={setUrlParams({ page: item.page }, initialSearchParams)}
                />
              )}
              color='primary'
              variant='outlined'
              showFirstButton
              showLastButton
            />
          </Stack>
        </Card>
      </Stack>

      <MpEdiUploadModal open={ediUploadModalOpen} onClose={() => setEdiUploadModalOpen(false)} onSuccess={handleEdiUploadSuccess} />
    </>
  );
}

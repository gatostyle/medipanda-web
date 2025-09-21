import { normalizeBusinessNumber } from '@/lib/utils/form';
import { setUrlParams } from '@/lib/utils/url';
import { useSearchParamsOrDefault } from '@/lib/hooks/useSearchParamsOrDefault';
import { useMpModal } from '@/hooks/useMpModal';
import {
  Button,
  Card,
  Checkbox,
  FormControl,
  InputLabel,
  Link,
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
  completePrescriptionPartner,
  DateTimeString,
  deletePrescriptionPartner,
  getPrescriptionPartnerList,
  type PrescriptionPartnerResponse,
  PrescriptionPartnerStatus,
  PrescriptionPartnerStatusLabel,
} from '@/backend';
import { SearchFilterActions, MpSearchFilterBar, SearchFilterItem } from '@/components/MpSearchFilterBar';
import { useMpDeleteDialog } from '@/hooks/useMpDeleteDialog';
import { DATEFORMAT_YYYY_MM, DAY_TO_MILLISECONDS, formatYyyyMm, formatYyyyMmDd, SafeDate } from '@/lib/utils/dateFormat';
import { type Sequenced, withSequence } from '@/lib/utils/withSequence';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';
import type { RequiredDeep } from 'type-fest';

export default function MpAdminPrescriptionFormList() {
  const navigate = useNavigate();

  const initialSearchParams = {
    searchType: '' as 'companyName' | 'institutionName' | 'dealerName' | 'drugCompany' | '',
    searchKeyword: '',
    prescriptionMonthStart: '',
    prescriptionMonthEnd: '',
    status: '' as keyof typeof PrescriptionPartnerStatus | '',
    page: '1',
  };

  const {
    searchType,
    searchKeyword,
    prescriptionMonthStart: paramPrescriptionMonthStart,
    prescriptionMonthEnd: paramPrescriptionMonthEnd,
    status,
    page: paramPage,
  } = useSearchParamsOrDefault(initialSearchParams);
  const prescriptionMonthStart = useMemo(() => SafeDate(paramPrescriptionMonthStart) ?? null, [paramPrescriptionMonthStart]);
  const prescriptionMonthEnd = useMemo(() => SafeDate(paramPrescriptionMonthEnd) ?? null, [paramPrescriptionMonthEnd]);
  const page = Number(paramPage);
  const pageSize = 20;

  const [loading, setLoading] = useState(false);
  const [contents, setContents] = useState<Sequenced<PrescriptionPartnerResponse>[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const deleteDialog = useMpDeleteDialog();
  const { alert, alertError } = useMpModal();
  const { enqueueSnackbar } = useSnackbar();

  const form = useForm({
    defaultValues: {
      ...initialSearchParams,
      prescriptionMonthStart: null as Date | null,
      prescriptionMonthEnd: null as Date | null,
    },
  });
  const formPrescriptionMonthStart = form.watch('prescriptionMonthStart');
  const formPrescriptionMonthEnd = form.watch('prescriptionMonthEnd');

  const submitHandler: SubmitHandler<RequiredDeep<(typeof form)['control']['_defaultValues']>> = async values => {
    if (values.searchType === '' && values.searchKeyword !== '') {
      await alert('검색유형을 선택하세요.');
      return;
    }

    const url = setUrlParams(
      {
        ...values,
        prescriptionMonthStart: values.prescriptionMonthStart !== null ? formatYyyyMm(values.prescriptionMonthStart) : undefined,
        prescriptionMonthEnd: values.prescriptionMonthEnd !== null ? formatYyyyMm(values.prescriptionMonthEnd) : undefined,
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
      const response = await getPrescriptionPartnerList({
        companyName: searchType === 'companyName' && searchKeyword !== '' ? searchKeyword : undefined,
        institutionName: searchType === 'institutionName' && searchKeyword !== '' ? searchKeyword : undefined,
        drugCompany: searchType === 'drugCompany' && searchKeyword !== '' ? searchKeyword : undefined,
        dealerName: searchType === 'dealerName' && searchKeyword !== '' ? searchKeyword : undefined,
        prescriptionMonthStart: prescriptionMonthStart ? new DateTimeString(prescriptionMonthStart) : undefined,
        prescriptionMonthEnd: prescriptionMonthEnd ? new DateTimeString(prescriptionMonthEnd) : undefined,
        status: status !== '' ? status : undefined,
        page: page - 1,
        size: pageSize,
      });

      setContents(withSequence(response).content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch prescription form list:', error);
      await alertError('처방입력 목록을 불러오는 중 오류가 발생했습니다.');
      setContents([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContents();
  }, [searchType, searchKeyword, prescriptionMonthStart, prescriptionMonthEnd, status, page]);

  const handleApprove = async () => {
    try {
      await Promise.all(selectedIds.map(id => completePrescriptionPartner(id)));
      const count = selectedIds.length;
      const message = count === 1 ? '처방이 승인되었습니다.' : `${count}개 처방이 승인되었습니다.`;
      await alert(message);
      setSelectedIds([]);
      fetchContents();
    } catch (error) {
      console.error('Failed to approve prescriptions:', error);
      await alertError('처방 승인 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async () => {
    if (selectedIds.length === 0) {
      await alert('삭제할 처방을 선택하세요.');
      return;
    }

    deleteDialog.open({
      title: '처방 삭제',
      message: `선택한 ${selectedIds.length}개의 처방을 삭제하시겠습니까?`,
      onConfirm: async () => {
        try {
          await Promise.all(selectedIds.map(id => deletePrescriptionPartner(id)));
          enqueueSnackbar('처방이 삭제되었습니다.', { variant: 'success' });
          setSelectedIds([]);
          fetchContents();
        } catch (error) {
          console.error('Failed to delete prescriptions:', error);
          await alertError('처방 삭제에 실패했습니다.');
        }
      },
    });
  };

  return (
    <Stack sx={{ gap: 3 }}>
      <Typography variant='h4'>처방입력</Typography>

      <Card sx={{ padding: 3 }}>
        <MpSearchFilterBar component='form' onSubmit={form.handleSubmit(submitHandler)}>
          <SearchFilterItem minWidth={140}>
            <FormControl fullWidth size='small'>
              <InputLabel>상태</InputLabel>
              <Controller
                control={form.control}
                name={'status'}
                render={({ field }) => (
                  <Select {...field}>
                    {Object.keys(PrescriptionPartnerStatus).map(prescriptionStatus => (
                      <MenuItem key={prescriptionStatus} value={prescriptionStatus}>
                        {PrescriptionPartnerStatusLabel[prescriptionStatus]}
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
                    <MenuItem value={'institutionName'}>거래처명</MenuItem>
                    <MenuItem value={'dealerName'}>딜러명</MenuItem>
                    <MenuItem value={'drugCompany'}>제약사명</MenuItem>
                  </Select>
                )}
              />
            </FormControl>
          </SearchFilterItem>
          <SearchFilterItem minWidth={140}>
            <Controller
              control={form.control}
              name={'prescriptionMonthStart'}
              render={({ field }) => (
                <DatePicker
                  {...field}
                  format={DATEFORMAT_YYYY_MM}
                  views={['year', 'month']}
                  maxDate={
                    formPrescriptionMonthEnd !== null ? new Date(formPrescriptionMonthEnd.getTime() + DAY_TO_MILLISECONDS) : undefined
                  }
                  label='처방 시작월'
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
              name={'prescriptionMonthEnd'}
              render={({ field }) => (
                <DatePicker
                  {...field}
                  format={DATEFORMAT_YYYY_MM}
                  views={['year', 'month']}
                  minDate={
                    formPrescriptionMonthStart !== null ? new Date(formPrescriptionMonthStart.getTime() - DAY_TO_MILLISECONDS) : undefined
                  }
                  label='처방 종료월'
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
            <Typography variant='subtitle1' sx={{ ml: 2 }}>
              총 처방금액: {contents.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}원
            </Typography>
          </Stack>
          <Stack direction='row' spacing={1}>
            <Button variant='contained' color='success' size='small' onClick={handleApprove} disabled={selectedIds.length === 0}>
              승인
            </Button>
            <Button variant='contained' size='small' color='error' disabled={selectedIds.length === 0} onClick={handleDelete}>
              삭제
            </Button>
          </Stack>
        </Stack>

        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table size='small'>
            <TableHead>
              <TableRow>
                <TableCell width={50}>
                  <Checkbox
                    checked={selectedIds.length === contents.length && contents.length > 0}
                    onChange={e => {
                      if (e.target.checked) {
                        setSelectedIds(contents.map(item => item.id));
                      } else {
                        setSelectedIds([]);
                      }
                    }}
                  />
                </TableCell>
                <TableCell width={60}>No</TableCell>
                <TableCell width={120}>제약사명</TableCell>
                <TableCell width={120}>회사명</TableCell>
                <TableCell width={100}>거래처코드</TableCell>
                <TableCell width={100}>거래처명</TableCell>
                <TableCell width={150}>딜러명</TableCell>
                <TableCell width={130}>사업자등록번호</TableCell>
                <TableCell width={100}>처방일</TableCell>
                <TableCell width={100}>접수일</TableCell>
                <TableCell width={100}>입력일</TableCell>
                <TableCell width={100}>처방금액(원)</TableCell>
                <TableCell width={80}>승인상태</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={13} align='center' sx={{ py: 3 }}>
                    <Typography variant='body2' color='text.secondary'>
                      데이터를 로드하는 중입니다.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : contents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={13} align='center' sx={{ py: 3 }}>
                    <Typography variant='body2' color='text.secondary'>
                      검색 결과가 없습니다.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                contents.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(item.id)}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedIds(prev => [...prev, item.id]);
                          } else {
                            setSelectedIds(prev => prev.filter(id => id !== item.id));
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>{item.sequence}</TableCell>
                    <TableCell>{item.drugCompany}</TableCell>
                    <TableCell>{item.companyName}</TableCell>
                    <TableCell>{item.institutionCode}</TableCell>
                    <TableCell>
                      <Link component={RouterLink} to={`/admin/prescription-forms/${item.id}/edit`}>
                        {item.institutionName}
                      </Link>
                    </TableCell>
                    <TableCell>{item.dealerName}</TableCell>
                    <TableCell>{normalizeBusinessNumber(item.businessNumber)}</TableCell>
                    <TableCell>{formatYyyyMm(item.prescriptionMonth)}</TableCell>
                    <TableCell>{formatYyyyMm(item.settlementMonth)}</TableCell>
                    <TableCell>{formatYyyyMmDd(item.inputDate)}</TableCell>
                    <TableCell>{item.amount.toLocaleString()}</TableCell>
                    <TableCell>{PrescriptionPartnerStatusLabel[item.status]}</TableCell>
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
  );
}

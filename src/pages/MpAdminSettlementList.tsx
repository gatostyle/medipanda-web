import {
  DateString,
  getDownloadSettlementListExcel,
  getSettlements,
  type SettlementResponse,
  SettlementStatus,
  SettlementStatusLabel,
} from '@/backend';
import { setUrlParams } from '@/lib/utils/url';
import { useSearchParamsOrDefault } from '@/lib/hooks/useSearchParamsOrDefault';
import { MpSettlementUploadModal } from '@/components/MpSettlementUploadModal';
import { SearchFilterActions, MpSearchFilterBar, SearchFilterItem } from '@/components/MpSearchFilterBar';
import { useMpModal } from '@/hooks/useMpModal';
import { DATEFORMAT_YYYY_MM, formatYyyyMm, SafeDate } from '@/lib/utils/dateFormat';
import { type Sequenced, withSequence } from '@/lib/utils/withSequence';
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
import { useFormik } from 'formik';
import { DocumentDownload } from 'iconsax-reactjs';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';

export default function MpAdminSettlementList() {
  const navigate = useNavigate();

  const initialSearchParams = {
    searchType: '' as 'dealerId' | 'companyName' | '',
    searchKeyword: '',
    settlementMonth: '',
    status: '' as keyof typeof SettlementStatus | '',
    page: '1',
  };

  const {
    searchType,
    searchKeyword,
    settlementMonth: paramSettlementMonth,
    status,
    page: paramPage,
  } = useSearchParamsOrDefault(initialSearchParams);
  const settlementMonth = useMemo(() => SafeDate(paramSettlementMonth) ?? null, [paramSettlementMonth]);
  const page = Number(paramPage);
  const pageSize = 20;

  const [loading, setLoading] = useState(false);
  const [contents, setContents] = useState<Sequenced<SettlementResponse>[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const [settlementUploadModalOpen, setSettlementUploadModalOpen] = useState(false);

  const { alert, alertError } = useMpModal();

  const formik = useFormik({
    initialValues: {
      ...initialSearchParams,
      settlementMonth: null as Date | null,
      page: null,
    },
    onSubmit: async values => {
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
          settlementMonth: values.settlementMonth !== null ? formatYyyyMm(values.settlementMonth) : undefined,
          page: 1,
        },
        initialSearchParams,
      );

      navigate(url);
    },
    onReset: () => {
      navigate('');
    },
  });

  const fetchContents = async () => {
    setLoading(true);
    try {
      const response = await getSettlements({
        dealerName: undefined,
        dealerId: searchType === 'dealerId' && searchKeyword !== '' ? Number(searchKeyword) : undefined,
        companyName: searchType === 'companyName' && searchKeyword !== '' ? searchKeyword : undefined,
        status: status !== '' ? status : undefined,
        startMonth: settlementMonth ? new DateString(settlementMonth) : undefined,
        endMonth: settlementMonth ? new DateString(settlementMonth) : undefined,
        page: page - 1,
        size: pageSize,
      });

      setContents(withSequence(response).content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch settlement list:', error);
      await alertError('정산내역 목록을 불러오는 중 오류가 발생했습니다.');
      setContents([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    formik.setValues({
      status,
      settlementMonth,
      searchType,
      searchKeyword,
      page: null,
    });
    fetchContents();
  }, [searchType, searchKeyword, settlementMonth, status, page]);

  const handleSettlementUploadSuccess = () => {
    setSettlementUploadModalOpen(false);
    fetchContents();
  };

  return (
    <>
      <Stack sx={{ gap: 3 }}>
        <Typography variant='h4'>정산내역</Typography>

        <Card sx={{ padding: 3 }}>
          <MpSearchFilterBar component='form' onSubmit={formik.handleSubmit}>
            <SearchFilterItem minWidth={140}>
              <FormControl fullWidth size='small'>
                <InputLabel>사용자확인</InputLabel>
                <Select name='status' value={formik.values.status} onChange={formik.handleChange}>
                  {Object.keys(SettlementStatus).map(settlementStatus => (
                    <MenuItem key={settlementStatus} value={settlementStatus}>
                      {SettlementStatusLabel[settlementStatus]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </SearchFilterItem>
            <SearchFilterItem minWidth={140}>
              <FormControl fullWidth size='small'>
                <InputLabel>검색유형</InputLabel>
                <Select name='searchType' value={formik.values.searchType} onChange={formik.handleChange}>
                  <MenuItem value={'dealerId'}>딜러번호</MenuItem>
                  <MenuItem value={'companyName'}>회사명</MenuItem>
                </Select>
              </FormControl>
            </SearchFilterItem>
            <SearchFilterItem minWidth={140}>
              <DatePicker
                value={formik.values.settlementMonth}
                onChange={value => formik.setFieldValue('settlementMonth', value)}
                format={DATEFORMAT_YYYY_MM}
                views={['year', 'month']}
                label='정산월'
                slotProps={{
                  textField: {
                    size: 'small',
                  },
                }}
              />
            </SearchFilterItem>
            <SearchFilterItem flexGrow={1} minWidth={200}>
              <TextField
                name='searchKeyword'
                size='small'
                placeholder='검색어를 입력하세요'
                fullWidth
                value={formik.values.searchKeyword}
                onChange={formik.handleChange}
              />
            </SearchFilterItem>
            <SearchFilterActions>
              <Button variant='contained' size='small' type='submit'>
                검색
              </Button>
              <Button variant='outlined' size='small' onClick={() => formik.resetForm()}>
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
              <Button
                variant='contained'
                color='success'
                size='small'
                href={getDownloadSettlementListExcel({
                  dealerName: undefined,
                  dealerId: searchType === 'dealerId' && searchKeyword !== '' ? Number(searchKeyword) : undefined,
                  companyName: searchType === 'companyName' && searchKeyword !== '' ? searchKeyword : undefined,
                  status: status !== '' ? status : undefined,
                  startMonth: settlementMonth ? new DateString(settlementMonth) : undefined,
                  endMonth: settlementMonth ? new DateString(settlementMonth) : undefined,
                  size: 2 ** 31 - 1,
                })}
                target='_blank'
                startIcon={<DocumentDownload size={16} />}
              >
                Excel
              </Button>
              <Button variant='contained' color='success' size='small' onClick={() => setSettlementUploadModalOpen(true)}>
                파일 업로드
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
                  <TableCell width={100}>딜러번호</TableCell>
                  <TableCell width={100}>정산월</TableCell>
                  <TableCell width={150}>회사명</TableCell>
                  <TableCell width={100}>딜러명</TableCell>
                  <TableCell width={120}>처방금액</TableCell>
                  <TableCell width={120}>공급가액</TableCell>
                  <TableCell width={100}>세액</TableCell>
                  <TableCell width={120}>합계금액</TableCell>
                  <TableCell width={100}>사용자확인</TableCell>
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
                      <TableCell>{item.dealerId}</TableCell>
                      <TableCell>{formatYyyyMm(item.settlementMonth)}</TableCell>
                      <TableCell>{item.companyName}</TableCell>
                      <TableCell>
                        <Link component={RouterLink} to={`/admin/settlements/${item.id}`}>
                          {item.dealerName}
                        </Link>
                      </TableCell>
                      <TableCell>{item.prescriptionAmount.toLocaleString()}</TableCell>
                      <TableCell>{item.supplyAmount.toLocaleString()}</TableCell>
                      <TableCell>{item.taxAmount.toLocaleString()}</TableCell>
                      <TableCell>{item.totalAmount.toLocaleString()}</TableCell>
                      <TableCell>{item.status !== null ? SettlementStatusLabel[item.status] : '-'}</TableCell>
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

      <MpSettlementUploadModal
        open={settlementUploadModalOpen}
        onClose={() => setSettlementUploadModalOpen(false)}
        onSuccess={handleSettlementUploadSuccess}
      />
    </>
  );
}

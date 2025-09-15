import { setUrlParams } from '@/lib/url';
import { useSearchParamsOrDefault } from '@/lib/useSearchParamsOrDefault';
import { MpEdiUploadModal } from '@/medipanda/components/MpEdiUploadModal';
import { useMpModal } from '@/medipanda/hooks/useMpModal';
import {
  Box,
  Button,
  Chip,
  FormControl,
  Grid,
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
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import { useFormik } from 'formik';
import {
  confirmPrescription,
  DateTimeString,
  PrescriptionResponse,
  PrescriptionStatus,
  PrescriptionStatusLabel,
  searchPrescriptions,
} from '@/backend';
import { SearchFilterActions, SearchFilterBar, SearchFilterItem } from '@/medipanda/components/SearchFilterBar';
import { formatYyyyMm, formatYyyyMmDd, SafeDate } from '@/medipanda/utils/dateFormat';
import { Sequenced, withSequence } from '@/medipanda/utils/withSequence';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';

export default function MpAdminPrescriptionReceptionList() {
  const navigate = useNavigate();

  const initialSearchParams = {
    searchType: '' as 'companyName' | 'userId' | 'dealerName' | 'dealerId' | '',
    searchKeyword: '',
    startAt: '',
    endAt: '',
    status: '' as PrescriptionStatus | '',
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

  const formik = useFormik({
    initialValues: {
      ...initialSearchParams,
      startAt: null as Date | null,
      endAt: null as Date | null,
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
          startAt: values.startAt !== null ? formatYyyyMmDd(values.startAt) : undefined,
          endAt: values.endAt !== null ? formatYyyyMmDd(values.endAt) : undefined,
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

  const table = useReactTable({
    data: contents,
    columns: [
      {
        header: 'No',
        cell: ({ row }) => row.original.sequence,
        size: 60,
      },
      {
        header: '딜러번호',
        cell: ({ row }) => row.original.dealerId,
        size: 100,
      },
      {
        header: '아이디',
        cell: ({ row }) => row.original.userId,
        size: 120,
      },
      {
        header: '회사명',
        cell: ({ row }) => row.original.companyName,
        size: 150,
      },
      {
        header: '딜러명',
        cell: ({ row }) => row.original.dealerName,
        size: 100,
      },
      {
        header: '처방월',
        cell: ({ row }) => formatYyyyMm(row.original.prescriptionMonth),
        size: 100,
      },
      {
        header: '정산월',
        cell: ({ row }) => formatYyyyMm(row.original.settlementMonth),
        size: 100,
      },
      {
        header: '접수신청일',
        cell: ({ row }) => formatYyyyMmDd(row.original.submittedAt),
        size: 120,
      },
      {
        header: '접수파일',
        cell: ({ row }) => (
          <Button
            variant='contained'
            color='success'
            size='small'
            href={`/v1/prescriptions/partners/${row.original.id}/edi-files/download`}
            target='_blank'
          >
            다운로드
          </Button>
        ),
        size: 120,
      },
      {
        header: '접수상태',
        cell: ({ row }) => <Chip label={PrescriptionStatusLabel[row.original.status]} size='small' color='success' />,
        size: 100,
      },
      {
        header: '관리자확인',
        cell: ({ row }) =>
          row.original.status === PrescriptionStatus.PENDING ? (
            <Button variant='contained' color='success' size='small' onClick={() => handleConfirm(row.original.id)}>
              접수확인
            </Button>
          ) : (
            <Typography variant='body2'>{row.original.checkedAt ? formatYyyyMmDd(row.original.checkedAt) : '-'}</Typography>
          ),
        size: 120,
      },
    ],
    getCoreRowModel: getCoreRowModel(),
  });

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
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant='h4' gutterBottom>
            처방접수
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <MainCard content={false}>
            <Box sx={{ p: 3 }}>
              <SearchFilterBar component='form' onSubmit={formik.handleSubmit}>
                <SearchFilterItem minWidth={140}>
                  <FormControl fullWidth size='small'>
                    <InputLabel>접수상태</InputLabel>
                    <Select name='status' value={formik.values.status} onChange={formik.handleChange}>
                      {Object.keys(PrescriptionStatus).map(prescriptionStatus => (
                        <MenuItem key={prescriptionStatus} value={prescriptionStatus}>
                          {PrescriptionStatusLabel[prescriptionStatus]}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </SearchFilterItem>
                <SearchFilterItem minWidth={140}>
                  <FormControl fullWidth size='small'>
                    <InputLabel>검색유형</InputLabel>
                    <Select name='searchType' value={formik.values.searchType} onChange={formik.handleChange}>
                      <MenuItem value={'companyName'}>회사명</MenuItem>
                      <MenuItem value={'userId'}>아이디</MenuItem>
                      <MenuItem value={'dealerName'}>딜러명</MenuItem>
                      <MenuItem value={'dealerId'}>딜러번호</MenuItem>
                    </Select>
                  </FormControl>
                </SearchFilterItem>
                <SearchFilterItem minWidth={140}>
                  <DatePicker
                    value={formik.values.startAt}
                    onChange={value => formik.setFieldValue('startAt', value)}
                    format='yyyy-MM-dd'
                    views={['year', 'month', 'day']}
                    label='시작일'
                    slotProps={{
                      textField: {
                        size: 'small',
                      },
                    }}
                  />
                </SearchFilterItem>
                <SearchFilterItem minWidth={140}>
                  <DatePicker
                    value={formik.values.endAt}
                    onChange={value => formik.setFieldValue('endAt', value)}
                    format='yyyy-MM-dd'
                    views={['year', 'month', 'day']}
                    label='종료일'
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
              </SearchFilterBar>
            </Box>
          </MainCard>
        </Grid>

        <Grid item xs={12}>
          <MainCard content={false}>
            <Box sx={{ p: 2 }}>
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

              <ScrollX>
                <TableContainer>
                  <Table size='small'>
                    <TableHead>
                      {table.getHeaderGroups().map(headerGroup => (
                        <TableRow key={headerGroup.id}>
                          {headerGroup.headers.map(header => (
                            <TableCell key={header.id} style={{ width: header.getSize() }}>
                              {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableHead>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={table.getAllColumns().length} align='center' sx={{ py: 3 }}>
                            <Typography variant='body2' color='text.secondary'>
                              데이터를 로드하는 중입니다.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : table.getRowModel().rows.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={table.getAllColumns().length} align='center' sx={{ py: 3 }}>
                            <Typography variant='body2' color='text.secondary'>
                              검색 결과가 없습니다.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        table.getRowModel().rows.map(row => (
                          <TableRow key={row.id}>
                            {row.getVisibleCells().map(cell => (
                              <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                            ))}
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </ScrollX>

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
            </Box>
          </MainCard>
        </Grid>
      </Grid>

      <MpEdiUploadModal open={ediUploadModalOpen} onClose={() => setEdiUploadModalOpen(false)} onSuccess={handleEdiUploadSuccess} />
    </>
  );
}

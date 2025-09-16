import { setUrlParams } from '@/lib/url';
import { useSearchParamsOrDefault } from '@/lib/useSearchParamsOrDefault';
import { useMpModal } from '@/medipanda/hooks/useMpModal';
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
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useFormik } from 'formik';
import {
  completePrescriptionPartner,
  DateTimeString,
  deletePrescriptionPartner,
  getPrescriptionPartnerList,
  type PrescriptionPartnerResponse,
  PrescriptionPartnerStatus,
  PrescriptionPartnerStatusLabel,
} from '@/backend';
import { SearchFilterActions, SearchFilterBar, SearchFilterItem } from '@/medipanda/components/SearchFilterBar';
import { useMpDeleteDialog } from '@/medipanda/hooks/useMpDeleteDialog';
import { formatYyyyMm, formatYyyyMmDd, SafeDate } from '@/medipanda/utils/dateFormat';
import { type Sequenced, withSequence } from '@/medipanda/utils/withSequence';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';

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

  const formik = useFormik({
    initialValues: {
      ...initialSearchParams,
      prescriptionMonthStart: null as Date | null,
      prescriptionMonthEnd: null as Date | null,
      page: null,
    },
    onSubmit: async values => {
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
    },
    onReset: () => {
      navigate('');
    },
  });

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

  const table = useReactTable({
    data: contents,
    columns: [
      {
        id: 'select',
        header: () => (
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
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={selectedIds.includes(row.original.id)}
            onChange={e => {
              if (e.target.checked) {
                setSelectedIds(prev => [...prev, row.original.id]);
              } else {
                setSelectedIds(prev => prev.filter(id => id !== row.original.id));
              }
            }}
          />
        ),
        size: 50,
      },
      {
        header: 'No',
        cell: ({ row }) => row.original.sequence,
        size: 60,
      },
      {
        header: '제약사명',
        cell: ({ row }) => row.original.drugCompany,
        size: 120,
      },
      {
        header: '회사명',
        cell: ({ row }) => row.original.companyName,
        size: 120,
      },
      {
        header: '거래처코드',
        cell: ({ row }) => row.original.institutionCode,
        size: 100,
      },
      {
        header: '거래처명',
        cell: ({ row }) => (
          <Link component={RouterLink} to={`/admin/prescription-forms/${row.original.id}/products`}>
            {row.original.institutionName}
          </Link>
        ),
        size: 100,
      },
      {
        header: '딜러명',
        cell: ({ row }) => row.original.dealerName,
      },
      {
        header: '사업자등록번호',
        cell: ({ row }) => row.original.businessNumber,
        size: 130,
      },
      {
        header: '처방일',
        cell: ({ row }) => formatYyyyMm(row.original.prescriptionMonth),
        size: 100,
      },
      {
        header: '접수일',
        cell: ({ row }) => formatYyyyMm(row.original.settlementMonth),
        size: 100,
      },
      {
        header: '입력일',
        cell: ({ row }) => formatYyyyMmDd(row.original.inputDate),
        size: 100,
      },
      {
        header: '처방금액',
        cell: ({ row }) => `${row.original.amount.toLocaleString()}`,
        size: 100,
      },
      {
        header: '승인상태',
        cell: ({ row }) => PrescriptionPartnerStatusLabel[row.original.status],
        size: 80,
      },
    ],
    getCoreRowModel: getCoreRowModel(),
  });

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
        <SearchFilterBar component='form' onSubmit={formik.handleSubmit}>
          <SearchFilterItem minWidth={140}>
            <FormControl fullWidth size='small'>
              <InputLabel>상태</InputLabel>
              <Select name='status' value={formik.values.status} onChange={formik.handleChange}>
                {Object.keys(PrescriptionPartnerStatus).map(prescriptionStatus => (
                  <MenuItem key={prescriptionStatus} value={prescriptionStatus}>
                    {PrescriptionPartnerStatusLabel[prescriptionStatus]}
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
                <MenuItem value={'institutionName'}>거래처명</MenuItem>
                <MenuItem value={'dealerName'}>딜러명</MenuItem>
                <MenuItem value={'drugCompany'}>제약사명</MenuItem>
              </Select>
            </FormControl>
          </SearchFilterItem>
          <SearchFilterItem minWidth={140}>
            <DatePicker
              value={formik.values.prescriptionMonthStart}
              onChange={value => formik.setFieldValue('prescriptionMonthStart', value)}
              format='yyyy-MM'
              views={['year', 'month']}
              label='처방 시작월'
              slotProps={{
                textField: {
                  size: 'small',
                },
              }}
            />
          </SearchFilterItem>
          <SearchFilterItem minWidth={140}>
            <DatePicker
              value={formik.values.prescriptionMonthEnd}
              onChange={value => formik.setFieldValue('prescriptionMonthEnd', value)}
              format='yyyy-MM'
              views={['year', 'month']}
              label='처방 종료월'
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

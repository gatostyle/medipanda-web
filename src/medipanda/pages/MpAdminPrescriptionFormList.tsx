import {
  Box,
  Button,
  Checkbox,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Pagination,
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
import { flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import { useFormik } from 'formik';
import { NotImplementedError } from '@/medipanda/api-definitions/NotImplementedError';
import {
  completePrescriptionPartner,
  DateTimeString,
  deletePrescriptionPartner,
  getPrescriptionPartnerList,
  PrescriptionPartnerResponse,
} from '@/backend';
import MpFormikDatePicker from '@/medipanda/components/MpFormikDatePicker';
import { SearchFilterActions, SearchFilterBar, SearchFilterItem } from '@/medipanda/components/SearchFilterBar';
import { useMpDeleteDialog } from '@/medipanda/hooks/useMpDeleteDialog';
import { useMpErrorDialog } from '@/medipanda/hooks/useMpErrorDialog';
import { useMpInfoDialog } from '@/medipanda/hooks/useMpInfoDialog';
import { useMpNotImplementedDialog } from '@/medipanda/hooks/useMpNotImplementedDialog';
import { formatYyyyMm, formatYyyyMmDd } from '@/medipanda/utils/dateFormat';
import { Sequenced, withSequence } from '@/medipanda/utils/withSequence';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function MpAdminPrescriptionFormList() {
  const [data, setData] = useState<Sequenced<PrescriptionPartnerResponse>[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const notImplementedDialog = useMpNotImplementedDialog();
  const infoDialog = useMpInfoDialog();
  const errorDialog = useMpErrorDialog();
  const deleteDialog = useMpDeleteDialog();

  const formik = useFormik({
    initialValues: {
      searchType: '' as 'companyName' | 'dealerName' | 'drugCompany' | '',
      searchKeyword: '',
      status: '' as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | '',
      prescriptionMonthStart: null as Date | null,
      prescriptionMonthEnd: null as Date | null,
      pageIndex: 0,
      pageSize: 20,
    },
    onSubmit: async () => {
      if (formik.values.pageIndex !== 0) {
        await formik.setFieldValue('pageIndex', 0);
      } else {
        await fetchData();
      }
    },
  });

  const handleApprove = async () => {
    try {
      await Promise.all(selectedItems.map(id => completePrescriptionPartner(id)));
      const count = selectedItems.length;
      const message = count === 1 ? '처방이 승인되었습니다.' : `${count}개 처방이 승인되었습니다.`;
      infoDialog.showInfo(message);
      setSelectedItems([]);
      fetchData();
    } catch (error) {
      if (error instanceof NotImplementedError) {
        notImplementedDialog.open(error.message);
      } else {
        console.error('Failed to approve prescriptions:', error);
        errorDialog.showError('처방 승인 중 오류가 발생했습니다.');
      }
    }
  };

  const table = useReactTable({
    data,
    columns: [
      {
        id: 'select',
        header: () => (
          <Checkbox
            checked={selectedItems.length === data.length && data.length > 0}
            onChange={e => {
              if (e.target.checked) {
                setSelectedItems(data.map(item => item.id));
              } else {
                setSelectedItems([]);
              }
            }}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={selectedItems.includes(row.original.id)}
            onChange={e => {
              if (e.target.checked) {
                setSelectedItems(prev => [...prev, row.original.id]);
              } else {
                setSelectedItems(prev => prev.filter(id => id !== row.original.id));
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
          <Link to={`/admin/prescription-forms/${row.original.id}/products`} style={{ textDecoration: 'none', color: '#1976d2' }}>
            {row.original.dealerName}
          </Link>
        ),
        size: 100,
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
        cell: ({ row }) => {
          const status = row.original.status;

          const labels = {
            PENDING: '승인대기',
            IN_PROGRESS: '승인진행중',
            COMPLETED: '승인완료',
          };

          return labels[status];
        },
        size: 80,
      },
    ],
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      pagination: {
        pageIndex: formik.values.pageIndex,
        pageSize: formik.values.pageSize,
      },
    },
    pageCount: totalPages,
    manualPagination: true,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getPrescriptionPartnerList({
        status: formik.values.status !== '' ? formik.values.status : undefined,
        companyName: formik.values.searchType === 'companyName' ? formik.values.searchKeyword : undefined,
        drugCompany: formik.values.searchType === 'drugCompany' ? formik.values.searchKeyword : undefined,
        dealerName: formik.values.searchType === 'dealerName' ? formik.values.searchKeyword : undefined,
        prescriptionMonthStart: formik.values.prescriptionMonthStart ? new DateTimeString(formik.values.prescriptionMonthStart) : undefined,
        prescriptionMonthEnd: formik.values.prescriptionMonthEnd ? new DateTimeString(formik.values.prescriptionMonthEnd) : undefined,
        page: formik.values.pageIndex,
        size: formik.values.pageSize,
      });

      setData(withSequence(response).content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch prescription form list:', error);
      errorDialog.showError('처방입력 목록을 불러오는 중 오류가 발생했습니다.');
      setData([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [formik.values.pageIndex, formik.values.pageSize]);

  const handleReset = () => {
    formik.resetForm();
  };

  const handleDelete = () => {
    if (selectedItems.length === 0) {
      infoDialog.showInfo('삭제할 처방을 선택해주세요.');
      return;
    }

    deleteDialog.open({
      title: '처방 삭제',
      message: `선택한 ${selectedItems.length}개의 처방을 삭제하시겠습니까?`,
      onConfirm: async () => {
        try {
          await Promise.all(selectedItems.map(id => deletePrescriptionPartner(id)));
          infoDialog.showInfo('처방이 삭제되었습니다.');
          setSelectedItems([]);
          fetchData();
        } catch (error) {
          if (error instanceof NotImplementedError) {
            notImplementedDialog.open(error.message);
          } else {
            console.error('Failed to delete prescriptions:', error);
            errorDialog.showError('처방 삭제에 실패했습니다.');
          }
        }
      },
    });
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant='h4' gutterBottom>
          처방입력
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <MainCard content={false}>
          <Box sx={{ p: 3 }}>
            <form onSubmit={formik.handleSubmit}>
              <SearchFilterBar>
                <SearchFilterItem minWidth={140}>
                  <FormControl fullWidth size='small'>
                    <InputLabel>상태</InputLabel>
                    <Select name='status' value={formik.values.status} onChange={formik.handleChange}>
                      <MenuItem value={'PENDING'}>승인대기</MenuItem>
                      <MenuItem value={'COMPLETED'}>승인완료</MenuItem>
                    </Select>
                  </FormControl>
                </SearchFilterItem>
                <SearchFilterItem minWidth={140}>
                  <FormControl fullWidth size='small'>
                    <InputLabel>검색유형</InputLabel>
                    <Select name='searchType' value={formik.values.searchType} onChange={formik.handleChange}>
                      <MenuItem value={'companyName'}>회사명</MenuItem>
                      <MenuItem value={'dealerName'}>딜러명</MenuItem>
                      <MenuItem value={'drugCompany'}>제약사명</MenuItem>
                    </Select>
                  </FormControl>
                </SearchFilterItem>
                <SearchFilterItem minWidth={140}>
                  <MpFormikDatePicker name='prescriptionMonthStart' label='시작일' formik={formik} />
                </SearchFilterItem>
                <SearchFilterItem minWidth={140}>
                  <MpFormikDatePicker name='prescriptionMonthEnd' label='종료일' formik={formik} />
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
                  <Button variant='outlined' size='small' onClick={handleReset}>
                    초기화
                  </Button>
                </SearchFilterActions>
              </SearchFilterBar>
            </form>
          </Box>
        </MainCard>
      </Grid>

      <Grid item xs={12}>
        <MainCard content={false}>
          <Box sx={{ p: 2 }}>
            <Stack direction='row' justifyContent='space-between' alignItems='center' mb={2}>
              <Stack direction='row' spacing={2}>
                <Typography variant='subtitle1'>검색결과: {totalElements.toLocaleString()} 건</Typography>
                <Typography variant='subtitle1' sx={{ ml: 2 }}>
                  총 처방금액: {data.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}원
                </Typography>
              </Stack>
              <Stack direction='row' spacing={1}>
                <Button variant='contained' color='success' size='small' onClick={handleApprove} disabled={selectedItems.length === 0}>
                  승인완료
                </Button>
                <Button variant='contained' size='small' color='error' disabled={selectedItems.length === 0} onClick={handleDelete}>
                  삭제
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
                page={formik.values.pageIndex + 1}
                onChange={(_, value) => formik.setFieldValue('pageIndex', value - 1)}
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
  );
}

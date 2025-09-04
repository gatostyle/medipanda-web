import {
  Box,
  Button,
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
import { InquiryResponseStatusFilter, InquirySearchType } from '@/medipanda/api-definitions/MpInquiry';
import { BoardPostResponse, getBoards } from '@/medipanda/backend';
import MpFormikDatePicker from '@/medipanda/components/MpFormikDatePicker';
import { SearchFilterActions, SearchFilterBar, SearchFilterItem } from '@/medipanda/components/SearchFilterBar';
import { useMpErrorDialog } from '@/medipanda/hooks/useMpErrorDialog';
import { formatYyyyMmDd } from '@/medipanda/utils/dateFormat';
import { Sequenced, withSequence } from '@/medipanda/utils/withSequence';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface BoardPostResponseWithMockData extends BoardPostResponse {
  drugCompany: string;
  responseCreatedAt: string | null;
  responseStatus: 'PENDING' | 'COMPLETED';
}

function withMock<T extends BoardPostResponse>(data: T): T & BoardPostResponseWithMockData {
  return {
    ...data,
    userId: '아이디',
    name: '사용자명',
    drugCompany: '제약사명',
    responseCreatedAt: '2025-01-01',
    responseStatus: Math.random() > 0.5 ? 'PENDING' : 'COMPLETED',
  };
}

export default function MpAdminInquiryList() {
  const [data, setData] = useState<Sequenced<BoardPostResponseWithMockData>[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const errorDialog = useMpErrorDialog();

  const formik = useFormik({
    initialValues: {
      responseStatusFilter: InquiryResponseStatusFilter.ALL,
      searchType: InquirySearchType.MEMBER_NAME,
      searchKeyword: '',
      startAt: null as Date | null,
      endAt: null as Date | null,
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

  const table = useReactTable({
    data,
    columns: [
      {
        header: 'No',
        cell: ({ row }) => row.original.sequence,
        size: 60,
      },
      {
        header: '회원번호',
        cell: ({ row }) => row.original.id,
        size: 100,
      },
      {
        header: '아이디',
        cell: ({ row }) => row.original.userId,
        size: 120,
      },
      {
        header: '회원명',
        cell: ({ row }) => row.original.name,
        size: 100,
      },
      {
        header: '회사명',
        cell: ({ row }) => row.original.drugCompany,
        size: 150,
      },
      {
        header: '제목',
        cell: ({ row }) => (
          <Link to={`/admin/inquiries/${row.original.id}`} style={{ textDecoration: 'none', color: '#1976d2' }}>
            {row.original.title}
          </Link>
        ),
        size: 250,
      },
      {
        header: '문의일',
        cell: ({ row }) => formatYyyyMmDd(row.original.createdAt),
        size: 100,
      },
      {
        header: '답변일',
        cell: ({ row }) => {
          const value = row.original.responseCreatedAt;

          return value !== null ? formatYyyyMmDd(value) : '-';
        },
        size: 100,
      },
      {
        header: '처리상태',
        cell: ({ row }) => {
          switch (row.original.responseStatus) {
            case 'PENDING':
              return '처리중';
            case 'COMPLETED':
              return '처리완료';
          }
        },
        size: 100,
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
      const response = await getBoards({
        boardType: 'INQUIRY',
        page: formik.values.pageIndex,
        size: formik.values.pageSize,
        // responseStatusFilter: formik.values.responseStatusFilter,
        name: formik.values.searchType === InquirySearchType.MEMBER_NAME ? formik.values.searchKeyword : undefined,
        drugCompany: formik.values.searchType === InquirySearchType.COMPANY_NAME ? formik.values.searchKeyword : undefined,
        userId: formik.values.searchType === InquirySearchType.USER_ID ? formik.values.searchKeyword : undefined,
        // startDate: formik.values.startAt ? new DateString(formik.values.startAt) : undefined,
        // endDate: formik.values.endAt ? new DateString(formik.values.endAt) : undefined
      });
      setData(withSequence(response).content.map(withMock));
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch inquiry list:', error);
      errorDialog.showError('1:1 문의내역을 불러오는 중 오류가 발생했습니다.');
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

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant='h4' gutterBottom>
          1:1 문의내역
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <MainCard content={false}>
          <Box sx={{ p: 3 }}>
            <form onSubmit={formik.handleSubmit}>
              <SearchFilterBar>
                <SearchFilterItem minWidth={140}>
                  <FormControl fullWidth size='small'>
                    <InputLabel>처리상태</InputLabel>
                    <Select name='responseStatusFilter' value={formik.values.responseStatusFilter} onChange={formik.handleChange}>
                      <MenuItem value={InquiryResponseStatusFilter.ALL}>처리상태(전체)</MenuItem>
                      <MenuItem value={InquiryResponseStatusFilter.WAITING}>답변대기중</MenuItem>
                      <MenuItem value={InquiryResponseStatusFilter.COMPLETED}>답변완료</MenuItem>
                    </Select>
                  </FormControl>
                </SearchFilterItem>
                <SearchFilterItem minWidth={140}>
                  <FormControl fullWidth size='small'>
                    <InputLabel>검색유형</InputLabel>
                    <Select name='searchType' value={formik.values.searchType} onChange={formik.handleChange}>
                      <MenuItem value={InquirySearchType.MEMBER_NAME}>회원명</MenuItem>
                      <MenuItem value={InquirySearchType.COMPANY_NAME}>회사명</MenuItem>
                      <MenuItem value={InquirySearchType.USER_ID}>아이디</MenuItem>
                    </Select>
                  </FormControl>
                </SearchFilterItem>
                <SearchFilterItem minWidth={140}>
                  <MpFormikDatePicker name='startAt' label='시작일' formik={formik} />
                </SearchFilterItem>
                <SearchFilterItem minWidth={140}>
                  <MpFormikDatePicker name='endAt' label='종료일' formik={formik} />
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

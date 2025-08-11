import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import MenuItem from '@mui/material/MenuItem';
import Pagination from '@mui/material/Pagination';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import { useFormik } from 'formik';
import { InquiryResponseStatusFilter, InquirySearchType } from 'medipanda/api-definitions/MpInquiry';
import { BoardPostResponse, getBoards } from 'medipanda/backend';
import MpFormikDatePicker from 'medipanda/components/MpFormikDatePicker';
import { formatYyyyMmDd } from 'medipanda/utils/dateFormat';
import { Sequenced, withSequence } from 'medipanda/utils/withSequence';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
    responseStatus: Math.random() > 0.5 ? 'PENDING' : 'COMPLETED'
  };
}

export default function MpAdminInquiryList() {
  const navigate = useNavigate();
  const [data, setData] = useState<Sequenced<BoardPostResponseWithMockData>[]>([]);
  const [, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const formik = useFormik({
    initialValues: {
      responseStatusFilter: InquiryResponseStatusFilter.ALL,
      searchType: InquirySearchType.MEMBER_NAME,
      searchKeyword: '',
      startAt: null as Date | null,
      endAt: null as Date | null,
      pageIndex: 0,
      pageSize: 20
    },
    onSubmit: () => {
      if (formik.values.pageIndex !== 0) {
        formik.setFieldValue('pageIndex', 0);
      } else {
        fetchData();
      }
    }
  });

  const columns = useMemo<ColumnDef<Sequenced<BoardPostResponseWithMockData>>[]>(
    () => [
      {
        header: 'No',
        accessorKey: 'sequence',
        cell: ({ row }) => row.original.sequence,
        size: 60
      },
      {
        header: '회원번호',
        accessorKey: 'id',
        cell: ({ row }) => row.original.id,
        size: 100
      },
      {
        header: '아이디',
        accessorKey: 'userId',
        cell: ({ row }) => row.original.userId,
        size: 120
      },
      {
        header: '회원명',
        accessorKey: 'name',
        cell: ({ row }) => row.original.name,
        size: 100
      },
      {
        header: '회사명',
        accessorKey: 'drugCompany',
        cell: ({ row }) => row.original.drugCompany,
        size: 150
      },
      {
        header: '제목',
        accessorKey: 'title',
        cell: ({ row }) => (
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate(`/admin/inquiries/${row.original.id}`)}
            sx={{ textDecoration: 'none', color: '#1976d2' }}
          >
            {row.original.title}
          </Link>
        ),
        size: 250
      },
      {
        header: '문의일',
        accessorKey: 'createdAt',
        cell: ({ row }) => formatYyyyMmDd(row.original.createdAt),
        size: 100
      },
      {
        header: '답변일',
        accessorKey: 'responseCreatedAt',
        cell: ({ row }) => {
          const value = row.original.responseCreatedAt;

          return value !== null ? formatYyyyMmDd(value) : '-';
        },
        size: 100
      },
      {
        header: '처리상태',
        accessorKey: 'responseStatus',
        cell: ({ row }) => {
          switch (row.original.responseStatus) {
            case 'PENDING':
              return '처리중';
            case 'COMPLETED':
              return '처리완료';
          }
        },
        size: 100
      }
    ],
    [navigate]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      pagination: {
        pageIndex: formik.values.pageIndex,
        pageSize: formik.values.pageSize
      }
    },
    pageCount: totalPages,
    manualPagination: true
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
        userId: formik.values.searchType === InquirySearchType.USER_ID ? formik.values.searchKeyword : undefined
        // startDate: formik.values.startAt ? new DateString(formik.values.startAt) : undefined,
        // endDate: formik.values.endAt ? new DateString(formik.values.endAt) : undefined
      });
      setData(withSequence(response).content.map(withMock));
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch inquiry list:', error);
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

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          1:1 문의내역
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <MainCard content={false}>
          <Box sx={{ p: 3 }}>
            <form onSubmit={formik.handleSubmit}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={1.5}>
                  <FormControl fullWidth size="small">
                    <Select
                      name="responseStatusFilter"
                      value={formik.values.responseStatusFilter}
                      onChange={(e) => formik.setFieldValue('responseStatusFilter', e.target.value)}
                      displayEmpty
                    >
                      <MenuItem value={InquiryResponseStatusFilter.ALL}>처리상태(전체)</MenuItem>
                      <MenuItem value={InquiryResponseStatusFilter.WAITING}>답변대기중</MenuItem>
                      <MenuItem value={InquiryResponseStatusFilter.COMPLETED}>답변완료</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={1.5}>
                  <FormControl fullWidth size="small">
                    <Select
                      name="searchType"
                      value={formik.values.searchType}
                      onChange={(e) => formik.setFieldValue('searchType', e.target.value)}
                    >
                      <MenuItem value={InquirySearchType.MEMBER_NAME}>회원명</MenuItem>
                      <MenuItem value={InquirySearchType.COMPANY_NAME}>회사명</MenuItem>
                      <MenuItem value={InquirySearchType.USER_ID}>아이디</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <MpFormikDatePicker name="startAt" label="시작일" formik={formik} />
                </Grid>
                <Grid item xs={12} md={2}>
                  <MpFormikDatePicker name="endAt" label="종료일" formik={formik} />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    name="searchKeyword"
                    size="small"
                    placeholder="검색어를 입력하세요"
                    onKeyPress={(e: React.KeyboardEvent) => e.key === 'Enter' && formik.handleSubmit()}
                    fullWidth
                    value={formik.values.searchKeyword}
                    onChange={formik.handleChange}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <Button variant="contained" color="primary" size="medium" type="submit" fullWidth>
                    검색
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Box>
        </MainCard>
      </Grid>

      <Grid item xs={12}>
        <MainCard content={false}>
          <Box sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="flex-start" alignItems="center" mb={2}>
              <Typography variant="subtitle1">검색결과: {totalElements.toLocaleString()} 건</Typography>
            </Stack>

            <ScrollX>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableCell key={header.id} style={{ width: header.getSize() }}>
                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableHead>
                  <TableBody>
                    {table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </ScrollX>

            <Stack direction="row" justifyContent="center" sx={{ mt: 2 }}>
              <Pagination
                count={totalPages}
                page={formik.values.pageIndex + 1}
                onChange={(_, value) => formik.setFieldValue('pageIndex', value - 1)}
                color="primary"
                variant="outlined"
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

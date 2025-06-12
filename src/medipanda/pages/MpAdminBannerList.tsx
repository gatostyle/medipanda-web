import { useEffect, useMemo, useState } from 'react';
import { useFormik } from 'formik';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
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
import Pagination from '@mui/material/Pagination';
import { SearchFilterBar, SearchFilterItem, SearchFilterActions } from 'medipanda/components/SearchFilterBar';
import MpFormikDatePicker from 'medipanda/components/MpFormikDatePicker';
import { BannerResponse, getBanners, DateTimeString } from 'medipanda/backend';
import { Sequenced } from 'medipanda/utils/withSequence';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { withSequence } from 'medipanda/utils/withSequence';

export default function MpAdminBannerList() {
  const [data, setData] = useState<Sequenced<BannerResponse>[]>([]);
  const [, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20
  });

  const formik = useFormik({
    initialValues: {
      bannerStatus: '' as 'VISIBLE' | 'HIDDEN' | '',
      startAt: null as Date | null,
      endAt: null as Date | null,
      bannerTitle: ''
    },
    onSubmit: (values) => {
      setPagination({ ...pagination, pageIndex: 0 });
    }
  });

  const columns = useMemo<ColumnDef<Sequenced<BannerResponse>>[]>(
    () => [
      {
        header: 'No',
        accessorKey: 'sequence',
        size: 60
      },
      {
        header: '배너위치',
        accessorKey: 'position',
        cell: ({ row }) => {
          const position = row.original.position;
          switch (position) {
            case 'POPUP':
              return '팝업배너';
            case 'PC_MAIN':
              return 'PC 메인';
            case 'PC_COMMUNITY':
              return 'PC 커뮤니티';
            case 'MOB_MAIN':
              return 'Mob 메인';
            default:
              return position;
          }
        },
        size: 120
      },
      {
        header: '배너제목',
        accessorKey: 'title',
        cell: ({ row }) => (
          <Link to={`/admin/banners/${row.original.id}/edit`} style={{ textDecoration: 'none', color: '#1976d2' }}>
            {row.original.title}
          </Link>
        ),
        size: 200
      },
      {
        header: '노출상태',
        accessorKey: 'status',
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <Chip
              label={status === 'VISIBLE' ? '노출' : '미노출'}
              color={status === 'VISIBLE' ? 'success' : 'default'}
              variant="light"
              size="small"
            />
          );
        },
        size: 100
      },
      {
        header: '노출범위',
        accessorKey: 'scope',
        cell: ({ row }) => {
          const scope = row.original.scope;
          switch (scope) {
            case 'ENTIRE':
              return '전체';
            case 'CONTRACT':
              return '계약';
            case 'NON_CONTRACT':
              return '미계약';
            default:
              return scope;
          }
        },
        size: 100
      },
      {
        header: '게시기간',
        accessorKey: 'startAt',
        cell: ({ row }) => {
          return `${format(new Date(row.original.startAt), 'yyyy-MM-dd HH:mm')} ~ ${format(new Date(row.original.endAt), 'yyyy-MM-dd HH:mm')}`;
        },
        size: 300
      },
      {
        header: '등록일',
        accessorKey: 'startAt',
        cell: ({ row }) => {
          return format(new Date(row.original.startAt), 'yyyy-MM-dd HH:mm');
        },
        size: 150
      },
      {
        header: '노출순서',
        accessorKey: 'displayOrder',
        size: 80
      },
      {
        header: '노출수',
        accessorKey: 'viewCount',
        cell: ({ row }) => row.original.viewCount.toLocaleString(),
        size: 100
      },
      {
        header: '클릭수',
        accessorKey: 'clickCount',
        cell: ({ row }) => row.original.clickCount.toLocaleString(),
        size: 100
      },
      {
        header: 'CTR',
        accessorKey: 'ctr',
        cell: ({ row }) => `${row.original.ctr}%`,
        size: 80
      }
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      pagination
    },
    onPaginationChange: setPagination,
    pageCount: totalPages,
    manualPagination: true
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getBanners({
        page: pagination.pageIndex,
        size: pagination.pageSize,
        startAt: formik.values.startAt ? new DateTimeString(formik.values.startAt) : undefined,
        endAt: formik.values.endAt ? new DateTimeString(formik.values.endAt) : undefined,
        bannerTitle: formik.values.bannerTitle !== '' ? formik.values.bannerTitle : undefined,
        bannerStatus: formik.values.bannerStatus !== '' ? formik.values.bannerStatus : undefined
      });

      setData(withSequence(response).content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch banner list:', error);
      setData([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pagination.pageIndex, pagination.pageSize, formik.values]);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h4">배너관리</Typography>
      </Grid>

      <Grid item xs={12}>
        <MainCard content={false}>
          <Box sx={{ p: 2 }}>
            <form onSubmit={formik.handleSubmit}>
              <SearchFilterBar>
                <SearchFilterItem minWidth={140}>
                  <FormControl fullWidth size="small">
                    <Select
                      name="bannerStatus"
                      value={formik.values.bannerStatus}
                      onChange={(e) => formik.setFieldValue('bannerStatus', e.target.value)}
                      displayEmpty
                    >
                      <MenuItem value="">상태(전체)</MenuItem>
                      <MenuItem value={'VISIBLE'}>노출</MenuItem>
                      <MenuItem value={'HIDDEN'}>미노출</MenuItem>
                    </Select>
                  </FormControl>
                </SearchFilterItem>
                <SearchFilterItem minWidth={140}>
                  <MpFormikDatePicker name="startAt" label="시작일" formik={formik} />
                </SearchFilterItem>
                <SearchFilterItem minWidth={140}>
                  <MpFormikDatePicker name="endAt" label="종료일" formik={formik} />
                </SearchFilterItem>
                <SearchFilterItem flexGrow={1} minWidth={200}>
                  <TextField
                    name="bannerTitle"
                    size="small"
                    placeholder="배너제목을 입력해주세요"
                    onKeyPress={(e: React.KeyboardEvent) => e.key === 'Enter' && formik.handleSubmit()}
                    fullWidth
                    value={formik.values.bannerTitle}
                    onChange={formik.handleChange}
                  />
                </SearchFilterItem>
                <SearchFilterActions>
                  <Button variant="contained" size="small" type="submit">
                    검색
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
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1">검색결과: {totalElements.toLocaleString()} 건</Typography>
              <Button
                variant="contained"
                size="small"
                sx={{ backgroundColor: '#4caf50', '&:hover': { backgroundColor: '#45a049' } }}
                component={Link}
                to="/admin/banners/new"
              >
                등록하기
              </Button>
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
                page={pagination.pageIndex + 1}
                onChange={(event, value) => {
                  setPagination({ ...pagination, pageIndex: value - 1 });
                }}
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

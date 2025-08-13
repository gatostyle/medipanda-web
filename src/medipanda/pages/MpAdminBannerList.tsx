import {
  Box,
  Button,
  Chip,
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
  Typography
} from '@mui/material';
import { ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import { useFormik } from 'formik';
import { BannerResponse, DateTimeString, getBanners } from 'medipanda/backend';
import MpFormikDatePicker from 'medipanda/components/MpFormikDatePicker';
import { SearchFilterActions, SearchFilterBar, SearchFilterItem } from 'medipanda/components/SearchFilterBar';
import { useMpErrorDialog } from 'medipanda/hooks/useMpErrorDialog';
import { formatYyyyMmDd, formatYyyyMmDdHhMm } from 'medipanda/utils/dateFormat';
import { Sequenced, withSequence } from 'medipanda/utils/withSequence';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function MpAdminBannerList() {
  const [data, setData] = useState<Sequenced<BannerResponse>[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const errorDialog = useMpErrorDialog();

  const formik = useFormik({
    initialValues: {
      bannerStatus: '' as 'VISIBLE' | 'HIDDEN' | '',
      startAt: null as Date | null,
      endAt: null as Date | null,
      bannerTitle: '',
      pageIndex: 0,
      pageSize: 20
    },
    onSubmit: async () => {
      if (formik.values.pageIndex !== 0) {
        await formik.setFieldValue('pageIndex', 0);
      } else {
        await fetchData();
      }
    }
  });

  const handleReset = () => {
    formik.resetForm();
  };

  const columns: ColumnDef<Sequenced<BannerResponse>>[] = [
    {
      header: 'No',
      accessorKey: 'sequence',
      cell: ({ row }) => row.original.sequence,
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
        return `${formatYyyyMmDdHhMm(row.original.startAt)} ~ ${formatYyyyMmDdHhMm(row.original.endAt)}`;
      },
      size: 300
    },
    {
      header: '등록일',
      accessorKey: 'startAt',
      cell: ({ row }) => {
        return formatYyyyMmDd(row.original.startAt);
      },
      size: 150
    },
    {
      header: '노출순서',
      accessorKey: 'displayOrder',
      cell: ({ row }) => row.original.displayOrder,
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
  ];

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
      const response = await getBanners({
        page: formik.values.pageIndex,
        size: formik.values.pageSize,
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
      errorDialog.showError('배너 목록을 불러오는 중 오류가 발생했습니다.');
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
          배너관리
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <MainCard content={false}>
          <Box sx={{ p: 3 }}>
            <form onSubmit={formik.handleSubmit}>
              <SearchFilterBar>
                <SearchFilterItem minWidth={140}>
                  <FormControl fullWidth size="small">
                    <InputLabel>상태</InputLabel>
                    <Select name="bannerStatus" value={formik.values.bannerStatus} onChange={formik.handleChange}>
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
                    placeholder="검색어를 입력하세요"
                    fullWidth
                    value={formik.values.bannerTitle}
                    onChange={formik.handleChange}
                  />
                </SearchFilterItem>
                <SearchFilterActions>
                  <Button variant="contained" size="small" type="submit">
                    검색
                  </Button>
                  <Button variant="outlined" size="small" onClick={handleReset}>
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
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Stack direction="row" spacing={2}>
                <Typography variant="subtitle1">검색결과: {totalElements.toLocaleString()} 건</Typography>
              </Stack>
              <Stack direction="row" spacing={1}>
                <Button variant="contained" color="success" size="small" component={Link} to="/admin/banners/new">
                  등록
                </Button>
              </Stack>
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
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={columns.length} align="center" sx={{ py: 3 }}>
                          <Typography variant="body2" color="text.secondary">
                            데이터를 로드하는 중입니다.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : table.getRowModel().rows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={columns.length} align="center" sx={{ py: 3 }}>
                          <Typography variant="body2" color="text.secondary">
                            검색 결과가 없습니다.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      table.getRowModel().rows.map((row) => (
                        <TableRow key={row.id}>
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                          ))}
                        </TableRow>
                      ))
                    )}
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

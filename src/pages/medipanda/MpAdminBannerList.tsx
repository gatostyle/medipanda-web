import { useEffect, useMemo, useState } from 'react';
import { useFormik } from 'formik';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Pagination from '@mui/material/Pagination';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import { Link } from 'react-router-dom';
import { ColumnDef, flexRender, getCoreRowModel, getSortedRowModel, useReactTable, SortingState } from '@tanstack/react-table';
import { MpPagedResponse } from 'api-definitions/MpPaged';
import { mpFetchBanners, MpBanner } from 'api-definitions/MpBanner';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import { useMpErrorDialog } from 'hooks/medipanda/useMpErrorDialog';

interface FormValues {
  pageSize: number;
  pageIndex: number;
  sorting: SortingState;
  state: boolean | null;
  position: string;
  title: string;
  startDate?: string;
  endDate?: string;
}

export default function MpAdminBannerList() {
  const emptyData = useMemo(() => [], []);
  const [pagedResponse, setPagedResponse] = useState<MpPagedResponse<MpBanner> | null>(null);
  const { showError } = useMpErrorDialog();

  const { values, handleChange, submitForm } = useFormik<FormValues>({
    initialValues: {
      pageSize: 10,
      pageIndex: 0,
      sorting: [],
      state: null,
      position: '',
      title: '',
      startDate: '',
      endDate: ''
    },
    onSubmit: async (values) => {
      try {
        const response = await mpFetchBanners({
          page: values.pageIndex,
          size: values.pageSize,
          position: values.position,
          title: values.title,
          state: values.state === null ? undefined : values.state,
          startAt: values.startDate || undefined,
          endAt: values.endDate || undefined
        });
        setPagedResponse(response);
      } catch (error) {
        console.error('Failed to fetch banners:', error);
        showError('배너 목록을 불러오는 중 오류가 발생했습니다.');
      }
    }
  });

  const columns: ColumnDef<MpBanner>[] = [
    {
      header: 'No',
      cell: ({ row }) => row.index + 1
    },
    {
      header: '배너위치',
      cell: ({ row }) => row.original.position
    },
    {
      header: '배너제목',
      cell: ({ row }) => row.original.title
    },
    {
      header: '노출상태',
      cell: ({ row }) => (row.original.state ? '노출' : '미노출')
    },
    {
      header: '노출범위',
      cell: ({ row }) => {
        const s = row.original.scope;
        if (s.contracted && s.nonContracted) return '전체';
        if (s.contracted) return '계약';
        if (s.nonContracted) return '미계약';
        return '-';
      }
    },
    {
      header: '게시기간',
      cell: ({ row }) => `${row.original.startAt} ~ ${row.original.endAt}`
    },
    {
      header: '등록일',
      cell: ({ row }) => row.original.createdAt
    },
    {
      header: '노출순서',
      cell: ({ row }) => row.original.order
    },
    {
      header: '노출수',
      cell: ({ row }) => row.original.impressions
    },
    {
      header: '조회수',
      cell: ({ row }) => row.original.views
    },
    {
      header: 'CTR',
      cell: ({ row }) => row.original.ctr + '%'
    },
    {
      header: '관리',
      cell: ({ row }) => (
        <Button component={Link} to={`edit?id=${row.original.id}`} variant="contained">
          수정
        </Button>
      )
    }
  ];

  const table = useReactTable({
    data: pagedResponse?.content ?? emptyData,
    columns,
    state: { sorting: values.sorting },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel()
  });

  useEffect(() => {
    submitForm();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <h2>배너관리</h2>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth>
                  <InputLabel sx={{ lineHeight: 1 }}>노출상태</InputLabel>
                  <Select
                    name="state"
                    value={values.state === null ? '' : values.state.toString()}
                    onChange={(e) => {
                      const value = e.target.value;
                      handleChange({
                        target: {
                          name: 'state',
                          value: value === '' ? null : value === 'true'
                        }
                      });
                    }}
                  >
                    <MenuItem value="">전체</MenuItem>
                    <MenuItem value="true">노출</MenuItem>
                    <MenuItem value="false">미노출</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField
                  fullWidth
                  type="date"
                  name="startDate"
                  value={values.startDate}
                  onChange={handleChange}
                  InputLabelProps={{
                    shrink: true
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField
                  fullWidth
                  type="date"
                  name="endDate"
                  value={values.endDate}
                  onChange={handleChange}
                  InputLabelProps={{
                    shrink: true
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField fullWidth name="title" placeholder="배너제목을 입력해주세요" value={values.title} onChange={handleChange} />
              </Grid>
              <Grid item>
                <Button variant="contained" onClick={() => submitForm()} sx={{ bgcolor: '#6B7280' }}>
                  검색
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            검색결과: <strong>{pagedResponse?.totalElements ?? 0}</strong> 건
          </div>
          <Button variant="contained" component={Link} to="edit">
            등록하기
          </Button>
        </Grid>

        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} sx={{ backgroundColor: '#F3F4F6' }}>
                    {headerGroup.headers.map((header) => (
                      <TableCell key={header.id} sx={{ fontWeight: 600, color: '#374151', fontSize: '14px', py: 1.5 }}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableHead>
              <TableBody>
                {pagedResponse === null ? (
                  <TableRow>
                    <TableCell colSpan={12}>불러오는 중...</TableCell>
                  </TableRow>
                ) : pagedResponse.content.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12}>데이터가 없습니다.</TableCell>
                  </TableRow>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.original.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination
            count={pagedResponse?.totalPages ?? 0}
            page={values.pageIndex + 1}
            onChange={(_, page) => {
              handleChange({
                target: {
                  name: 'pageIndex',
                  value: page - 1
                }
              });
              submitForm();
            }}
            color="primary"
          />
        </Grid>
      </Grid>
    </Box>
  );
}

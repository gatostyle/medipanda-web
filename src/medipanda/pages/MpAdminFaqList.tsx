import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
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
import { BoardPostResponse, DateString, deleteBoardPost, getBoards } from 'medipanda/backend';
import MpFormikDatePicker from 'medipanda/components/MpFormikDatePicker';
import { useMpDeleteDialog } from 'medipanda/hooks/useMpDeleteDialog';
import { Sequenced, withSequence } from 'medipanda/utils/withSequence';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatYyyyMmDd } from '../utils/dateFormat';

export default function MpAdminFaqList() {
  const [data, setData] = useState<Sequenced<BoardPostResponse>[]>([]);
  const [, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const deleteDialog = useMpDeleteDialog();

  const formik = useFormik({
    initialValues: {
      visible: 'all' as 'all' | 'visible' | 'hidden',
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

  const columns = useMemo<ColumnDef<Sequenced<BoardPostResponse>>[]>(
    () => [
      {
        id: 'select',
        header: () => (
          <Checkbox
            checked={selectedItems.length === data.length && data.length > 0}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedItems(data.map((item) => item.id));
              } else {
                setSelectedItems([]);
              }
            }}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={selectedItems.includes(row.original.id)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedItems((prev) => [...prev, row.original.id]);
              } else {
                setSelectedItems((prev) => prev.filter((id) => id !== row.original.id));
              }
            }}
          />
        ),
        size: 50
      },
      {
        header: 'No',
        accessorKey: 'sequence',
        cell: ({ row }) => row.original.sequence,
        size: 80
      },
      {
        header: '제목',
        accessorKey: 'title',
        cell: ({ row }) => (
          <Link to={`/admin/faqs/${row.original.id}`} style={{ textDecoration: 'none', color: '#1976d2' }}>
            {row.original.title}
          </Link>
        )
      },
      {
        header: '상태',
        accessorKey: 'isExposed',
        cell: ({ row }) => {
          const isExposed = row.original.isExposed;
          return <Chip label={isExposed ? '노출' : '미노출'} color={isExposed ? 'success' : 'default'} variant="light" size="small" />;
        },
        size: 100
      },
      {
        header: '조회수',
        accessorKey: 'viewsCount',
        cell: ({ row }) => row.original.viewsCount.toLocaleString(),
        size: 100
      },
      {
        header: '작성일',
        accessorKey: 'createdAt',
        cell: ({ row }) => {
          return formatYyyyMmDd(row.original.createdAt);
        },
        size: 120
      }
    ],
    [data, selectedItems]
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
        boardType: 'FAQ',
        userId: undefined,
        name: undefined,
        nickname: undefined,
        startAt: formik.values.startAt ? new DateString(formik.values.startAt) : undefined,
        endAt: formik.values.endAt ? new DateString(formik.values.endAt) : undefined,
        page: formik.values.pageIndex,
        size: formik.values.pageSize,
        filterBlind: undefined,
        boardTitle: formik.values.searchKeyword !== '' ? formik.values.searchKeyword : undefined,
        filterDeleted: undefined,
        isExposed: formik.values.visible === 'all' ? undefined : formik.values.visible === 'visible'
      });

      setData(withSequence(response).content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch FAQ list:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [formik.values.pageIndex, formik.values.pageSize]);

  const handleDelete = () => {
    const count = selectedItems.length;
    const message =
      count === 1
        ? `FAQ "${data.find((item) => item.id === selectedItems[0])?.title}"을 삭제하시겠습니까?`
        : `${count}건이 선택되었습니다. 삭제하시겠습니까?`;

    deleteDialog.open({
      message,
      onConfirm: async () => {
        try {
          await Promise.all(selectedItems.map((id) => deleteBoardPost(id)));
          setSelectedItems([]);
          fetchData();
        } catch (error) {
          console.error('Failed to delete items:', error);
        }
      }
    });
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          FAQ
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <MainCard content={false}>
          <Box sx={{ p: 2 }}>
            <form onSubmit={formik.handleSubmit}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <Select value={formik.values.visible} onChange={(e) => formik.setFieldValue('visible', e.target.value)} displayEmpty>
                    <MenuItem value="all">상태(전체)</MenuItem>
                    <MenuItem value="visible">노출</MenuItem>
                    <MenuItem value="hidden">미노출</MenuItem>
                  </Select>
                </FormControl>
                <Box sx={{ width: 150 }}>
                  <MpFormikDatePicker name="startAt" placeholder="시작일" formik={formik} />
                </Box>
                <Box sx={{ width: 150 }}>
                  <MpFormikDatePicker name="endAt" placeholder="종료일" formik={formik} />
                </Box>
                <TextField
                  name="searchKeyword"
                  size="small"
                  placeholder="검색어를 입력하세요"
                  onKeyPress={(e: React.KeyboardEvent) => e.key === 'Enter' && formik.handleSubmit()}
                  sx={{ flex: 1 }}
                  value={formik.values.searchKeyword}
                  onChange={formik.handleChange}
                />
                <Button variant="contained" size="small" type="submit" sx={{ px: 3 }}>
                  검색
                </Button>
              </Stack>
            </form>
          </Box>
        </MainCard>
      </Grid>

      <Grid item xs={12}>
        <MainCard content={false}>
          <Box sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1">검색결과: {totalElements.toLocaleString()} 건</Typography>
              <Stack direction="row" spacing={1}>
                <Button variant="contained" size="small" color="error" disabled={selectedItems.length === 0} onClick={handleDelete}>
                  삭제
                </Button>
                <Button variant="contained" size="small" color="success" component={Link} to="/admin/faqs/new">
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

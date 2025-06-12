import { useEffect, useMemo, useState } from 'react';
import { useFormik } from 'formik';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import { ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import Pagination from '@mui/material/Pagination';
import Checkbox from '@mui/material/Checkbox';
import { SearchFilterBar, SearchFilterItem, SearchFilterActions } from 'medipanda/components/SearchFilterBar';
import MpFormikDatePicker from 'medipanda/components/MpFormikDatePicker';
import { getBoards, deleteBoardPost, BoardPostResponse, DateString } from 'medipanda/backend';
import { useMpDeleteDialog } from 'medipanda/hooks/useMpDeleteDialog';
import { Sequenced } from 'medipanda/utils/withSequence';
import { Link } from 'react-router-dom';
import { withSequence } from 'medipanda/utils/withSequence';

export default function MpAdminContentManagementAtoZList() {
  const [data, setData] = useState<Sequenced<BoardPostResponse>[]>([]);
  const [, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const deleteDialog = useMpDeleteDialog();

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20
  });

  const formik = useFormik({
    initialValues: {
      visible: undefined as boolean | undefined,
      searchKeyword: '',
      startAt: null as Date | null,
      endAt: null as Date | null
    },
    onSubmit: (values) => {
      setPagination({ ...pagination, pageIndex: 0 });
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
        size: 80
      },
      {
        header: '제목',
        accessorKey: 'title',
        cell: ({ row }) => (
          <Link to={`/admin/atoz/${row.original.id}`} style={{ textDecoration: 'none', color: '#1976d2' }}>
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
        header: '조회 수',
        accessorKey: 'viewsCount',
        cell: ({ row }) => {
          const value = row.original.viewsCount;
          return value.toLocaleString();
        },
        size: 100
      },
      {
        header: '작성일',
        accessorKey: 'createdAt',
        cell: ({ row }) => {
          const value = row.original.createdAt;
          if (!value) return '-';
          try {
            const date = new Date(value);
            if (isNaN(date.getTime())) return value;
            return date
              .toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
              })
              .replace(/\. /g, '-')
              .replace('.', '');
          } catch {
            return value;
          }
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
      pagination
    },
    onPaginationChange: setPagination,
    pageCount: totalPages,
    manualPagination: true
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getBoards({
        boardType: 'CSO_A_TO_Z',
        userId: undefined,
        name: undefined,
        nickname: undefined,
        startAt: formik.values.startAt ? new DateString(formik.values.startAt) : undefined,
        endAt: formik.values.endAt ? new DateString(formik.values.endAt) : undefined,
        page: pagination.pageIndex,
        size: pagination.pageSize,
        filterBlind: undefined,
        boardTitle: formik.values.searchKeyword !== '' ? formik.values.searchKeyword : undefined,
        filterDeleted: undefined,
        isExposed: formik.values.visible
      });

      setData(withSequence(response).content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch CSO A to Z list:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pagination.pageIndex, pagination.pageSize, formik.values]);

  const handleReset = () => {
    formik.resetForm();
    setPagination({ ...pagination, pageIndex: 0 });
  };

  const handleDelete = () => {
    const count = selectedItems.length;
    const message =
      count === 1
        ? `CSO A TO Z ${data.find((item) => item.id === selectedItems[0])?.title}를 삭제하시겠습니까?`
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
          CSO A TO Z
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <MainCard content={false}>
          <Box sx={{ p: 3 }}>
            <form onSubmit={formik.handleSubmit}>
              <SearchFilterBar>
                <SearchFilterItem minWidth={140}>
                  <FormControl fullWidth size="small">
                    <InputLabel>상태(전체)</InputLabel>
                    <Select
                      value={formik.values.visible === undefined ? 'ALL' : formik.values.visible ? 'VISIBLE' : 'HIDDEN'}
                      label="상태(전체)"
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === 'ALL') {
                          formik.setFieldValue('visible', undefined);
                        } else if (value === 'VISIBLE') {
                          formik.setFieldValue('visible', true);
                        } else {
                          formik.setFieldValue('visible', false);
                        }
                      }}
                    >
                      <MenuItem value="ALL">전체</MenuItem>
                      <MenuItem value="VISIBLE">노출</MenuItem>
                      <MenuItem value="HIDDEN">미노출</MenuItem>
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
                    name="searchKeyword"
                    size="small"
                    placeholder="검색어를 입력하세요"
                    onKeyPress={(e: React.KeyboardEvent) => e.key === 'Enter' && formik.handleSubmit()}
                    fullWidth
                    value={formik.values.searchKeyword}
                    onChange={formik.handleChange}
                  />
                </SearchFilterItem>
                <SearchFilterActions>
                  <Button variant="contained" color="primary" size="small" type="submit">
                    검색
                  </Button>
                  <Button variant="outlined" color="inherit" size="small" onClick={handleReset}>
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
              <Typography variant="subtitle1">검색결과: {totalElements.toLocaleString()} 건</Typography>
              <Stack direction="row" spacing={1}>
                <Button variant="contained" color="error" size="small" disabled={selectedItems.length === 0} onClick={handleDelete}>
                  삭제
                </Button>
                <Button variant="contained" color="success" size="small" component={Link} to="/admin/atoz/new">
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

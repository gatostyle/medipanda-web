import { useEffect, useMemo, useState } from 'react';
import { useFormik } from 'formik';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
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
import { Sequenced } from 'medipanda/utils/withSequence';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useMpNotImplementedDialog } from 'medipanda/hooks/useMpNotImplementedDialog';
import { useMpInfoDialog } from 'medipanda/hooks/useMpInfoDialog';
import { useMpErrorDialog } from 'medipanda/hooks/useMpErrorDialog';
import { NotImplementedError } from 'medipanda/api-definitions/NotImplementedError';
import { useMpDeleteDialog } from 'medipanda/hooks/useMpDeleteDialog';
import { DateString, EventBoardSummaryResponse, getEventBoards, softDeleteEventBoard } from 'medipanda/backend';
import { EVENT_STATUS_LABELS } from 'medipanda/ui-labels';
import { withSequence } from 'medipanda/utils/withSequence';

export default function MpAdminEventList() {
  const [data, setData] = useState<Sequenced<EventBoardSummaryResponse>[]>([]);
  const [, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const notImplementedDialog = useMpNotImplementedDialog();
  const infoDialog = useMpInfoDialog();
  const errorDialog = useMpErrorDialog();
  const deleteDialog = useMpDeleteDialog();

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20
  });

  const formik = useFormik({
    initialValues: {
      status: '' as '' | 'IN_PROGRESS' | 'FINISHED',
      startAt: null as Date | null,
      endAt: null as Date | null,
      searchKeyword: ''
    },
    onSubmit: (values) => {
      setPagination({ ...pagination, pageIndex: 0 });
    }
  });

  const columns = useMemo<ColumnDef<Sequenced<EventBoardSummaryResponse>>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            indeterminate={table.getIsSomePageRowsSelected()}
            onChange={(event) => {
              table.toggleAllPageRowsSelected(event.target.checked);
              if (event.target.checked) {
                setSelectedRows(data.map((row) => row.id));
              } else {
                setSelectedRows([]);
              }
            }}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onChange={(event) => {
              row.toggleSelected(event.target.checked);
              if (event.target.checked) {
                setSelectedRows([...selectedRows, row.original.id]);
              } else {
                setSelectedRows(selectedRows.filter((id) => id !== row.original.id));
              }
            }}
          />
        ),
        size: 50
      },
      {
        header: 'No',
        accessorKey: 'sequence',
        size: 60
      },
      {
        header: '이벤트 상태',
        accessorKey: 'eventStatus',
        cell: ({ row }) => {
          const status = row.original.eventStatus;
          return (
            <Chip
              label={EVENT_STATUS_LABELS[status]}
              color={status === 'IN_PROGRESS' ? 'success' : 'default'}
              variant="light"
              size="small"
            />
          );
        },
        size: 100
      },
      {
        header: '썸네일',
        accessorKey: 'thumbnailUrl',
        cell: ({ row }) => {
          const thumbnail = row.original.thumbnailUrl;
          if (thumbnail) {
            return (
              <Box sx={{ width: 80, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img
                  src={thumbnail}
                  alt="썸네일"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'cover',
                    borderRadius: '4px'
                  }}
                />
              </Box>
            );
          }
          return <Box sx={{ width: 80, height: 60, bgcolor: 'grey.200', borderRadius: 1 }} />;
        },
        size: 100
      },
      {
        header: '제목',
        accessorKey: 'title',
        cell: ({ row }) => (
          <Link to={`/admin/events/${row.original.id}`} style={{ textDecoration: 'none', color: '#1976d2' }}>
            {row.original.title}
          </Link>
        ),
        size: 300
      },
      {
        header: '조회 수',
        accessorKey: 'viewCount',
        cell: ({ row }) => row.original.viewCount.toLocaleString(),
        size: 100
      },
      {
        header: '작성일',
        accessorKey: 'createdDate',
        cell: ({ row }) => {
          return format(new Date(row.original.createdDate), 'yyyy-MM-dd');
        },
        size: 120
      },
      {
        header: '노출상태',
        accessorKey: 'isExposed',
        cell: ({ row }) => {
          const isExposed = row.original.isExposed;
          return <Chip label={isExposed ? '노출' : '미노출'} color={isExposed ? 'primary' : 'default'} variant="light" size="small" />;
        },
        size: 100
      },
      {
        header: '이벤트 기간',
        accessorKey: 'eventStartAt',
        cell: ({ row }) => {
          return `${format(new Date(row.original.eventStartAt), 'yyyy-MM-dd')} ~ ${format(new Date(row.original.eventEndAt), 'yyyy-MM-dd')}`;
        },
        size: 250
      }
    ],
    [data, selectedRows]
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
      const response = await getEventBoards({
        status: formik.values.status !== '' ? formik.values.status : undefined,
        title: formik.values.searchKeyword !== '' ? formik.values.searchKeyword : undefined,
        startAt: formik.values.startAt ? new DateString(formik.values.startAt) : undefined,
        endAt: formik.values.endAt ? new DateString(formik.values.endAt) : undefined,
        page: pagination.pageIndex,
        size: pagination.pageSize
      });

      setData(withSequence(response).content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch event list:', error);
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

  const handleReset = () => {
    formik.resetForm();
    setPagination({ ...pagination, pageIndex: 0 });
  };

  const handleDelete = () => {
    if (selectedRows.length === 0) {
      infoDialog.showInfo('삭제할 이벤트를 선택해주세요.');
      return;
    }

    deleteDialog.open({
      title: '이벤트 삭제',
      message: `선택한 ${selectedRows.length}개의 이벤트를 삭제하시겠습니까?`,
      onConfirm: async () => {
        try {
          await Promise.all(selectedRows.map((id) => softDeleteEventBoard(id)));
          infoDialog.showInfo('이벤트가 삭제되었습니다.');
          setSelectedRows([]);
          fetchData();
        } catch (error) {
          if (error instanceof NotImplementedError) {
            notImplementedDialog.open(error.message);
          } else {
            console.error('Failed to delete events:', error);
            errorDialog.showError('이벤트 삭제에 실패했습니다.');
          }
        }
      }
    });
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          이벤트관리
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <MainCard content={false}>
          <Box sx={{ p: 3 }}>
            <form onSubmit={formik.handleSubmit}>
              <SearchFilterBar>
                <SearchFilterItem minWidth={140}>
                  <FormControl fullWidth size="small">
                    <Select
                      name="status"
                      value={formik.values.status}
                      onChange={(e) => formik.setFieldValue('status', e.target.value)}
                      displayEmpty
                    >
                      <MenuItem value="">전체</MenuItem>
                      <MenuItem value={'FINISHED'}>종료</MenuItem>
                      <MenuItem value={'IN_PROGRESS'}>진행중</MenuItem>
                    </Select>
                  </FormControl>
                </SearchFilterItem>
                <SearchFilterItem minWidth={140}>
                  <MpFormikDatePicker name="startAt" label="시작일" formik={formik} />
                </SearchFilterItem>
                <SearchFilterItem minWidth={140}>
                  <MpFormikDatePicker name="endAt" label="종룼일" formik={formik} />
                </SearchFilterItem>
                <SearchFilterItem flexGrow={1} minWidth={200}>
                  <TextField
                    name="searchKeyword"
                    size="small"
                    placeholder="검색어를 입력해주세요"
                    onKeyPress={(e: React.KeyboardEvent) => e.key === 'Enter' && formik.handleSubmit()}
                    fullWidth
                    value={formik.values.searchKeyword}
                    onChange={formik.handleChange}
                  />
                </SearchFilterItem>
                <SearchFilterActions>
                  <Stack direction="row" spacing={1}>
                    <Button variant="contained" size="small" type="submit">
                      검색
                    </Button>
                    <Button variant="outlined" size="small" onClick={handleReset}>
                      초기화
                    </Button>
                  </Stack>
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
                <Button variant="contained" size="small" color="error" disabled={selectedRows.length === 0} onClick={handleDelete}>
                  삭제
                </Button>
                <Button variant="contained" size="small" color="success" component={Link} to="/admin/events/new">
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

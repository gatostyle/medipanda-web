import {
  Box,
  Button,
  Checkbox,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  Link,
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
import { DateString, EventBoardSummaryResponse, getEventBoards, softDeleteEventBoard } from '@/backend';
import MpFormikDatePicker from '@/medipanda/components/MpFormikDatePicker';
import { SearchFilterActions, SearchFilterBar, SearchFilterItem } from '@/medipanda/components/SearchFilterBar';
import { useMpDeleteDialog } from '@/medipanda/hooks/useMpDeleteDialog';
import { useMpErrorDialog } from '@/medipanda/hooks/useMpErrorDialog';
import { useMpInfoDialog } from '@/medipanda/hooks/useMpInfoDialog';
import { EVENT_STATUS_LABELS } from '@/medipanda/ui-labels';
import { formatYyyyMmDd } from '@/medipanda/utils/dateFormat';
import { Sequenced, withSequence } from '@/medipanda/utils/withSequence';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

export default function MpAdminEventList() {
  const [data, setData] = useState<Sequenced<EventBoardSummaryResponse>[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const infoDialog = useMpInfoDialog();
  const errorDialog = useMpErrorDialog();
  const deleteDialog = useMpDeleteDialog();

  const formik = useFormik({
    initialValues: {
      status: '' as 'IN_PROGRESS' | 'FINISHED' | '',
      startAt: null as Date | null,
      endAt: null as Date | null,
      searchKeyword: '',
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
        header: '이벤트 상태',
        cell: ({ row }) => {
          const status = row.original.eventStatus;
          return (
            <Chip
              label={EVENT_STATUS_LABELS[status]}
              color={status === 'IN_PROGRESS' ? 'success' : 'default'}
              variant='light'
              size='small'
            />
          );
        },
        size: 100,
      },
      {
        header: '썸네일',
        cell: ({ row }) => {
          const thumbnail = row.original.thumbnailUrl;
          if (thumbnail) {
            return (
              <Box sx={{ width: 80, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img
                  src={thumbnail}
                  alt='썸네일'
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'cover',
                    borderRadius: '4px',
                  }}
                />
              </Box>
            );
          }
          return <Box sx={{ width: 80, height: 60, bgcolor: 'grey.200', borderRadius: 1 }} />;
        },
        size: 100,
      },
      {
        header: '제목',
        cell: ({ row }) => (
          <Link component={RouterLink} to={`/admin/events/${row.original.id}`} style={{ textDecoration: 'none', color: '#1976d2' }}>
            {row.original.title}
          </Link>
        ),
        size: 300,
      },
      {
        header: '조회 수',
        cell: ({ row }) => row.original.viewCount.toLocaleString(),
        size: 100,
      },
      {
        header: '작성일',
        cell: ({ row }) => {
          return formatYyyyMmDd(row.original.createdDate);
        },
        size: 120,
      },
      {
        header: '노출상태',
        cell: ({ row }) => {
          const isExposed = row.original.isExposed;
          return <Chip label={isExposed ? '노출' : '미노출'} color={isExposed ? 'primary' : 'default'} variant='light' size='small' />;
        },
        size: 100,
      },
      {
        header: '이벤트 기간',
        cell: ({ row }) => {
          return `${formatYyyyMmDd(row.original.eventStartAt)} ~ ${formatYyyyMmDd(row.original.eventEndAt)}`;
        },
        size: 250,
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
      const response = await getEventBoards({
        status: formik.values.status !== '' ? formik.values.status : undefined,
        title: formik.values.searchKeyword !== '' ? formik.values.searchKeyword : undefined,
        startAt: formik.values.startAt ? new DateString(formik.values.startAt) : undefined,
        endAt: formik.values.endAt ? new DateString(formik.values.endAt) : undefined,
        page: formik.values.pageIndex,
        size: formik.values.pageSize,
      });

      setData(withSequence(response).content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch event list:', error);
      errorDialog.showError('이벤트 목록을 불러오는 중 오류가 발생했습니다.');
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
      infoDialog.showInfo('삭제할 이벤트를 선택해주세요.');
      return;
    }

    deleteDialog.open({
      title: '이벤트 삭제',
      message: `선택한 ${selectedItems.length}개의 이벤트를 삭제하시겠습니까?`,
      onConfirm: async () => {
        try {
          await Promise.all(selectedItems.map(id => softDeleteEventBoard(id)));
          infoDialog.showInfo('이벤트가 삭제되었습니다.');
          setSelectedItems([]);
          fetchData();
        } catch (error) {
          console.error('Failed to delete events:', error);
          errorDialog.showError('이벤트 삭제에 실패했습니다.');
        }
      },
    });
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant='h4' gutterBottom>
          이벤트관리
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
                      <MenuItem value={'IN_PROGRESS'}>진행중</MenuItem>
                      <MenuItem value={'FINISHED'}>종료</MenuItem>
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
                    placeholder='검색어를 입력해주세요'
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
              <Stack direction='row' spacing={1}>
                <Button variant='contained' size='small' color='error' disabled={selectedItems.length === 0} onClick={handleDelete}>
                  삭제
                </Button>
                <Button variant='contained' size='small' color='success' component={RouterLink} to='/admin/events/new'>
                  등록
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

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
  Typography
} from '@mui/material';
import { ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import { useFormik } from 'formik';
import { BoardPostResponse, DateString, deleteBoardPost, getBoards, getDrugCompanies } from 'medipanda/backend';
import MpFormikDatePicker from 'medipanda/components/MpFormikDatePicker';
import { SearchFilterActions, SearchFilterBar, SearchFilterItem } from 'medipanda/components/SearchFilterBar';
import { useMpDeleteDialog } from 'medipanda/hooks/useMpDeleteDialog';
import { useMpErrorDialog } from 'medipanda/hooks/useMpErrorDialog';
import { BOARD_TYPE_LABELS, EXPOSURE_RANGE_LABELS, NOTICE_TYPE_LABELS } from 'medipanda/ui-labels';
import { formatYyyyMmDd } from 'medipanda/utils/dateFormat';
import { Sequenced, withSequence } from 'medipanda/utils/withSequence';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface BoardPostResponseWithMockData extends BoardPostResponse {
  drugCompany: string;
}

function withMock<T extends BoardPostResponse>(data: T): T & BoardPostResponseWithMockData {
  return {
    ...data,
    drugCompany: '제약사명'
  };
}

export default function MpAdminNoticeList() {
  const [data, setData] = useState<Sequenced<BoardPostResponseWithMockData>[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [manufacturerOptions, setManufacturerOptions] = useState<string[]>([]);
  const deleteDialog = useMpDeleteDialog();
  const errorDialog = useMpErrorDialog();

  const formik = useFormik({
    initialValues: {
      isExposed: '' as boolean | '',
      drugCompany: '',
      searchKeyword: '',
      startAt: null as Date | null,
      endAt: null as Date | null,
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

  const columns: ColumnDef<Sequenced<BoardPostResponseWithMockData>>[] = [
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
      size: 60
    },
    {
      header: '게시판',
      accessorKey: 'boardType',
      cell: ({ row }) => BOARD_TYPE_LABELS[row.original.boardType],
      size: 100
    },
    {
      header: '공지분류',
      accessorKey: 'noticeType',
      cell: ({ row }) => {
        const noticeType = row.original.noticeType;
        if (!noticeType) return '-';
        return NOTICE_TYPE_LABELS[noticeType];
      },
      size: 100
    },
    {
      header: '제약사명',
      accessorKey: 'drugCompany',
      cell: ({ row }) => row.original.drugCompany,
      size: 120
    },
    {
      header: '제목',
      accessorKey: 'title',
      cell: ({ row }) => (
        <Link to={`/admin/notices/${row.original.id}`} style={{ textDecoration: 'none', color: '#1976d2' }}>
          {row.original.title}
        </Link>
      )
    },
    {
      header: '상태',
      accessorKey: 'isExposed',
      cell: ({ row }) => (row.original.isExposed ? '노출' : '미노출'),
      size: 80
    },
    {
      header: '노출범위',
      accessorKey: 'exposureRange',
      cell: ({ row }) => EXPOSURE_RANGE_LABELS[row.original.exposureRange],
      size: 80
    },
    {
      header: '조회수',
      accessorKey: 'viewsCount',
      cell: ({ row }) => row.original.viewsCount.toLocaleString(),
      size: 80
    },
    {
      header: '작성일',
      accessorKey: 'createdAt',
      cell: ({ row }) => formatYyyyMmDd(row.original.createdAt),
      size: 100
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
      const response = await getBoards({
        boardType: 'NOTICE',
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
        isExposed: formik.values.isExposed !== '' ? formik.values.isExposed : undefined,
        drugCompany: formik.values.drugCompany !== '' ? formik.values.drugCompany : undefined
      });

      setData(withSequence(response).content.map(withMock));
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch notice list:', error);
      errorDialog.showError('공지사항 목록을 불러오는 중 오류가 발생했습니다.');
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

  useEffect(() => {
    const fetchManufacturers = async () => {
      try {
        const manufacturers = await getDrugCompanies();
        setManufacturerOptions(manufacturers);
      } catch (error) {
        console.error('Failed to fetch manufacturer list:', error);
        errorDialog.showError('제약사 목록을 불러오는 중 오류가 발생했습니다.');
      }
    };
    fetchManufacturers();
  }, []);

  const handleReset = () => {
    formik.resetForm();
  };

  const handleDelete = () => {
    const count = selectedItems.length;
    const message =
      count === 1
        ? `공지사항 ${data.find((item) => item.id === selectedItems[0])?.title}을 삭제하시겠습니까?`
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
          errorDialog.showError('삭제 중 오류가 발생했습니다.');
        }
      }
    });
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          공지사항
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
                      name="isExposed"
                      label="상태(전체)"
                      value={formik.values.isExposed}
                      onChange={(e) => formik.setFieldValue('isExposed', e.target.value === 'true')}
                    >
                      <MenuItem value={'true'}>노출</MenuItem>
                      <MenuItem value={'false'}>미노출</MenuItem>
                    </Select>
                  </FormControl>
                </SearchFilterItem>
                <SearchFilterItem minWidth={140}>
                  <FormControl fullWidth size="small">
                    <InputLabel>제약사명</InputLabel>
                    <Select name="drugCompany" label="제약사명" value={formik.values.drugCompany} onChange={formik.handleChange}>
                      {manufacturerOptions.map((manufacturer) => (
                        <MenuItem key={manufacturer} value={manufacturer}>
                          {manufacturer}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </SearchFilterItem>
                <SearchFilterItem minWidth={140}>
                  <MpFormikDatePicker name="startAt" placeholder="시작일" formik={formik} />
                </SearchFilterItem>
                <SearchFilterItem minWidth={140}>
                  <MpFormikDatePicker name="endAt" placeholder="종료일" formik={formik} />
                </SearchFilterItem>
                <SearchFilterItem flexGrow={1} minWidth={200}>
                  <TextField
                    name="searchKeyword"
                    size="small"
                    placeholder="검색어를 입력하세요"
                    fullWidth
                    value={formik.values.searchKeyword}
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
                <Button variant="contained" color="error" size="small" disabled={selectedItems.length === 0} onClick={handleDelete}>
                  삭제
                </Button>
                <Button variant="contained" color="success" size="small" component={Link} to="/admin/notices/new">
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

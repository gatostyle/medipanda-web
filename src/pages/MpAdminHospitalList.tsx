import { setUrlParams } from '@/lib/utils/url';
import { useSearchParamsOrDefault } from '@/lib/hooks/useSearchParamsOrDefault';
import { MpHospitalUploadModal } from '@/components/MpHospitalUploadModal';
import { useMpModal } from '@/hooks/useMpModal';
import {
  Button,
  Card,
  Checkbox,
  FormControl,
  InputLabel,
  MenuItem,
  Pagination,
  PaginationItem,
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
import { DatePicker } from '@mui/x-date-pickers';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useFormik } from 'formik';
import {
  DateTimeString,
  getAllSido,
  getHospitals,
  getSigunguBySido,
  type HospitalResponse,
  type RegionCategoryResponse,
  softDeleteHospital,
} from '@/backend';
import { SearchFilterActions, MpSearchFilterBar, SearchFilterItem } from '@/components/MpSearchFilterBar';
import { useMpDeleteDialog } from '@/hooks/useMpDeleteDialog';
import { DATEFORMAT_YYYY_MM_DD, formatYyyyMmDd, SafeDate } from '@/lib/utils/dateFormat';
import { type Sequenced, withSequence } from '@/lib/utils/withSequence';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';

export default function MpAdminHospitalList() {
  const navigate = useNavigate();

  const initialSearchParams = {
    searchKeyword: '',
    sido: '-1',
    sigungu: '-1',
    startDate: '',
    endDate: '',
    page: '1',
  };

  const {
    searchKeyword,
    sido: paramSido,
    sigungu: paramSigungu,
    startDate: paramStartDate,
    endDate: paramEndDate,
    page: paramPage,
  } = useSearchParamsOrDefault(initialSearchParams);
  const sido = Number(paramSido);
  const sigungu = Number(paramSigungu);
  const startDate = useMemo(() => SafeDate(paramStartDate) ?? null, [paramStartDate]);
  const endDate = useMemo(() => SafeDate(paramEndDate) ?? null, [paramEndDate]);
  const page = Number(paramPage);
  const pageSize = 20;

  const [loading, setLoading] = useState(false);
  const [contents, setContents] = useState<Sequenced<HospitalResponse>[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const [sidoList, setSidoList] = useState<RegionCategoryResponse[]>([]);
  const [sigunguList, setSigunguList] = useState<Record<number, RegionCategoryResponse[]>>({});

  const [hospitalUploadModalOpen, setHospitalUploadModalOpen] = useState(false);

  const { alert, alertError } = useMpModal();
  const { enqueueSnackbar } = useSnackbar();
  const deleteDialog = useMpDeleteDialog();

  const formik = useFormik({
    initialValues: {
      ...initialSearchParams,
      sido: -1,
      sigungu: -1,
      startDate: null as Date | null,
      endDate: null as Date | null,
      page: null,
    },
    onSubmit: async values => {
      const url = setUrlParams(
        {
          ...values,
          startDate: values.startDate !== null ? formatYyyyMmDd(values.startDate) : undefined,
          endDate: values.endDate !== null ? formatYyyyMmDd(values.endDate) : undefined,
          page: 1,
        },
        initialSearchParams,
      );

      navigate(url);
    },
    onReset: () => {
      navigate('');
    },
  });

  const fetchContents = async () => {
    setLoading(true);
    try {
      const response = await getHospitals({
        regionCategoryId: sigungu !== -1 ? sigungu : sido !== -1 ? sido : undefined,
        hospitalName: searchKeyword !== '' ? searchKeyword : undefined,
        startDate: startDate ? new DateTimeString(startDate) : undefined,
        endDate: endDate ? new DateTimeString(endDate) : undefined,
        page: page - 1,
        size: pageSize,
      });
      setContents(withSequence(response).content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch hospital list:', error);
      await alertError('개원병원 목록을 불러오는 중 오류가 발생했습니다.');
      setContents([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    formik.setValues({
      searchKeyword,
      sido,
      sigungu,
      startDate,
      endDate,
      page: null,
    });
    fetchContents();
  }, [searchKeyword, sido, sigungu, startDate, endDate, page]);

  const fetchRegionData = async () => {
    try {
      const sidoContents = await getAllSido();
      setSidoList(sidoContents);

      const sigunguContents = await Promise.all(sidoContents.map(async sido => [sido.id, await getSigunguBySido(sido.id)]));
      setSigunguList(Object.fromEntries(sigunguContents));
    } catch (e) {
      console.error('Failed to fetch region data:', e);
      await alertError('지역 데이터를 불러오는 중 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    fetchRegionData();
  }, []);

  const table = useReactTable({
    data: contents,
    columns: [
      {
        id: 'select',
        header: () => (
          <Checkbox
            checked={selectedIds.length === contents.length && contents.length > 0}
            onChange={e => {
              if (e.target.checked) {
                setSelectedIds(contents.map(item => item.id));
              } else {
                setSelectedIds([]);
              }
            }}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={selectedIds.includes(row.original.id)}
            onChange={e => {
              if (e.target.checked) {
                setSelectedIds(prev => [...prev, row.original.id]);
              } else {
                setSelectedIds(prev => prev.filter(id => id !== row.original.id));
              }
            }}
          />
        ),
        size: 60,
      },
      {
        header: 'No',
        cell: ({ row }) => row.original.sequence,
        size: 60,
      },
      {
        header: '지역',
        cell: ({ row }) => row.original.sido,
        size: 80,
      },
      {
        header: '병의원명',
        cell: ({ row }) => row.original.name,
        size: 200,
      },
      {
        header: '주소',
        cell: ({ row }) => row.original.address,
        size: 400,
      },
      {
        header: '허가예정일',
        cell: ({ row }) => {
          const value = row.original.scheduledOpenDate;

          return value !== null ? formatYyyyMmDd(value) : '-';
        },
        size: 120,
      },
      {
        header: '분류',
        cell: ({ row }) => row.original.source,
        size: 120,
      },
    ],
    getCoreRowModel: getCoreRowModel(),
  });

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) {
      await alert('삭제할 항목을 선택하세요.');
      return;
    }

    const count = selectedIds.length;
    const message = count === 1 ? '선택한 개원병원을 삭제하시겠습니까?' : `${count}건이 선택되었습니다. 삭제하시겠습니까?`;

    deleteDialog.open({
      message,
      onConfirm: async () => {
        try {
          await Promise.all(selectedIds.map(id => softDeleteHospital(id)));
          enqueueSnackbar('삭제가 완료되었습니다.', { variant: 'success' });
          setSelectedIds([]);
          fetchContents();
        } catch (error) {
          console.error('Failed to delete hospitals:', error);
          await alertError('개원병원 삭제 중 오류가 발생했습니다.');
        }
      },
    });
  };

  const handleHospitalUploadModalSuccess = async () => {
    await fetchContents();
    setHospitalUploadModalOpen(false);
  };

  return (
    <Stack sx={{ gap: 3 }}>
      <Typography variant='h4'>개원병원페이지</Typography>

      <Card sx={{ padding: 3 }}>
        <MpSearchFilterBar component='form' onSubmit={formik.handleSubmit}>
          <SearchFilterItem minWidth={140}>
            <FormControl fullWidth size='small'>
              <InputLabel>시/도</InputLabel>
              <Select
                name='sido'
                value={formik.values.sido === -1 ? '' : formik.values.sido}
                onChange={event => {
                  formik.handleChange(event);
                  formik.setFieldValue('sigungu', -1);
                }}
              >
                {sidoList.map(region => (
                  <MenuItem key={region.id} value={region.id}>
                    {region.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </SearchFilterItem>
          <SearchFilterItem minWidth={140}>
            <FormControl fullWidth size='small'>
              <InputLabel>시/군/구</InputLabel>
              <Select name='sigungu' value={formik.values.sigungu === -1 ? '' : formik.values.sigungu} onChange={formik.handleChange}>
                {(sigunguList[formik.values.sido] ?? []).map(region => (
                  <MenuItem key={region.id} value={region.id}>
                    {region.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </SearchFilterItem>
          <SearchFilterItem minWidth={140}>
            <DatePicker
              value={formik.values.startDate}
              onChange={value => formik.setFieldValue('startDate', value)}
              format={DATEFORMAT_YYYY_MM_DD}
              views={['year', 'month', 'day']}
              label='시작일'
              slotProps={{
                textField: {
                  size: 'small',
                },
              }}
            />
          </SearchFilterItem>
          <SearchFilterItem minWidth={140}>
            <DatePicker
              value={formik.values.endDate}
              onChange={value => formik.setFieldValue('endDate', value)}
              format={DATEFORMAT_YYYY_MM_DD}
              views={['year', 'month', 'day']}
              label='종료일'
              slotProps={{
                textField: {
                  size: 'small',
                },
              }}
            />
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
            <Button variant='outlined' size='small' onClick={() => formik.resetForm()}>
              초기화
            </Button>
          </SearchFilterActions>
        </MpSearchFilterBar>
      </Card>

      <Card sx={{ padding: 3 }}>
        <Stack direction='row' justifyContent='space-between' alignItems='center' mb={2}>
          <Stack direction='row' spacing={2}>
            <Typography variant='subtitle1'>검색결과: {totalElements.toLocaleString()} 건</Typography>
          </Stack>
          <Stack direction='row' spacing={1}>
            <Button variant='contained' color='success' size='small' onClick={() => setHospitalUploadModalOpen(true)}>
              엑셀 업로드
            </Button>
            <Button variant='contained' color='error' size='small' onClick={handleDeleteSelected} disabled={selectedIds.length === 0}>
              삭제
            </Button>
          </Stack>
        </Stack>

        <TableContainer sx={{ overflowX: 'auto' }}>
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

        <Stack direction='row' justifyContent='center' sx={{ mt: 2 }}>
          <Pagination
            count={totalPages}
            page={page}
            renderItem={item => (
              <PaginationItem
                {...item}
                color='primary'
                variant='outlined'
                component={RouterLink}
                to={setUrlParams({ page: item.page }, initialSearchParams)}
              />
            )}
            color='primary'
            variant='outlined'
            showFirstButton
            showLastButton
          />
        </Stack>
      </Card>

      <MpHospitalUploadModal
        open={hospitalUploadModalOpen}
        onClose={() => setHospitalUploadModalOpen(false)}
        onSuccess={handleHospitalUploadModalSuccess}
      />
    </Stack>
  );
}

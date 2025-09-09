import AttachFileIcon from '@mui/icons-material/AttachFile';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
  Typography,
} from '@mui/material';
import { flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import { useFormik } from 'formik';
import {
  DateTimeString,
  getAllSido,
  getHospitals,
  getSigunguBySido,
  HospitalResponse,
  RegionCategoryResponse,
  softDeleteHospital,
  uploadHospitalExcel,
} from '@/backend';
import MpFormikDatePicker from '@/medipanda/components/MpFormikDatePicker';
import { SearchFilterActions, SearchFilterBar, SearchFilterItem } from '@/medipanda/components/SearchFilterBar';
import { useMpDeleteDialog } from '@/medipanda/hooks/useMpDeleteDialog';
import { useMpErrorDialog } from '@/medipanda/hooks/useMpErrorDialog';
import { useMpInfoDialog } from '@/medipanda/hooks/useMpInfoDialog';
import { formatYyyyMmDd } from '@/medipanda/utils/dateFormat';
import { Sequenced, withSequence } from '@/medipanda/utils/withSequence';
import { useEffect, useState } from 'react';

export default function MpAdminHospitalList() {
  const [sido, setSido] = useState<RegionCategoryResponse[]>([]);
  const [sigungu, setSigungu] = useState<Record<number, RegionCategoryResponse[]>>({});
  const [data, setData] = useState<Sequenced<HospitalResponse>[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [excelUploadDialogOpen, setExcelUploadDialogOpen] = useState(false);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const errorDialog = useMpErrorDialog();
  const infoDialog = useMpInfoDialog();
  const deleteDialog = useMpDeleteDialog();

  const formik = useFormik({
    initialValues: {
      sido: -1,
      sigungu: -1,
      searchKeyword: '',
      startDate: null as Date | null,
      endDate: null as Date | null,
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

  const handleReset = () => {
    formik.resetForm();
  };

  const handleExcelUpload = async () => {
    if (!excelFile) {
      infoDialog.showInfo('업로드할 파일을 선택해주세요.');
      return;
    }

    try {
      await uploadHospitalExcel({ file: excelFile });
      infoDialog.showInfo('엑셀 업로드가 완료되었습니다.');
      setExcelUploadDialogOpen(false);
      setExcelFile(null);
      fetchData();
    } catch (error) {
      console.error('Failed to upload excel:', error);
      errorDialog.showError('엑셀 업로드 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteSelected = () => {
    if (selectedItems.length === 0) {
      infoDialog.showInfo('삭제할 항목을 선택해주세요.');
      return;
    }

    const count = selectedItems.length;
    const message = count === 1 ? '선택한 개원병원을 삭제하시겠습니까?' : `${count}건이 선택되었습니다. 삭제하시겠습니까?`;

    deleteDialog.open({
      message,
      onConfirm: async () => {
        try {
          await Promise.all(selectedItems.map(id => softDeleteHospital(id)));
          infoDialog.showInfo('삭제가 완료되었습니다.');
          setSelectedItems([]);
          fetchData();
        } catch (error) {
          console.error('Failed to delete hospitals:', error);
          errorDialog.showError('개원병원 삭제 중 오류가 발생했습니다.');
        }
      },
    });
  };

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
      const sidoResponse = await getAllSido();
      setSido(sidoResponse);

      const sigunguResponse = await Promise.all(sidoResponse.map(async sido => [sido.id, await getSigunguBySido(sido.id)]));
      setSigungu(Object.fromEntries(sigunguResponse));

      const response = await getHospitals({
        page: formik.values.pageIndex,
        size: formik.values.pageSize,
        regionCategoryId: formik.values.sigungu !== -1 ? formik.values.sigungu : formik.values.sido !== -1 ? formik.values.sido : undefined,
        hospitalName: formik.values.searchKeyword !== '' ? formik.values.searchKeyword : undefined,
        startDate: formik.values.startDate ? new DateTimeString(formik.values.startDate) : undefined,
        endDate: formik.values.endDate ? new DateTimeString(formik.values.endDate) : undefined,
      });
      setData(withSequence(response).content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch hospital list:', error);
      errorDialog.showError('개원병원 목록을 불러오는 중 오류가 발생했습니다.');
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
        <Typography variant='h4' gutterBottom>
          개원병원페이지
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <MainCard content={false}>
          <Box sx={{ p: 3 }}>
            <form onSubmit={formik.handleSubmit}>
              <SearchFilterBar>
                <SearchFilterItem minWidth={140}>
                  <FormControl fullWidth size='small'>
                    <InputLabel>시/도</InputLabel>
                    <Select name='sido' value={formik.values.sido ?? ''} onChange={formik.handleChange}>
                      {sido.map(region => (
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
                    <Select name='sigungu' value={formik.values.sigungu ?? ''} onChange={formik.handleChange}>
                      {(sigungu[formik.values.sido] ?? []).map(region => (
                        <MenuItem key={region.id} value={region.id}>
                          {region.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </SearchFilterItem>
                <SearchFilterItem minWidth={140}>
                  <MpFormikDatePicker name='startDate' label='시작일' formik={formik} />
                </SearchFilterItem>
                <SearchFilterItem minWidth={140}>
                  <MpFormikDatePicker name='endDate' label='종료일' formik={formik} />
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
                <Button variant='contained' color='success' size='small' onClick={() => setExcelUploadDialogOpen(true)}>
                  엑셀 업로드
                </Button>
                <Button variant='contained' color='error' size='small' onClick={handleDeleteSelected} disabled={selectedItems.length === 0}>
                  삭제
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

      <Dialog open={excelUploadDialogOpen} onClose={() => setExcelUploadDialogOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>개원병원정보 업로드</DialogTitle>
        <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
          <Button
            href={import.meta.env.VITE_APP_URL_FILE_HOSPITAL}
            target='_blank'
            variant='contained'
            color='success'
            size='small'
            startIcon={<AttachFileIcon />}
            sx={{ position: 'relative' }}
          >
            양식 다운로드
          </Button>
        </Box>
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          <Button variant='contained' color='success' component='label' startIcon={<AttachFileIcon />} sx={{ px: 4, py: 2 }}>
            파일
            <input
              type='file'
              hidden
              accept='.xlsx,.xls'
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) {
                  setExcelFile(file);
                }
              }}
            />
          </Button>
          {excelFile && (
            <Typography variant='body2' sx={{ mt: 2 }}>
              선택된 파일: {excelFile.name}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            variant='contained'
            color='inherit'
            onClick={() => {
              setExcelUploadDialogOpen(false);
              setExcelFile(null);
            }}
            sx={{ px: 4 }}
          >
            취소
          </Button>
          <Button variant='contained' color='success' onClick={handleExcelUpload} disabled={!excelFile} sx={{ px: 4 }}>
            업데이트
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}

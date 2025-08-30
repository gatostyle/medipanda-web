import { UploadFile } from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
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
import { NotImplementedError } from 'medipanda/api-definitions/NotImplementedError';
import {
  confirmPrescription,
  DateString,
  DateTimeString,
  PrescriptionResponse,
  searchPrescriptions,
  uploadEdiZip,
} from 'medipanda/backend';
import MpDatePicker from 'medipanda/components/MpDatePicker';
import MpFormikDatePicker from 'medipanda/components/MpFormikDatePicker';
import { SearchFilterActions, SearchFilterBar, SearchFilterItem } from 'medipanda/components/SearchFilterBar';
import { useMpErrorDialog } from 'medipanda/hooks/useMpErrorDialog';
import { useMpInfoDialog } from 'medipanda/hooks/useMpInfoDialog';
import { useMpNotImplementedDialog } from 'medipanda/hooks/useMpNotImplementedDialog';
import { formatYyyyMm, formatYyyyMmDd } from 'medipanda/utils/dateFormat';
import { Sequenced, withSequence } from 'medipanda/utils/withSequence';
import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';

export default function MpAdminPrescriptionReceptionList() {
  const [data, setData] = useState<Sequenced<PrescriptionResponse>[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [prescriptionMonth, setPrescriptionMonth] = useState<Date | null>(null);
  const [settlementMonth, setSettlementMonth] = useState<Date | null>(null);
  const [ediZipFile, setEdiZipFile] = useState<File | null>(null);
  const notImplementedDialog = useMpNotImplementedDialog();
  const errorDialog = useMpErrorDialog();
  const infoDialog = useMpInfoDialog();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setEdiZipFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/zip': ['.zip'] } });

  const formik = useFormik({
    initialValues: {
      searchType: 'companyName' as 'companyName' | 'userId' | 'dealerName' | 'dealerId',
      searchKeyword: '',
      status: '' as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | '',
      startAt: null as Date | null,
      endAt: null as Date | null,
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

  const handleConfirm = async (id: number) => {
    try {
      await confirmPrescription(id);
      infoDialog.showInfo('접수 확인되었습니다.');
      fetchData();
    } catch (error) {
      if (error instanceof NotImplementedError) {
        notImplementedDialog.open(error.message);
      } else {
        console.error('Failed to confirm reception:', error);
        errorDialog.showError('접수 확인 중 오류가 발생했습니다.');
      }
    }
  };

  const table = useReactTable({
    data,
    columns: [
      {
        header: 'No',
        cell: ({ row }) => row.original.sequence,
        size: 60,
      },
      {
        header: '딜러번호',
        cell: ({ row }) => row.original.dealerId,
        size: 100,
      },
      {
        header: '아이디',
        cell: ({ row }) => row.original.userId,
        size: 120,
      },
      {
        header: '회사명',
        cell: ({ row }) => row.original.companyName,
        size: 150,
      },
      {
        header: '딜러명',
        cell: ({ row }) => row.original.dealerName,
        size: 100,
      },
      {
        header: '처방월',
        cell: ({ row }) => formatYyyyMm(row.original.prescriptionMonth),
        size: 100,
      },
      {
        header: '정산월',
        cell: ({ row }) => formatYyyyMm(row.original.settlementMonth),
        size: 100,
      },
      {
        header: '접수신청일',
        cell: ({ row }) => formatYyyyMmDd(row.original.submittedAt),
        size: 120,
      },
      {
        header: '접수파일',
        cell: ({ row }) => (
          <Button
            variant='contained'
            color='success'
            size='small'
            href={`/v1/prescriptions/partners/${row.original.id}/edi-files/download`}
            target='_blank'
          >
            다운로드
          </Button>
        ),
        size: 120,
      },
      {
        header: '접수상태',
        cell: ({ row }) => {
          const status = row.original.status;

          const labels = {
            PENDING: '접수대기',
            IN_PROGRESS: '처리중',
            COMPLETED: '입력완료',
          };

          return <Chip label={labels[status]} size='small' sx={{ backgroundColor: '#4caf50', color: 'white' }} />;
        },
        size: 100,
      },
      {
        header: '관리자확인',
        cell: ({ row }) =>
          row.original.status === 'PENDING' ? (
            <Button variant='contained' color='success' size='small' onClick={() => handleConfirm(row.original.id)}>
              접수확인
            </Button>
          ) : (
            <Typography variant='body2'>{row.original.checkedAt ? formatYyyyMmDd(row.original.checkedAt) : '-'}</Typography>
          ),
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

  const handleReset = () => {
    formik.resetForm();
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await searchPrescriptions({
        status: formik.values.status !== '' ? formik.values.status : undefined,
        companyName: formik.values.searchType === 'companyName' ? formik.values.searchKeyword : undefined,
        userId: formik.values.searchType === 'userId' ? formik.values.searchKeyword : undefined,
        dealerName: formik.values.searchType === 'dealerName' ? formik.values.searchKeyword : undefined,
        dealerId: formik.values.searchType === 'dealerId' ? parseInt(formik.values.searchKeyword) : undefined,
        startAt: formik.values.startAt ? new DateTimeString(formik.values.startAt) : undefined,
        endAt: formik.values.endAt ? new DateTimeString(formik.values.endAt) : undefined,
        page: formik.values.pageIndex,
        size: formik.values.pageSize,
      });

      setData(withSequence(response).content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch prescription reception list:', error);
      errorDialog.showError('처방접수 목록을 불러오는 중 오류가 발생했습니다.');
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

  const handleFileUpload = async () => {
    if (!ediZipFile) return;

    try {
      await uploadEdiZip({
        prescriptionMonth: new DateString(prescriptionMonth!).toString(),
        settlementMonth: new DateString(settlementMonth!).toString(),
        file: ediZipFile,
      });

      infoDialog.showInfo('EDI를 업로드했습니다.');
    } catch (error) {
      if (error instanceof NotImplementedError) {
        notImplementedDialog.open(error.message);
      } else {
        console.error('Failed to upload rate table:', error);
        errorDialog.showError('EDI 업로드 중 오류가 발생했습니다.');
      }
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant='h4' gutterBottom>
          처방접수
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <MainCard content={false}>
          <Box sx={{ p: 3 }}>
            <form onSubmit={formik.handleSubmit}>
              <SearchFilterBar>
                <SearchFilterItem minWidth={140}>
                  <FormControl fullWidth size='small'>
                    <InputLabel>접수상태</InputLabel>
                    <Select name='status' value={formik.values.status} onChange={formik.handleChange}>
                      <MenuItem value={'PENDING'}>접수대기</MenuItem>
                      <MenuItem value={'IN_PROGRESS'}>처리중</MenuItem>
                      <MenuItem value={'COMPLETED'}>입력완료</MenuItem>
                    </Select>
                  </FormControl>
                </SearchFilterItem>
                <SearchFilterItem minWidth={140}>
                  <FormControl fullWidth size='small'>
                    <InputLabel>검색유형</InputLabel>
                    <Select name='searchType' value={formik.values.searchType} onChange={formik.handleChange}>
                      <MenuItem value={'companyName'}>회사명</MenuItem>
                      <MenuItem value={'id'}>아이디</MenuItem>
                      <MenuItem value={'dealerName'}>딜러명</MenuItem>
                      <MenuItem value={'dealerId'}>딜러번호</MenuItem>
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
                <Button variant='contained' color='success' size='small' onClick={() => setRegisterDialogOpen(true)}>
                  EDI 등록
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

      <Dialog open={registerDialogOpen} onClose={() => setRegisterDialogOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>EDI 등록</DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 3 }}>
          <Stack direction='row' spacing={2} justifyContent='center' alignItems='center' sx={{ mb: 3 }}>
            <Typography variant='body1'>처방월 선택</Typography>
            <Box>
              <MpDatePicker
                value={prescriptionMonth}
                onChange={value => {
                  setPrescriptionMonth(value);
                }}
                placeholder='월 선택'
                format='yyyy-MM'
                views={['year', 'month']}
              />
            </Box>
            <Typography variant='body1'>정산월 선택</Typography>
            <Box>
              <MpDatePicker
                value={settlementMonth}
                onChange={value => {
                  setSettlementMonth(value);
                }}
                placeholder='월 선택'
                format='yyyy-MM'
                views={['year', 'month']}
              />
            </Box>
          </Stack>
          <Box
            {...getRootProps()}
            sx={{
              border: '2px dashed #e0e0e0',
              borderRadius: 1,
              p: 4,
              textAlign: 'center',
              cursor: 'pointer',
              bgcolor: isDragActive ? 'action.hover' : 'transparent',
              '&:hover': {
                borderColor: 'primary.main',
              },
            }}
          >
            <input {...getInputProps()} />
            <UploadFile sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant='h6' color='text.secondary'>
              여기에 파일을 드래그하거나 클릭하여 업로드하세요.
            </Typography>
            {ediZipFile && (
              <Typography variant='body2' sx={{ mt: 1 }}>
                선택된 파일: {ediZipFile.name}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            variant='outlined'
            onClick={() => {
              setRegisterDialogOpen(false);
              setEdiZipFile(null);
            }}
            sx={{ minWidth: 100 }}
          >
            취소
          </Button>
          <Button variant='contained' color='success' onClick={handleFileUpload} disabled={!ediZipFile} sx={{ minWidth: 100 }}>
            업데이트
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}

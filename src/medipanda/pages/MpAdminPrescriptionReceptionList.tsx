import AttachFileIcon from '@mui/icons-material/AttachFile';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
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
import { NotImplementedError } from 'medipanda/api-definitions/NotImplementedError';
import {
  confirmPrescription,
  DateString,
  DateTimeString,
  getDownloadZippedEdiFiles,
  PrescriptionResponse,
  searchPrescriptions,
  uploadEdiZip
} from 'medipanda/backend';
import MpDatePicker from 'medipanda/components/MpDatePicker';
import MpFormikDatePicker from 'medipanda/components/MpFormikDatePicker';
import { useMpErrorDialog } from 'medipanda/hooks/useMpErrorDialog';
import { useMpInfoDialog } from 'medipanda/hooks/useMpInfoDialog';
import { useMpNotImplementedDialog } from 'medipanda/hooks/useMpNotImplementedDialog';
import { formatYyyyMm, formatYyyyMmDd } from 'medipanda/utils/dateFormat';
import { Sequenced, withSequence } from 'medipanda/utils/withSequence';
import { useCallback, useEffect, useMemo, useState } from 'react';

export default function MpAdminPrescriptionReceptionList() {
  const [data, setData] = useState<Sequenced<PrescriptionResponse>[]>([]);
  const [, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const notImplementedDialog = useMpNotImplementedDialog();
  const errorDialog = useMpErrorDialog();
  const infoDialog = useMpInfoDialog();
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [prescriptionMonth, setPrescriptionMonth] = useState<Date | null>(null);
  const [settlementMonth, setSettlementMonth] = useState<Date | null>(null);
  const [ediZipFile, setEdiZipFile] = useState<File | null>(null);

  const formik = useFormik({
    initialValues: {
      searchType: 'companyName' as 'companyName' | 'userId' | 'dealerName' | 'dealerId',
      searchKeyword: '',
      status: '' as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | '',
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

  const handleConfirm = useCallback(
    async (id: number) => {
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
    },
    [notImplementedDialog, errorDialog, infoDialog]
  );

  const columns = useMemo<ColumnDef<Sequenced<PrescriptionResponse>>[]>(
    () => [
      {
        header: 'No',
        accessorKey: 'sequence',
        cell: ({ row }) => row.original.sequence,
        size: 60
      },
      {
        header: '딜러번호',
        accessorKey: 'dealerId',
        cell: ({ row }) => row.original.dealerId,
        size: 100
      },
      {
        header: '아이디',
        accessorKey: 'userId',
        cell: ({ row }) => row.original.userId,
        size: 120
      },
      {
        header: '회사명',
        accessorKey: 'companyName',
        cell: ({ row }) => row.original.companyName,
        size: 150
      },
      {
        header: '딜러명',
        accessorKey: 'dealerName',
        cell: ({ row }) => row.original.dealerName,
        size: 100
      },
      {
        header: '처방월',
        accessorKey: 'prescriptionMonth',
        cell: ({ row }) => formatYyyyMm(row.original.prescriptionMonth),
        size: 100
      },
      {
        header: '정산월',
        accessorKey: 'settlementMonth',
        cell: ({ row }) => formatYyyyMm(row.original.settlementMonth),
        size: 100
      },
      {
        header: '접수신청일',
        accessorKey: 'submittedAt',
        cell: ({ row }) => formatYyyyMmDd(row.original.submittedAt),
        size: 120
      },
      {
        header: '접수파일',
        cell: ({ row }) => (
          <Button variant="contained" color="success" size="small" href={getDownloadZippedEdiFiles(row.original.id)} target="_blank">
            파일 다운로드
          </Button>
        ),
        size: 120
      },
      {
        header: '접수상태',
        accessorKey: 'status',
        cell: ({ row }) => {
          const status = row.original.status;

          const labels = {
            PENDING: '접수대기',
            IN_PROGRESS: '처리중',
            COMPLETED: '입력완료'
          };

          return <Chip label={labels[status]} size="small" sx={{ backgroundColor: '#4caf50', color: 'white' }} />;
        },
        size: 100
      },
      {
        header: '관리자확인',
        cell: ({ row }) =>
          row.original.checkedAt ? (
            <Typography variant="body2">{formatYyyyMmDd(row.original.checkedAt)}</Typography>
          ) : (
            <Button variant="contained" color="success" size="small" onClick={() => handleConfirm(row.original.id)}>
              접수확인
            </Button>
          ),
        size: 120
      }
    ],
    [handleConfirm]
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
      const response = await searchPrescriptions({
        status: formik.values.status !== '' ? formik.values.status : undefined,
        companyName: formik.values.searchType === 'companyName' ? formik.values.searchKeyword : undefined,
        userId: formik.values.searchType === 'userId' ? formik.values.searchKeyword : undefined,
        dealerName: formik.values.searchType === 'dealerName' ? formik.values.searchKeyword : undefined,
        dealerId: formik.values.searchType === 'dealerId' ? parseInt(formik.values.searchKeyword) : undefined,
        startAt: formik.values.startAt ? new DateTimeString(formik.values.startAt) : undefined,
        endAt: formik.values.endAt ? new DateTimeString(formik.values.endAt) : undefined,
        page: formik.values.pageIndex,
        size: formik.values.pageSize
      });

      setData(withSequence(response).content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch prescription reception list:', error);
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
        file: ediZipFile
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
        <Typography variant="h4" gutterBottom>
          처방접수
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <MainCard content={false}>
          <Box sx={{ p: 3 }}>
            <form onSubmit={formik.handleSubmit}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={2}>
                  <FormControl fullWidth size="small">
                    <Select
                      name="status"
                      value={formik.values.status}
                      onChange={(e) => formik.setFieldValue('status', e.target.value)}
                      displayEmpty
                    >
                      <MenuItem value="">접수상태</MenuItem>
                      <MenuItem value={'PENDING'}>접수대기</MenuItem>
                      <MenuItem value={'IN_PROGRESS'}>처리중</MenuItem>
                      <MenuItem value={'COMPLETED'}>입력완료</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={2}>
                  <FormControl fullWidth size="small">
                    <Select
                      name="searchType"
                      value={formik.values.searchType}
                      onChange={(e) => formik.setFieldValue('searchType', e.target.value)}
                      displayEmpty
                    >
                      <MenuItem value="companyName">회사명</MenuItem>
                      <MenuItem value="id">아이디</MenuItem>
                      <MenuItem value="dealerName">딜러명</MenuItem>
                      <MenuItem value="dealerId">딜러번호</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={2}>
                  <MpFormikDatePicker name="startAt" label="시작일" formik={formik} />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <MpFormikDatePicker name="endAt" label="종료일" formik={formik} />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    name="searchKeyword"
                    size="small"
                    placeholder="검색어를 입력해주세요"
                    onKeyPress={(e: React.KeyboardEvent) => e.key === 'Enter' && formik.handleSubmit()}
                    fullWidth
                    value={formik.values.searchKeyword}
                    onChange={formik.handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={1}>
                  <Button variant="contained" size="small" type="submit" fullWidth>
                    검색
                  </Button>
                </Grid>
              </Grid>
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
                <Button variant="contained" color="success" size="small" onClick={() => setRegisterDialogOpen(true)}>
                  EDI 등록
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

      <Dialog open={registerDialogOpen} onClose={() => setRegisterDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>EDI 등록</DialogTitle>
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          <Stack direction="row" spacing={2} justifyContent="center" alignItems="center" sx={{ mb: 3 }}>
            <Typography variant="body1">처방월 선택</Typography>
            <Box>
              <MpDatePicker
                value={prescriptionMonth}
                onChange={(value) => {
                  setPrescriptionMonth(value);
                }}
                placeholder="월 선택"
                format="yyyy-MM"
                views={['year', 'month']}
              />
            </Box>
            <Typography variant="body1">정산월 선택</Typography>
            <Box>
              <MpDatePicker
                value={settlementMonth}
                onChange={(value) => {
                  setSettlementMonth(value);
                }}
                placeholder="월 선택"
                format="yyyy-MM"
                views={['year', 'month']}
              />
            </Box>
          </Stack>
          <Button variant="contained" color="success" component="label" startIcon={<AttachFileIcon />}>
            .zip 파일 선택
            <input
              type="file"
              hidden
              accept=".zip"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setEdiZipFile(file);
                }
              }}
            />
          </Button>
          {ediZipFile && (
            <Typography variant="body2" sx={{ mt: 2 }}>
              선택된 파일: {ediZipFile.name}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            variant="contained"
            color="inherit"
            onClick={() => {
              setRegisterDialogOpen(false);
              setEdiZipFile(null);
            }}
            sx={{ px: 4 }}
          >
            취소
          </Button>
          <Button variant="contained" color="success" onClick={handleFileUpload} disabled={!ediZipFile} sx={{ px: 4 }}>
            업데이트
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}

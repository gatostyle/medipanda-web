import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
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
import { DocumentDownload } from 'iconsax-react';
import { mpDownloadSettlementEDI, mpPrintSettlementEDI } from 'medipanda/api-definitions/MpSettlement';
import { NotImplementedError } from 'medipanda/api-definitions/NotImplementedError';
import { getDownloadSettlementListExcel, getSettlements, SettlementResponse, uploadSettlementExcel } from 'medipanda/backend';
import MpFormikDatePicker from 'medipanda/components/MpFormikDatePicker';
import { SearchFilterActions, SearchFilterBar, SearchFilterItem } from 'medipanda/components/SearchFilterBar';
import { useMpErrorDialog } from 'medipanda/hooks/useMpErrorDialog';
import { useMpNotImplementedDialog } from 'medipanda/hooks/useMpNotImplementedDialog';
import { mockNumber } from 'medipanda/mockup';
import { formatYyyyMm } from 'medipanda/utils/dateFormat';
import { Sequenced, withSequence } from 'medipanda/utils/withSequence';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMpInfoDialog } from '../hooks/useMpInfoDialog';

export default function MpAdminSettlementList() {
  const [data, setData] = useState<Sequenced<SettlementResponse>[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const notImplementedDialog = useMpNotImplementedDialog();
  const infoDialog = useMpInfoDialog();
  const errorDialog = useMpErrorDialog();

  const formik = useFormik({
    initialValues: {
      userConfirmation: '' as boolean | '',
      searchType: '' as 'dealerId' | 'companyName' | '',
      startAt: null as Date | null,
      endAt: null as Date | null,
      searchKeyword: '',
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

  const columns = useMemo<ColumnDef<Sequenced<SettlementResponse>>[]>(
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
        size: 60
      },
      {
        header: '딜러번호',
        accessorKey: 'dealerId',
        cell: ({ row }) => row.original.dealerId,
        size: 100
      },
      {
        header: '정산월',
        accessorKey: 'settlementMonth',
        cell: ({ row }) => formatYyyyMm(row.original.settlementMonth),
        size: 100
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
        cell: ({ row }) => (
          <Link to={`/admin/settlements/${row.original.id}`} style={{ textDecoration: 'none', color: '#1976d2' }}>
            {row.original.dealerName}
          </Link>
        ),
        size: 100
      },
      {
        header: '처방금액',
        accessorKey: 'prescriptionAmount',
        cell: ({ row }) => row.original.prescriptionAmount.toLocaleString(),
        size: 120
      },
      {
        header: '공급가액',
        accessorKey: 'supplyAmount',
        cell: ({ row }) => row.original.supplyAmount.toLocaleString(),
        size: 120
      },
      {
        header: '세액',
        accessorKey: 'taxAmount',
        cell: ({ row }) => row.original.taxAmount.toLocaleString(),
        size: 100
      },
      {
        header: '합계금액',
        accessorKey: 'totalAmount',
        cell: ({ row }) => row.original.totalAmount.toLocaleString(),
        size: 120
      },
      {
        header: '사용자확인',
        accessorKey: 'status',
        cell: ({ row }) => {
          const value = row.original.status;

          switch (value) {
            case 'REQUEST':
              return '정산요청';
            case 'OBJECTION':
              return '이의신청';
            default:
              return '-';
          }
        },
        size: 100
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
      const response = await getSettlements({
        dealerName: undefined,
        dealerId: formik.values.searchType === 'dealerId' ? parseInt(formik.values.searchKeyword) : undefined,
        companyName: formik.values.searchType === 'companyName' ? formik.values.searchKeyword : undefined,
        status: formik.values.userConfirmation !== '' ? (formik.values.userConfirmation ? 'REQUEST' : 'OBJECTION') : undefined,
        startMonth: formik.values.startAt ? mockNumber() : undefined,
        endMonth: formik.values.endAt ? mockNumber() : undefined,
        page: formik.values.pageIndex,
        size: formik.values.pageSize
      });

      setData(withSequence(response).content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch settlement list:', error);
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
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls';
    input.onchange = async (e) => {
      try {
        await uploadSettlementExcel({ file: (e.target as HTMLInputElement).files![0] });
        infoDialog.showInfo('정산 파일을 업로드했습니다.');
        await fetchData();
      } catch (error) {
        console.error('Failed to upload file:', error);
        errorDialog.showError('파일 업로드 중 오류가 발생했습니다.');
      }
    };
    input.click();
  };

  const handleEDIDownload = async () => {
    try {
      await mpDownloadSettlementEDI();
    } catch (error) {
      if (error instanceof NotImplementedError) {
        notImplementedDialog.open(error.message);
      } else {
        console.error('Failed to download EDI:', error);
        errorDialog.showError('EDI 다운로드 중 오류가 발생했습니다.');
      }
    }
  };

  const handleEDIPrint = async () => {
    try {
      await mpPrintSettlementEDI();
    } catch (error) {
      if (error instanceof NotImplementedError) {
        notImplementedDialog.open(error.message);
      } else {
        console.error('Failed to print EDI:', error);
        errorDialog.showError('EDI 인쇄 중 오류가 발생했습니다.');
      }
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          정산내역
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <MainCard content={false}>
          <Box sx={{ p: 3 }}>
            <form onSubmit={formik.handleSubmit}>
              <SearchFilterBar>
                <SearchFilterItem minWidth={140}>
                  <FormControl fullWidth size="small">
                    <InputLabel>사용자확인</InputLabel>
                    <Select
                      name="userConfirmation"
                      label="사용자확인"
                      value={formik.values.userConfirmation}
                      onChange={(e) => formik.setFieldValue('userConfirmation', e.target.value === 'true')}
                    >
                      <MenuItem value="">전체</MenuItem>
                      <MenuItem value={'true'}>정산요청</MenuItem>
                      <MenuItem value={'false'}>이의신청</MenuItem>
                    </Select>
                  </FormControl>
                </SearchFilterItem>
                <SearchFilterItem minWidth={140}>
                  <FormControl fullWidth size="small">
                    <Select
                      name="searchType"
                      value={formik.values.searchType}
                      onChange={(e) => formik.setFieldValue('searchType', e.target.value)}
                      displayEmpty
                    >
                      <MenuItem value="dealerId">딜러번호</MenuItem>
                      <MenuItem value="companyName">회사명</MenuItem>
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
                    placeholder="검색어를 입력해주세요"
                    onKeyPress={(e: React.KeyboardEvent) => e.key === 'Enter' && formik.handleSubmit()}
                    fullWidth
                    value={formik.values.searchKeyword}
                    onChange={formik.handleChange}
                  />
                </SearchFilterItem>
                <SearchFilterActions>
                  <Button variant="contained" size="small" type="submit">
                    검색
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
                <Button
                  variant="contained"
                  color="success"
                  size="small"
                  href={getDownloadSettlementListExcel({
                    dealerName: undefined,
                    dealerId: formik.values.searchType === 'dealerId' ? parseInt(formik.values.searchKeyword) : undefined,
                    companyName: formik.values.searchType === 'companyName' ? formik.values.searchKeyword : undefined,
                    status: formik.values.userConfirmation !== '' ? (formik.values.userConfirmation ? 'REQUEST' : 'OBJECTION') : undefined,
                    startMonth: formik.values.startAt ? mockNumber() : undefined,
                    endMonth: formik.values.endAt ? mockNumber() : undefined,
                    page: formik.values.pageIndex,
                    size: formik.values.pageSize
                  })}
                  target="_blank"
                  startIcon={<DocumentDownload size={16} />}
                >
                  Excel
                </Button>
                <Button variant="contained" color="success" size="small" onClick={handleFileUpload}>
                  파일 업로드
                </Button>
                <Button variant="contained" color="success" size="small" onClick={handleEDIDownload}>
                  EDI다운로드
                </Button>
                <Button variant="contained" color="success" size="small" onClick={handleEDIPrint}>
                  EDI인쇄
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

import { useEffect, useMemo, useState } from 'react';
import { useFormik } from 'formik';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
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
import Checkbox from '@mui/material/Checkbox';
import { SearchFilterBar, SearchFilterItem, SearchFilterActions } from 'medipanda/components/SearchFilterBar';
import MpFormikDatePicker from 'medipanda/components/MpFormikDatePicker';
import {
  MpSettlement,
  MpSettlementSearchRequest,
  mpFetchSettlementList,
  mpDownloadSettlementExcel,
  mpUploadSettlementFile,
  mpDownloadSettlementEDI,
  mpPrintSettlementEDI
} from 'medipanda/api-definitions/MpSettlement';
import { Link } from 'react-router-dom';
import { useMpNotImplementedDialog } from 'medipanda/hooks/useMpNotImplementedDialog';
import { useMpErrorDialog } from 'medipanda/hooks/useMpErrorDialog';
import { NotImplementedError } from 'medipanda/api-definitions/NotImplementedError';
import { DocumentDownload } from 'iconsax-react';
import { Sequenced } from 'medipanda/utils/withSequence';
import { DateString } from 'medipanda/backend';

export default function MpAdminSettlementList() {
  const [data, setData] = useState<Sequenced<MpSettlement>[]>([]);
  const [, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const notImplementedDialog = useMpNotImplementedDialog();
  const errorDialog = useMpErrorDialog();

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20
  });

  const formik = useFormik({
    initialValues: {
      userConfirmation: '' as boolean | '',
      searchType: 'dealerNumber' as 'dealerNumber' | 'companyName' | 'businessPartnerName',
      startAt: null as Date | null,
      endAt: null as Date | null,
      searchKeyword: ''
    },
    onSubmit: (values) => {
      setPagination({ ...pagination, pageIndex: 0 });
    }
  });

  const columns = useMemo<ColumnDef<Sequenced<MpSettlement>>[]>(
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
        size: 60
      },
      {
        header: '딜러번호',
        accessorKey: 'dealerNumber',
        size: 100
      },
      {
        header: '정산월',
        accessorKey: 'settlementMonth',
        size: 100
      },
      {
        header: '제약사명',
        accessorKey: 'companyName',
        size: 150
      },
      {
        header: '회사명',
        accessorKey: 'businessPartnerName',
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
        cell: ({ row }) => {
          const value = row.original.prescriptionAmount;
          return value ? `${value.toLocaleString()}` : '-';
        },
        size: 120
      },
      {
        header: '공급가액',
        accessorKey: 'supplyAmount',
        cell: ({ row }) => {
          const value = row.original.supplyAmount;
          return value ? `${value.toLocaleString()}` : '-';
        },
        size: 120
      },
      {
        header: '세액',
        accessorKey: 'taxAmount',
        cell: ({ row }) => {
          const value = row.original.taxAmount;
          return value ? `${value.toLocaleString()}` : '-';
        },
        size: 100
      },
      {
        header: '합계금액',
        accessorKey: 'totalAmount',
        cell: ({ row }) => {
          const value = row.original.totalAmount;
          return value ? `${value.toLocaleString()}` : '-';
        },
        size: 120
      },
      {
        header: '사용자확인',
        accessorKey: 'userConfirmation',
        cell: ({ row }) => {
          const value = row.original.userConfirmation;
          return value ? '정산요청' : '이의신청';
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
      pagination
    },
    onPaginationChange: setPagination,
    pageCount: totalPages,
    manualPagination: true
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const request: MpSettlementSearchRequest = {
        page: pagination.pageIndex,
        size: pagination.pageSize,
        userConfirmation: formik.values.userConfirmation !== '' ? formik.values.userConfirmation : undefined,
        searchType: formik.values.searchType,
        startDate: formik.values.startAt ? new DateString(formik.values.startAt) : undefined,
        endDate: formik.values.endAt ? new DateString(formik.values.endAt) : undefined,
        searchKeyword: formik.values.searchKeyword !== '' ? formik.values.searchKeyword : undefined
      };

      const response = await mpFetchSettlementList(request);
      setData(response.content);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.pageIndex, pagination.pageSize, formik.values]);

  const handleExcelDownload = async () => {
    try {
      await mpDownloadSettlementExcel();
    } catch (error) {
      if (error instanceof NotImplementedError) {
        notImplementedDialog.open(error.message);
      } else {
        console.error('Failed to download Excel:', error);
        errorDialog.showError('Excel 다운로드 중 오류가 발생했습니다.');
      }
    }
  };

  const handleFileUpload = async () => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.xlsx,.xls';
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          await mpUploadSettlementFile(file);
        }
      };
      input.click();
    } catch (error) {
      if (error instanceof NotImplementedError) {
        notImplementedDialog.open(error.message);
      } else {
        console.error('Failed to upload file:', error);
        errorDialog.showError('파일 업로드 중 오류가 발생했습니다.');
      }
    }
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
                      <MenuItem value="dealerNumber">딜러번호</MenuItem>
                      <MenuItem value="companyName">제약사명</MenuItem>
                      <MenuItem value="businessPartnerName">회사명</MenuItem>
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
                  onClick={handleExcelDownload}
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

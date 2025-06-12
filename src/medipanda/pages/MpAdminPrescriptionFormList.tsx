import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFormik } from 'formik';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
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
import { SearchFilterActions, SearchFilterBar, SearchFilterItem } from 'medipanda/components/SearchFilterBar';
import MpFormikDatePicker from 'medipanda/components/MpFormikDatePicker';
import { Link } from 'react-router-dom';
import { useMpNotImplementedDialog } from 'medipanda/hooks/useMpNotImplementedDialog';
import { useMpInfoDialog } from 'medipanda/hooks/useMpInfoDialog';
import { useMpErrorDialog } from 'medipanda/hooks/useMpErrorDialog';
import { useMpDeleteDialog } from 'medipanda/hooks/useMpDeleteDialog';
import { NotImplementedError } from 'medipanda/api-definitions/NotImplementedError';
import { Sequenced, withSequence } from 'medipanda/utils/withSequence';
import {
  completePrescriptionPartner,
  DateTimeString,
  deletePrescriptionPartner,
  getPrescriptionPartnerList,
  PrescriptionPartnerResponse
} from 'medipanda/backend';

export default function MpAdminPrescriptionFormList() {
  const [data, setData] = useState<Sequenced<PrescriptionPartnerResponse>[]>([]);
  const [, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
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
      searchType: '' as 'companyName' | 'dealerName' | 'drugCompany' | '',
      searchKeyword: '',
      status: '' as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | '',
      startAt: null as Date | null,
      endAt: null as Date | null
    },
    onSubmit: (values) => {
      setPagination({ ...pagination, pageIndex: 0 });
    }
  });

  const handleApprove = useCallback(async () => {
    try {
      await Promise.all(selectedItems.map((id) => completePrescriptionPartner(id)));
      const count = selectedItems.length;
      const message = count === 1 ? '처방이 승인되었습니다.' : `${count}개 처방이 승인되었습니다.`;
      infoDialog.showInfo(message);
      setSelectedItems([]);
      setPagination({ ...pagination, pageIndex: 0 });
    } catch (error) {
      if (error instanceof NotImplementedError) {
        notImplementedDialog.open(error.message);
      } else {
        console.error('Failed to approve prescriptions:', error);
        errorDialog.showError('처방 승인 중 오류가 발생했습니다.');
      }
    }
  }, [selectedItems, notImplementedDialog, infoDialog, errorDialog, pagination]);

  const columns = useMemo<ColumnDef<Sequenced<PrescriptionPartnerResponse>>[]>(
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
        header: '제약사명',
        accessorKey: 'drugCompany',
        size: 120
      },
      {
        header: '회사명',
        accessorKey: 'companyName',
        size: 120
      },
      {
        header: '거래처코드',
        accessorKey: 'dealerCode',
        size: 100
      },
      {
        header: '거래처명',
        accessorKey: 'dealerName',
        cell: ({ row }) => (
          <Link to={`/admin/prescription-forms/${row.original.id}/products`} style={{ textDecoration: 'none', color: '#1976d2' }}>
            {row.original.dealerName}
          </Link>
        ),
        size: 100
      },
      {
        header: '사업자등록번호',
        accessorKey: 'businessRegistrationNumber',
        size: 130
      },
      {
        header: '처방일',
        accessorKey: 'prescriptionDate',
        size: 100
      },
      {
        header: '접수일',
        accessorKey: 'receptionDate',
        size: 100
      },
      {
        header: '입력일',
        accessorKey: 'inputDate',
        size: 100
      },
      {
        header: '처방금액',
        accessorKey: 'amount',
        cell: ({ row }) => `${row.original.amount.toLocaleString()}`,
        size: 100
      },
      {
        header: '승인상태',
        accessorKey: 'status',
        cell: ({ row }) => {
          const status = row.original.status;

          const labels = {
            PENDING: '승인대기',
            IN_PROGRESS: '승인진행중',
            COMPLETED: '승인완료'
          };

          return labels[status];
        },
        size: 80
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

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getPrescriptionPartnerList({
        status: formik.values.status !== '' ? formik.values.status : undefined,
        companyName: formik.values.searchType === 'companyName' ? formik.values.searchKeyword : undefined,
        drugCompany: formik.values.searchType === 'drugCompany' ? formik.values.searchKeyword : undefined,
        dealerName: formik.values.searchType === 'dealerName' ? formik.values.searchKeyword : undefined,
        prescriptionMonthStart: formik.values.startAt ? new DateTimeString(formik.values.startAt) : undefined,
        prescriptionMonthEnd: formik.values.endAt ? new DateTimeString(formik.values.endAt) : undefined,
        page: pagination.pageIndex,
        size: pagination.pageSize
      });

      setData(withSequence(response).content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch prescription form list:', error);
      setData([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [pagination, formik.values]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleReset = () => {
    formik.resetForm();
    setPagination({ ...pagination, pageIndex: 0 });
  };

  const handleDelete = () => {
    if (selectedItems.length === 0) {
      infoDialog.showInfo('삭제할 처방을 선택해주세요.');
      return;
    }

    deleteDialog.open({
      title: '처방 삭제',
      message: `선택한 ${selectedItems.length}개의 처방을 삭제하시겠습니까?`,
      onConfirm: async () => {
        try {
          await Promise.all(selectedItems.map((id) => deletePrescriptionPartner(id)));
          infoDialog.showInfo('처방이 삭제되었습니다.');
          setSelectedItems([]);
          fetchData();
        } catch (error) {
          if (error instanceof NotImplementedError) {
            notImplementedDialog.open(error.message);
          } else {
            console.error('Failed to delete prescriptions:', error);
            errorDialog.showError('처방 삭제에 실패했습니다.');
          }
        }
      }
    });
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          처방입력
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
                      <MenuItem value={'PENDING'}>승인대기</MenuItem>
                      <MenuItem value={'COMPLETED'}>승인완료</MenuItem>
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
                      <MenuItem value="">회사명</MenuItem>
                      <MenuItem value={'companyName'}>거래처명</MenuItem>
                      <MenuItem value={'dealerName'}>딜러명</MenuItem>
                      <MenuItem value={'drugCompany'}>제약사명</MenuItem>
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
              <Box>
                <Typography variant="subtitle1" component="span">
                  검색결과: {totalElements.toLocaleString()} 건
                </Typography>
                <Typography variant="subtitle1" component="span" sx={{ ml: 2 }}>
                  총 처방금액: {data.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}원
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Button variant="contained" color="success" size="small" onClick={handleApprove} disabled={selectedItems.length === 0}>
                  승인완료
                </Button>
                <Button variant="contained" color="success" size="small" component={Link} to="/admin/prescription-forms/new">
                  신규
                </Button>
                <Button variant="contained" size="small" color="error" disabled={selectedItems.length === 0} onClick={handleDelete}>
                  삭제
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

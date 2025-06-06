import { useEffect, useMemo, useState } from 'react';
import { useFormik } from 'formik';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Pagination from '@mui/material/Pagination';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { ColumnDef, flexRender, getCoreRowModel, getSortedRowModel, SortingState, useReactTable } from '@tanstack/react-table';
import { DocumentDownload, ExportSquare } from 'iconsax-react';
import { useMpNotImplementedDialog } from 'hooks/medipanda/useMpNotImplementedDialog';
import { useMpErrorDialog } from 'hooks/medipanda/useMpErrorDialog';
import { MpPagedResponse } from 'api-definitions/MpPaged';
import {
  mpFetchPrescriptionReceptions,
  MpPrescriptionReception,
  MpPrescriptionReceptionSearchRequest
} from 'api-definitions/MpPrescriptionReception';

interface FormValues {
  pageSize: number;
  pageIndex: number;
  sorting: SortingState;
  searchKeyword: string;
  memberName: string;
  receptionStatus: string;
  startDate: string;
  endDate: string;
}

export default function MpAdminPrescriptionReceptionList() {
  const emptyData = useMemo(() => [], []);
  const [pagedResponse, setPagedResponse] = useState<MpPagedResponse<MpPrescriptionReception> | null>(null);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { open: openNotImplementedDialog } = useMpNotImplementedDialog();
  const { showError } = useMpErrorDialog();

  const { values, setValues, handleChange, submitForm } = useFormik<FormValues>({
    initialValues: {
      pageSize: 10,
      pageIndex: 0,
      sorting: [],
      searchKeyword: '',
      memberName: '회원명',
      receptionStatus: '접수상태',
      startDate: '',
      endDate: ''
    },
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        const searchRequest: MpPrescriptionReceptionSearchRequest = {
          page: values.pageIndex,
          size: values.pageSize,
          searchKeyword: values.searchKeyword,
          memberName: values.memberName === '회원명' ? undefined : values.memberName,
          receptionStatus: values.receptionStatus === '접수상태' ? undefined : values.receptionStatus,
          startDate: values.startDate,
          endDate: values.endDate
        };
        const response = await mpFetchPrescriptionReceptions(searchRequest);
        setPagedResponse(response);
      } catch (error) {
        console.error('처방전 접수 목록 조회 오류:', error);
        showError('처방전 접수 목록을 조회하는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    }
  });

  const columns: ColumnDef<MpPrescriptionReception>[] = [
    {
      id: 'select',
      header: () => (
        <Checkbox
          checked={selectedItems.length === pagedResponse?.content.length && pagedResponse?.content.length > 0}
          indeterminate={selectedItems.length > 0 && selectedItems.length < (pagedResponse?.content.length || 0)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedItems(pagedResponse?.content.map((item) => item.id) || []);
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
            e.stopPropagation();
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
      id: 'no',
      header: 'No',
      cell: ({ row }) => (row.original as any).sequence || row.index + 1 + values.pageIndex * values.pageSize,
      size: 60
    },
    {
      id: 'memberNumber',
      header: '회원번호',
      accessorKey: 'memberNumber'
    },
    {
      id: 'userId',
      header: '아이디',
      accessorKey: 'userId'
    },
    {
      id: 'memberName',
      header: '회원명',
      accessorKey: 'memberName'
    },
    {
      id: 'doctor',
      header: '담당의',
      accessorKey: 'doctor'
    },
    {
      id: 'receptionDate',
      header: '접수일',
      accessorKey: 'receptionDate'
    },
    {
      id: 'applicationDate',
      header: '접수신청일',
      accessorKey: 'applicationDate'
    },
    {
      id: 'governmentDelegate',
      header: '정부위탁',
      accessorKey: 'governmentDelegate'
    },
    {
      id: 'receptionStatus',
      header: '접수상태',
      cell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            label={row.original.receptionStatus}
            size="small"
            sx={{
              bgcolor: row.original.receptionStatus === '파일 다운로드' ? '#10B981' : '#6B7280',
              color: 'white',
              fontWeight: 500
            }}
          />
          {row.original.receptionStatus === '파일 다운로드' && (
            <Button
              size="small"
              startIcon={<DocumentDownload size="16" color="#3B82F6" />}
              onClick={() => openNotImplementedDialog('파일 다운로드')}
              sx={{
                minWidth: 'auto',
                p: 0.5,
                color: '#3B82F6'
              }}
            />
          )}
        </Box>
      )
    },
    {
      id: 'receptionConfirm',
      header: '접수확인',
      cell: ({ row }) =>
        row.original.receptionConfirm ? (
          <Chip
            label="접수확인"
            size="small"
            sx={{
              bgcolor: '#10B981',
              color: 'white',
              fontWeight: 500
            }}
          />
        ) : (
          <Chip
            label="접수대기"
            size="small"
            sx={{
              bgcolor: '#6B7280',
              color: 'white',
              fontWeight: 500
            }}
          />
        )
    }
  ];

  const table = useReactTable({
    data: pagedResponse?.content ?? emptyData,
    columns,
    state: { sorting: values.sorting },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel()
  });

  useEffect(() => {
    submitForm();
  }, [submitForm]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontSize: '24px', fontWeight: 600, mb: 3 }}>
        처방전접수조회
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={2}>
            <TextField
              fullWidth
              size="small"
              name="searchKeyword"
              value={values.searchKeyword}
              onChange={handleChange}
              placeholder="검색어"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '20px',
                  '& fieldset': {
                    borderColor: '#10B981'
                  }
                }
              }}
            />
          </Grid>

          <Grid item xs={12} sm={2}>
            <FormControl fullWidth size="small">
              <Select
                value={values.memberName}
                onChange={handleChange}
                name="memberName"
                sx={{
                  borderRadius: '20px',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#10B981'
                  }
                }}
              >
                <MenuItem value="회원명">회원명</MenuItem>
                <MenuItem value="키메디">키메디</MenuItem>
                <MenuItem value="케이엠메디슨">케이엠메디슨</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={2}>
            <FormControl fullWidth size="small">
              <Select
                value={values.receptionStatus}
                onChange={handleChange}
                name="receptionStatus"
                sx={{
                  borderRadius: '20px',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#10B981'
                  }
                }}
              >
                <MenuItem value="접수상태">접수상태</MenuItem>
                <MenuItem value="파일 다운로드">파일 다운로드</MenuItem>
                <MenuItem value="입력완료">입력완료</MenuItem>
                <MenuItem value="입력대기">입력대기</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={2}>
            <TextField
              fullWidth
              size="small"
              type="date"
              name="startDate"
              value={values.startDate}
              onChange={handleChange}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '20px',
                  '& fieldset': {
                    borderColor: '#10B981'
                  }
                }
              }}
            />
          </Grid>

          <Grid item xs={12} sm={2}>
            <TextField
              fullWidth
              size="small"
              type="date"
              name="endDate"
              value={values.endDate}
              onChange={handleChange}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '20px',
                  '& fieldset': {
                    borderColor: '#10B981'
                  }
                }
              }}
            />
          </Grid>

          <Grid item xs={12} sm={2}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => submitForm()}
              sx={{
                bgcolor: '#6B7280',
                borderRadius: '20px',
                '&:hover': { bgcolor: '#4B5563' }
              }}
            >
              검색
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="body1">
          검색결과: <strong>{isLoading ? '...' : pagedResponse?.totalElements ?? 0}</strong> 건
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            onClick={() => openNotImplementedDialog('삭제')}
            sx={{
              bgcolor: '#10B981',
              borderRadius: '6px',
              px: 3,
              '&:hover': { bgcolor: '#059669' }
            }}
          >
            삭제
          </Button>
          <Button
            variant="contained"
            startIcon={<ExportSquare size={16} />}
            onClick={() => openNotImplementedDialog('엑셀 다운로드')}
            sx={{
              bgcolor: '#10B981',
              borderRadius: '6px',
              px: 3,
              '&:hover': { bgcolor: '#059669' }
            }}
          >
            엑셀 다운로드
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: '#F9FAFB' }}>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableCell key={header.id} sx={{ fontWeight: 600, color: '#374151', fontSize: '14px', py: 1.5 }}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={11} align="center" sx={{ py: 8 }}>
                  <Typography variant="body2" sx={{ color: '#6B7280' }}>
                    데이터를 불러오는 중...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : pagedResponse === null || pagedResponse.content.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} align="center" sx={{ py: 8 }}>
                  <Typography variant="body2" sx={{ color: '#6B7280' }}>
                    검색 결과가 없습니다.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} hover>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} sx={{ py: 1.5 }}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {pagedResponse && pagedResponse.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={pagedResponse.totalPages}
            page={values.pageIndex + 1}
            onChange={(_, page) => {
              setValues((prev) => ({ ...prev, pageIndex: page - 1 }));
              submitForm();
            }}
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
}

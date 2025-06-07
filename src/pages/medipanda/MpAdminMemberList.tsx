import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import { ColumnDef, getCoreRowModel, getSortedRowModel, SortingState, useReactTable } from '@tanstack/react-table';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
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
import Pagination from '@mui/material/Pagination';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ko } from 'date-fns/locale';
import { Calendar, DocumentDownload } from 'iconsax-react';

import { mpFetchMembers, mpGetMemberExcelDownloadUrl, MpMember, MpMemberSearchRequest } from 'api-definitions/MpMember';
import { MpPartnershipType } from 'api-definitions/MpPartnershipType';
import { MpPagedResponse } from 'api-definitions/MpPaged';
import { useMpErrorDialog } from 'hooks/medipanda/useMpErrorDialog';

interface FormValues {
  page: number;
  size: number;
  sorting: SortingState;
  partnershipType?: MpPartnershipType;
  searchType?: string;
  searchKeyword?: string;
  startAt: Date | null;
  endAt: Date | null;
}

const emptyData: MpMember[] = [];

export default function MpAdminMemberList() {
  const navigate = useNavigate();
  const [pagedResponse, setPagedResponse] = useState<MpPagedResponse<MpMember> | null>(null);
  const { showError } = useMpErrorDialog();

  const { values, handleChange, setFieldValue, submitForm } = useFormik<FormValues>({
    initialValues: {
      page: 0,
      size: 10,
      sorting: [],
      partnershipType: undefined,
      searchType: 'name',
      searchKeyword: '',
      startAt: null,
      endAt: null
    },
    onSubmit: async (vals) => {
      try {
        const request: MpMemberSearchRequest = {
          page: vals.page,
          size: vals.size,
          partnershipType: vals.partnershipType,
          searchType: vals.searchType,
          searchKeyword: vals.searchKeyword,
          startAt: vals.startAt ? vals.startAt.toISOString().split('T')[0] : undefined,
          endAt: vals.endAt ? vals.endAt.toISOString().split('T')[0] : undefined
        };
        const response = await mpFetchMembers(request);
        setPagedResponse(response);
      } catch (error) {
        if (error instanceof Error && error.message === 'NOT_IMPLEMENTED') {
          showError('검색 및 필터 기능은 아직 구현되지 않았습니다.', '기능 미구현');
          setFieldValue('partnershipType', undefined);
          setFieldValue('searchKeyword', '');
          setFieldValue('startAt', null);
          setFieldValue('endAt', null);
          return;
        }
        console.error('회원 목록 조회 오류:', error);
        showError('회원 목록을 조회하는 중 오류가 발생했습니다.');
      }
    }
  });

  const columns: ColumnDef<MpMember>[] = [
    {
      header: 'No',
      accessorFn: (_, index) => values.page * values.size + index + 1,
      cell: ({ getValue }) => getValue()
    },
    {
      header: '회원번호',
      accessorKey: 'memberNo',
      cell: ({ getValue }) => getValue() || '-'
    },
    {
      header: '아이디',
      accessorKey: 'userId',
      cell: ({ getValue }) => getValue()
    },
    {
      header: '회원명',
      accessorKey: 'name',
      cell: ({ getValue }) => getValue()
    },
    {
      header: '휴대폰번호',
      accessorKey: 'phone',
      cell: ({ getValue }) => getValue()
    },
    {
      header: '생년월일',
      accessorKey: 'birthDate',
      cell: ({ getValue }) => getValue() || '-'
    },
    {
      header: '이메일',
      accessorKey: 'email',
      cell: ({ getValue }) => getValue()
    },
    {
      header: '파트너사 계약여부',
      accessorKey: 'partnershipType',
      cell: ({ getValue }) => getValue()
    },
    {
      header: 'CSO신고증 유무',
      accessorKey: 'csoCertification',
      cell: ({ getValue }) => {
        const value = getValue();
        if (value === null) return '-';
        if (typeof value === 'string') return value;
        if (typeof value === 'boolean') return value ? 'Y' : 'N';
        return '-';
      }
    },
    {
      header: '계정상태',
      accessorKey: 'state',
      cell: ({ getValue }) => {
        const state = getValue();
        if (state === null) return '-';
        const isActive = state === true || state === 'ACTIVE';
        return <Box>{isActive ? '활성' : '비활성'}</Box>;
      }
    },
    {
      header: '마케팅수신동의',
      accessorFn: (row) => {
        const consent = row.marketingConsent;
        if (typeof consent === 'boolean') {
          return consent ? '동의' : '미동의';
        }
        if (consent && typeof consent === 'object') {
          return '동의';
        }
        return '미동의';
      },
      cell: ({ getValue }) => getValue()
    },
    {
      header: '가입일',
      accessorKey: 'createdAt',
      cell: ({ getValue }) => getValue()
    },
    {
      header: '최종접속일',
      accessorKey: 'lastLoginAt',
      cell: ({ getValue }) => getValue() || '-'
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
  }, []);

  const handleRowClick = (member: MpMember) => {
    navigate(`/admin/members/edit?userId=${member.userId}`);
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    setFieldValue('page', page - 1);
    submitForm();
  };

  const handleExcelDownload = async () => {
    const request: MpMemberSearchRequest = {
      page: values.page,
      size: values.size,
      partnershipType: values.partnershipType,
      searchType: values.searchType,
      searchKeyword: values.searchKeyword,
      startAt: values.startAt ? values.startAt.toISOString().split('T')[0] : undefined,
      endAt: values.endAt ? values.endAt.toISOString().split('T')[0] : undefined
    };
    try {
      const url = await mpGetMemberExcelDownloadUrl(request);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Excel download failed:', error);
      showError('Excel 다운로드 중 오류가 발생했습니다.');
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h4" sx={{ fontSize: '24px', fontWeight: 600, mb: 2 }}>
              회원관리
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Card sx={{ p: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>파트너사 계약여부</InputLabel>
                    <Select name="partnershipType" value={values.partnershipType || ''} onChange={handleChange}>
                      <MenuItem value={MpPartnershipType.NONE}>{MpPartnershipType.NONE}</MenuItem>
                      <MenuItem value={MpPartnershipType.INDIVIDUAL}>{MpPartnershipType.INDIVIDUAL}</MenuItem>
                      <MenuItem value={MpPartnershipType.CORPORATE}>{MpPartnershipType.CORPORATE}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={2}>
                  <FormControl fullWidth size="small">
                    <Select name="searchType" value={values.searchType} onChange={handleChange}>
                      <MenuItem value="name">회원명</MenuItem>
                      <MenuItem value="memberNo">회원번호</MenuItem>
                      <MenuItem value="userId">아이디</MenuItem>
                      <MenuItem value="phone">휴대폰번호</MenuItem>
                      <MenuItem value="email">이메일</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={2}>
                  <DatePicker
                    label="시작일"
                    value={values.startAt}
                    onChange={(newValue: Date | null) => setFieldValue('startAt', newValue)}
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                        InputProps: {
                          endAdornment: <Calendar size={20} />
                        }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <DatePicker
                    label="종료일"
                    value={values.endAt}
                    onChange={(newValue: Date | null) => setFieldValue('endAt', newValue)}
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                        InputProps: {
                          endAdornment: <Calendar size={20} />
                        }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    size="small"
                    name="searchKeyword"
                    value={values.searchKeyword}
                    onChange={handleChange}
                    placeholder="검색어를 입력하세요"
                  />
                </Grid>
                <Grid item xs={12} sm={1}>
                  <Button variant="contained" onClick={submitForm}>
                    검색
                  </Button>
                </Grid>
              </Grid>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography>검색결과 {pagedResponse?.totalElements || 0} 건</Typography>
              <Button
                startIcon={<DocumentDownload size={20} />}
                onClick={handleExcelDownload}
                sx={{
                  fontSize: '14px'
                }}
              >
                Excel
              </Button>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    {columns.map((column, index) => (
                      <TableCell key={index}>{typeof column.header === 'string' ? column.header : ''}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} onClick={() => handleRowClick(row.original)}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>{cell.getValue() as React.ReactNode}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={pagedResponse?.totalPages || 0}
                page={(values.page || 0) + 1}
                onChange={handlePageChange}
                color="primary"
                size="medium"
              />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
}

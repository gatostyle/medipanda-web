import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
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
import { DocumentDownload } from 'iconsax-react';
import { DateString, getDownloadUserMembersExcel, getUserMembers, MemberResponse } from 'medipanda/backend';
import MpFormikDatePicker from 'medipanda/components/MpFormikDatePicker';
import { SearchFilterActions, SearchFilterBar, SearchFilterItem } from 'medipanda/components/SearchFilterBar';
import { CONSENT_LABELS, MEMBER_ACCOUNT_STATUS_LABELS } from 'medipanda/ui-labels';
import { formatYyyyMmDd } from 'medipanda/utils/dateFormat';
import { Sequenced, withSequence } from 'medipanda/utils/withSequence';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

export default function MpAdminMemberList() {
  const [data, setData] = useState<Sequenced<MemberResponse>[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const formik = useFormik({
    initialValues: {
      contractStatus: '' as 'CONTRACT' | 'NON_CONTRACT' | '',
      searchField: 'name' as 'name' | 'id' | 'userId' | 'phoneNumber' | 'email' | 'companyName',
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

  const columns = useMemo<ColumnDef<Sequenced<MemberResponse>>[]>(
    () => [
      {
        header: 'No',
        accessorKey: 'sequence',
        cell: ({ row }) => row.original.sequence,
        size: 60
      },
      {
        header: '회원번호',
        accessorKey: 'id',
        cell: ({ row }) => row.original.id,
        size: 80
      },
      {
        header: '아이디',
        accessorKey: 'userId',
        cell: ({ row }) => row.original.userId,
        size: 120
      },
      {
        header: '회원명',
        accessorKey: 'name',
        cell: ({ row }) => (
          <Link to={`/admin/members/${row.original.userId}/edit`} style={{ textDecoration: 'none', color: '#1976d2' }}>
            {row.original.name}
          </Link>
        ),
        size: 100
      },
      {
        header: '회사명',
        accessorKey: 'companyName',
        cell: ({ row }) => row.original.companyName,
        size: 150
      },
      {
        header: '휴대폰번호',
        accessorKey: 'phoneNumber',
        cell: ({ row }) => row.original.phoneNumber,
        size: 130
      },
      {
        header: '이메일',
        accessorKey: 'email',
        cell: ({ row }) => row.original.email,
        size: 200
      },
      {
        header: '파트너사 계약여부',
        accessorKey: 'partnerContractStatus',
        cell: ({ row }) => (row.original.partnerContractStatus !== 'NONE' ? '계약' : '미계약'),
        size: 130
      },
      {
        header: 'CSO신고증 유무',
        accessorKey: 'hasCsoCert',
        cell: ({ row }) => (row.original.hasCsoCert ? 'Y' : 'N'),
        size: 120
      },
      {
        header: '계정상태',
        accessorKey: 'accountStatus',
        cell: ({ row }) => MEMBER_ACCOUNT_STATUS_LABELS[row.original.accountStatus],
        size: 90
      },
      {
        header: '마케팅수신동의',
        accessorKey: 'marketingConsent',
        cell: ({ row }) => CONSENT_LABELS[String(row.original.marketingConsent)],
        size: 120
      },
      {
        header: '가입일',
        accessorKey: 'registrationDate',
        cell: ({ row }) => formatYyyyMmDd(row.original.registrationDate),
        size: 150
      },
      {
        header: '최종접속일',
        accessorKey: 'lastLoginDate',
        cell: ({ row }) => formatYyyyMmDd(row.original.lastLoginDate),
        size: 110
      }
    ],
    []
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
      const response = await getUserMembers({
        contractStatus: formik.values.contractStatus !== '' ? formik.values.contractStatus : undefined,
        name: formik.values.searchField === 'name' && formik.values.searchKeyword ? formik.values.searchKeyword : undefined,
        userId: formik.values.searchField === 'userId' && formik.values.searchKeyword ? formik.values.searchKeyword : undefined,
        phoneNumber:
          formik.values.searchField === 'phoneNumber' && formik.values.searchKeyword
            ? formik.values.searchKeyword.replace(/-/g, '')
            : undefined,
        email: formik.values.searchField === 'email' && formik.values.searchKeyword ? formik.values.searchKeyword : undefined,
        companyName: formik.values.searchField === 'companyName' && formik.values.searchKeyword ? formik.values.searchKeyword : undefined,
        startAt: formik.values.startAt ? new DateString(formik.values.startAt) : undefined,
        endAt: formik.values.endAt ? new DateString(formik.values.endAt) : undefined,
        page: formik.values.pageIndex,
        size: formik.values.pageSize
      });

      setData(withSequence(response).content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch member list:', error);
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

  const handleReset = () => {
    formik.resetForm();
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          회원관리
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
                      name="contractStatus"
                      value={formik.values.contractStatus}
                      onChange={(e) => formik.setFieldValue('contractStatus', e.target.value)}
                      displayEmpty
                    >
                      <MenuItem value="">전체</MenuItem>
                      <MenuItem value={'CONTRACT'}>계약</MenuItem>
                      <MenuItem value={'NON_CONTRACT'}>미계약</MenuItem>
                    </Select>
                  </FormControl>
                </SearchFilterItem>
                <SearchFilterItem minWidth={140}>
                  <FormControl fullWidth size="small">
                    <Select
                      name="searchField"
                      value={formik.values.searchField}
                      onChange={(e) => formik.setFieldValue('searchField', e.target.value)}
                      displayEmpty
                    >
                      <MenuItem value="name">회원명</MenuItem>
                      <MenuItem value="id">회원번호</MenuItem>
                      <MenuItem value="userId">아이디</MenuItem>
                      <MenuItem value="phoneNumber">휴대폰번호</MenuItem>
                      <MenuItem value="email">이메일</MenuItem>
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
              <Typography variant="subtitle1">검색결과: {totalElements.toLocaleString()} 건</Typography>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  color="success"
                  target="_blank"
                  href={getDownloadUserMembersExcel({
                    contractStatus: formik.values.contractStatus !== '' ? formik.values.contractStatus : undefined,
                    name: formik.values.searchField === 'name' && formik.values.searchKeyword ? formik.values.searchKeyword : undefined,
                    userId: formik.values.searchField === 'userId' && formik.values.searchKeyword ? formik.values.searchKeyword : undefined,
                    phoneNumber:
                      formik.values.searchField === 'phoneNumber' && formik.values.searchKeyword
                        ? formik.values.searchKeyword.replace(/-/g, '')
                        : undefined,
                    email: formik.values.searchField === 'email' && formik.values.searchKeyword ? formik.values.searchKeyword : undefined,
                    companyName:
                      formik.values.searchField === 'companyName' && formik.values.searchKeyword ? formik.values.searchKeyword : undefined,
                    startAt: formik.values.startAt ? new DateString(formik.values.startAt) : undefined,
                    endAt: formik.values.endAt ? new DateString(formik.values.endAt) : undefined,
                    page: formik.values.pageIndex,
                    size: formik.values.pageSize
                  })}
                >
                  <DocumentDownload />
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
                          <Typography variant="body1" color="text.secondary">
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

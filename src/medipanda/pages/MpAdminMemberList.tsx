import { setUrlParams } from '@/lib/url';
import { useSearchParamsOrDefault } from '@/lib/useSearchParamsOrDefault';
import { useMpModal } from '@/medipanda/hooks/useMpModal';
import {
  Button,
  Card,
  FormControl,
  Grid,
  InputLabel,
  Link,
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
import { DocumentDownload } from 'iconsax-react';
import {
  ContractStatus,
  memberTypeToContractStatus,
  ContractStatusLabel,
  DateString,
  getDownloadUserMembersExcel,
  getUserMembers,
  MemberResponse,
  AccountStatusLabel,
  MemberType,
} from '@/backend';
import { SearchFilterActions, SearchFilterBar, SearchFilterItem } from '@/medipanda/components/SearchFilterBar';
import { formatYyyyMmDd, formatYyyyMmDdHhMm, SafeDate } from '@/medipanda/utils/dateFormat';
import { Sequenced, withSequence } from '@/medipanda/utils/withSequence';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';

export default function MpAdminMemberList() {
  const navigate = useNavigate();

  const initialSearchParams = {
    searchType: '' as 'name' | 'memberId' | 'userId' | 'phoneNumber' | 'email' | 'companyName' | '',
    searchKeyword: '',
    startAt: '',
    endAt: '',
    contractStatus: '' as ContractStatus | '',
    page: '1',
  };

  const {
    searchType,
    searchKeyword,
    startAt: paramStartAt,
    endAt: paramEndAt,
    contractStatus,
    page: paramPage,
  } = useSearchParamsOrDefault(initialSearchParams);
  const startAt = useMemo(() => SafeDate(paramStartAt) ?? null, [paramStartAt]);
  const endAt = useMemo(() => SafeDate(paramEndAt) ?? null, [paramEndAt]);
  const page = Number(paramPage);
  const pageSize = 20;

  const [loading, setLoading] = useState(false);
  const [contents, setContents] = useState<Sequenced<MemberResponse>[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const { alert, alertError } = useMpModal();

  const formik = useFormik({
    initialValues: {
      ...initialSearchParams,
      startAt: null as Date | null,
      endAt: null as Date | null,
      page: null,
    },
    onSubmit: async values => {
      if (values.searchType === '' && values.searchKeyword !== '') {
        await alert('검색유형을 선택하세요.');
        return;
      }

      if (values.searchType === 'memberId' && values.searchKeyword !== '' && Number.isNaN(Number(values.searchKeyword))) {
        await alert('회원번호는 숫자만 입력할 수 있습니다.');
        return;
      }

      const url = setUrlParams(
        {
          ...values,
          startAt: values.startAt !== null ? formatYyyyMmDd(values.startAt) : undefined,
          endAt: values.endAt !== null ? formatYyyyMmDd(values.endAt) : undefined,
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
      const response = await getUserMembers({
        name: searchType === 'name' && searchKeyword !== '' ? searchKeyword : undefined,
        memberId: searchType === 'memberId' && searchKeyword !== '' ? Number(searchKeyword) : undefined,
        userId: searchType === 'userId' && searchKeyword !== '' ? searchKeyword : undefined,
        phoneNumber: searchType === 'phoneNumber' && searchKeyword !== '' ? searchKeyword.replace(/-/g, '') : undefined,
        email: searchType === 'email' && searchKeyword !== '' ? searchKeyword : undefined,
        companyName: searchType === 'companyName' && searchKeyword !== '' ? searchKeyword : undefined,
        startAt: startAt ? new DateString(startAt) : undefined,
        endAt: endAt ? new DateString(endAt) : undefined,
        contractStatus: contractStatus !== '' ? contractStatus : undefined,
        page: page - 1,
        size: pageSize,
      });

      setContents(withSequence(response).content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch member list:', error);
      await alertError('회원 목록을 불러오는 중 오류가 발생했습니다.');
      setContents([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    formik.setValues({
      searchType,
      searchKeyword,
      startAt,
      endAt,
      contractStatus,
      page: null,
    });
    fetchContents();
  }, [searchType, searchKeyword, startAt, endAt, contractStatus, page]);

  const table = useReactTable({
    data: contents,
    columns: [
      {
        header: 'No',
        cell: ({ row }) => row.original.sequence,
        size: 60,
      },
      {
        header: '회원번호',
        cell: ({ row }) => row.original.id,
        size: 80,
      },
      {
        header: '아이디',
        cell: ({ row }) => row.original.userId,
        size: 120,
      },
      {
        header: '회원명',
        cell: ({ row }) => (
          <Link component={RouterLink} to={`/admin/members/${row.original.userId}/edit`}>
            {row.original.name}
          </Link>
        ),
        size: 100,
      },
      {
        header: '회사명',
        cell: ({ row }) => row.original.companyName,
        size: 150,
      },
      {
        header: '휴대폰번호',
        cell: ({ row }) => row.original.phoneNumber,
        size: 130,
      },
      {
        header: '이메일',
        cell: ({ row }) => row.original.email,
        size: 200,
      },
      {
        header: '파트너사 계약여부',
        cell: ({ row }) => ContractStatusLabel[memberTypeToContractStatus(row.original.partnerContractStatus as MemberType)],
        size: 130,
      },
      {
        header: 'CSO신고증 유무',
        cell: ({ row }) => (row.original.hasCsoCert ? 'Y' : 'N'),
        size: 120,
      },
      {
        header: '계정상태',
        cell: ({ row }) => AccountStatusLabel[row.original.accountStatus],
        size: 90,
      },
      {
        header: '마케팅수신동의',
        cell: ({ row }) => (row.original.marketingConsent ? '동의' : '미동의'),
        size: 120,
      },
      {
        header: '가입일',
        cell: ({ row }) => formatYyyyMmDdHhMm(row.original.registrationDate),
        size: 150,
      },
      {
        header: '최종접속일',
        cell: ({ row }) => formatYyyyMmDd(row.original.lastLoginDate),
        size: 110,
      },
    ],
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Stack sx={{ gap: 3 }}>
      <Grid item xs={12}>
        <Typography variant='h4' gutterBottom>
          회원관리
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <Card sx={{ padding: 3 }}>
          <SearchFilterBar component='form' onSubmit={formik.handleSubmit}>
            <SearchFilterItem minWidth={140}>
              <FormControl fullWidth size='small'>
                <InputLabel>계약상태</InputLabel>
                <Select name='contractStatus' value={formik.values.contractStatus} onChange={formik.handleChange}>
                  {Object.keys(ContractStatus).map(contractStatus => (
                    <MenuItem key={contractStatus} value={contractStatus}>
                      {ContractStatusLabel[contractStatus]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </SearchFilterItem>
            <SearchFilterItem minWidth={140}>
              <FormControl fullWidth size='small'>
                <InputLabel>검색유형</InputLabel>
                <Select name='searchType' value={formik.values.searchType} onChange={formik.handleChange}>
                  <MenuItem value={'name'}>회원명</MenuItem>
                  <MenuItem value={'memberId'}>회원번호</MenuItem>
                  <MenuItem value={'userId'}>아이디</MenuItem>
                  <MenuItem value={'phoneNumber'}>휴대폰번호</MenuItem>
                  <MenuItem value={'email'}>이메일</MenuItem>
                  <MenuItem value={'companyName'}>회사명</MenuItem>
                </Select>
              </FormControl>
            </SearchFilterItem>
            <SearchFilterItem minWidth={140}>
              <DatePicker
                value={formik.values.startAt}
                onChange={value => formik.setFieldValue('startAt', value)}
                format='yyyy-MM-dd'
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
                value={formik.values.endAt}
                onChange={value => formik.setFieldValue('endAt', value)}
                format='yyyy-MM-dd'
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
                label='검색어를 입력하세요'
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
          </SearchFilterBar>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card sx={{ padding: 3 }}>
          <Stack direction='row' justifyContent='space-between' alignItems='center' mb={2}>
            <Stack direction='row' spacing={2}>
              <Typography variant='subtitle1'>검색결과: {totalElements.toLocaleString()} 건</Typography>
            </Stack>
            <Stack direction='row' spacing={1}>
              <Button
                variant='contained'
                color='success'
                size='small'
                target='_blank'
                href={getDownloadUserMembersExcel({
                  name: searchType === 'name' && searchKeyword !== '' ? searchKeyword : undefined,
                  memberId: searchType === 'memberId' && searchKeyword !== '' ? Number(searchKeyword) : undefined,
                  userId: searchType === 'userId' && searchKeyword !== '' ? searchKeyword : undefined,
                  phoneNumber: searchType === 'phoneNumber' && searchKeyword !== '' ? searchKeyword.replace(/-/g, '') : undefined,
                  email: searchType === 'email' && searchKeyword !== '' ? searchKeyword : undefined,
                  companyName: searchType === 'companyName' && searchKeyword !== '' ? searchKeyword : undefined,
                  startAt: startAt ? new DateString(startAt) : undefined,
                  endAt: endAt ? new DateString(endAt) : undefined,
                  contractStatus: contractStatus !== '' ? contractStatus : undefined,
                  size: 2 ** 31 - 1,
                })}
                startIcon={<DocumentDownload size={16} />}
              >
                Excel
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
      </Grid>
    </Stack>
  );
}

import { normalizePhoneNumber } from '@/lib/utils/form';
import { setUrlParams } from '@/lib/utils/url';
import { useSearchParamsOrDefault } from '@/lib/hooks/useSearchParamsOrDefault';
import { useMpModal } from '@/hooks/useMpModal';
import {
  Button,
  Card,
  Chip,
  FormControl,
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
import { AccountStatusLabel, getUserMembers, type MemberResponse, Role, RoleLabel } from '@/backend';
import { SearchFilterActions, MpSearchFilterBar, SearchFilterItem } from '@/components/MpSearchFilterBar';
import { formatYyyyMmDdHhMm } from '@/lib/utils/dateFormat';
import { type Sequenced, withSequence } from '@/lib/utils/withSequence';
import { useEffect, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';
import type { RequiredDeep } from 'type-fest';

export default function MpAdminAdminList() {
  const navigate = useNavigate();

  const initialSearchParams = {
    searchType: '' as 'name' | 'userId' | 'email' | 'phoneNumber' | '',
    searchKeyword: '',
    page: '1',
  };

  const { searchType, searchKeyword, page: paramPage } = useSearchParamsOrDefault(initialSearchParams);
  const page = Number(paramPage);
  const pageSize = 20;

  const [loading, setLoading] = useState(false);
  const [contents, setcontents] = useState<Sequenced<MemberResponse>[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const { alert, alertError } = useMpModal();

  const form = useForm({
    defaultValues: {
      ...initialSearchParams,
    },
  });

  const submitHandler: SubmitHandler<RequiredDeep<(typeof form)['control']['_defaultValues']>> = async values => {
    if (values.searchType === '' && values.searchKeyword !== '') {
      await alert('검색유형을 선택하세요.');
      return;
    }

    const url = setUrlParams(
      {
        ...values,
        page: 1,
      },
      initialSearchParams,
    );

    navigate(url);
  };

  const handleReset = () => {
    navigate('');
    form.reset();
  };

  const fetchContents = async () => {
    setLoading(true);
    try {
      const response = await getUserMembers({
        roles: [Role.ADMIN, Role.SUPER_ADMIN],
        name: searchType === 'name' && searchKeyword !== '' ? searchKeyword : undefined,
        userId: searchType === 'userId' && searchKeyword !== '' ? searchKeyword : undefined,
        email: searchType === 'email' && searchKeyword !== '' ? searchKeyword : undefined,
        phoneNumber: searchType === 'phoneNumber' && searchKeyword !== '' ? searchKeyword : undefined,
        page: page - 1,
        size: pageSize,
      });

      setcontents(withSequence(response).content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch admin list:', error);
      await alertError('관리자 목록을 불러오는 중 오류가 발생했습니다.');
      setcontents([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    form.setValue('searchType', searchType);
    form.setValue('searchKeyword', searchKeyword);
    fetchContents();
  }, [searchType, searchKeyword, page]);

  return (
    <Stack sx={{ gap: 3 }}>
      <Typography variant='h4'>관리자 권한</Typography>

      <Card sx={{ padding: 3 }}>
        <MpSearchFilterBar component='form' onSubmit={form.handleSubmit(submitHandler)}>
          <SearchFilterItem minWidth={140}>
            <FormControl fullWidth size='small'>
              <InputLabel>검색유형</InputLabel>
              <Controller
                control={form.control}
                name='searchType'
                render={({ field }) => (
                  <Select {...field}>
                    <MenuItem value={'name'}>관리자명</MenuItem>
                    <MenuItem value={'userId'}>아이디</MenuItem>
                    <MenuItem value={'email'}>이메일</MenuItem>
                    <MenuItem value={'phoneNumber'}>연락처</MenuItem>
                  </Select>
                )}
              />
            </FormControl>
          </SearchFilterItem>
          <SearchFilterItem flexGrow={1} minWidth={200}>
            <Controller
              control={form.control}
              name='searchKeyword'
              render={({ field }) => <TextField {...field} size='small' label='검색어' fullWidth />}
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
        </MpSearchFilterBar>
      </Card>

      <Card sx={{ padding: 3 }}>
        <Stack direction='row' justifyContent='space-between' alignItems='center' mb={2}>
          <Stack direction='row' spacing={2}>
            <Typography variant='subtitle1'>검색결과: {totalElements.toLocaleString()} 건</Typography>
          </Stack>
          <Stack direction='row' spacing={1}>
            <Button variant='contained' size='small' color='success' component={RouterLink} to='/admin/admins/new'>
              등록
            </Button>
          </Stack>
        </Stack>

        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table size='small'>
            <TableHead>
              <TableRow>
                <TableCell style={{ width: 60 }}>No</TableCell>
                <TableCell style={{ width: 120 }}>아이디</TableCell>
                <TableCell style={{ width: 120 }}>관리자</TableCell>
                <TableCell style={{ width: 200 }}>이메일</TableCell>
                <TableCell style={{ width: 150 }}>연락처</TableCell>
                <TableCell style={{ width: 100 }}>권한</TableCell>
                <TableCell style={{ width: 80 }}>상태</TableCell>
                <TableCell style={{ width: 150 }}>등록일</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align='center' sx={{ py: 3 }}>
                    <Typography variant='body2' color='text.secondary'>
                      데이터를 로드하는 중입니다.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : contents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align='center' sx={{ py: 3 }}>
                    <Typography variant='body2' color='text.secondary'>
                      검색 결과가 없습니다.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                contents.map(row => (
                  <TableRow key={row.userId}>
                    <TableCell>{row.sequence}</TableCell>
                    <TableCell>{row.userId}</TableCell>
                    <TableCell>
                      <Link component={RouterLink} to={`/admin/admins/${row.userId}/edit`}>
                        {row.name}
                      </Link>
                    </TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{normalizePhoneNumber(row.phoneNumber)}</TableCell>
                    <TableCell>{RoleLabel[row.role]}</TableCell>
                    <TableCell>
                      <Chip label={AccountStatusLabel[row.accountStatus]} color='success' variant='light' size='small' />
                    </TableCell>
                    <TableCell>{formatYyyyMmDdHhMm(row.registrationDate)}</TableCell>
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
    </Stack>
  );
}

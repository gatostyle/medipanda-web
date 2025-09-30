import { setUrlParams } from '@/lib/utils/url';
import { useSearchParamsOrDefault } from '@/lib/hooks/useSearchParamsOrDefault';
import { useMpModal } from '@/hooks/useMpModal';
import {
  Button,
  Card,
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
import { DatePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { DocumentDownload } from 'iconsax-reactjs';
import {
  ContractStatus,
  memberTypeToContractStatus,
  ContractStatusLabel,
  DateString,
  getDownloadUserMembersExcel,
  getUserMembers,
  type MemberResponse,
  AccountStatusLabel,
} from '@/backend';
import { SearchFilterActions, MpSearchFilterBar, SearchFilterItem } from '@/components/MpSearchFilterBar';
import { DATEFORMAT_YYYY_MM_DD, DATEFORMAT_YYYY_MM_DD_HH_MM, DateUtils } from '@/lib/utils/dateFormat';
import { type Sequenced, withSequence } from '@/lib/utils/withSequence';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';
import type { RequiredDeep } from 'type-fest';

export default function MpAdminMemberList() {
  const navigate = useNavigate();

  const initialSearchParams = {
    searchType: '' as 'name' | 'memberId' | 'userId' | 'phoneNumber' | 'email' | 'companyName' | '',
    searchKeyword: '',
    startAt: '',
    endAt: '',
    contractStatus: '' as keyof typeof ContractStatus | '',
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
  const startAt = useMemo(() => DateUtils.tryParseDate(paramStartAt) ?? null, [paramStartAt]);
  const endAt = useMemo(() => DateUtils.tryParseDate(paramEndAt) ?? null, [paramEndAt]);
  const page = Number(paramPage);
  const pageSize = 20;

  const [loading, setLoading] = useState(false);
  const [contents, setContents] = useState<Sequenced<MemberResponse>[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const { alert, alertError } = useMpModal();

  const form = useForm({
    defaultValues: {
      ...initialSearchParams,
      startAt: null as Date | null,
      endAt: null as Date | null,
    },
  });
  const formStartAt = form.watch('startAt');
  const formEndAt = form.watch('endAt');

  const submitHandler: SubmitHandler<RequiredDeep<(typeof form)['control']['_defaultValues']>> = async values => {
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
        startAt: values.startAt !== null ? format(values.startAt, DATEFORMAT_YYYY_MM_DD) : undefined,
        endAt: values.endAt !== null ? format(values.endAt, DATEFORMAT_YYYY_MM_DD) : undefined,
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
    form.setValue('searchType', searchType);
    form.setValue('searchKeyword', searchKeyword);
    form.setValue('startAt', startAt);
    form.setValue('endAt', endAt);
    form.setValue('contractStatus', contractStatus);
    fetchContents();
  }, [searchType, searchKeyword, startAt, endAt, contractStatus, page]);

  return (
    <Stack sx={{ gap: 3 }}>
      <Typography variant='h4'>회원관리</Typography>

      <Card sx={{ padding: 3 }}>
        <MpSearchFilterBar component='form' onSubmit={form.handleSubmit(submitHandler)}>
          <SearchFilterItem minWidth={140}>
            <FormControl fullWidth size='small'>
              <InputLabel>계약상태</InputLabel>
              <Controller
                control={form.control}
                name={'contractStatus'}
                render={({ field }) => (
                  <Select {...field}>
                    {Object.keys(ContractStatus).map(contractStatus => (
                      <MenuItem key={contractStatus} value={contractStatus}>
                        {ContractStatusLabel[contractStatus]}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </FormControl>
          </SearchFilterItem>
          <SearchFilterItem minWidth={140}>
            <FormControl fullWidth size='small'>
              <InputLabel>검색유형</InputLabel>
              <Controller
                control={form.control}
                name='searchType'
                render={({ field }) => (
                  <Select {...field}>
                    <MenuItem value={'name'}>회원명</MenuItem>
                    <MenuItem value={'memberId'}>회원번호</MenuItem>
                    <MenuItem value={'userId'}>아이디</MenuItem>
                    <MenuItem value={'phoneNumber'}>연락처</MenuItem>
                    <MenuItem value={'email'}>이메일</MenuItem>
                    <MenuItem value={'companyName'}>회사명</MenuItem>
                  </Select>
                )}
              />
            </FormControl>
          </SearchFilterItem>
          <SearchFilterItem minWidth={140}>
            <Controller
              control={form.control}
              name={'startAt'}
              render={({ field }) => (
                <DatePicker
                  {...field}
                  format={DATEFORMAT_YYYY_MM_DD}
                  views={['year', 'month', 'day']}
                  maxDate={formEndAt ?? undefined}
                  label='시작일'
                  slotProps={{
                    textField: {
                      size: 'small',
                    },
                  }}
                />
              )}
            />
          </SearchFilterItem>
          <SearchFilterItem minWidth={140}>
            <Controller
              control={form.control}
              name={'endAt'}
              render={({ field }) => (
                <DatePicker
                  {...field}
                  format={DATEFORMAT_YYYY_MM_DD}
                  views={['year', 'month', 'day']}
                  minDate={formStartAt ?? undefined}
                  label='종료일'
                  slotProps={{
                    textField: {
                      size: 'small',
                    },
                  }}
                />
              )}
            />
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
              <TableRow>
                <TableCell width={60}>No</TableCell>
                <TableCell width={80}>회원번호</TableCell>
                <TableCell width={120}>아이디</TableCell>
                <TableCell width={100}>회원명</TableCell>
                <TableCell width={150}>회사명</TableCell>
                <TableCell width={130}>연락처</TableCell>
                <TableCell width={200}>이메일</TableCell>
                <TableCell width={130}>파트너사 계약여부</TableCell>
                <TableCell width={120}>CSO신고증 유무</TableCell>
                <TableCell width={90}>계정상태</TableCell>
                <TableCell width={120}>마케팅수신동의</TableCell>
                <TableCell width={150}>가입일</TableCell>
                <TableCell width={110}>최종접속일</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={13} align='center' sx={{ py: 3 }}>
                    <Typography variant='body2' color='text.secondary'>
                      데이터를 로드하는 중입니다.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : contents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={13} align='center' sx={{ py: 3 }}>
                    <Typography variant='body2' color='text.secondary'>
                      검색 결과가 없습니다.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                contents.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>{item.sequence}</TableCell>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{item.userId}</TableCell>
                    <TableCell>
                      <Link component={RouterLink} to={`/admin/members/${item.userId}/edit`}>
                        {item.name}
                      </Link>
                    </TableCell>
                    <TableCell>{item.companyName}</TableCell>
                    <TableCell>{item.phoneNumber}</TableCell>
                    <TableCell>{item.email}</TableCell>
                    <TableCell>{ContractStatusLabel[memberTypeToContractStatus(item.partnerContractStatus)]}</TableCell>
                    <TableCell>{item.hasCsoCert ? 'Y' : 'N'}</TableCell>
                    <TableCell>{AccountStatusLabel[item.accountStatus]}</TableCell>
                    <TableCell>{item.marketingConsent ? '동의' : '미동의'}</TableCell>
                    <TableCell>{DateUtils.parseUtcAndFormatKst(item.registrationDate, DATEFORMAT_YYYY_MM_DD_HH_MM)}</TableCell>
                    <TableCell>{DateUtils.parseUtcAndFormatKst(item.lastLoginDate, DATEFORMAT_YYYY_MM_DD)}</TableCell>
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

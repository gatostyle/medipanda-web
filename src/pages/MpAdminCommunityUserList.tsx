import { normalizePhoneNumber } from '@/lib/utils/form';
import { setUrlParams } from '@/lib/utils/url';
import { useSearchParamsOrDefault } from '@/lib/hooks/useSearchParamsOrDefault';
import { useMpModal } from '@/hooks/useMpModal';
import {
  Button,
  Card,
  FormControl,
  InputLabel,
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
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { type BoardMemberStatsResponse, ContractStatus, ContractStatusLabel, getBoardMembers } from '@/backend';
import { SearchFilterActions, MpSearchFilterBar, SearchFilterItem } from '@/components/MpSearchFilterBar';
import { type Sequenced, withSequence } from '@/lib/utils/withSequence';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';
import type { RequiredDeep } from 'type-fest';

export default function MpAdminCommunityUserList() {
  const navigate = useNavigate();

  const initialSearchParams = {
    searchType: 'name' as 'name' | 'memberId' | 'userId' | 'nickname',
    searchKeyword: '',
    contractStatus: '' as keyof typeof ContractStatus | '',
    page: '1',
  };

  const { searchType, searchKeyword, contractStatus, page: paramPage } = useSearchParamsOrDefault(initialSearchParams);
  const page = Number(paramPage);
  const pageSize = 20;

  const [loading, setLoading] = useState(false);
  const [contents, setContents] = useState<Sequenced<BoardMemberStatsResponse>[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const { alertError } = useMpModal();

  const form = useForm({
    defaultValues: {
      ...initialSearchParams,
    },
  });

  const submitHandler: SubmitHandler<RequiredDeep<(typeof form)['control']['_defaultValues']>> = async values => {
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
      const response = await getBoardMembers({
        [searchType]: searchKeyword !== '' ? searchKeyword : undefined,
        contractStatus: contractStatus !== '' ? contractStatus : undefined,
        startAt: undefined,
        endAt: undefined,
        filterDeleted: true,
        page: page - 1,
        size: pageSize,
      });

      setContents(withSequence(response).content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch board members:', error);
      await alertError('이용자 목록을 불러오는 중 오류가 발생했습니다.');
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
    form.setValue('contractStatus', contractStatus);
    fetchContents();
  }, [searchType, searchKeyword, contractStatus, page]);

  return (
    <Stack sx={{ gap: 3 }}>
      <Typography variant='h4'>이용자 관리</Typography>

      <Card sx={{ padding: 3 }}>
        <MpSearchFilterBar component='form' onSubmit={form.handleSubmit(submitHandler)}>
          <SearchFilterItem minWidth={140}>
            <FormControl fullWidth size='small'>
              <InputLabel>파트너사 계약여부</InputLabel>
              <Controller
                control={form.control}
                name={'contractStatus'}
                render={({ field }) => (
                  <Select {...field} size='small'>
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
                name={'searchType'}
                render={({ field }) => (
                  <Select {...field}>
                    <MenuItem value={'name'}>회원명</MenuItem>
                    <MenuItem value={'memberId'}>회원번호</MenuItem>
                    <MenuItem value={'userId'}>아이디</MenuItem>
                    <MenuItem value={'nickname'}>닉네임</MenuItem>
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
            <Button type='submit' variant='contained' size='small'>
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
        </Stack>

        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table size='small'>
            <TableHead>
              <TableRow>
                <TableCell width={60}>No</TableCell>
                <TableCell width={100}>회원번호</TableCell>
                <TableCell width={120}>아이디</TableCell>
                <TableCell width={100}>회원명</TableCell>
                <TableCell width={130}>연락처</TableCell>
                <TableCell width={130}>파트너사 계약여부</TableCell>
                <TableCell width={100}>작성글 수</TableCell>
                <TableCell width={100}>댓글 수</TableCell>
                <TableCell width={100}>좋아요 수</TableCell>
                <TableCell width={120}>블라인드 글 수</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} align='center' sx={{ py: 3 }}>
                    <Typography variant='body2' color='text.secondary'>
                      데이터를 로드하는 중입니다.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : contents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align='center' sx={{ py: 3 }}>
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
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{normalizePhoneNumber(item.phoneNumber)}</TableCell>
                    <TableCell>{ContractStatusLabel[item.contractStatus]}</TableCell>
                    <TableCell>{item.postCount}</TableCell>
                    <TableCell>{item.commentCount}</TableCell>
                    <TableCell>{item.totalLikes}</TableCell>
                    <TableCell>{item.blindPostCount}</TableCell>
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

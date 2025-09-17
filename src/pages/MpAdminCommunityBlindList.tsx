import { setUrlParams } from '@/lib/utils/url';
import { useSearchParamsOrDefault } from '@/lib/hooks/useSearchParamsOrDefault';
import { useMpModal } from '@/hooks/useMpModal';
import {
  Button,
  Card,
  Checkbox,
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
import { DatePicker } from '@mui/x-date-pickers';
import { useFormik } from 'formik';
import { type BlindPostResponse, DateString, getBlindPosts, PostType, PostTypeLabel, unblindPost } from '@/backend';
import { SearchFilterActions, MpSearchFilterBar, SearchFilterItem } from '@/components/MpSearchFilterBar';
import { useMpDeleteDialog } from '@/hooks/useMpDeleteDialog';
import { DATEFORMAT_YYYY_MM_DD, formatYyyyMmDd, formatYyyyMmDdHhMm, SafeDate } from '@/lib/utils/dateFormat';
import { type Sequenced, withSequence } from '@/lib/utils/withSequence';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';

export default function MpAdminCommunityBlindList() {
  const navigate = useNavigate();

  const initialSearchParams = {
    searchType: '' as 'nickname' | 'userId' | 'memberName' | '',
    searchKeyword: '',
    startAt: '',
    endAt: '',
    postType: '' as keyof typeof PostType | '',
    page: '1',
  };

  const {
    searchType,
    searchKeyword,
    startAt: paramStartAt,
    endAt: paramEndAt,
    postType,
    page: paramPage,
  } = useSearchParamsOrDefault(initialSearchParams);
  const startAt = useMemo(() => SafeDate(paramStartAt) ?? null, [paramStartAt]);
  const endAt = useMemo(() => SafeDate(paramEndAt) ?? null, [paramEndAt]);
  const page = Number(paramPage);
  const pageSize = 20;

  const [contents, setContents] = useState<Sequenced<BlindPostResponse>[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const deleteDialog = useMpDeleteDialog();
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
      const response = await getBlindPosts({
        nickname: searchType === 'nickname' && searchKeyword !== '' ? searchKeyword : undefined,
        userId: searchType === 'userId' && searchKeyword !== '' ? searchKeyword : undefined,
        memberName: searchType === 'memberName' && searchKeyword !== '' ? searchKeyword : undefined,
        startAt: startAt ? new DateString(startAt) : undefined,
        endAt: endAt ? new DateString(endAt) : undefined,
        postType: postType !== '' ? postType : undefined,
        page: page - 1,
        size: pageSize,
      });

      setContents(withSequence(response).content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch blind post list:', error);
      await alertError('블라인드 목록을 불러오는 중 오류가 발생했습니다.');
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
      postType,
      page: null,
    });
    fetchContents();
  }, [searchType, searchKeyword, startAt, endAt, postType, page]);

  const handleUnblind = () => {
    const count = selectedIds.length;
    const message =
      count === 1 ? `선택한 항목의 블라인드를 해제하시겠습니까?` : `${count}건이 선택되었습니다. 블라인드를 해제하시겠습니까?`;

    deleteDialog.open({
      message,
      onConfirm: async () => {
        try {
          for (const id of selectedIds) {
            const item = contents.find(item => item.id === id);
            if (item) {
              if (item.postType === PostType.BOARD) {
                await unblindPost({ postId: item.id, commentId: null });
              } else {
                await unblindPost({ postId: null, commentId: item.id });
              }
            }
          }
          await fetchContents();
          setSelectedIds([]);
        } catch (error) {
          console.error('Failed to unblind posts:', error);
          await alertError('블라인드 해제 중 오류가 발생했습니다.');
        }
      },
    });
  };

  return (
    <Stack sx={{ gap: 3 }}>
      <Typography variant='h4'>블라인드 관리</Typography>

      <Card sx={{ padding: 3 }}>
        <MpSearchFilterBar component='form' onSubmit={formik.handleSubmit}>
          <SearchFilterItem minWidth={140}>
            <FormControl fullWidth size='small'>
              <InputLabel>글 유형</InputLabel>
              <Select name='postType' value={formik.values.postType} onChange={formik.handleChange}>
                {Object.keys(PostType).map(postType => (
                  <MenuItem key={postType} value={postType}>
                    {PostTypeLabel[postType]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </SearchFilterItem>
          <SearchFilterItem minWidth={140}>
            <FormControl fullWidth size='small'>
              <InputLabel>검색유형</InputLabel>
              <Select name='searchType' value={formik.values.searchType} onChange={formik.handleChange}>
                <MenuItem value={'nickname'}>닉네임</MenuItem>
                <MenuItem value={'userId'}>아이디</MenuItem>
                <MenuItem value={'memberName'}>회원명</MenuItem>
              </Select>
            </FormControl>
          </SearchFilterItem>
          <SearchFilterItem minWidth={140}>
            <DatePicker
              value={formik.values.startAt}
              onChange={value => formik.setFieldValue('startAt', value)}
              format={DATEFORMAT_YYYY_MM_DD}
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
              format={DATEFORMAT_YYYY_MM_DD}
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
              placeholder='검색어를 입력하세요'
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
        </MpSearchFilterBar>
      </Card>

      <Card sx={{ padding: 3 }}>
        <Stack direction='row' justifyContent='space-between' alignItems='center' mb={2}>
          <Stack direction='row' spacing={2}>
            <Typography variant='subtitle1'>검색결과: {totalElements.toLocaleString()} 건</Typography>
          </Stack>
          <Stack direction='row' spacing={1}>
            <Button variant='contained' color='success' size='small' disabled={selectedIds.length === 0} onClick={handleUnblind}>
              블라인드 해제
            </Button>
          </Stack>
        </Stack>

        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table size='small'>
            <TableHead>
              <TableRow>
                <TableCell width={50}>
                  <Checkbox
                    checked={selectedIds.length === contents.length && contents.length > 0}
                    onChange={e => {
                      if (e.target.checked) {
                        setSelectedIds(contents.map(item => item.id));
                      } else {
                        setSelectedIds([]);
                      }
                    }}
                  />
                </TableCell>
                <TableCell width={60}>No</TableCell>
                <TableCell width={120}>아이디</TableCell>
                <TableCell width={100}>회원명</TableCell>
                <TableCell width={100}>닉네임</TableCell>
                <TableCell width={80}>글 유형</TableCell>
                <TableCell width={150}>글 내용</TableCell>
                <TableCell width={150}>블라인드 처리일</TableCell>
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
                contents.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(item.id)}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedIds(prev => [...prev, item.id]);
                          } else {
                            setSelectedIds(prev => prev.filter(id => id !== item.id));
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>{item.sequence}</TableCell>
                    <TableCell>{item.userId}</TableCell>
                    <TableCell>{item.memberName}</TableCell>
                    <TableCell>{item.nickname}</TableCell>
                    <TableCell>{PostTypeLabel[item.postType]}</TableCell>
                    <TableCell>
                      <Typography
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: 300,
                        }}
                      >
                        {item.content}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatYyyyMmDdHhMm(item.blindAt)}</TableCell>
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

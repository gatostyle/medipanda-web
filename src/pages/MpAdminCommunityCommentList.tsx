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
import {
  type CommentMemberResponse,
  CommentType,
  CommentTypeLabel,
  ContractStatusLabel,
  DateString,
  getCommentMembers,
  toggleBlindStatus,
} from '@/backend';
import { SearchFilterActions, MpSearchFilterBar, SearchFilterItem } from '@/components/MpSearchFilterBar';
import { useMpDeleteDialog } from '@/hooks/useMpDeleteDialog';
import { DATEFORMAT_YYYY_MM_DD, formatYyyyMmDd, SafeDate } from '@/lib/utils/dateFormat';
import { type Sequenced, withSequence } from '@/lib/utils/withSequence';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';

export default function MpAdminCommunityCommentList() {
  const navigate = useNavigate();

  const initialSearchParams = {
    searchType: '' as 'nickname' | 'userId' | '',
    searchKeyword: '',
    commentType: '' as keyof typeof CommentType | '',
    startAt: '',
    endAt: '',
    page: '1',
  };

  const {
    searchType,
    searchKeyword,
    commentType,
    startAt: paramStartAt,
    endAt: paramEndAt,
    page: paramPage,
  } = useSearchParamsOrDefault(initialSearchParams);
  const startAt = useMemo(() => SafeDate(paramStartAt) ?? null, [paramStartAt]);
  const endAt = useMemo(() => SafeDate(paramEndAt) ?? null, [paramEndAt]);
  const page = Number(paramPage);
  const pageSize = 20;

  const [loading, setLoading] = useState(false);
  const [contents, setContents] = useState<Sequenced<CommentMemberResponse>[]>([]);
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
      const response = await getCommentMembers({
        userId: searchType === 'userId' && searchKeyword !== '' ? searchKeyword : undefined,
        nickname: searchType === 'nickname' && searchKeyword !== '' ? searchKeyword : undefined,
        startAt: startAt ? new DateString(startAt) : undefined,
        endAt: endAt ? new DateString(endAt) : undefined,
        commentType: commentType !== '' ? commentType : undefined,
        page: page - 1,
        size: pageSize,
      });

      setContents(withSequence(response).content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch comment list:', error);
      await alertError('댓글 목록을 불러오는 중 오류가 발생했습니다.');
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
      commentType,
      startAt,
      endAt,
      page: null,
    });
    fetchContents();
  }, [searchType, searchKeyword, commentType, startAt, endAt, page]);

  const handleBlind = () => {
    const count = selectedIds.length;
    const message = count === 1 ? `댓글을 블라인드 처리하시겠습니까?` : `${count}건이 선택되었습니다. 블라인드 처리하시겠습니까?`;

    deleteDialog.open({
      message,
      onConfirm: async () => {
        try {
          for (const id of selectedIds) {
            const comment = contents.find(item => item.id === id);
            if (comment) {
              await toggleBlindStatus(id);
            }
          }
          await fetchContents();
          setSelectedIds([]);
        } catch (error) {
          console.error('Failed to blind comments:', error);
          await alertError('댓글 블라인드 처리 중 오류가 발생했습니다.');
        }
      },
    });
  };

  return (
    <Stack sx={{ gap: 3 }}>
      <Typography variant='h4'>댓글 관리</Typography>

      <Card sx={{ padding: 3 }}>
        <MpSearchFilterBar component='form' onSubmit={formik.handleSubmit}>
          <SearchFilterItem minWidth={140}>
            <FormControl fullWidth size='small'>
              <InputLabel>글 유형</InputLabel>
              <Select name='commentType' value={formik.values.commentType} onChange={formik.handleChange}>
                {Object.keys(CommentType).map(commentType => (
                  <MenuItem key={commentType} value={commentType}>
                    {CommentTypeLabel[commentType]}
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
                <MenuItem value={'member'}>회원명</MenuItem>
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
            <Button variant='contained' color='success' size='small' disabled={selectedIds.length === 0} onClick={handleBlind}>
              블라인드
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
                <TableCell width={150}>아이디</TableCell>
                <TableCell width={100}>회원명</TableCell>
                <TableCell width={150}>닉네임</TableCell>
                <TableCell width={100}>계약유무</TableCell>
                <TableCell width={80}>유형</TableCell>
                <TableCell width={150}>댓글내용</TableCell>
                <TableCell width={100}>좋아요 수</TableCell>
                <TableCell width={150}>등록일</TableCell>
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
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.nickname}</TableCell>
                    <TableCell>{ContractStatusLabel[item.contractStatus]}</TableCell>
                    <TableCell>{CommentTypeLabel[item.commentType]}</TableCell>
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
                    <TableCell>{item.likesCount}</TableCell>
                    <TableCell>{formatYyyyMmDd(item.createdAt)}</TableCell>
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

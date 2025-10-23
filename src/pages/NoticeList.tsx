import { type BoardPostResponse, BoardType, getBoards, getFixedTopNotices, NoticeType } from '@/backend';
import { MedipandaPagination } from '@/custom/components/MedipandaPagination';
import { useSearchParamsOrDefault } from '@/lib/hooks/useSearchParamsOrDefault';
import { setUrlParams } from '@/lib/utils/url';
import { colors } from '@/themes';
import { DateUtils, DATEFORMAT_YYYY_MM_DD } from '@/lib/utils/dateFormat';
import { BoardUtils } from '@/utils/BoardUtils';
import { Search } from '@mui/icons-material';
import {
  Box,
  IconButton,
  InputAdornment,
  PaginationItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import type { RequiredDeep } from 'type-fest';

export default function NoticeList() {
  const navigate = useNavigate();

  const [contents, setContents] = useState<BoardPostResponse[]>([]);
  const [totalPages, setTotalPages] = useState(0);

  const initialSearchParams = {
    searchType: 'boardTitle' as 'userId' | 'name' | 'nickname' | 'boardTitle' | 'drugCompany' | 'myUserId',
    searchKeyword: '',
    noticeType: '' as keyof typeof NoticeType | '',
    page: '1',
  };

  const { searchType, searchKeyword, noticeType, page: paramPage } = useSearchParamsOrDefault(initialSearchParams);
  const page = Number(paramPage);
  const pageSize = 10;

  const form = useForm({
    defaultValues: {
      ...initialSearchParams,
    },
  });

  const submitHandler: SubmitHandler<RequiredDeep<(typeof form)['control']['_defaultValues']>> = async values => {
    console.log({ values });
    const url = setUrlParams(
      {
        ...values,
        page: 1,
      },
      initialSearchParams,
    );

    navigate(url);
  };

  const fetchContents = async () => {
    try {
      const response = await getBoards({
        boardType: BoardType.NOTICE,
        [searchType]: searchKeyword !== '' ? searchKeyword : undefined,
        noticeTypes: noticeType !== '' ? [noticeType] : undefined,
        page: page - 1,
        size: pageSize,
        filterDeleted: true,
        filterBlind: true,
      });

      setContents(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch notice list:', error);
      alert('공지사항 목록을 불러오는 중 오류가 발생했습니다.');
      setContents([]);
      setTotalPages(0);
    }
  };

  useEffect(() => {
    form.setValue('searchType', searchType);
    form.setValue('searchKeyword', searchKeyword);
    form.setValue('noticeType', noticeType);
    fetchContents();
  }, [searchType, searchKeyword, noticeType, page]);

  const [fixedNotices, setFixedNotices] = useState<BoardPostResponse[]>([]);

  const fetchFixedNotices = async () => {
    const response = await getFixedTopNotices({
      boardType: BoardType.NOTICE,
      noticeTypes: [
        NoticeType.PRODUCT_STATUS,
        NoticeType.MANUFACTURING_SUSPENSION,
        NoticeType.NEW_PRODUCT,
        NoticeType.POLICY,
        NoticeType.GENERAL,
      ],
      filterBlind: true,
      filterDeleted: true,
    });

    setFixedNotices(response);
  };

  useEffect(() => {
    fetchFixedNotices();
  }, []);

  return (
    <>
      <Typography variant='headingPc3M' sx={{ color: colors.gray80 }}>
        공지사항
      </Typography>

      <Stack
        direction='row'
        alignItems='center'
        component='form'
        onSubmit={form.handleSubmit(submitHandler)}
        sx={{
          marginTop: '30px',
        }}
      >
        <Controller
          control={form.control}
          name='searchKeyword'
          render={({ field }) => (
            <TextField
              {...field}
              size='small'
              placeholder='제약사명 또는 제목을 검색해주세요'
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton edge='end' type='submit'>
                      <Search />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                width: '350px',
                marginLeft: 'auto',
              }}
            />
          )}
        />
      </Stack>

      <Table
        sx={{
          marginTop: '10px',
          borderTop: `1px solid ${colors.gray50}`,
        }}
      >
        <TableBody>
          {[...fixedNotices, ...contents].map(notice => (
            <TableRow
              key={notice.id}
              sx={{
                borderBottom: `1px solid ${colors.gray10}`,
                backgroundColor: fixedNotices.includes(notice) ? colors.gray10 : undefined,
              }}
            >
              <TableCell>
                <Typography
                  variant='smallPcR'
                  sx={{ color: notice.noticeProperties!.drugCompany === '' ? colors.vividViolet : colors.gray70 }}
                >
                  {notice.noticeProperties!.drugCompany || '메디판다'}
                </Typography>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography
                    component={RouterLink}
                    to={`/customer-service/notice/${notice.id}`}
                    variant='smallPcR'
                    sx={{
                      color: colors.gray70,
                      textDecoration: 'none',
                      '&:hover': {
                        color: colors.vividViolet,
                        textDecoration: 'underline',
                      },

                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',

                      whiteSpace: 'pre-line',
                      wordBreak: 'keep-all',
                    }}
                  >
                    {fixedNotices.includes(notice) && (
                      <img
                        src='/assets/icons/icon-pin.svg'
                        style={{
                          width: '16px',
                          height: '16px',
                        }}
                      />
                    )}
                    {notice.title}
                  </Typography>
                  {BoardUtils.isNewPost(DateUtils.utcToKst(new Date(notice.createdAt))) && (
                    <img src='/assets/icons/icon-bullet-new.svg' style={{ width: '25px', height: '14px' }} />
                  )}
                </Box>
              </TableCell>
              <TableCell align='center'>
                <Typography variant='smallPcR' sx={{ color: colors.gray70 }}>
                  {DateUtils.parseUtcAndFormatKst(notice.createdAt, DATEFORMAT_YYYY_MM_DD)}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <MedipandaPagination
        count={totalPages}
        page={page}
        showFirstButton
        showLastButton
        renderItem={item => <PaginationItem {...item} component={RouterLink} to={setUrlParams({ page: item.page }, initialSearchParams)} />}
        sx={{
          alignSelf: 'center',
          marginTop: '40px',
        }}
      />
    </>
  );
}

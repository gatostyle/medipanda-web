import { type BoardPostResponse, BoardType, getBoards, getFixedTopNotices, NoticeType } from '@/backend';
import { CommunityBanners } from '@/custom/components/CommunityBanners';
import { MedipandaPagination } from '@/custom/components/MedipandaPagination';
import { MedipandaTableCell, MedipandaTableRow } from '@/custom/components/MedipandaTable';
import { useSession } from '@/hooks/useSession';
import { useSearchParamsOrDefault } from '@/lib/hooks/useSearchParamsOrDefault';
import { setUrlParams } from '@/lib/utils/url';
import { colors } from '@/themes';
import { DateUtils, DATEFORMAT_YYYY_MM_DD_HH_MM } from '@/lib/utils/dateFormat';
import { Search } from '@mui/icons-material';
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Link,
  PaginationItem,
  Stack,
  Table,
  TableBody,
  TableHead,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import type { RequiredDeep } from 'type-fest';

export default function MrCsoMatchingList() {
  const { session } = useSession();

  const navigate = useNavigate();

  const [contents, setContents] = useState<BoardPostResponse[]>([]);
  const [totalPages, setTotalPages] = useState(0);

  const initialSearchParams = {
    searchType: 'boardTitle' as 'userId' | 'name' | 'nickname' | 'boardTitle' | 'drugCompany' | 'myUserId',
    searchKeyword: '',
    page: '1',
    filterMine: 'false',
  };

  const { searchType, searchKeyword, page: paramPage, filterMine: paramFilterMine } = useSearchParamsOrDefault(initialSearchParams);
  const page = Number(paramPage);
  const pageSize = 10;
  const filterMine = paramFilterMine === 'true';

  const form = useForm({
    defaultValues: {
      ...initialSearchParams,
      filterMine: null,
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
        boardType: BoardType.MR_CSO_MATCHING,
        [searchType]: searchKeyword,
        page: page - 1,
        size: pageSize,
        myUserId: filterMine ? session!.userId : undefined,
      });

      setContents(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch mr cso matching list:', error);
      alert('신규처 매칭 목록을 불러오는 중 오류가 발생했습니다.');
      setContents([]);
      setTotalPages(0);
    }
  };

  useEffect(() => {
    form.setValue('searchType', searchType);
    form.setValue('searchKeyword', searchKeyword);
    fetchContents();
  }, [searchType, searchKeyword, page, filterMine]);

  const [fixedNotices, setFixedNotices] = useState<BoardPostResponse[]>([]);

  const fetchFixedNotices = async () => {
    const response = await getFixedTopNotices({
      boardType: BoardType.NOTICE,
      noticeTypes: [NoticeType.MR_CSO_MATCHING],
    });

    setFixedNotices(response);
  };

  useEffect(() => {
    fetchFixedNotices();
  }, []);

  return (
    <>
      <Stack
        direction='row'
        alignItems='flex-start'
        gap='24px'
        sx={{
          marginTop: '40px',
        }}
      >
        <Stack>
          <Table>
            <TableHead>
              <MedipandaTableRow>
                <MedipandaTableCell sx={{ width: '380px' }}>제목</MedipandaTableCell>
                <MedipandaTableCell sx={{ width: '80px' }}>작성자</MedipandaTableCell>
                <MedipandaTableCell sx={{ width: '110px' }}>작성일</MedipandaTableCell>
                <MedipandaTableCell sx={{ width: '60px' }}>조회수</MedipandaTableCell>
                <MedipandaTableCell sx={{ width: '60px' }}>좋아요</MedipandaTableCell>
              </MedipandaTableRow>
            </TableHead>
            <TableBody>
              {[...fixedNotices, ...contents].map(post => (
                <MedipandaTableRow
                  key={post.id}
                  sx={{
                    ...(fixedNotices.includes(post) && {
                      backgroundColor: colors.gray10,
                    }),
                  }}
                >
                  <MedipandaTableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {fixedNotices.includes(post) && (
                        <img
                          src='/assets/icons/icon-pin.svg'
                          style={{
                            width: '16px',
                            height: '16px',
                          }}
                        />
                      )}
                      <Link
                        component={RouterLink}
                        to={`/community/mr-cso-matching/${post.id}`}
                        underline='hover'
                        sx={{
                          color: fixedNotices.includes(post) ? colors.gray80 : colors.gray70,
                          '&:hover': {
                            color: colors.vividViolet,
                          },
                        }}
                      >
                        <Typography variant='smallTextB'>{post.title}</Typography>
                      </Link>
                      <img
                        src='/assets/icons/icon-image.svg'
                        style={{
                          width: '16px',
                          height: '16px',
                        }}
                      />
                      <Typography variant='smallTextB' sx={{ color: colors.red }}>
                        [{post.commentCount}]
                      </Typography>
                    </Box>
                  </MedipandaTableCell>
                  <MedipandaTableCell>{post.nickname}</MedipandaTableCell>
                  <MedipandaTableCell>{DateUtils.parseUtcAndFormatKst(post.createdAt, DATEFORMAT_YYYY_MM_DD_HH_MM)}</MedipandaTableCell>
                  <MedipandaTableCell>{post.viewsCount.toLocaleString()}</MedipandaTableCell>
                  <MedipandaTableCell>{post.likesCount.toLocaleString()}</MedipandaTableCell>
                </MedipandaTableRow>
              ))}
            </TableBody>
          </Table>

          <Box
            component='form'
            onSubmit={form.handleSubmit(submitHandler)}
            sx={{
              alignSelf: 'center',
              marginTop: '40px',
            }}
          >
            <Controller
              control={form.control}
              name={'searchKeyword'}
              render={({ field }) => (
                <TextField
                  {...field}
                  placeholder='제목을 입력해주세요.'
                  fullWidth
                  size='small'
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
                    width: '480px',
                  }}
                />
              )}
            />
          </Box>

          <MedipandaPagination
            count={totalPages}
            page={page}
            showFirstButton
            showLastButton
            renderItem={item => (
              <PaginationItem {...item} component={RouterLink} to={setUrlParams({ page: item.page }, initialSearchParams)} />
            )}
            sx={{
              alignSelf: 'center',
              marginTop: '40px',
            }}
          />
        </Stack>
        <Stack
          gap='10px'
          sx={{
            width: '400px',
          }}
        >
          <Stack direction='row' gap='10px'>
            <Button
              fullWidth
              variant='contained'
              component={RouterLink}
              to='/community/mr-cso-matching/new'
              sx={{
                height: '50px',
                backgroundColor: colors.navy,
              }}
            >
              <Typography variant='largeTextB' sx={{ color: colors.white }}>
                글쓰기
              </Typography>
            </Button>
            <Button
              fullWidth
              variant='contained'
              component={RouterLink}
              to={filterMine ? '?' : '?filterMine=true'}
              sx={{
                height: '50px',
                backgroundColor: colors.gray20,
                color: colors.gray80,

                ...(filterMine && {
                  border: `1px solid ${colors.blue}`,
                }),
              }}
            >
              <Box
                sx={{
                  padding: '5px 10px',
                  border: `1px solid ${colors.red}`,
                  borderRadius: '10px',
                  boxSizing: 'border-box',
                  backgroundColor: colors.white,
                  color: colors.red,
                }}
              >
                <Typography sx={{ fontSize: '10px', lineHeight: '100%' }}>MY</Typography>
              </Box>
              <Typography variant='largeTextB' sx={{ marginLeft: '5px', color: colors.gray80 }}>
                내 글
              </Typography>
            </Button>
          </Stack>

          <CommunityBanners />
        </Stack>
      </Stack>
    </>
  );
}

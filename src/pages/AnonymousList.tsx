import { getBoards } from '@/backend';
import { CommunityBanners } from '@/custom/components/CommunityBanners';
import { CommunityTrendingList } from '@/custom/components/CommunityTrendingList';
import { MedipandaPagination } from '@/custom/components/MedipandaPagination';
import { MedipandaTableCell, MedipandaTableRow } from '@/custom/components/MedipandaTable';
import { formatYyyyMmDdHhMm } from '@/lib/dateFormat';
import { usePageFetchFormik } from '@/lib/react/usePageFetchFormik';
import { colors } from '@/themes';
import { Search } from '@mui/icons-material';
import { Box, Button, InputAdornment, Link, Stack, Table, TableBody, TableHead, TextField, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router';

export default function AnonymousList() {
  const {
    content: page,
    pageCount,
    formik: pageFormik,
  } = usePageFetchFormik({
    initialFormValues: {
      searchKeyword: '',
    },
    fetcher: values => {
      return getBoards({
        boardType: 'ANONYMOUS',
        boardTitle: values.searchKeyword !== '' ? values.searchKeyword : undefined,
        page: values.pageIndex,
        size: values.pageSize,
      });
    },
    contentSelector: response => response.content,
    pageCountSelector: response => response.totalPages,
    initialContent: [],
  });

  const { content: noticePage } = usePageFetchFormik({
    fetcher: () => {
      return getBoards({
        boardType: 'NOTICE',
        size: 2,
      });
    },
    contentSelector: response => response.content,
    initialContent: [],
  });

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
              {[...noticePage, ...page].map(post => (
                <MedipandaTableRow
                  key={post.id}
                  sx={{
                    ...(noticePage.includes(post) && {
                      backgroundColor: colors.gray10,
                    }),
                  }}
                >
                  <MedipandaTableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {noticePage.includes(post) && (
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
                        to={`/community/anonymous/${post.id}`}
                        underline='hover'
                        sx={{
                          color: colors.gray70,
                          '&:hover': {
                            color: colors.vividViolet,
                          },
                        }}
                      >
                        {post.title}
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
                  <MedipandaTableCell>{formatYyyyMmDdHhMm(post.createdAt)}</MedipandaTableCell>
                  <MedipandaTableCell>{post.viewsCount.toLocaleString()}</MedipandaTableCell>
                  <MedipandaTableCell>{post.likesCount.toLocaleString()}</MedipandaTableCell>
                </MedipandaTableRow>
              ))}
            </TableBody>
          </Table>

          <Box
            component='form'
            onSubmit={pageFormik.handleSubmit}
            sx={{
              alignSelf: 'center',
              marginTop: '40px',
            }}
          >
            <TextField
              name='searchKeyword'
              value={pageFormik.values.searchKeyword}
              onChange={pageFormik.handleChange}
              placeholder='제목을 입력해주세요.'
              fullWidth
              size='small'
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{
                width: '480px',
              }}
            />
          </Box>

          <MedipandaPagination
            count={pageCount}
            page={pageFormik.values.pageIndex + 1}
            showFirstButton
            showLastButton
            onChange={(_, page) => {
              pageFormik.setFieldValue('pageIndex', page - 1);
            }}
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
              sx={{
                height: '50px',
                backgroundColor: colors.gray20,
                color: colors.gray80,
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

          <CommunityTrendingList />

          <CommunityBanners />
        </Stack>
      </Stack>
    </>
  );
}

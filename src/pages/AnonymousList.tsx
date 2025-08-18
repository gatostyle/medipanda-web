import { Search } from '@mui/icons-material';
import { Box, Button, InputAdornment, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { Link as RouterLink } from 'react-router';
import { useEffect, useState } from 'react';
import { type BoardPostResponse, getBoards } from '../backend';
import { MedipandaPagination } from '../custom/components/MedipandaPagination.tsx';
import { colors, typography } from '../custom/globalStyles.ts';
import { formatYyyyMmDdHhMm } from '../utils/dateFormat.ts';
import { MedipandaTableCell, MedipandaTableRow } from 'custom/components/MedipandaTable.tsx';

export default function AnonymousList() {
  const [page, setPage] = useState<BoardPostResponse[]>([]);
  const [noticePage, setNoticePage] = useState<BoardPostResponse[]>([]);
  const [totalPages, setTotalPages] = useState(0);

  const pageFormik = useFormik({
    initialValues: {
      searchKeyword: '',
      pageIndex: 0,
      pageSize: 10,
      totalPages: 1,
    },
    onSubmit: async () => {
      if (pageFormik.values.pageIndex !== 0) {
        await pageFormik.setFieldValue('pageIndex', 0);
      } else {
        await fetchPage();
      }
    },
  });

  const fetchPage = async () => {
    const response = await getBoards({
      boardType: 'ANONYMOUS',
      boardTitle: pageFormik.values.searchKeyword !== '' ? pageFormik.values.searchKeyword : undefined,
      page: pageFormik.values.pageIndex,
      size: pageFormik.values.pageSize,
    });

    setPage(response.content);
    setTotalPages(response.totalPages);

    const noticeResponse = await getBoards({
      boardType: 'NOTICE',
      size: 2,
    });

    setNoticePage(noticeResponse.content);
  };

  useEffect(() => {
    pageFormik.submitForm();
  }, [pageFormik.values.pageIndex, pageFormik.values.pageSize]);

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
        <Stack alignItems='center' sx={{ width: '800px' }}>
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
                      <Typography
                        component={RouterLink}
                        to={`/community/anonymous/${post.id}`}
                        sx={{
                          textDecoration: 'none',
                          color: colors.gray600,
                          '&:hover': { textDecoration: 'underline', color: colors.primary },
                        }}
                      >
                        {post.title}
                      </Typography>
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
                  <MedipandaTableCell>
                    {post.viewsCount >= 1000 ? `${(post.viewsCount / 1000).toFixed(1).replace(/\.0$/, '')}만` : post.viewsCount}
                  </MedipandaTableCell>
                  <MedipandaTableCell>
                    {post.likesCount >= 1000 ? `${(post.likesCount / 1000).toFixed(1).replace(/\.0$/, '')}만` : post.likesCount}
                  </MedipandaTableCell>
                </MedipandaTableRow>
              ))}
            </TableBody>
          </Table>

          <Box sx={{ marginTop: '40px' }}>
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
            count={totalPages}
            page={pageFormik.values.pageIndex + 1}
            showFirstButton
            showLastButton
            onChange={(_, page) => {
              pageFormik.setFieldValue('pageIndex', page - 1);
            }}
            sx={{ marginTop: '40px' }}
          />
        </Stack>
        <Stack
          alignItems='center'
          gap='10px'
          sx={{
            width: '400px',
          }}
        >
          <Stack
            direction='row'
            gap='10px'
            sx={{
              width: '100%',
            }}
          >
            <Button
              fullWidth
              variant='contained'
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
                  marginRight: '5px',
                  border: `1px solid ${colors.red}`,
                  borderRadius: '10px',
                  boxSizing: 'border-box',
                  backgroundColor: colors.white,
                  color: colors.red,
                }}
              >
                <Typography sx={{ fontSize: '10px', lineHeight: '100%' }}>MY</Typography>
              </Box>
              <Typography variant='largeTextB' sx={{ color: colors.gray80 }}>
                내 글
              </Typography>
            </Button>
          </Stack>
          <Stack
            sx={{
              padding: '30px',
              border: `1px solid ${colors.gray30}`,
              borderRadius: '5px',
            }}
          >
            <Stack direction='row' gap='5px'>
              <Button
                variant='outlined'
                startIcon={<img src='/assets/icons/icon-fire.svg' />}
                sx={{
                  ...typography.smallTextM,
                  color: colors.vividViolet,
                  width: '60px',
                  height: '24px',
                  padding: '3px 5px',
                  borderColor: colors.vividViolet,
                }}
              >
                인기순
              </Button>
              <Button
                variant='outlined'
                startIcon={<img src='/assets/icons/icon-chat-light.svg' />}
                sx={{
                  ...typography.smallTextM,
                  color: colors.vividViolet,
                  width: '60px',
                  height: '24px',
                  padding: '3px 5px',
                  borderColor: colors.vividViolet,
                }}
              >
                댓글순
              </Button>
            </Stack>
            <Table sx={{ marginTop: '20px' }}>
              <TableBody>
                {Array.from({ length: 10 })
                  .map(_ => {
                    return {
                      title: '[노하우 공유] "이런 원장님/교수님은 이렇게 뚫었다!" 나만의 디...',
                      url: '/community/anonymous/trending/1',
                    };
                  })
                  .map((item, index) => (
                    <TableRow
                      key={index}
                      sx={{
                        height: '28px',
                      }}
                    >
                      <TableCell
                        sx={{
                          width: '28px',
                          padding: '0',
                          paddingRight: '5px',
                          borderBottom: `1px solid ${colors.gray20}`,
                          textAlign: 'right',
                        }}
                      >
                        <Typography variant='smallTextB' sx={{ color: colors.gray80 }}>
                          {index + 1}
                        </Typography>
                      </TableCell>
                      <TableCell
                        sx={{
                          padding: '0',
                          borderBottom: `1px solid ${colors.gray20}`,
                        }}
                      >
                        <Typography
                          component={RouterLink}
                          to={item.url}
                          variant='smallTextR'
                          sx={{
                            color: colors.gray80,
                            textDecoration: 'none',
                            '&:hover': {
                              textDecoration: 'underline',
                              color: colors.vividViolet,
                            },
                          }}
                        >
                          {item.title}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </Stack>
          <img
            src='https://picsum.photos/392/120'
            width='392px'
            height='120px'
            style={{
              border: `1p solid ${colors.gray20}`,
              borderRadius: '5px',
            }}
          />
          <img
            src='https://picsum.photos/392/120'
            width='392px'
            height='120px'
            style={{
              border: `1p solid ${colors.gray20}`,
              borderRadius: '5px',
            }}
          />
          <img
            src='https://picsum.photos/392/120'
            width='392px'
            height='120px'
            style={{
              border: `1p solid ${colors.gray20}`,
              borderRadius: '5px',
            }}
          />
        </Stack>
      </Stack>
    </>
  );
}

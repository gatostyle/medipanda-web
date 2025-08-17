import { Search } from '@mui/icons-material';
import { Box, Button, InputAdornment, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { Link as RouterLink } from 'react-router';
import { useEffect, useState } from 'react';
import { type BoardPostResponse, getBoards } from '../backend';
import { MedipandaPagination } from '../components/MedipandaPagination.tsx';
import { MedipandaTableCell, MedipandaTableRow } from '../components/MedipandaTable.tsx';
import { colors, typography } from '../globalStyles.ts';
import { formatYyyyMmDdHhMm } from '../utils/dateFormat.ts';

export default function AnonymousList() {
  const [data, setData] = useState<BoardPostResponse[]>([]);
  const [noticeData, setNoticeData] = useState<BoardPostResponse[]>([]);
  const [totalPages, setTotalPages] = useState(0);

  const formik = useFormik({
    initialValues: {
      searchKeyword: '',
      pageIndex: 0,
      pageSize: 10,
      totalPages: 1,
    },
    onSubmit: async () => {
      if (formik.values.pageIndex !== 0) {
        await formik.setFieldValue('pageIndex', 0);
      } else {
        await fetchData();
      }
    },
  });

  const fetchData = async () => {
    const response = await getBoards({
      boardType: 'ANONYMOUS',
      boardTitle: formik.values.searchKeyword !== '' ? formik.values.searchKeyword : undefined,
      page: formik.values.pageIndex,
      size: formik.values.pageSize,
    });

    setData(response.content);
    setTotalPages(response.totalPages);

    const noticeResponse = await getBoards({
      boardType: 'NOTICE',
      size: 2,
    });

    setNoticeData(noticeResponse.content);
  };

  useEffect(() => {
    fetchData();
  }, [formik.values.pageIndex, formik.values.pageSize]);

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
              {[...noticeData, ...data].map(post => (
                <MedipandaTableRow
                  key={post.id}
                  sx={{
                    ...(noticeData.includes(post) && {
                      backgroundColor: colors.gray10,
                    }),
                  }}
                >
                  <MedipandaTableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {noticeData.includes(post) && (
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
                      <Typography sx={{ ...typography.smallTextB, color: colors.red }}>[{post.commentCount}]</Typography>
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
              value={formik.values.searchKeyword}
              onChange={formik.handleChange}
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
            page={formik.values.pageIndex + 1}
            showFirstButton
            showLastButton
            onChange={(_, page) => {
              formik.setFieldValue('pageIndex', page - 1);
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
              <Typography sx={{ ...typography.largeTextB, color: colors.white }}>글쓰기</Typography>
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
              <Typography sx={{ ...typography.largeTextB, color: colors.gray80 }}>내 글</Typography>
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
                        <Typography sx={{ ...typography.smallTextB, color: colors.gray80 }}>{index + 1}</Typography>
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
                          sx={{
                            ...typography.smallTextR,
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

import { Search } from '@mui/icons-material';
import { Box, Button, InputAdornment, Stack, Table, TableBody, TableCell, TableRow, TextField, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router';
import { type BoardPostResponse, getBoards } from '../backend';
import { MedipandaPagination } from '../custom/components/MedipandaPagination.tsx';
import { colors, typography } from '../custom/globalStyles.ts';
import { formatYyyyMmDd } from '../utils/dateFormat.ts';

const categories = ['전체', '제품현황', '정산 및 생산중단', '신제품 정보', '제약사 정책', '일반공지'];

export default function NoticeList() {
  const [page, setPage] = useState<BoardPostResponse[]>([]);
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
      boardType: 'NOTICE',
      boardTitle: pageFormik.values.searchKeyword !== '' ? pageFormik.values.searchKeyword : undefined,
      page: pageFormik.values.pageIndex,
      size: pageFormik.values.pageSize,
    });

    setPage(response.content);
    setTotalPages(response.totalPages);
  };

  useEffect(() => {
    pageFormik.submitForm();
  }, [pageFormik.values.pageIndex, pageFormik.values.pageSize]);

  return (
    <Stack alignItems='center'>
      <Box sx={{ width: '100%' }}>
        <Typography variant='heading3M' sx={{ color: colors.gray80, mb: '30px' }}>
          공지사항
        </Typography>
      </Box>

      <Stack
        direction='row'
        alignItems='center'
        component='form'
        onSubmit={pageFormik.handleSubmit}
        sx={{
          width: '100%',
          marginTop: '30px',
        }}
      >
        <Stack direction='row' alignItems='center' sx={{ justifyContent: 'space-between' }}>
          {categories.map((category, index) => (
            <Button
              variant='text'
              sx={{
                ...typography.mediumTextB,
                color: colors.gray50,
                '&:hover': {
                  color: colors.vividViolet,
                  textDecoration: 'underline',
                },
                ...(index === 0 && {
                  color: colors.vividViolet,
                  textDecoration: 'underline',
                }),
              }}
            >
              {category}
            </Button>
          ))}
        </Stack>
        <TextField
          size='small'
          name='searchKeyword'
          value={pageFormik.values.searchKeyword}
          onChange={pageFormik.handleChange}
          placeholder='제약사명 또는 제목을 검색해주세요'
          InputProps={{
            endAdornment: (
              <InputAdornment position='end'>
                <Search sx={{ color: colors.gray500 }} />
              </InputAdornment>
            ),
          }}
          sx={{
            width: '350px',
            marginLeft: 'auto',
          }}
        />
      </Stack>

      <Table
        sx={{
          marginTop: '10px',
          borderTop: `1px solid ${colors.gray50}`,
        }}
      >
        <TableBody>
          {page.map((notice, index) => (
            <TableRow
              key={notice.id}
              sx={{
                borderBottom: `1px solid ${colors.gray10}`,
                ...(index < 2 && {
                  backgroundColor: colors.gray10,
                }),
              }}
            >
              <TableCell>
                <Typography variant='smallTextR' sx={{ color: notice.noticeType === 'GENERAL' ? colors.vividViolet : colors.gray70 }}>
                  {notice.noticeType}
                </Typography>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography
                    component={RouterLink}
                    to={`/customer-service/notice/${notice.id}`}
                    variant='smallTextR'
                    sx={{
                      color: colors.gray70,
                      textDecoration: 'none',
                      '&:hover': {
                        color: colors.vividViolet,
                        textDecoration: 'underline',
                      },

                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {index < 2 && (
                      <img
                        src='/assets/icons/icon-pin.svg'
                        style={{
                          width: '16px',
                          height: '16px',
                          marginRight: '4px',
                        }}
                      />
                    )}
                    {notice.title}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell align='center'>
                <Typography variant='smallTextR' sx={{ color: colors.gray70 }}>
                  {formatYyyyMmDd(notice.createdAt)}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

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
  );
}

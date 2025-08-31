import { getBoards, getFixedTopNotices } from '@/backend';
import { MedipandaPagination } from '@/custom/components/MedipandaPagination';
import { usePageFetchFormik } from '@/lib/react/usePageFetchFormik';
import { colors, typography } from '@/themes';
import { formatYyyyMmDd } from '@/lib/dateFormat';
import { Search } from '@mui/icons-material';
import { Box, Button, InputAdornment, Stack, Table, TableBody, TableCell, TableRow, TextField, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router';

const categories = ['전체', '제품현황', '정산 및 생산중단', '신제품 정보', '제약사 정책', '일반공지'];

export default function NoticeList() {
  const {
    content: page,
    pageCount: totalPages,
    formik: pageFormik,
  } = usePageFetchFormik({
    initialFormValues: {
      searchKeyword: '',
    },
    fetcher: values => {
      return getBoards({
        boardType: 'NOTICE',
        boardTitle: values.searchKeyword !== '' ? values.searchKeyword : undefined,
        page: values.pageIndex,
        size: values.pageSize,
      });
    },
    contentSelector: response => response.content,
    pageCountSelector: response => response.totalPages,
    initialContent: [],
  });

  const { content: fixedPage } = usePageFetchFormik({
    fetcher: () => {
      return getFixedTopNotices({
        boardType: 'NOTICE',
      });
    },
    initialContent: [],
  });

  return (
    <>
      <Typography variant='heading3M' sx={{ color: colors.gray80 }}>
        공지사항
      </Typography>

      <Stack
        direction='row'
        alignItems='center'
        component='form'
        onSubmit={pageFormik.handleSubmit}
        sx={{
          marginTop: '30px',
        }}
      >
        <Stack direction='row' alignItems='center' sx={{ justifyContent: 'space-between' }}>
          {categories.map((category, index) => (
            <Button
              key={category}
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
                <Search />
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
          {[...fixedPage, ...page].map(notice => (
            <TableRow
              key={notice.id}
              sx={{
                borderBottom: `1px solid ${colors.gray10}`,
                backgroundColor: fixedPage.includes(notice) ? colors.gray10 : undefined,
              }}
            >
              <TableCell>
                <Typography
                  variant='smallTextR'
                  sx={{ color: notice.noticeProperties?.drugCompany === '메디판다' ? colors.vividViolet : colors.gray70 }}
                >
                  {notice.noticeProperties?.drugCompany}
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
                      gap: '4px',
                    }}
                  >
                    {fixedPage.includes(notice) && (
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
        sx={{
          alignSelf: 'center',
          marginTop: '40px',
        }}
      />
    </>
  );
}

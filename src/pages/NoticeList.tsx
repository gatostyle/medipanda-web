import { getBoards, getFixedTopNotices } from '@/backend';
import type { NoticeType } from '@/backend-types';
import { MedipandaPagination } from '@/custom/components/MedipandaPagination';
import { MedipandaTextLink } from '@/custom/components/MedipandaTextLink';
import { NoticeLabels } from '@/labels';
import { usePageFetchFormik } from '@/lib/components/usePageFetchFormik';
import { colors } from '@/themes';
import { formatYyyyMmDd } from '@/lib/utils/dateFormat';
import { Search } from '@mui/icons-material';
import { Box, InputAdornment, Stack, Table, TableBody, TableCell, TableRow, TextField, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export default function NoticeList() {
  const {
    content: page,
    pageCount: totalPages,
    formik: pageFormik,
  } = usePageFetchFormik({
    initialFormValues: {
      searchKeyword: '',
      noticeType: '' as NoticeType | '',
    },
    fetcher: values => {
      return getBoards({
        boardType: 'NOTICE',
        boardTitle: values.searchKeyword !== '' ? values.searchKeyword : undefined,
        noticeType: values.noticeType !== '' ? values.noticeType : undefined,
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
        <Stack direction='row' alignItems='center' gap='20px'>
          {(['', 'PRODUCT_STATUS', 'MANUFACTURING_SUSPENSION', 'NEW_PRODUCT', 'POLICY', 'GENERAL'] as const).map(noticeType => (
            <MedipandaTextLink
              key={noticeType}
              underline='hover'
              onClick={() => {
                pageFormik.setFieldValue('noticeType', noticeType);
                pageFormik.submitForm();
              }}
              sx={{
                color: pageFormik.values.noticeType === noticeType ? colors.vividViolet : colors.gray50,
                cursor: 'pointer',
              }}
            >
              {noticeType === '' ? '전체' : NoticeLabels[noticeType]}
            </MedipandaTextLink>
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

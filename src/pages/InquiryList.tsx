import { getBoards } from '@/backend';
import { InquiryStatusChip } from '@/components/InquiryStatusChip';
import { MedipandaPagination } from '@/custom/components/MedipandaPagination';
import { MedipandaTab, MedipandaTabElse, MedipandaTabs } from '@/custom/components/MedipandaTab';
import { MedipandaTableCell, MedipandaTableRow } from '@/custom/components/MedipandaTable';
import { usePageFetchFormik } from '@/lib/components/usePageFetchFormik';
import { colors } from '@/themes';
import { formatYyyyMmDdHhMm } from '@/lib/utils/dateFormat';
import { withSequence } from '@/lib/utils/withSequence';
import { Search } from '@mui/icons-material';
import { Fab, InputAdornment, Link, Stack, Table, TableBody, TableHead, TextField, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export default function InquiryList() {
  const {
    content: page,
    pageCount: totalPages,
    formik: pageFormik,
  } = usePageFetchFormik({
    initialFormValues: {
      searchKeyword: '',
    },
    fetcher: async values => {
      const response = await getBoards({
        boardType: 'INQUIRY',
        boardTitle: values.searchKeyword !== '' ? values.searchKeyword : undefined,
        page: values.pageIndex,
        size: values.pageSize,
      });

      return withSequence(response);
    },
    contentSelector: response => response.content,
    initialContent: [],
  });

  return (
    <>
      <Typography variant='heading3M' sx={{ color: colors.gray80 }}>
        1:1 문의내역
      </Typography>

      <MedipandaTabs value={0} sx={{ marginTop: '30px' }}>
        <MedipandaTab label='문의내역' />
        <MedipandaTabElse />
      </MedipandaTabs>

      <Stack direction='row' component='form' onSubmit={pageFormik.handleSubmit} sx={{ marginTop: '40px' }}>
        <TextField
          size='small'
          name='searchKeyword'
          value={pageFormik.values.searchKeyword}
          onChange={pageFormik.handleChange}
          placeholder='문의 내역을 검색해 보세요'
          sx={{ width: '350px', marginLeft: 'auto' }}
          InputProps={{
            endAdornment: (
              <InputAdornment position='end'>
                <Search sx={{ color: '#999' }} />
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      <Table sx={{ marginTop: '10px' }}>
        <TableHead>
          <MedipandaTableRow>
            <MedipandaTableCell sx={{ width: '80px' }}>No</MedipandaTableCell>
            <MedipandaTableCell sx={{ width: '472px' }}>제목</MedipandaTableCell>
            <MedipandaTableCell sx={{ width: '130px' }}>문의일</MedipandaTableCell>
            <MedipandaTableCell sx={{ width: '100px' }}>답변상태</MedipandaTableCell>
          </MedipandaTableRow>
        </TableHead>
        <TableBody>
          {page.map(inquiry => (
            <MedipandaTableRow key={inquiry.id}>
              <MedipandaTableCell>{`${inquiry.sequence}`}</MedipandaTableCell>
              <MedipandaTableCell sx={{ textAlign: 'left' }}>
                <Link
                  underline='hover'
                  component={RouterLink}
                  to={`/customer-service/inquiry/${inquiry.id}`}
                  sx={{
                    color: colors.gray80,
                    '&:hover': {
                      color: colors.vividViolet,
                    },
                  }}
                >
                  {inquiry.title}
                </Link>
              </MedipandaTableCell>
              <MedipandaTableCell>{formatYyyyMmDdHhMm(inquiry.createdAt)}</MedipandaTableCell>
              <MedipandaTableCell>
                <InquiryStatusChip status={inquiry.hasChildren} />
              </MedipandaTableCell>
            </MedipandaTableRow>
          ))}
        </TableBody>
      </Table>

      <MedipandaPagination
        count={totalPages}
        page={pageFormik.values.pageIndex + 1}
        showFirstButton
        showLastButton
        sx={{
          alignSelf: 'center',
          marginTop: '40px',
        }}
      />

      <Fab
        component={RouterLink}
        to='/customer-service/inquiry/new'
        sx={{
          position: 'fixed',
          right: '40px',
          bottom: '160px',
          width: '90px',
          height: '90px',
          backgroundColor: colors.navy,
          '&:hover': {
            backgroundColor: colors.vividViolet,
          },
        }}
      >
        <img src='/assets/icons/icon-inquiry-new.svg' style={{ width: '54px', height: '54px' }} />
      </Fab>

      <Fab
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        sx={{
          position: 'fixed',
          right: '40px',
          bottom: '60px',
          width: '90px',
          height: '90px',
          border: `1px solid ${colors.navy}`,
          backgroundColor: colors.white,
        }}
      >
        <img src='/assets/icons/icon-top.svg' style={{ width: '54px', height: '54px' }} />
      </Fab>
    </>
  );
}

import { Search } from '@mui/icons-material';
import { Box, Fab, InputAdornment, Stack, Table, TableBody, TableHead, TextField, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router';
import { type BoardPostResponse, getBoards } from '../backend';
import { InquiryStatusChip } from '../components/InquiryStatusChip.tsx';
import { MedipandaPagination } from '../custom/components/MedipandaPagination.tsx';
import { MedipandaTab, MedipandaTabElse, MedipandaTabs } from '../custom/components/MedipandaTab.tsx';
import { colors } from '../custom/globalStyles.ts';
import { formatYyyyMmDdHhMm } from '../utils/dateFormat.ts';
import { mockBoolean } from '../utils/mock.ts';
import { type Sequenced, withSequence } from '../utils/withSequence.ts';
import { MedipandaTableCell, MedipandaTableRow } from 'custom/components/MedipandaTable.tsx';

export default function InquiryList() {
  const [page, setPage] = useState<Sequenced<BoardPostResponse>[]>([]);

  const pageFormik = useFormik({
    initialValues: {
      searchKeyword: '',
      pageIndex: 0,
      pageSize: 10,
      expandedId: -1,
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
      boardType: 'INQUIRY',
      boardTitle: pageFormik.values.searchKeyword !== '' ? pageFormik.values.searchKeyword : undefined,
      page: pageFormik.values.pageIndex,
      size: pageFormik.values.pageSize,
    });

    setPage(withSequence(response).content);
  };

  useEffect(() => {
    pageFormik.submitForm();
  }, [pageFormik.values.pageIndex, pageFormik.values.pageSize]);

  return (
    <Stack alignItems='center'>
      <Box sx={{ width: '100%' }}>
        <Typography variant='heading3M' sx={{ color: colors.gray80, mb: '30px' }}>
          1:1 문의내역
        </Typography>
      </Box>

      <MedipandaTabs value={0} sx={{ width: '100%' }}>
        <MedipandaTab label='문의내역' />
        <MedipandaTabElse />
      </MedipandaTabs>

      <Stack direction='row' component='form' onSubmit={pageFormik.handleSubmit} sx={{ width: '100%', marginTop: '40px' }}>
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
              <MedipandaTableCell sx={{ textAlign: 'left' }}>{inquiry.title}</MedipandaTableCell>
              <MedipandaTableCell>{formatYyyyMmDdHhMm(inquiry.createdAt)}</MedipandaTableCell>
              <MedipandaTableCell>
                <InquiryStatusChip responseStatus={mockBoolean()} />
              </MedipandaTableCell>
            </MedipandaTableRow>
          ))}
        </TableBody>
      </Table>

      <MedipandaPagination count={10} page={1} showFirstButton showLastButton sx={{ marginTop: '40px' }} />

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
    </Stack>
  );
}

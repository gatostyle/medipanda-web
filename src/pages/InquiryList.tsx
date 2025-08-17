import { Search } from '@mui/icons-material';
import { Box, Fab, InputAdornment, Stack, Table, TableBody, TableHead, TextField, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router';
import { type BoardPostResponse, getBoards } from '../backend';
import { InquiryStatusChip } from '../components/InquiryStatusChip.tsx';
import { MedipandaPagination } from '../components/MedipandaPagination.tsx';
import { MedipandaTab, MedipandaTabElse, MedipandaTabs } from '../components/MedipandaTab.tsx';
import { MedipandaTableCell, MedipandaTableRow } from '../components/MedipandaTable.tsx';
import { colors, typography } from '../globalStyles.ts';
import { formatYyyyMmDdHhMm } from '../utils/dateFormat.ts';
import { mockBoolean } from '../utils/mock.ts';
import { type Sequenced, withSequence } from '../utils/withSequence.ts';

export default function InquiryList() {
  const [data, setData] = useState<Sequenced<BoardPostResponse>[]>([]);

  const formik = useFormik({
    initialValues: {
      searchKeyword: '',
      pageIndex: 0,
      pageSize: 10,
      expandedId: -1,
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
      boardType: 'INQUIRY',
      boardTitle: formik.values.searchKeyword !== '' ? formik.values.searchKeyword : undefined,
      page: formik.values.pageIndex,
      size: formik.values.pageSize,
    });

    setData(withSequence(response).content);
  };

  useEffect(() => {
    fetchData();
  }, [formik.values.pageIndex, formik.values.pageSize]);

  return (
    <Stack alignItems='center'>
      <Box sx={{ width: '100%' }}>
        <Typography
          sx={{
            ...typography.heading3M,
            color: colors.gray80,
            mb: '30px',
          }}
        >
          1:1 문의내역
        </Typography>
      </Box>

      <MedipandaTabs value={0} sx={{ width: '100%' }}>
        <MedipandaTab label='문의내역' />
        <MedipandaTabElse />
      </MedipandaTabs>

      <Stack direction='row' component='form' onSubmit={formik.handleSubmit} sx={{ width: '100%', marginTop: '40px' }}>
        <TextField
          size='small'
          name='searchKeyword'
          value={formik.values.searchKeyword}
          onChange={formik.handleChange}
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
          {data.map(inquiry => (
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

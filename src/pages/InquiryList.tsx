import { Create, Search } from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  Fab,
  InputAdornment,
  Pagination,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router';

const TabButton = styled(Button)({
  padding: '12px 24px',
  borderRadius: '4px 4px 0 0',
  textTransform: 'none',
  fontSize: '14px',
  fontWeight: 500,
  border: 'none',
  '&.selected': {
    backgroundColor: '#6B3AA0',
    color: '#fff',
    borderBottom: 'none',
    '&:hover': {
      backgroundColor: '#6B3AA0',
    },
  },
  '&:not(.selected)': {
    backgroundColor: '#f8f9fa',
    color: '#666',
    borderBottom: '1px solid #e0e0e0',
    '&:hover': {
      backgroundColor: '#e9ecef',
    },
  },
});

const StyledTableCell = styled(TableCell)({
  padding: '16px',
  borderBottom: '1px solid #f0f0f0',
  fontSize: '14px',
});

const StyledTableHead = styled(TableHead)({
  backgroundColor: '#f8f9fa',
  '& .MuiTableCell-head': {
    fontWeight: 600,
    color: '#333',
    borderBottom: '1px solid #e0e0e0',
  },
});

const mockInquiries = [
  {
    id: 1,
    title: '커뮤니티에서 활동 중에 답글처리의 안내요',
    createdAt: '2025-05-08 10:36',
    status: '답변 대기중',
    statusColor: '#f44336',
  },
  {
    id: 2,
    title: 'MR-CSO 매칭 기능문의',
    createdAt: '2025-05-08 10:36',
    status: '답변 완료',
    statusColor: '#4caf50',
  },
  {
    id: 3,
    title: 'CSO Link beta 서비스 요청',
    createdAt: '2025-05-08 10:36',
    status: '답변 완료',
    statusColor: '#4caf50',
  },
];

export default function InquiryList() {
  return (
    <Box sx={{ position: 'relative' }}>
      <Typography variant='h5' sx={{ mb: 4, fontWeight: 'bold', color: '#333' }}>
        1:1 문의내역
      </Typography>

      <Box sx={{ mb: 3 }}>
        <TabButton className='selected'>문의내역</TabButton>
      </Box>

      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'flex-end' }}>
        <TextField
          placeholder='문의 내역을 검색해 보세요'
          size='small'
          sx={{ width: '300px' }}
          InputProps={{
            endAdornment: (
              <InputAdornment position='end'>
                <Search sx={{ color: '#999' }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e0e0e0' }}>
        <Table>
          <StyledTableHead>
            <TableRow>
              <StyledTableCell align='center' sx={{ width: '80px' }}>
                No
              </StyledTableCell>
              <StyledTableCell sx={{ width: '60%' }}>제목</StyledTableCell>
              <StyledTableCell align='center' sx={{ width: '140px' }}>
                문의일
              </StyledTableCell>
              <StyledTableCell align='center' sx={{ width: '140px' }}>
                답변상태
              </StyledTableCell>
            </TableRow>
          </StyledTableHead>
          <TableBody>
            {mockInquiries.map((inquiry, index) => (
              <TableRow key={inquiry.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                <StyledTableCell align='center'>{mockInquiries.length - index}</StyledTableCell>
                <StyledTableCell>
                  <Typography
                    component={RouterLink}
                    to={`/customer-service/inquiry/${inquiry.id}`}
                    sx={{
                      textDecoration: 'none',
                      color: '#333',
                      '&:hover': {
                        textDecoration: 'underline',
                        color: '#6B3AA0',
                      },
                    }}
                  >
                    {inquiry.title}
                  </Typography>
                </StyledTableCell>
                <StyledTableCell align='center'>{inquiry.createdAt}</StyledTableCell>
                <StyledTableCell align='center'>
                  <Chip
                    label={inquiry.status}
                    size='small'
                    sx={{
                      backgroundColor: inquiry.statusColor,
                      color: '#fff',
                      fontSize: '12px',
                      fontWeight: 500,
                    }}
                  />
                </StyledTableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Pagination
          count={10}
          page={1}
          showFirstButton
          showLastButton
          sx={{
            '& .MuiPaginationItem-root': {
              fontSize: '14px',
            },
            '& .Mui-selected': {
              backgroundColor: '#6B3AA0 !important',
              color: '#fff',
            },
          }}
        />
      </Box>

      <Fab
        component={RouterLink}
        to='/customer-service/inquiry/new'
        sx={{
          position: 'fixed',
          bottom: 80,
          right: 80,
          backgroundColor: '#1a237e',
          color: '#fff',
          width: 64,
          height: 64,
          '&:hover': {
            backgroundColor: '#0d47a1',
          },
        }}
      >
        <Create />
      </Fab>
    </Box>
  );
}

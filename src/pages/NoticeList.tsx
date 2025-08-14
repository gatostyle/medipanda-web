import { Search } from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
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

const CategoryButton = styled(Button)({
  padding: '8px 16px',
  borderRadius: '4px',
  textTransform: 'none',
  fontSize: '14px',
  fontWeight: 500,
  minWidth: 'auto',
  '&.selected': {
    backgroundColor: '#6B3AA0',
    color: '#fff',
    border: '1px solid #6B3AA0',
    '&:hover': {
      backgroundColor: '#6B3AA0',
    },
  },
  '&:not(.selected)': {
    backgroundColor: 'transparent',
    color: '#666',
    border: '1px solid #e0e0e0',
    '&:hover': {
      backgroundColor: '#f5f5f5',
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

const categories = ['전체', '제품정보', '정산 및 실적관리', '서비스 정보', '계약사 정책', '일반문의'];

const mockNotices = [
  {
    id: 1,
    title: '[품질] 휴비스트제약- 품질 및 관리 품목 안내',
    category: '동구바이오',
    createdAt: '2025-05-08',
    isNew: false,
  },
  {
    id: 2,
    title: '[수수료변경] 아주약품- 트라넥스',
    category: '메디판다',
    createdAt: '2025-05-08',
    isNew: false,
  },
  {
    id: 3,
    title: '[품질] 휴비스트제약- 품질 및 관리...',
    category: '동구바이오',
    createdAt: '2025-05-08',
    isNew: false,
  },
  {
    id: 4,
    title: '[수수료변경] 아주약품- 트라넥스',
    category: '메디판다',
    createdAt: '2025-05-08',
    isNew: false,
  },
  {
    id: 5,
    title: '[품질] 휴비스트제약- 품질 및 관리...',
    category: '동구바이오',
    createdAt: '2025-05-08',
    isNew: false,
  },
  {
    id: 6,
    title: '[수수료변경] 아주약품- 트라넥스',
    category: '메디판다',
    createdAt: '2025-05-08',
    isNew: false,
  },
  {
    id: 7,
    title: '[품질] 휴비스트제약- 품질 및 관리...',
    category: '동구바이오',
    createdAt: '2025-05-08',
    isNew: false,
  },
  {
    id: 8,
    title: '[품질] 휴비스트제약- 품질 및 관리...',
    category: '동구바이오',
    createdAt: '2025-05-08',
    isNew: false,
  },
  {
    id: 9,
    title: '[품질] 휴비스트제약- 품질 및 관리...',
    category: '동구바이오',
    createdAt: '2025-05-08',
    isNew: false,
  },
  {
    id: 10,
    title: '[품질] 휴비스트제약- 품질 및 관리...',
    category: '동구바이오',
    createdAt: '2025-05-08',
    isNew: false,
  },
];

export default function NoticeList() {
  return (
    <Box>
      <Typography variant='h5' sx={{ mb: 4, fontWeight: 'bold', color: '#333' }}>
        공지사항
      </Typography>

      <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {categories.map((category, index) => (
          <CategoryButton key={category} className={index === 0 ? 'selected' : ''}>
            {category}
          </CategoryButton>
        ))}
      </Box>

      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'flex-end' }}>
        <TextField
          placeholder='제목이나 글쓴이 제목을 검색하세요'
          size='small'
          sx={{ width: '400px' }}
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
              <StyledTableCell align='center' sx={{ width: '120px' }}>
                문의일
              </StyledTableCell>
              <StyledTableCell align='center' sx={{ width: '120px' }}>
                답변상태
              </StyledTableCell>
            </TableRow>
          </StyledTableHead>
          <TableBody>
            {mockNotices.map((notice, index) => (
              <TableRow key={notice.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                <StyledTableCell align='center'>{mockNotices.length - index}</StyledTableCell>
                <StyledTableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={notice.category}
                      size='small'
                      sx={{
                        backgroundColor: notice.category === '동구바이오' ? '#6B3AA0' : '#e0e0e0',
                        color: notice.category === '동구바이오' ? '#fff' : '#666',
                        fontSize: '12px',
                        height: '24px',
                      }}
                    />
                    <Typography
                      component={RouterLink}
                      to={`/customer-service/notice/${notice.id}`}
                      sx={{
                        textDecoration: 'none',
                        color: '#333',
                        '&:hover': {
                          textDecoration: 'underline',
                          color: '#6B3AA0',
                        },
                      }}
                    >
                      {notice.title}
                    </Typography>
                  </Box>
                </StyledTableCell>
                <StyledTableCell align='center'>{notice.createdAt}</StyledTableCell>
                <StyledTableCell align='center'>
                  <Typography sx={{ color: '#999', fontSize: '14px' }}>-</Typography>
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
    </Box>
  );
}

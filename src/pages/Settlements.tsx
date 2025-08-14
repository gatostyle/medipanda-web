import { FileDownload, Search } from '@mui/icons-material';
import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputAdornment,
  MenuItem,
  Pagination,
  Paper,
  Select,
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
import { useState } from 'react';

const TabButton = styled(Button)({
  padding: '12px 32px',
  borderRadius: '8px 8px 0 0',
  textTransform: 'none',
  fontSize: '16px',
  fontWeight: 500,
  border: 'none',
  marginRight: '4px',
  '&.selected': {
    backgroundColor: '#fff',
    color: '#6B3AA0',
    fontWeight: 'bold',
    borderBottom: '2px solid #6B3AA0',
  },
  '&:not(.selected)': {
    backgroundColor: '#f8f9fa',
    color: '#666',
    '&:hover': {
      backgroundColor: '#e9ecef',
    },
  },
});

const MonthSelector = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '24px 0',
  gap: '16px',
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

const ActionButton = styled(Button)({
  textTransform: 'none',
  borderRadius: '20px',
  padding: '8px 20px',
  fontSize: '14px',
  fontWeight: 500,
});

const mockSettlements = [
  {
    id: 1,
    drugCompany: '동구바이오',
    dealerName: '정길동',
    supplyAmount: '-',
    taxAmount: '-',
    totalAmount: '승인대기중',
    status: 'pending',
  },
  {
    id: 2,
    drugCompany: '동구바이오',
    dealerName: '홍길동',
    supplyAmount: 328303614,
    taxAmount: 3316198,
    totalAmount: 331619812,
    status: 'approved',
  },
  {
    id: 3,
    drugCompany: '동구바이오',
    dealerName: '나유비',
    supplyAmount: 328303614,
    taxAmount: 3316198,
    totalAmount: 331619812,
    status: 'approved',
  },
];

export default function Settlements() {
  const [currentTab, setCurrentTab] = useState(0);
  const [searchCategory, setSearchCategory] = useState('제약사명');
  const [searchQuery, setSearchQuery] = useState('');

  const totalAmount = mockSettlements
    .filter(item => item.status === 'approved')
    .reduce((sum, item) => sum + (typeof item.totalAmount === 'number' ? item.totalAmount : 0), 0);

  return (
    <Box>
      <Typography variant='h4' sx={{ mb: 4, fontWeight: 'bold', color: '#333' }}>
        정산
      </Typography>

      <Box sx={{ mb: 3 }}>
        <TabButton className={currentTab === 0 ? 'selected' : ''} onClick={() => setCurrentTab(0)}>
          정산내역
        </TabButton>
        <TabButton className={currentTab === 1 ? 'selected' : ''} onClick={() => setCurrentTab(1)}>
          매출통계
        </TabButton>
      </Box>

      {currentTab === 0 && (
        <Box>
          <MonthSelector>
            <IconButton>
              <Typography variant='h5'>←</Typography>
            </IconButton>
            <Typography variant='h5' sx={{ fontWeight: 'bold', minWidth: '160px', textAlign: 'center' }}>
              2025년 4월
            </Typography>
            <IconButton>
              <Typography variant='h5'>→</Typography>
            </IconButton>
          </MonthSelector>

          <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
            <FormControl sx={{ minWidth: 120 }}>
              <Select value={searchCategory} onChange={e => setSearchCategory(e.target.value)} size='small'>
                <MenuItem value='제약사명'>제약사명</MenuItem>
                <MenuItem value='딜러명'>딜러명</MenuItem>
                <MenuItem value='거래처명'>거래처명</MenuItem>
              </Select>
            </FormControl>
            <TextField
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              size='small'
              sx={{ flex: 1 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant='h6' sx={{ fontWeight: 'bold', color: '#333' }}>
              합계금액 : {totalAmount.toLocaleString()}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <ActionButton
                variant='contained'
                startIcon={<FileDownload />}
                sx={{
                  backgroundColor: '#1a237e',
                  '&:hover': { backgroundColor: '#0d47a1' },
                }}
              >
                파일다운로드
              </ActionButton>
              <ActionButton
                variant='outlined'
                sx={{
                  borderColor: '#6B3AA0',
                  color: '#6B3AA0',
                  '&:hover': { backgroundColor: '#f3f0ff' },
                }}
              >
                정산신청
              </ActionButton>
              <ActionButton
                variant='outlined'
                sx={{
                  borderColor: '#f44336',
                  color: '#f44336',
                  '&:hover': { backgroundColor: '#ffebee' },
                }}
              >
                이의신청
              </ActionButton>
            </Box>
          </Box>

          <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e0e0e0' }}>
            <Table>
              <StyledTableHead>
                <TableRow>
                  <StyledTableCell sx={{ width: '150px' }}>제약사명</StyledTableCell>
                  <StyledTableCell sx={{ width: '120px' }}>딜러명</StyledTableCell>
                  <StyledTableCell align='right' sx={{ width: '150px' }}>
                    공급가액
                  </StyledTableCell>
                  <StyledTableCell align='right' sx={{ width: '120px' }}>
                    세액
                  </StyledTableCell>
                  <StyledTableCell align='right' sx={{ width: '150px' }}>
                    합계금액
                  </StyledTableCell>
                </TableRow>
              </StyledTableHead>
              <TableBody>
                {mockSettlements.map(settlement => (
                  <TableRow key={settlement.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                    <StyledTableCell>{settlement.drugCompany}</StyledTableCell>
                    <StyledTableCell>
                      <Typography
                        component={RouterLink}
                        to={`/settlements/customer/${settlement.id}`}
                        sx={{
                          textDecoration: 'none',
                          color: '#6B3AA0',
                          fontWeight: 500,
                          '&:hover': { textDecoration: 'underline' },
                        }}
                      >
                        {settlement.dealerName}
                      </Typography>
                    </StyledTableCell>
                    <StyledTableCell align='right'>
                      {settlement.status === 'pending' ? '-' : settlement.supplyAmount.toLocaleString()}
                    </StyledTableCell>
                    <StyledTableCell align='right'>
                      {settlement.status === 'pending' ? '-' : settlement.taxAmount.toLocaleString()}
                    </StyledTableCell>
                    <StyledTableCell align='right'>
                      {settlement.status === 'pending' ? (
                        <Typography sx={{ color: '#ff9800', fontWeight: 500 }}>{settlement.totalAmount}</Typography>
                      ) : (
                        settlement.totalAmount.toLocaleString()
                      )}
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
      )}

      {currentTab === 1 && (
        <Box>
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Button
              variant="outlined"
              sx={{
                borderColor: '#6B3AA0',
                color: '#6B3AA0',
                textTransform: 'none',
                borderRadius: '20px',
                '&:hover': { backgroundColor: '#f3f0ff' },
              }}
            >
              전체매출
            </Button>
            <Button
              variant="contained"
              sx={{
                backgroundColor: '#6B3AA0',
                textTransform: 'none',
                borderRadius: '20px',
                '&:hover': { backgroundColor: '#5a2d8a' },
              }}
            >
              거래처매출
            </Button>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
            <TextField
              value="2025-07"
              size="small"
              sx={{ width: '140px' }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    📅
                  </InputAdornment>
                ),
              }}
            />
            <Typography sx={{ color: '#666' }}>~</Typography>
            <TextField
              value="2025-11"
              size="small"
              sx={{ width: '140px' }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    📅
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              placeholder="A 병원"
              value="A 병원"
              size="small"
              sx={{ flex: 1 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box
            sx={{
              width: '100%',
              height: '300px',
              backgroundColor: '#f8f9fa',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '32px',
              color: '#666',
              fontSize: '18px',
            }}
          >
            그래프 영역
          </Box>

          <Typography variant="body2" sx={{ mb: 2, color: '#f44336', textAlign: 'center' }}>
            ※ 정산월 기준으로 산정된 금액이며, 만원단위 이하는 절삭한 금액으로 표시 됩니다.
          </Typography>

          <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e0e0e0' }}>
            <Table>
              <StyledTableHead>
                <TableRow>
                  <StyledTableCell sx={{ width: '150px' }}>거래처명</StyledTableCell>
                  <StyledTableCell align="right" sx={{ width: '180px' }}>정산(합계)금액(VAT별도)</StyledTableCell>
                  <StyledTableCell align="center" sx={{ width: '100px' }}>관리</StyledTableCell>
                </TableRow>
              </StyledTableHead>
              <TableBody>
                {[
                  { name: 'A 병원 1', amount: 15500000, selected: true },
                  { name: 'A 병원 2', amount: 50500145, selected: true },
                  { name: 'A 병원 3', amount: 1050202500, selected: true },
                  { name: 'A 병원 4', amount: 65500050, selected: true },
                  { name: 'A 병원 5', amount: 0, selected: true },
                ].map((item, index) => (
                  <TableRow key={index} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                    <StyledTableCell>{item.name}</StyledTableCell>
                    <StyledTableCell align="right">
                      {item.amount.toLocaleString()}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      <Button
                        variant="contained"
                        size="small"
                        sx={{
                          backgroundColor: '#1a237e',
                          color: '#fff',
                          textTransform: 'none',
                          borderRadius: '20px',
                          padding: '4px 16px',
                          '&:hover': {
                            backgroundColor: '#0d47a1',
                          },
                        }}
                      >
                        선택
                      </Button>
                    </StyledTableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
}

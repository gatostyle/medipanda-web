import { CalendarToday, Search } from '@mui/icons-material';
import {
  Box,
  Button,
  FormControl,
  InputAdornment,
  MenuItem,
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
import { useState } from 'react';

const TabButton = styled(Button)({
  padding: '16px 32px',
  borderRadius: 0,
  textTransform: 'none',
  fontSize: '16px',
  fontWeight: 500,
  border: 'none',
  borderBottom: '3px solid transparent',
  '&.selected': {
    backgroundColor: 'transparent',
    color: '#6B3AA0',
    borderBottom: '3px solid #6B3AA0',
    fontWeight: 'bold',
  },
  '&:not(.selected)': {
    backgroundColor: 'transparent',
    color: '#666',
    '&:hover': {
      backgroundColor: '#f5f5f5',
    },
  },
});

const DateRangeBox = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  marginBottom: '32px',
});

const ChartArea = styled(Box)({
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

const mockStatistics = [
  {
    id: 1,
    companyName: '거래처 총매출',
    prescriptionAmount: '60,500만원',
    settlementAmount: '60,500만원',
    checked: true,
  },
  {
    id: 2,
    companyName: '동구바이오',
    prescriptionAmount: '24,500만원',
    settlementAmount: '24,500만원',
    checked: true,
  },
  {
    id: 3,
    companyName: '한미약품',
    prescriptionAmount: '24,500만원',
    settlementAmount: '24,500만원',
    checked: true,
  },
  {
    id: 4,
    companyName: '셀트리온',
    prescriptionAmount: '24,500만원',
    settlementAmount: '24,500만원',
    checked: true,
  },
  {
    id: 5,
    companyName: '종근당',
    prescriptionAmount: '24,500만원',
    settlementAmount: '24,500만원',
    checked: true,
  },
  {
    id: 6,
    companyName: '대웅제약',
    prescriptionAmount: '24,500만원',
    settlementAmount: '24,500만원',
    checked: true,
  },
];

export default function StatisticsAll() {
  const [currentTab, setCurrentTab] = useState(0);
  const [startDate, setStartDate] = useState('시작월');
  const [endDate, setEndDate] = useState('종료월');
  const [searchQuery, setSearchQuery] = useState('');

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

      {currentTab === 1 && (
        <Box>
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Button
              variant='contained'
              sx={{
                backgroundColor: '#6B3AA0',
                textTransform: 'none',
                borderRadius: '20px',
                '&:hover': { backgroundColor: '#5a2d8a' },
              }}
            >
              전체매출
            </Button>
            <Button
              variant='outlined'
              sx={{
                borderColor: '#e0e0e0',
                color: '#666',
                textTransform: 'none',
                borderRadius: '20px',
                '&:hover': { borderColor: '#6B3AA0', color: '#6B3AA0' },
              }}
            >
              거래처매출
            </Button>
          </Box>

          <DateRangeBox>
            <FormControl sx={{ minWidth: 120 }}>
              <Select
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                size='small'
                displayEmpty
                startAdornment={<CalendarToday sx={{ mr: 1, color: '#999' }} />}
              >
                <MenuItem value='시작월'>시작월</MenuItem>
                <MenuItem value='2025-01'>2025-01</MenuItem>
                <MenuItem value='2025-02'>2025-02</MenuItem>
                <MenuItem value='2025-03'>2025-03</MenuItem>
                <MenuItem value='2025-04'>2025-04</MenuItem>
              </Select>
            </FormControl>
            <Typography sx={{ color: '#666' }}>~</Typography>
            <FormControl sx={{ minWidth: 120 }}>
              <Select
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                size='small'
                displayEmpty
                startAdornment={<CalendarToday sx={{ mr: 1, color: '#999' }} />}
              >
                <MenuItem value='종료월'>종료월</MenuItem>
                <MenuItem value='2025-01'>2025-01</MenuItem>
                <MenuItem value='2025-02'>2025-02</MenuItem>
                <MenuItem value='2025-03'>2025-03</MenuItem>
                <MenuItem value='2025-04'>2025-04</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant='contained'
              sx={{
                backgroundColor: '#6B3AA0',
                textTransform: 'none',
                '&:hover': { backgroundColor: '#5a2d8a' },
              }}
            >
              검색
            </Button>
            <TextField
              placeholder='검색'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              size='small'
              sx={{ ml: 'auto', width: '200px' }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </DateRangeBox>

          <ChartArea>그래프 영역</ChartArea>

          <Typography variant='body2' sx={{ mb: 2, color: '#f44336', textAlign: 'center' }}>
            ※ 정산월 기준으로 산정된 금액이며, 만원단위 이하는 절삭한 금액으로 표시 됩니다.
          </Typography>

          <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e0e0e0' }}>
            <Table>
              <StyledTableHead>
                <TableRow>
                  <StyledTableCell sx={{ width: '50px' }}></StyledTableCell>
                  <StyledTableCell sx={{ width: '200px' }}>제약사명</StyledTableCell>
                  <StyledTableCell align='right' sx={{ width: '150px' }}>
                    처방금액
                  </StyledTableCell>
                  <StyledTableCell align='right' sx={{ width: '180px' }}>
                    정산(합계)금액(VAT포함)
                  </StyledTableCell>
                </TableRow>
              </StyledTableHead>
              <TableBody>
                {mockStatistics.map(stat => (
                  <TableRow key={stat.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                    <StyledTableCell>
                      <input
                        type='checkbox'
                        checked={stat.checked}
                        style={{
                          accentColor: '#6B3AA0',
                          width: '16px',
                          height: '16px',
                        }}
                      />
                    </StyledTableCell>
                    <StyledTableCell>
                      <Typography
                        variant='body2'
                        sx={{
                          fontWeight: stat.id === 1 ? 'bold' : 'normal',
                          color: stat.id === 1 ? '#6B3AA0' : '#333',
                        }}
                      >
                        {stat.companyName}
                      </Typography>
                    </StyledTableCell>
                    <StyledTableCell align='right'>
                      <Typography
                        variant='body2'
                        sx={{
                          fontWeight: stat.id === 1 ? 'bold' : 'normal',
                          color: stat.id === 1 ? '#6B3AA0' : '#333',
                        }}
                      >
                        {stat.prescriptionAmount}
                      </Typography>
                    </StyledTableCell>
                    <StyledTableCell align='right'>
                      <Typography
                        variant='body2'
                        sx={{
                          fontWeight: stat.id === 1 ? 'bold' : 'normal',
                          color: stat.id === 1 ? '#6B3AA0' : '#333',
                        }}
                      >
                        {stat.settlementAmount}
                      </Typography>
                    </StyledTableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {currentTab === 0 && (
        <Box>
          <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
            <FormControl sx={{ minWidth: 120 }}>
              <Select
                value="제약사명"
                size="small"
              >
                <MenuItem value="제약사명">제약사명</MenuItem>
                <MenuItem value="딜러명">딜러명</MenuItem>
                <MenuItem value="거래처명">거래처명</MenuItem>
              </Select>
            </FormControl>
            <TextField
              placeholder="검색"
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

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
              합계금액 : 663,239,627
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: '#1a237e',
                  textTransform: 'none',
                  borderRadius: '20px',
                  padding: '8px 20px',
                  '&:hover': { backgroundColor: '#0d47a1' },
                }}
              >
                파일다운로드
              </Button>
              <Button
                variant="outlined"
                sx={{
                  borderColor: '#6B3AA0',
                  color: '#6B3AA0',
                  textTransform: 'none',
                  borderRadius: '20px',
                  padding: '8px 20px',
                  '&:hover': { backgroundColor: '#f3f0ff' },
                }}
              >
                정산신청
              </Button>
              <Button
                variant="outlined"
                sx={{
                  borderColor: '#f44336',
                  color: '#f44336',
                  textTransform: 'none',
                  borderRadius: '20px',
                  padding: '8px 20px',
                  '&:hover': { backgroundColor: '#ffebee' },
                }}
              >
                이의신청
              </Button>
            </Box>
          </Box>

          <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e0e0e0' }}>
            <Table>
              <StyledTableHead>
                <TableRow>
                  <StyledTableCell sx={{ width: '150px' }}>제약사명</StyledTableCell>
                  <StyledTableCell sx={{ width: '120px' }}>딜러명</StyledTableCell>
                  <StyledTableCell align="right" sx={{ width: '150px' }}>공급가액</StyledTableCell>
                  <StyledTableCell align="right" sx={{ width: '120px' }}>세액</StyledTableCell>
                  <StyledTableCell align="right" sx={{ width: '150px' }}>합계금액</StyledTableCell>
                </TableRow>
              </StyledTableHead>
              <TableBody>
                {[
                  { drugCompany: '동구바이오', dealerName: '정길동', supplyAmount: null, taxAmount: null, totalAmount: '승인대기중', status: 'pending' },
                  { drugCompany: '동구바이오', dealerName: '홍길동', supplyAmount: 328303614, taxAmount: 3316198, totalAmount: 331619812, status: 'approved' },
                  { drugCompany: '동구바이오', dealerName: '나유비', supplyAmount: 328303614, taxAmount: 3316198, totalAmount: 331619812, status: 'approved' },
                ].map((settlement, index) => (
                  <TableRow key={index} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                    <StyledTableCell>{settlement.drugCompany}</StyledTableCell>
                    <StyledTableCell>{settlement.dealerName}</StyledTableCell>
                    <StyledTableCell align="right">
                      {settlement.status === 'pending' ? '-' : settlement.supplyAmount?.toLocaleString()}
                    </StyledTableCell>
                    <StyledTableCell align="right">
                      {settlement.status === 'pending' ? '-' : settlement.taxAmount?.toLocaleString()}
                    </StyledTableCell>
                    <StyledTableCell align="right">
                      {settlement.status === 'pending' ? (
                        <Typography sx={{ color: '#ff9800', fontWeight: 500 }}>
                          {settlement.totalAmount}
                        </Typography>
                      ) : (
                        settlement.totalAmount?.toLocaleString()
                      )}
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

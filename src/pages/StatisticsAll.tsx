import { CalendarToday, Search } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fade,
  FormControl,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Snackbar,
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
import { colors } from '../globalStyles';

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
    color: colors.primary,
    borderBottom: `3px solid ${colors.primary}`,
    fontWeight: 'bold',
  },
  '&:not(.selected)': {
    backgroundColor: 'transparent',
    color: colors.gray500,
    '&:hover': {
      backgroundColor: colors.gray100,
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
  backgroundColor: colors.gray100,
  border: `1px solid ${colors.gray300}`,
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '32px',
  color: colors.gray500,
  fontSize: '18px',
});

const StyledTableCell = styled(TableCell)({
  padding: '16px',
  borderBottom: `1px solid ${colors.gray200}`,
  fontSize: '14px',
});

const StyledTableHead = styled(TableHead)({
  backgroundColor: colors.gray100,
  '& .MuiTableCell-head': {
    fontWeight: 600,
    color: colors.gray700,
    borderBottom: `1px solid ${colors.gray300}`,
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
  const [activeFilter, setActiveFilter] = useState('전체매출');

  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [actionType, setActionType] = useState('');
  const [tabLoading, setTabLoading] = useState(false);
  const [dateLoading, setDateLoading] = useState(false);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleTabChange = newTab => {
    setTabLoading(true);
    setTimeout(() => {
      setCurrentTab(newTab);
      setTabLoading(false);
      const tabName = newTab === 0 ? '정산내역' : '매출통계';
      showSnackbar(`${tabName} 탭으로 이동했습니다.`, 'info');
    }, 300);
  };

  const handleFilterChange = filter => {
    setActiveFilter(filter);
    showSnackbar(`${filter} 필터로 전환했습니다.`, 'info');
  };

  const handleDateSearch = () => {
    setDateLoading(true);
    setTimeout(() => {
      setDateLoading(false);
      showSnackbar('기간 검색이 완료되었습니다.', 'success');
    }, 1000);
  };

  const handleAction = type => {
    setActionType(type);
    if (type === '파일다운로드') {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        showSnackbar('정산 데이터가 다운로드되었습니다.');
      }, 1500);
    } else {
      setConfirmDialog(true);
    }
  };

  return (
    <Box>
      <Typography sx={{ mb: 4, fontWeight: 'bold', color: colors.gray700 }}>정산</Typography>

      <Box sx={{ mb: 3 }}>
        <TabButton className={currentTab === 0 ? 'selected' : ''} onClick={() => handleTabChange(0)} disabled={tabLoading}>
          {tabLoading && currentTab !== 0 ? <CircularProgress size={16} sx={{ mr: 1 }} /> : null}
          정산내역
        </TabButton>
        <TabButton className={currentTab === 1 ? 'selected' : ''} onClick={() => handleTabChange(1)} disabled={tabLoading}>
          {tabLoading && currentTab !== 1 ? <CircularProgress size={16} sx={{ mr: 1 }} /> : null}
          매출통계
        </TabButton>
      </Box>

      {currentTab === 1 && (
        <Box>
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Button
              variant={activeFilter === '전체매출' ? 'contained' : 'outlined'}
              sx={{
                backgroundColor: activeFilter === '전체매출' ? colors.primary : 'transparent',
                borderColor: activeFilter === '전체매출' ? colors.primary : colors.gray300,
                color: activeFilter === '전체매출' ? colors.white : colors.gray500,
                textTransform: 'none',
                borderRadius: '20px',
                '&:hover': {
                  backgroundColor: activeFilter === '전체매출' ? colors.primaryDark : 'rgba(107, 58, 160, 0.1)',
                  borderColor: colors.primary,
                  color: activeFilter === '전체매출' ? colors.white : colors.primary,
                },
              }}
              onClick={() => handleFilterChange('전체매출')}
            >
              전체매출
            </Button>
            <Button
              variant={activeFilter === '거래처매출' ? 'contained' : 'outlined'}
              sx={{
                backgroundColor: activeFilter === '거래처매출' ? colors.primary : 'transparent',
                borderColor: activeFilter === '거래처매출' ? colors.primary : colors.gray300,
                color: activeFilter === '거래처매출' ? colors.white : colors.gray500,
                textTransform: 'none',
                borderRadius: '20px',
                '&:hover': {
                  backgroundColor: activeFilter === '거래처매출' ? colors.primaryDark : 'rgba(107, 58, 160, 0.1)',
                  borderColor: colors.primary,
                  color: activeFilter === '거래처매출' ? colors.white : colors.primary,
                },
              }}
              onClick={() => handleFilterChange('거래처매출')}
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
                startAdornment={<CalendarToday sx={{ mr: 1, color: colors.gray400 }} />}
              >
                <MenuItem value='시작월'>시작월</MenuItem>
                <MenuItem value='2025-01'>2025-01</MenuItem>
                <MenuItem value='2025-02'>2025-02</MenuItem>
                <MenuItem value='2025-03'>2025-03</MenuItem>
                <MenuItem value='2025-04'>2025-04</MenuItem>
              </Select>
            </FormControl>
            <Typography sx={{ color: colors.gray500 }}>~</Typography>
            <FormControl sx={{ minWidth: 120 }}>
              <Select
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                size='small'
                displayEmpty
                startAdornment={<CalendarToday sx={{ mr: 1, color: colors.gray400 }} />}
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
                backgroundColor: colors.primary,
                textTransform: 'none',
                '&:hover': { backgroundColor: colors.primaryDark },
              }}
              onClick={handleDateSearch}
              disabled={dateLoading}
            >
              {dateLoading ? <CircularProgress size={20} color='inherit' sx={{ mr: 1 }} /> : null}
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

          <Typography sx={{ mb: 2, color: colors.error, textAlign: 'center' }}>
            ※ 정산월 기준으로 산정된 금액이며, 만원단위 이하는 절삭한 금액으로 표시 됩니다.
          </Typography>

          <TableContainer component={Paper} sx={{ boxShadow: 'none', border: `1px solid ${colors.gray300}` }}>
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
                  <TableRow key={stat.id} sx={{ '&:hover': { backgroundColor: colors.gray50 } }}>
                    <StyledTableCell>
                      <input
                        type='checkbox'
                        checked={stat.checked}
                        style={{
                          accentColor: colors.primary,
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
                          color: stat.id === 1 ? colors.primary : colors.gray700,
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
                          color: stat.id === 1 ? colors.primary : colors.gray700,
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
                          color: stat.id === 1 ? colors.primary : colors.gray700,
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
              <Select value='제약사명' size='small'>
                <MenuItem value='제약사명'>제약사명</MenuItem>
                <MenuItem value='딜러명'>딜러명</MenuItem>
                <MenuItem value='거래처명'>거래처명</MenuItem>
              </Select>
            </FormControl>
            <TextField
              placeholder='검색'
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
            <Typography sx={{ fontWeight: 'bold', color: colors.gray700 }}>합계금액 : 663,239,627</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant='contained'
                sx={{
                  backgroundColor: colors.navy,
                  textTransform: 'none',
                  borderRadius: '20px',
                  padding: '8px 20px',
                  '&:hover': { backgroundColor: colors.navy },
                }}
                onClick={() => handleAction('파일다운로드')}
                disabled={loading}
              >
                {loading && actionType === '파일다운로드' ? <CircularProgress size={16} color='inherit' sx={{ mr: 1 }} /> : null}
                파일다운로드
              </Button>
              <Button
                variant='outlined'
                sx={{
                  borderColor: colors.primary,
                  color: colors.primary,
                  textTransform: 'none',
                  borderRadius: '20px',
                  padding: '8px 20px',
                  '&:hover': { backgroundColor: 'rgba(107, 58, 160, 0.1)' },
                }}
                onClick={() => handleAction('정산신청')}
                disabled={loading}
              >
                정산신청
              </Button>
              <Button
                variant='outlined'
                sx={{
                  borderColor: colors.error,
                  color: colors.error,
                  textTransform: 'none',
                  borderRadius: '20px',
                  padding: '8px 20px',
                  '&:hover': { backgroundColor: 'rgba(244, 67, 54, 0.1)' },
                }}
                onClick={() => handleAction('이의신청')}
                disabled={loading}
              >
                이의신청
              </Button>
            </Box>
          </Box>

          <TableContainer component={Paper} sx={{ boxShadow: 'none', border: `1px solid ${colors.gray300}` }}>
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
                {[
                  {
                    drugCompany: '동구바이오',
                    dealerName: '정길동',
                    supplyAmount: null,
                    taxAmount: null,
                    totalAmount: '승인대기중',
                    status: 'pending',
                  },
                  {
                    drugCompany: '동구바이오',
                    dealerName: '홍길동',
                    supplyAmount: 328303614,
                    taxAmount: 3316198,
                    totalAmount: 331619812,
                    status: 'approved',
                  },
                  {
                    drugCompany: '동구바이오',
                    dealerName: '나유비',
                    supplyAmount: 328303614,
                    taxAmount: 3316198,
                    totalAmount: 331619812,
                    status: 'approved',
                  },
                ].map((settlement, index) => (
                  <TableRow key={index} sx={{ '&:hover': { backgroundColor: colors.gray50 } }}>
                    <StyledTableCell>{settlement.drugCompany}</StyledTableCell>
                    <StyledTableCell>{settlement.dealerName}</StyledTableCell>
                    <StyledTableCell align='right'>
                      {settlement.status === 'pending' ? '-' : settlement.supplyAmount?.toLocaleString()}
                    </StyledTableCell>
                    <StyledTableCell align='right'>
                      {settlement.status === 'pending' ? '-' : settlement.taxAmount?.toLocaleString()}
                    </StyledTableCell>
                    <StyledTableCell align='right'>
                      {settlement.status === 'pending' ? (
                        <Typography sx={{ color: colors.warning, fontWeight: 500 }}>{settlement.totalAmount}</Typography>
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

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
        <DialogTitle>
          {actionType === '정산신청' ? '정산 신청 확인' : actionType === '이의신청' ? '이의 신청 확인' : '작업 확인'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {actionType === '정산신청'
              ? '선택된 항목에 대해 정산을 신청하시겠습니까?'
              : actionType === '이의신청'
                ? '선택된 항목에 대해 이의를 신청하시겠습니까?'
                : '이 작업을 진행하시겠습니까?'}
          </Typography>
          <Typography sx={{ mt: 1, color: colors.gray500 }}>
            {actionType === '정산신청'
              ? '정산 신청 후 취소가 어려울 수 있습니다.'
              : actionType === '이의신청'
                ? '이의 신청은 담당자 검토 후 처리됩니다.'
                : '작업 후 취소가 어려울 수 있습니다.'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)}>취소</Button>
          <Button
            variant='contained'
            onClick={() => {
              setConfirmDialog(false);
              const message =
                actionType === '정산신청'
                  ? '정산 신청이 완료되었습니다.'
                  : actionType === '이의신청'
                    ? '이의 신청이 접수되었습니다.'
                    : '작업이 완료되었습니다.';
              showSnackbar(message, 'success');
            }}
            sx={{ backgroundColor: colors.primary }}
          >
            확인
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

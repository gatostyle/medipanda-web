import { Search } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableContainer,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { MedipandaButton } from '../custom/components/MedipandaButton.tsx';
import { colors, StyledTableHead, StyledTableCell } from '../custom/globalStyles.ts';

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

export default function SalesStatistic() {
  const [currentTab, setCurrentTab] = useState<'ALL' | 'INDIVIDUAL'>('ALL');
  const [searchCategory, setSearchCategory] = useState('제약사명');
  const [searchQuery, setSearchQuery] = useState('');

  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [actionType, setActionType] = useState('');
  const [currentMonth, setCurrentMonth] = useState('2025년 4월');
  const [tabLoading, setTabLoading] = useState(false);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleMonthChange = direction => {
    setLoading(true);
    const year = parseInt(currentMonth.match(/\d{4}/)[0]);
    const month = parseInt(currentMonth.match(/\d+(?=월)/)[0]);

    let newYear = year;
    let newMonth = month;

    if (direction === 'prev') {
      newMonth -= 1;
      if (newMonth < 1) {
        newMonth = 12;
        newYear -= 1;
      }
    } else {
      newMonth += 1;
      if (newMonth > 12) {
        newMonth = 1;
        newYear += 1;
      }
    }

    setTimeout(() => {
      setCurrentMonth(`${newYear}년 ${newMonth}월`);
      setLoading(false);
    }, 500);
  };

  const handleAction = type => {
    setActionType(type);
    if (type === '파일다운로드') {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        showSnackbar('정산 데이터가 다운로드되었습니다.');
        const link = document.createElement('a');
        link.href = '/mock-settlements-data.xlsx';
        link.download = 'settlements-data.xlsx';
        link.click();
      }, 1500);
    } else {
      setConfirmDialog(true);
    }
  };

  const totalAmount = mockSettlements
    .filter(item => item.status === 'approved')
    .reduce((sum, item) => sum + (typeof item.totalAmount === 'number' ? item.totalAmount : 0), 0);

  return (
    <>
      <Stack
        direction='row'
        justifyContent='center'
        sx={{
          wdith: '100%',
        }}
      >
        <MedipandaButton
          variant={currentTab === 'ALL' ? 'contained' : 'outlined'}
          rounded
          onClick={() => setCurrentTab('ALL')}
          sx={{
            borderTopRightRadius: '0px',
            borderBottomRightRadius: '0px',
          }}
        >
          전체매출
        </MedipandaButton>
        <MedipandaButton
          variant={currentTab === 'INDIVIDUAL' ? 'contained' : 'outlined'}
          rounded
          onClick={() => setCurrentTab('INDIVIDUAL')}
          sx={{
            borderBottomLeftRadius: '0px',
            borderTopLeftRadius: '0px',
          }}
        >
          거래처매출
        </MedipandaButton>
      </Stack>

      <Box>
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button
            variant='outlined'
            sx={{
              borderColor: colors.primary,
              color: colors.primary,
              textTransform: 'none',
              borderRadius: '20px',
              '&:hover': { backgroundColor: colors.primaryLight },
            }}
            onClick={() => {
              showSnackbar('전체매출 보기로 전환했습니다.', 'info');
            }}
          >
            전체매출
          </Button>
          <Button
            variant='contained'
            sx={{
              backgroundColor: colors.primary,
              textTransform: 'none',
              borderRadius: '20px',
              '&:hover': { backgroundColor: colors.primaryDark },
            }}
            onClick={() => {
              showSnackbar('거래처매출 보기로 전환했습니다.', 'info');
            }}
          >
            거래처매출
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
          <TextField
            value='2025-07'
            size='small'
            sx={{ width: '140px' }}
            InputProps={{
              startAdornment: <InputAdornment position='start'>📅</InputAdornment>,
            }}
          />
          <Typography sx={{ color: colors.gray500 }}>~</Typography>
          <TextField
            value='2025-11'
            size='small'
            sx={{ width: '140px' }}
            InputProps={{
              startAdornment: <InputAdornment position='start'>📅</InputAdornment>,
            }}
          />
          <TextField
            placeholder='A 병원'
            value='A 병원'
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

        <Box
          sx={{
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
          }}
        >
          그래프 영역
        </Box>

        <Typography sx={{ mb: 2, color: colors.error, textAlign: 'center' }}>
          ※ 정산월 기준으로 산정된 금액이며, 만원단위 이하는 절삭한 금액으로 표시 됩니다.
        </Typography>

        <TableContainer component={Paper} sx={{ boxShadow: 'none', border: `1px solid ${colors.gray300}` }}>
          <Table>
            <StyledTableHead>
              <TableRow>
                <StyledTableCell sx={{ width: '150px' }}>거래처명</StyledTableCell>
                <StyledTableCell align='right' sx={{ width: '180px' }}>
                  정산(합계)금액(VAT별도)
                </StyledTableCell>
                <StyledTableCell align='center' sx={{ width: '100px' }}>
                  관리
                </StyledTableCell>
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
                <TableRow key={index} sx={{ '&:hover': { backgroundColor: colors.gray50 } }}>
                  <StyledTableCell>{item.name}</StyledTableCell>
                  <StyledTableCell align='right'>{item.amount.toLocaleString()}</StyledTableCell>
                  <StyledTableCell align='center'>
                    <Button
                      variant='contained'
                      size='small'
                      sx={{
                        backgroundColor: colors.primary,
                        color: colors.white,
                        textTransform: 'none',
                        borderRadius: '20px',
                        padding: '4px 16px',
                        '&:hover': {
                          backgroundColor: colors.primaryDark,
                        },
                      }}
                      onClick={() => {
                        showSnackbar(`${item.name}이(가) 선택되었습니다.`, 'success');
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

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
        <DialogTitle>{actionType === '정산신청' ? '정산 신청 확인' : '이의 신청 확인'}</DialogTitle>
        <DialogContent>
          <Typography>
            {actionType === '정산신청' ? '선택된 항목들에 대해 정산을 신청하시겠습니까?' : '이의 신청을 진행하시겠습니까?'}
          </Typography>
          <Typography sx={{ mt: 1, color: colors.gray500 }}>
            {actionType === '정산신청' ? '신청 후 취소가 어려울 수 있습니다.' : '이의 사유를 상세히 작성해 주세요.'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)}>취소</Button>
          <Button
            variant='contained'
            onClick={() => {
              setConfirmDialog(false);
              const message = actionType === '정산신청' ? '정산 신청이 완료되었습니다.' : '이의 신청이 접수되었습니다.';
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
    </>
  );
}

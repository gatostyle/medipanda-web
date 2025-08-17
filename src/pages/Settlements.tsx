import { KeyboardArrowLeft, KeyboardArrowRight, Search } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { type BoardPostResponse, getBoards, getSettlements, type SettlementResponse } from '../backend';
import { MedipandaPagination } from '../components/MedipandaPagination.tsx';
import { MedipandaTab, MedipandaTabElse, MedipandaTabs } from '../components/MedipandaTab.tsx';
import { MedipandaTableCell, MedipandaTableRow } from '../components/MedipandaTable.tsx';
import { colors, StyledTableHead, StyledTableCell, typography } from '../globalStyles.ts';

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
  const [data, setData] = useState<SettlementResponse[]>([]);
  const [totalPages, setTotalPages] = useState(0);

  const formik = useFormik({
    initialValues: {
      searchType: 'companyName' as 'companyName' | 'dealerName',
      searchKeyword: '',
      pageIndex: 0,
      pageSize: 10,
      totalPages: 1,
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
    const response = await getSettlements({
      companyName: formik.values.searchType === 'companyName' ? formik.values.searchKeyword : undefined,
      dealerName: formik.values.searchType === 'dealerName' ? formik.values.searchKeyword : undefined,
      page: formik.values.pageIndex,
      size: formik.values.pageSize,
    });

    setData(response.content);
    setTotalPages(response.totalPages);
  };

  useEffect(() => {
    fetchData();
  }, [formik.values.pageIndex, formik.values.pageSize]);

  return (
    <>
      <Stack
        alignItems='center'
        sx={{
          width: '100%',
        }}
      >
        <Stack direction='row' alignItems='center' gap='10px'>
          <IconButton>
            <KeyboardArrowLeft />
          </IconButton>
          <Typography sx={{ ...typography.heading4B, color: colors.gray80 }}>{currentMonth}</Typography>
          <IconButton>
            <KeyboardArrowRight />
          </IconButton>
        </Stack>

        <Stack
          direction='row'
          alignItems='center'
          gap='10px'
          sx={{
            marginTop: '40px',
          }}
        >
          <FormControl sx={{ width: '320px' }}>
            <Select value={formik.values.searchType} onChange={formik.handleChange}>
              <MenuItem value='companyName'>제약사명</MenuItem>
              <MenuItem value='dealerName'>딜러명</MenuItem>
            </Select>
          </FormControl>
          <TextField
            placeholder='제약사명을 검색하세요.'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            sx={{
              width: '478px',
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </Stack>
        <Stack direction='row' alignItems='flex-start' gap='24px' sx={{ width: '100%', marginTop: '10px' }}>
          <Stack alignItems='center' sx={{ width: '600px' }}>
            <Stack
              direction='row'
              alignItems='center'
              sx={{
                width: '100%',
                height: '40px',
                marginTop: '40px',
              }}
            >
              <Typography sx={{ ...typography.mediumTextR, color: colors.navy }}>
                합계금액 : {data.reduce((acc, v) => acc + v.totalAmount, 0).toLocaleString()}
              </Typography>
              <Button
                variant='contained'
                size='small'
                sx={{
                  marginLeft: 'auto',
                  backgroundColor: colors.navy,
                }}
              >
                파일다운로드
              </Button>
            </Stack>
            <Table sx={{ marginTop: '10px' }}>
              <TableHead>
                <MedipandaTableRow>
                  <MedipandaTableCell sx={{ width: '120px' }}>제약사명</MedipandaTableCell>
                  <MedipandaTableCell sx={{ width: '60px' }}>딜러명</MedipandaTableCell>
                  <MedipandaTableCell sx={{ width: '90px' }}>공급가액</MedipandaTableCell>
                  <MedipandaTableCell sx={{ width: '80px' }}>세액</MedipandaTableCell>
                  <MedipandaTableCell sx={{ width: '90px' }}>합계금액</MedipandaTableCell>
                </MedipandaTableRow>
              </TableHead>
              <TableBody>
                {data.map(settlement => (
                  <MedipandaTableRow key={settlement.id}>
                    <MedipandaTableCell>{settlement.drugCompanyName}</MedipandaTableCell>
                    <MedipandaTableCell>
                      <Button
                        variant='text'
                        sx={{
                          textDecoration: 'underline',
                          color: colors.vividViolet,
                          '&:hover': {
                            textDecoration: 'underline',
                          },
                        }}
                      >
                        {settlement.dealerName}
                      </Button>
                    </MedipandaTableCell>
                    <MedipandaTableCell>{settlement.supplyAmount.toLocaleString()}</MedipandaTableCell>
                    <MedipandaTableCell>{settlement.taxAmount.toLocaleString()}</MedipandaTableCell>
                    <MedipandaTableCell>{settlement.totalAmount.toLocaleString()}</MedipandaTableCell>
                  </MedipandaTableRow>
                ))}
              </TableBody>
            </Table>
            <MedipandaPagination
              count={totalPages}
              page={formik.values.pageIndex + 1}
              showFirstButton
              showLastButton
              onChange={(_, page) => {
                formik.setFieldValue('pageIndex', page - 1);
              }}
              sx={{ marginTop: '40px' }}
            />
          </Stack>
          <Stack
            sx={{
              width: '600px',
            }}
          >
            <Stack
              direction='row'
              alignItems='center'
              gap='10px'
              sx={{
                width: '100%',
                marginTop: '40px',
              }}
            >
              <Button
                variant='outlined'
                sx={{
                  width: '120px',
                  height: '40px',
                  marginLeft: 'auto',
                  borderRadius: '30px',
                  borderColor: colors.vividViolet,
                  color: colors.vividViolet,
                }}
              >
                정산신청
              </Button>
              <Button
                variant='outlined'
                sx={{
                  width: '120px',
                  height: '40px',
                  borderRadius: '30px',
                  borderColor: colors.vividViolet,
                  color: colors.vividViolet,
                }}
              >
                이의신청
              </Button>
            </Stack>
            <Stack
              alignItems='center'
              sx={{
                paddingY: '40px',
                marginTop: '10px',
                border: `1px solid ${colors.gray30}`,
                boxSizing: 'border-box',
              }}
            >
              <Typography sx={{ ...typography.heading2B, color: colors.gray80 }}>정산내역 상세</Typography>
              <Stack
                direction='row'
                sx={{
                  marginTop: '20px',
                }}
              >
                <Typography sx={{ ...typography.mediumTextB, color: colors.gray80, width: '160px' }}>제약사명: 동구바이오</Typography>
                <Typography sx={{ ...typography.mediumTextB, color: colors.gray80, width: '160px' }}>딜러명: 홍길동</Typography>
                <Typography sx={{ ...typography.mediumTextB, color: colors.gray80, width: '160px' }}>처방금액 : 121,140,267</Typography>
              </Stack>
              <Stack direction='row'>
                <Typography sx={{ ...typography.mediumTextB, color: colors.gray80, width: '160px' }}>공급가액 : 220,733,209</Typography>
                <Typography sx={{ ...typography.mediumTextB, color: colors.gray80, width: '160px' }}>세액 : 22,073,320</Typography>
                <Typography sx={{ ...typography.mediumTextB, color: colors.gray80, width: '160px' }}>합계금액 : 242,806,529</Typography>
              </Stack>
              <Stack
                direction='row'
                alignItems='center'
                sx={{
                  width: '100%',
                  padding: '16px 30px',
                  marginTop: '10px',
                  boxSizing: 'border-box',
                }}
              >
                <Typography sx={{ ...typography.mediumTextR, color: colors.navy }}>합계금액 : {totalAmount.toLocaleString()}</Typography>
                <Typography sx={{ ...typography.mediumTextR, color: colors.navy, marginLeft: 'auto' }}>정렬기준: </Typography>
                <FormControl sx={{ marginLeft: '10px' }}>
                  <Select size='small' value={'정산금액 높은순'}>
                    <MenuItem value={'정산금액 높은순'}>정산금액 높은순</MenuItem>
                    <MenuItem value={'정산금액 낮은순'}>정산금액 낮은순</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
              <Table sx={{ marginTop: '10px' }}>
                <TableHead>
                  <MedipandaTableRow>
                    <MedipandaTableCell sx={{ width: '140px' }}>거래처명</MedipandaTableCell>
                    <MedipandaTableCell sx={{ width: '110px' }}>처방수수료금액</MedipandaTableCell>
                    <MedipandaTableCell sx={{ width: '110px' }}>기타수수료금액</MedipandaTableCell>
                    <MedipandaTableCell sx={{ width: '110px' }}>정산금액</MedipandaTableCell>
                  </MedipandaTableRow>
                </TableHead>
                <TableBody>
                  {[
                    {
                      hospitalName: 'A 병원',
                      prescriptionFee: 121140267,
                      otherFee: 0,
                      settlementAmount: 242806529,
                    },
                    {
                      hospitalName: 'B 병원',
                      prescriptionFee: 150000000,
                      otherFee: 5000000,
                      settlementAmount: 155000000,
                    },
                    {
                      hospitalName: 'C 병원',
                      prescriptionFee: 200000000,
                      otherFee: 10000000,
                      settlementAmount: 210000000,
                    },
                    {
                      hospitalName: 'D 병원',
                      prescriptionFee: 180000000,
                      otherFee: 8000000,
                      settlementAmount: 188000000,
                    },
                  ].map((settlement, index) => (
                    <MedipandaTableRow key={index}>
                      <MedipandaTableCell>
                        <Button
                          variant='text'
                          sx={{
                            textDecoration: 'underline',
                            color: colors.vividViolet,
                            '&:hover': {
                              textDecoration: 'underline',
                            },
                          }}
                        >
                          {settlement.hospitalName}
                        </Button>
                      </MedipandaTableCell>
                      <MedipandaTableCell>{settlement.prescriptionFee.toLocaleString()}</MedipandaTableCell>
                      <MedipandaTableCell>{settlement.otherFee.toLocaleString()}</MedipandaTableCell>
                      <MedipandaTableCell>{settlement.settlementAmount.toLocaleString()}</MedipandaTableCell>
                    </MedipandaTableRow>
                  ))}
                </TableBody>
              </Table>
            </Stack>
          </Stack>
        </Stack>
      </Stack>

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

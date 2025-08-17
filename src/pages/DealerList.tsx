import { Search } from '@mui/icons-material';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputAdornment,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableHead,
  TextField,
  Typography,
} from '@mui/material';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { type DealerResponse, listDealers, type PrescriptionResponse, searchPrescriptions } from '../backend';
import { MedipandaPagination } from '../components/MedipandaPagination.tsx';
import { MedipandaTableCell, MedipandaTableRow } from '../components/MedipandaTable.tsx';
import { colors, typography } from '../globalStyles.ts';
import { formatYyyyMmDd } from '../utils/dateFormat.ts';

export default function PrescriptionList() {
  const [currentTab, setCurrentTab] = useState(0);
  const [searchCategory, setSearchCategory] = useState('거래처명');
  const [searchQuery, setSearchQuery] = useState('건일');
  const [ediForm, setEdiForm] = useState({
    dealerName: '홍길동',
    settlementMonth: '2025-04',
    prescriptionMonth: '2025-02',
    clientName: '명수병원',
  });

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

  const handleTabChange = newTab => {
    setTabLoading(true);
    setTimeout(() => {
      setCurrentTab(newTab);
      setTabLoading(false);
      const tabName = newTab === 0 ? '실적입력(EDI)' : '소속딜러 관리';
      showSnackbar(`${tabName} 탭으로 이동했습니다.`, 'info');
    }, 300);
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
      showSnackbar(`${newYear}년 ${newMonth}월로 이동했습니다.`, 'info');
    }, 500);
  };

  const handleAction = type => {
    setActionType(type);
    if (type === '파일업로드') {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        showSnackbar('파일이 성공적으로 업로드되었습니다.');
      }, 1500);
    } else {
      setConfirmDialog(true);
    }
  };

  const handleFileUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.jpeg,.png';
    input.onchange = e => {
      const files = (e.target as HTMLInputElement).files;
      if (files) {
        setAttachedFiles(Array.from(files));
        showSnackbar(`${files.length}개 파일이 선택되었습니다.`, 'success');
      }
    };
    input.click();
  };

  const [data, setData] = useState<DealerResponse[]>([]);

  const formik = useFormik({
    initialValues: {
      searchType: 'companyName' as 'companyName' | 'dealerName',
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
    const response = await listDealers();

    setData(response);
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
          <FormControl sx={{ width: '320px' }}>
            <Select value={'딜러명'}>
              <MenuItem value='딜러명'>딜러명</MenuItem>
            </Select>
          </FormControl>
          <TextField
            placeholder='딜러명을 검색하세요.'
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
        <Stack sx={{ width: '100%', marginTop: '40px' }}>
          <Button
            variant='contained'
            sx={{
              width: '120px',
              marginLeft: 'auto',
              borderRadius: '30px',
              backgroundColor: colors.vividViolet,
            }}
            onClick={() => showSnackbar('딜러 등록 폼을 준비했습니다.', 'info')}
          >
            딜러 등록
          </Button>
        </Stack>
        <Stack direction='row' alignItems='flex-start' gap='24px' sx={{ width: '100%', marginTop: '10px' }}>
          <Stack alignItems='center' sx={{ width: '600px' }}>
            <Table>
              <TableHead>
                <MedipandaTableRow>
                  <MedipandaTableCell sx={{ width: '40px' }}>No</MedipandaTableCell>
                  <MedipandaTableCell sx={{ width: '80px' }}>딜러번호</MedipandaTableCell>
                  <MedipandaTableCell sx={{ width: '70px' }}>딜러명</MedipandaTableCell>
                  <MedipandaTableCell sx={{ width: '160px' }}>거래제약사</MedipandaTableCell>
                  <MedipandaTableCell sx={{ width: '90px' }}>등록일</MedipandaTableCell>
                </MedipandaTableRow>
              </TableHead>
              <TableBody>
                {data.map((dealer, index) => (
                  <MedipandaTableRow key={dealer.id}>
                    <MedipandaTableCell align='center'>{index + 1}</MedipandaTableCell>
                    <MedipandaTableCell>{dealer.id}</MedipandaTableCell>
                    <MedipandaTableCell>{dealer.dealerName}</MedipandaTableCell>
                    <MedipandaTableCell>{formatYyyyMmDd(dealer.createdAt)}</MedipandaTableCell>
                  </MedipandaTableRow>
                ))}
              </TableBody>
            </Table>
          </Stack>
          <Stack
            sx={{
              width: '600px',
              padding: '40px 75px',
              border: `1px solid ${colors.gray30}`,
              boxSizing: 'border-box',
            }}
          >
            <Stack direction='row' alignItems='center'>
              <Typography sx={{ ...typography.largeTextM, color: colors.gray80, width: '120px' }}>딜러명</Typography>
              <TextField
                value='홍길동'
                size='small'
                sx={{
                  flexGrow: 1,
                  height: '50px',
                }}
              />
            </Stack>
            <Stack direction='row' alignItems='center'>
              <Typography sx={{ ...typography.largeTextM, color: colors.gray80, width: '120px' }}>거래제약사</Typography>
              <TextField
                value='홍길동'
                size='small'
                sx={{
                  flexGrow: 1,
                }}
              />
              <Button
                variant='contained'
                sx={{
                  width: '106px',
                  marginLeft: '10px',
                  backgroundColor: colors.navy,
                }}
              >
                추가하기
              </Button>
            </Stack>

            <Stack
              direction='row'
              justifyContent='center'
              gap='10px'
              sx={{
                width: '100%',
                marginTop: '20px',
              }}
            >
              <Button
                variant='outlined'
                sx={{
                  width: '160px',
                  height: '50px',
                  borderColor: colors.navy,
                  color: colors.navy,
                }}
              >
                취소
              </Button>
              <Button
                variant='contained'
                // onClick={handleSubmit}
                // disabled={!title.trim() || !content.trim() || loading}
                sx={{
                  width: '160px',
                  height: '50px',
                  backgroundColor: colors.navy,
                }}
              >
                {/*{loading ? <CircularProgress size={20} color='inherit' sx={{ mr: 1 }} /> : null}*/}
                등록
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </Stack>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
        <DialogTitle>{actionType === '거래처별업로드' ? '파일 업로드 확인' : '작업 확인'}</DialogTitle>
        <DialogContent>
          <Typography>{actionType === '거래처별업로드' ? '거래처별 파일을 업로드하시겠습니까?' : '이 작업을 진행하시겠습니까?'}</Typography>
          <Typography sx={{ mt: 1, color: colors.gray500 }}>
            {actionType === '거래처별업로드' ? '업로드된 파일은 검토 후 처리됩니다.' : '작업 후 취소가 어려울 수 있습니다.'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)}>취소</Button>
          <Button
            variant='contained'
            onClick={() => {
              setConfirmDialog(false);
              if (actionType === '거래처별업로드') {
                handleAction('파일업로드');
              } else {
                showSnackbar('작업이 완료되었습니다.', 'success');
              }
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

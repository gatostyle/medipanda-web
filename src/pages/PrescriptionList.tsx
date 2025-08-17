import { Search } from '@mui/icons-material';
import {
  Alert,
  Box,
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
import { type BoardPostResponse, getBoards, type PrescriptionResponse, searchPrescriptions } from '../backend';
import { MedipandaPagination } from '../components/MedipandaPagination.tsx';
import { MedipandaTableCell, MedipandaTableRow } from '../components/MedipandaTable.tsx';
import MpDatePicker from '../components/MpDatePicker.tsx';
import { colors, typography } from '../globalStyles.ts';
import { formatYyyyMmDd } from '../utils/dateFormat.ts';

const mockPrescriptionData = [
  {
    id: 1,
    type: '개별',
    dealerName: '홍길동',
    clientName: '명수병원',
    prescriptionMonth: '2025-04',
    status: '접수대기',
  },
  {
    id: 2,
    type: '묶음',
    dealerName: '정길동',
    clientName: '(50개)',
    prescriptionMonth: '2025-04',
    status: '접수대기',
  },
  {
    id: 3,
    type: '묶음',
    dealerName: '정길동',
    clientName: '(50개)',
    prescriptionMonth: '2025-04',
    status: '접수대기',
  },
  {
    id: 4,
    type: '묶음',
    dealerName: '정길동',
    clientName: '(50개)',
    prescriptionMonth: '2025-04',
    status: '접수대기',
  },
  {
    id: 5,
    type: '묶음',
    dealerName: '정길동',
    clientName: '(50개)',
    prescriptionMonth: '2025-04',
    status: '접수대기',
  },
];

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

  const [data, setData] = useState<PrescriptionResponse[]>([]);
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
    const response = await searchPrescriptions({
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
        <Typography sx={{ ...typography.heading4B, color: colors.gray80 }}>{currentMonth}</Typography>
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
              <MenuItem value='companyName'>거래처명</MenuItem>
              <MenuItem value='dealerName'>딜러명</MenuItem>
            </Select>
          </FormControl>
          <TextField
            placeholder='거래처명을 검색하세요.'
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
        <Stack direction='row' alignItems='center' gap='10px' sx={{ width: '100%', marginTop: '40px' }}>
          <Button
            variant='outlined'
            sx={{
              width: '140px',
              height: '40px',
              marginLeft: 'auto',
              border: `1px solid ${colors.vividViolet}`,
              borderRadius: '30px',
              color: colors.vividViolet,
            }}
          >
            거래처별 업로드
          </Button>
          <Button
            variant='contained'
            sx={{
              width: '140px',
              height: '40px',
              borderRadius: '30px',
              backgroundColor: colors.vividViolet,
            }}
          >
            한번에 업로드
          </Button>
        </Stack>
        <Stack direction='row' alignItems='flex-start' gap='24px' sx={{ width: '100%', marginTop: '10px' }}>
          <Stack alignItems='center' sx={{ width: '600px' }}>
            <Table>
              <TableHead>
                <MedipandaTableRow>
                  <MedipandaTableCell sx={{ width: '40px' }}>구분</MedipandaTableCell>
                  <MedipandaTableCell sx={{ width: '70px' }}>딜러명</MedipandaTableCell>
                  <MedipandaTableCell sx={{ width: '170px' }}>거래처명</MedipandaTableCell>
                  <MedipandaTableCell sx={{ width: '80px' }}>처방월</MedipandaTableCell>
                  <MedipandaTableCell sx={{ width: '70px' }}>등록처리</MedipandaTableCell>
                </MedipandaTableRow>
              </TableHead>
              <TableBody>
                {data.map(prescription => (
                  <MedipandaTableRow key={prescription.id}>
                    <MedipandaTableCell>{prescription.type}</MedipandaTableCell>
                    <MedipandaTableCell>{prescription.dealerName}</MedipandaTableCell>
                    <MedipandaTableCell>{prescription.companyName}</MedipandaTableCell>
                    <MedipandaTableCell>{formatYyyyMmDd(prescription.prescriptionMonth)}</MedipandaTableCell>
                    <MedipandaTableCell>{prescription.status}</MedipandaTableCell>
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
            alignItems='center'
            gap='10px'
            sx={{
              width: '600px',
              padding: '40px 75px',
              border: `1px solid ${colors.gray30}`,
              boxSizing: 'border-box',
            }}
          >
            <Typography sx={{ ...typography.heading2B, color: colors.gray80 }}>실적(EDI) 입력</Typography>
            <Stack direction='row' alignItems='center' sx={{ marginTop: '20px' }}>
              <Typography sx={{ ...typography.largeTextM, color: colors.gray80, width: '120px' }}>정산월</Typography>
              <MpDatePicker
                sx={{
                  width: '330px',
                }}
              />
            </Stack>
            <Stack direction='row' alignItems='center'>
              <Typography sx={{ ...typography.largeTextM, color: colors.gray80, width: '120px' }}>처방월</Typography>
              <MpDatePicker
                sx={{
                  width: '330px',
                }}
              />
            </Stack>
            <Stack direction='row' alignItems='center'>
              <Typography sx={{ ...typography.largeTextM, color: colors.gray80, width: '120px' }}>파일업로드</Typography>
              <Button
                variant='outlined'
                startIcon={<img src='/assets/icons/icon-file-upload.svg' />}
                onClick={() => handleFileUpload()}
                sx={{
                  width: '330px',
                  height: '40px',
                  marginLeft: 'auto',
                  borderColor: colors.gray40,
                  color: colors.gray50,
                }}
              >
                파일 올리기
              </Button>
            </Stack>
            <Box>
              <Typography sx={{ ...typography.smallTextR, color: 'red', whiteSpace: 'pre-wrap' }}>
                파일 업로드시 주의사항
                <br />
                1. 한번에 업로드시 zip파일로 업로드 해주세요
                <br />
                2. zip 파일 내 각 파일명: 딜러명_거래처명_처방월 (ex. 홍길동_메디판다_202504)으로 저장해주세요
                <br />
                3. png, jpg, jpeg, png, pdf파일만 업로드 가능해요
                <br />
                4. 파일명내에 처방월이 선택한 처방월과 일치하게 해주세요
                <br />
              </Typography>
            </Box>

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

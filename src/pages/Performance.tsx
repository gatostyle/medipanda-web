import { Add, GetApp, Search } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
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

const EDIFormCard = styled(Card)({
  backgroundColor: '#fff',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  border: '1px solid #e0e0e0',
  borderRadius: '12px',
  marginLeft: '24px',
  minWidth: '300px',
});

const StatusChip = styled(Chip)(({ status }) => ({
  fontSize: '12px',
  fontWeight: 500,
  ...(status === '접수대기' && {
    backgroundColor: '#ff9800',
    color: '#fff',
  }),
  ...(status === '완료' && {
    backgroundColor: '#4caf50',
    color: '#fff',
  }),
}));

const mockPerformanceData = [
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

export default function Performance() {
  const [currentTab, setCurrentTab] = useState(0);
  const [searchCategory, setSearchCategory] = useState('거래처명');
  const [searchQuery, setSearchQuery] = useState('건일');
  const [ediForm, setEdiForm] = useState({
    dealerName: '홍길동',
    settlementMonth: '2025-04',
    prescriptionMonth: '2025-02',
    clientName: '명수병원',
  });

  return (
    <Box>
      <Typography variant='h4' sx={{ mb: 4, fontWeight: 'bold', color: '#333' }}>
        실적관리
      </Typography>

      <Box sx={{ mb: 3 }}>
        <TabButton className={currentTab === 0 ? 'selected' : ''} onClick={() => setCurrentTab(0)}>
          실적입력(EDI)
        </TabButton>
        <TabButton className={currentTab === 1 ? 'selected' : ''} onClick={() => setCurrentTab(1)}>
          소속딜러 관리
        </TabButton>
      </Box>

      {currentTab === 0 && (
        <Box sx={{ display: 'flex', gap: 4 }}>
          <Box sx={{ flex: 1 }}>
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
                  <MenuItem value='거래처명'>거래처명</MenuItem>
                  <MenuItem value='딜러명'>딜러명</MenuItem>
                  <MenuItem value='제약사명'>제약사명</MenuItem>
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
              <Button
                variant='contained'
                sx={{
                  backgroundColor: '#6B3AA0',
                  textTransform: 'none',
                  '&:hover': { backgroundColor: '#5a2d8a' },
                }}
              >
                거래처별 업로드
              </Button>
              <Button
                variant='outlined'
                sx={{
                  borderColor: '#6B3AA0',
                  color: '#6B3AA0',
                  textTransform: 'none',
                  '&:hover': { backgroundColor: '#f3f0ff' },
                }}
              >
                한번에 업로드
              </Button>
            </Box>

            <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e0e0e0' }}>
              <Table>
                <StyledTableHead>
                  <TableRow>
                    <StyledTableCell sx={{ width: '80px' }}>구분</StyledTableCell>
                    <StyledTableCell sx={{ width: '120px' }}>딜러명</StyledTableCell>
                    <StyledTableCell sx={{ width: '150px' }}>거래처명</StyledTableCell>
                    <StyledTableCell sx={{ width: '100px' }}>처방월</StyledTableCell>
                    <StyledTableCell sx={{ width: '100px' }}>등록처리</StyledTableCell>
                  </TableRow>
                </StyledTableHead>
                <TableBody>
                  {mockPerformanceData.map(item => (
                    <TableRow key={item.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                      <StyledTableCell>
                        <Chip
                          label={item.type}
                          size='small'
                          sx={{
                            backgroundColor: item.type === '개별' ? '#e3f2fd' : '#f3e5f5',
                            color: item.type === '개별' ? '#1976d2' : '#7b1fa2',
                            fontSize: '12px',
                          }}
                        />
                      </StyledTableCell>
                      <StyledTableCell>{item.dealerName}</StyledTableCell>
                      <StyledTableCell>{item.clientName}</StyledTableCell>
                      <StyledTableCell>{item.prescriptionMonth}</StyledTableCell>
                      <StyledTableCell>
                        <StatusChip label={item.status} size='small' status={item.status} />
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

          <EDIFormCard>
            <CardContent sx={{ p: 3 }}>
              <Typography variant='h6' sx={{ mb: 3, fontWeight: 'bold', color: '#333' }}>
                실적(EDI)입력
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant='body2' sx={{ mb: 1, fontWeight: 500 }}>
                  딜러명
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TextField
                    value={ediForm.dealerName}
                    onChange={e => setEdiForm(prev => ({ ...prev, dealerName: e.target.value }))}
                    size='small'
                    sx={{ flex: 1 }}
                  />
                  <IconButton size='small' sx={{ color: '#6B3AA0' }}>
                    <Add />
                  </IconButton>
                  <Typography variant='caption' sx={{ color: '#6B3AA0' }}>
                    딜러추가
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant='body2' sx={{ mb: 1, fontWeight: 500 }}>
                  정산월
                </Typography>
                <TextField
                  value={ediForm.settlementMonth}
                  onChange={e => setEdiForm(prev => ({ ...prev, settlementMonth: e.target.value }))}
                  size='small'
                  fullWidth
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant='body2' sx={{ mb: 1, fontWeight: 500 }}>
                  처방월
                </Typography>
                <TextField
                  value={ediForm.prescriptionMonth}
                  onChange={e => setEdiForm(prev => ({ ...prev, prescriptionMonth: e.target.value }))}
                  size='small'
                  fullWidth
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant='body2' sx={{ mb: 1, fontWeight: 500 }}>
                  거래처명
                </Typography>
                <TextField
                  value={ediForm.clientName}
                  onChange={e => setEdiForm(prev => ({ ...prev, clientName: e.target.value }))}
                  size='small'
                  fullWidth
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant='body2' sx={{ mb: 1, fontWeight: 500 }}>
                  파일업로드
                </Typography>
                <Button
                  variant='outlined'
                  startIcon={<GetApp />}
                  sx={{
                    borderColor: '#e0e0e0',
                    color: '#666',
                    textTransform: 'none',
                    mb: 2,
                    '&:hover': {
                      borderColor: '#6B3AA0',
                      color: '#6B3AA0',
                    },
                  }}
                >
                  파일 올리기
                </Button>
                <Box sx={{ backgroundColor: '#fff3cd', p: 2, borderRadius: '4px', border: '1px solid #ffeaa7' }}>
                  <Typography variant='caption' sx={{ color: '#856404', fontSize: '11px', display: 'block', mb: 1 }}>
                    파일 업로드시 주의사항
                  </Typography>
                  <Typography variant='caption' sx={{ color: '#856404', fontSize: '10px', display: 'block', lineHeight: 1.4 }}>
                    • png, jpg, jpeg, png, pdf파일만 업로드 가능해요
                  </Typography>
                  <Typography variant='caption' sx={{ color: '#856404', fontSize: '10px', display: 'block', lineHeight: 1.4 }}>
                    • 파일은 최대 5개까지 가능하니, 5개가 초과할 경우에 한번에 업로드 기능을 이용해주세요
                  </Typography>
                  <Typography variant='caption' sx={{ color: '#856404', fontSize: '10px', display: 'block', lineHeight: 1.4 }}>
                    • 파일명의 처방월이 선택한 처방월과 일치하게 해주세요.
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant='outlined'
                  sx={{
                    padding: '8px 24px',
                    borderColor: '#e0e0e0',
                    color: '#666',
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: '#6B3AA0',
                      color: '#6B3AA0',
                    },
                  }}
                >
                  취소
                </Button>
                <Button
                  variant='contained'
                  sx={{
                    padding: '8px 24px',
                    backgroundColor: '#1a237e',
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: '#0d47a1',
                    },
                  }}
                >
                  등록
                </Button>
              </Box>
            </CardContent>
          </EDIFormCard>
        </Box>
      )}

      {currentTab === 1 && (
        <Box sx={{ display: 'flex', gap: 4 }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: '#333' }}>
                딜러명
              </Typography>
              <TextField
                placeholder="딜러명을 검색하세요."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
              <Button
                variant="contained"
                sx={{
                  backgroundColor: '#6B3AA0',
                  textTransform: 'none',
                  '&:hover': { backgroundColor: '#5a2d8a' },
                }}
              >
                딜러 등록
              </Button>
            </Box>

            <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e0e0e0' }}>
              <Table>
                <StyledTableHead>
                  <TableRow>
                    <StyledTableCell align="center" sx={{ width: '80px' }}>No</StyledTableCell>
                    <StyledTableCell sx={{ width: '120px' }}>딜러번호</StyledTableCell>
                    <StyledTableCell sx={{ width: '120px' }}>딜러명</StyledTableCell>
                    <StyledTableCell sx={{ width: '150px' }}>거래제약사</StyledTableCell>
                    <StyledTableCell sx={{ width: '120px' }}>등록일</StyledTableCell>
                  </TableRow>
                </StyledTableHead>
                <TableBody>
                  {[
                    { id: 1, dealerNumber: '31231', dealerName: '홍길동', drugCompany: '동구바이오', registrationDate: '2025-04-10' },
                    { id: 2, dealerNumber: '123123', dealerName: '나유비', drugCompany: '동구바이오', registrationDate: '2025-04-15' },
                    { id: 3, dealerNumber: '124125', dealerName: '제갈량', drugCompany: '동구바이오', registrationDate: '2025-04-15' },
                    { id: 4, dealerNumber: '124214', dealerName: '조조', drugCompany: '동구바이오', registrationDate: '2025-04-15' },
                  ].map((dealer, index) => (
                    <TableRow key={dealer.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                      <StyledTableCell align="center">{index + 1}</StyledTableCell>
                      <StyledTableCell>{dealer.dealerNumber}</StyledTableCell>
                      <StyledTableCell>{dealer.dealerName}</StyledTableCell>
                      <StyledTableCell>{dealer.drugCompany}</StyledTableCell>
                      <StyledTableCell>{dealer.registrationDate}</StyledTableCell>
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

          <EDIFormCard>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', color: '#333' }}>
                딜러 등록
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                  딜러명
                </Typography>
                <TextField
                  value="홍길동"
                  size="small"
                  fullWidth
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                  거래제약사
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TextField
                    value="명수병원"
                    size="small"
                    sx={{ flex: 1 }}
                  />
                  <IconButton size="small" sx={{ color: '#6B3AA0' }}>
                    <Add />
                  </IconButton>
                  <Typography variant="caption" sx={{ color: '#6B3AA0' }}>
                    추가하기
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  sx={{
                    padding: '8px 24px',
                    borderColor: '#e0e0e0',
                    color: '#666',
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: '#6B3AA0',
                      color: '#6B3AA0',
                    },
                  }}
                >
                  취소
                </Button>
                <Button
                  variant="contained"
                  sx={{
                    padding: '8px 24px',
                    backgroundColor: '#1a237e',
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: '#0d47a1',
                    },
                  }}
                >
                  등록
                </Button>
              </Box>
            </CardContent>
          </EDIFormCard>
        </Box>
      )}
    </Box>
  );
}

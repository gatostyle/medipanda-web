import { Add, GetApp, Search } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
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

const AddDealerCard = styled(Card)({
  backgroundColor: '#fff',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  border: '1px solid #e0e0e0',
  borderRadius: '12px',
  marginLeft: '24px',
  minWidth: '300px',
});

const mockDealers = [
  {
    id: 1,
    dealerNumber: '31231',
    dealerName: '홍길동',
    drugCompany: '동구바이오',
    registrationDate: '2025-04-10',
  },
  {
    id: 2,
    dealerNumber: '123123',
    dealerName: '나유비',
    drugCompany: '동구바이오',
    registrationDate: '2025-04-15',
  },
  {
    id: 3,
    dealerNumber: '124125',
    dealerName: '제갈량',
    drugCompany: '동구바이오',
    registrationDate: '2025-04-15',
  },
  {
    id: 4,
    dealerNumber: '124214',
    dealerName: '조조',
    drugCompany: '동구바이오',
    registrationDate: '2025-04-15',
  },
];

export default function Dealers() {
  const [currentTab, setCurrentTab] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDealerOpen, setIsAddDealerOpen] = useState(false);
  const [dealerForm, setDealerForm] = useState({
    dealerName: '홍길동',
    drugCompany: '명수병원',
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
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '24px 0', gap: '16px' }}>
              <IconButton>
                <Typography variant="h5">←</Typography>
              </IconButton>
              <Typography variant="h5" sx={{ fontWeight: 'bold', minWidth: '160px', textAlign: 'center' }}>
                2025년 4월
              </Typography>
              <IconButton>
                <Typography variant="h5">→</Typography>
              </IconButton>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
              <FormControl sx={{ minWidth: 120 }}>
                <Select
                  value="거래처명"
                  size="small"
                >
                  <MenuItem value="거래처명">거래처명</MenuItem>
                  <MenuItem value="딜러명">딜러명</MenuItem>
                  <MenuItem value="제약사명">제약사명</MenuItem>
                </Select>
              </FormControl>
              <TextField
                value="건일"
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
                거래처별 업로드
              </Button>
              <Button
                variant="outlined"
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
                  {[
                    { id: 1, type: '개별', dealerName: '홍길동', clientName: '명수병원', prescriptionMonth: '2025-04', status: '접수대기' },
                    { id: 2, type: '묶음', dealerName: '정길동', clientName: '(50개)', prescriptionMonth: '2025-04', status: '접수대기' },
                    { id: 3, type: '묶음', dealerName: '정길동', clientName: '(50개)', prescriptionMonth: '2025-04', status: '접수대기' },
                    { id: 4, type: '묶음', dealerName: '정길동', clientName: '(50개)', prescriptionMonth: '2025-04', status: '접수대기' },
                  ].map((item) => (
                    <TableRow key={item.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                      <StyledTableCell>
                        <Chip
                          label={item.type}
                          size="small"
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
                        <Chip
                          label={item.status}
                          size="small"
                          sx={{
                            backgroundColor: '#ff9800',
                            color: '#fff',
                            fontSize: '12px',
                          }}
                        />
                      </StyledTableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          <AddDealerCard>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', color: '#333' }}>
                실적(EDI)입력
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                  정산월
                </Typography>
                <TextField
                  value="2025-04"
                  size="small"
                  fullWidth
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                  처방월
                </Typography>
                <TextField
                  value="2025-02"
                  size="small"
                  fullWidth
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                  파일업로드
                </Typography>
                <Button
                  variant="outlined"
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
          </AddDealerCard>
        </Box>
      )}

      {currentTab === 1 && (
        <Box sx={{ display: 'flex', gap: 4 }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
              <Typography variant='body2' sx={{ fontWeight: 500, color: '#333' }}>
                딜러명
              </Typography>
              <TextField
                placeholder='딜러명을 검색하세요.'
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
                onClick={() => setIsAddDealerOpen(true)}
              >
                딜러 등록
              </Button>
            </Box>

            <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e0e0e0' }}>
              <Table>
                <StyledTableHead>
                  <TableRow>
                    <StyledTableCell align='center' sx={{ width: '80px' }}>
                      No
                    </StyledTableCell>
                    <StyledTableCell sx={{ width: '120px' }}>딜러번호</StyledTableCell>
                    <StyledTableCell sx={{ width: '120px' }}>딜러명</StyledTableCell>
                    <StyledTableCell sx={{ width: '150px' }}>거래제약사</StyledTableCell>
                    <StyledTableCell sx={{ width: '120px' }}>등록일</StyledTableCell>
                  </TableRow>
                </StyledTableHead>
                <TableBody>
                  {mockDealers.map((dealer, index) => (
                    <TableRow key={dealer.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                      <StyledTableCell align='center'>{index + 1}</StyledTableCell>
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

          <AddDealerCard>
            <CardContent sx={{ p: 3 }}>
              <Typography variant='h6' sx={{ mb: 3, fontWeight: 'bold', color: '#333' }}>
                딜러 등록
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant='body2' sx={{ mb: 1, fontWeight: 500 }}>
                  딜러명
                </Typography>
                <TextField
                  value={dealerForm.dealerName}
                  onChange={e => setDealerForm(prev => ({ ...prev, dealerName: e.target.value }))}
                  size='small'
                  fullWidth
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant='body2' sx={{ mb: 1, fontWeight: 500 }}>
                  거래제약사
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TextField
                    value={dealerForm.drugCompany}
                    onChange={e => setDealerForm(prev => ({ ...prev, drugCompany: e.target.value }))}
                    size='small'
                    sx={{ flex: 1 }}
                  />
                  <IconButton size='small' sx={{ color: '#6B3AA0' }}>
                    <Add />
                  </IconButton>
                  <Typography variant='caption' sx={{ color: '#6B3AA0' }}>
                    추가하기
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
          </AddDealerCard>
        </Box>
      )}

      <Dialog open={isAddDealerOpen} onClose={() => setIsAddDealerOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>딜러 등록</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant='body2' sx={{ mb: 1, fontWeight: 500 }}>
              딜러명
            </Typography>
            <TextField
              value={dealerForm.dealerName}
              onChange={e => setDealerForm(prev => ({ ...prev, dealerName: e.target.value }))}
              size='small'
              fullWidth
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant='body2' sx={{ mb: 1, fontWeight: 500 }}>
              거래제약사
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TextField
                value={dealerForm.drugCompany}
                onChange={e => setDealerForm(prev => ({ ...prev, drugCompany: e.target.value }))}
                size='small'
                sx={{ flex: 1 }}
              />
              <IconButton size='small' sx={{ color: '#6B3AA0' }}>
                <Add />
              </IconButton>
              <Typography variant='caption' sx={{ color: '#6B3AA0' }}>
                추가하기
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant='outlined'
              onClick={() => setIsAddDealerOpen(false)}
              sx={{
                borderColor: '#e0e0e0',
                color: '#666',
                textTransform: 'none',
              }}
            >
              취소
            </Button>
            <Button
              variant='contained'
              sx={{
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
        </DialogContent>
      </Dialog>
    </Box>
  );
}

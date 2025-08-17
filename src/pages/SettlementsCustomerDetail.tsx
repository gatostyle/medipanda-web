import { ChevronLeft, ChevronRight, GetApp, Search } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
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
import { useParams } from 'react-router';

const ContentContainer = styled(Box)({
  padding: '24px',
  display: 'flex',
  gap: '24px',
});

const MainContent = styled(Box)({
  flex: 1,
});

const Sidebar = styled(Box)({
  width: '350px',
  flexShrink: 0,
});

const TabButton = styled(Button)({
  padding: '12px 24px',
  borderRadius: '4px',
  textTransform: 'none',
  fontSize: '14px',
  fontWeight: 500,
  minWidth: 'auto',
  '&.selected': {
    backgroundColor: '#e0e0e0',
    color: '#333',
  },
  '&:not(.selected)': {
    backgroundColor: 'transparent',
    color: '#666',
  },
});

const DateNavigation = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '16px',
  margin: '24px 0',
});

const FilterContainer = styled(Box)({
  display: 'flex',
  gap: '16px',
  marginBottom: '24px',
});

const SummaryContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '16px',
  padding: '16px',
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
});

const StyledTableHead = styled(TableHead)({
  backgroundColor: '#f8f9fa',
  '& .MuiTableCell-head': {
    fontWeight: 600,
    color: '#333',
    borderBottom: '1px solid #e0e0e0',
    padding: '16px',
    textAlign: 'center',
  },
});

const StyledTableCell = styled(TableCell)({
  padding: '16px',
  borderBottom: '1px solid #f0f0f0',
  fontSize: '14px',
  textAlign: 'center',
});

const DetailCard = styled(Card)({
  boxShadow: 'none',
  border: '1px solid #e0e0e0',
  borderRadius: '8px',
});

export default function SettlementsCustomerDetail() {
  const { id } = useParams();
  const [selectedTab, setSelectedTab] = useState('정산내역');
  const [currentMonth, setCurrentMonth] = useState('2025년 4월');
  const [selectedCompany, setSelectedCompany] = useState('제약사명');
  const [searchValue, setSearchValue] = useState('');

  const mockData = [
    { company: '동구바이오', manager: '정길동', supplyAmount: '328,303,614', taxAmount: '3,316,198', totalAmount: '331,619,812' },
    { company: '동구바이오', manager: '홍길동', supplyAmount: '328,303,614', taxAmount: '3,316,198', totalAmount: '331,619,812' },
    { company: '동구바이오', manager: '나현빈', supplyAmount: '328,303,614', taxAmount: '3,316,198', totalAmount: '331,619,812' },
  ];

  const detailData = {
    company: '동구바이오',
    manager: '정길동',
    totalAmount: '121,140,267',
    supplyAmount: '220,733,209',
    taxAmount: '22,073,320',
    settlementAmount: '242,806,529',
    products: [
      { category: '거래처명', supplyAndTax: '110,366,605', settlement: '121,403,265' },
      { category: 'D형일', supplyAndTax: '110,366,605', settlement: '121,403,265' },
    ],
  };

  return (
    <Box>
      <ContentContainer>
        <MainContent>
          <Typography sx={{ mb: 4, fontWeight: 'bold', color: '#333' }}>정산</Typography>

          <Box sx={{ mb: 3 }}>
            <TabButton className={selectedTab === '정산내역' ? 'selected' : ''} onClick={() => setSelectedTab('정산내역')}>
              정산내역
            </TabButton>
            <TabButton className={selectedTab === '매출통계' ? 'selected' : ''} onClick={() => setSelectedTab('매출통계')}>
              매출통계
            </TabButton>
          </Box>

          <DateNavigation>
            <IconButton size='small'>
              <ChevronLeft />
            </IconButton>
            <Typography sx={{ fontWeight: 500 }}>{currentMonth}</Typography>
            <IconButton size='small'>
              <ChevronRight />
            </IconButton>
          </DateNavigation>

          <FilterContainer>
            <FormControl size='small' sx={{ minWidth: 160 }}>
              <Select value={selectedCompany} onChange={e => setSelectedCompany(e.target.value)}>
                <MenuItem value='제약사명'>제약사명</MenuItem>
                <MenuItem value='동구바이오'>동구바이오</MenuItem>
              </Select>
            </FormControl>
            <TextField
              size='small'
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              sx={{ width: '300px' }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <Search sx={{ color: '#999' }} />
                  </InputAdornment>
                ),
              }}
            />
          </FilterContainer>

          <SummaryContainer>
            <Typography sx={{ fontWeight: 500 }}>합계금액: 663,239,627</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant='outlined' startIcon={<GetApp />} sx={{ textTransform: 'none' }}>
                파일다운로드
              </Button>
              <Button variant='outlined' sx={{ textTransform: 'none' }}>
                정산신청
              </Button>
              <Button variant='contained' sx={{ textTransform: 'none', backgroundColor: '#6B3AA0' }}>
                이의신청
              </Button>
            </Box>
          </SummaryContainer>

          <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e0e0e0' }}>
            <Table>
              <StyledTableHead>
                <TableRow>
                  <StyledTableCell>제약사명</StyledTableCell>
                  <StyledTableCell>담당자</StyledTableCell>
                  <StyledTableCell>공급가액</StyledTableCell>
                  <StyledTableCell>세액</StyledTableCell>
                  <StyledTableCell>합계금액</StyledTableCell>
                </TableRow>
              </StyledTableHead>
              <TableBody>
                {mockData.map((row, index) => (
                  <TableRow key={index} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                    <StyledTableCell>
                      <Typography sx={{ color: '#1976d2', textDecoration: 'underline', cursor: 'pointer' }}>{row.company}</Typography>
                    </StyledTableCell>
                    <StyledTableCell>{row.manager}</StyledTableCell>
                    <StyledTableCell>{row.supplyAmount}</StyledTableCell>
                    <StyledTableCell>{row.taxAmount}</StyledTableCell>
                    <StyledTableCell>{row.totalAmount}</StyledTableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination count={10} page={3} showFirstButton showLastButton />
          </Box>
        </MainContent>

        <Sidebar>
          <DetailCard>
            <CardContent sx={{ p: 3 }}>
              <Typography sx={{ mb: 3, fontWeight: 'bold' }}>정산내역 상세(거래처)</Typography>

              <Box sx={{ mb: 3 }}>
                <Typography sx={{ color: '#666', mb: 1 }}>제약사명: {detailData.company}</Typography>
                <Typography sx={{ color: '#666', mb: 1 }}>담당자: {detailData.manager}</Typography>
                <Typography sx={{ color: '#666', mb: 1 }}>거래금액: {detailData.totalAmount}</Typography>
                <Typography sx={{ color: '#666', mb: 1 }}>공급가액: {detailData.supplyAmount}</Typography>
                <Typography sx={{ color: '#666', mb: 1 }}>세액: {detailData.taxAmount}</Typography>
                <Typography sx={{ color: '#666' }}>합계금액: {detailData.settlementAmount}</Typography>
              </Box>

              <Typography sx={{ mb: 2, fontWeight: 500 }}>합계금액: 663,239,627 · 정산구분: ▼</Typography>

              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, fontSize: '12px' }}>거래처명</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '12px' }}>차방수수료공급액</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '12px' }}>기타수수료공급액</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '12px' }}>정산금액</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {detailData.products.map((product, index) => (
                    <TableRow key={index}>
                      <TableCell sx={{ fontSize: '12px' }}>
                        <Typography sx={{ color: '#1976d2', textDecoration: 'underline', cursor: 'pointer', fontSize: '12px' }}>
                          {product.category}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ fontSize: '12px' }}>{product.supplyAndTax}</TableCell>
                      <TableCell sx={{ fontSize: '12px' }}>10,536,660</TableCell>
                      <TableCell sx={{ fontSize: '12px' }}>{product.settlement}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </DetailCard>
        </Sidebar>
      </ContentContainer>
    </Box>
  );
}

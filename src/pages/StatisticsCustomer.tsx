import { Search } from '@mui/icons-material';
import {
  Box,
  Button,
  InputAdornment,
  Paper,
  Switch,
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
import { Link as RouterLink } from 'react-router';

const ContentContainer = styled(Box)({
  padding: '24px',
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
    '&:hover': {
      backgroundColor: '#e0e0e0',
    },
  },
  '&:not(.selected)': {
    backgroundColor: 'transparent',
    color: '#666',
    '&:hover': {
      backgroundColor: '#f5f5f5',
    },
  },
});

const PeriodToggle = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  margin: '24px 0',
  justifyContent: 'center',
});

const FilterContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  marginBottom: '24px',
  justifyContent: 'center',
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

const ActionButton = styled(Button)({
  backgroundColor: '#1a237e',
  color: '#fff',
  padding: '4px 16px',
  fontSize: '12px',
  fontWeight: 500,
  textTransform: 'none',
  borderRadius: '4px',
  '&:hover': {
    backgroundColor: '#0d47a1',
  },
});

const mockData = [
  { id: 1, hospital: 'A 병원 1', amount: '15,500,000' },
  { id: 2, hospital: 'A 병원 2', amount: '50,500,145' },
  { id: 3, hospital: 'A 병원 3', amount: '1,050,202,500' },
  { id: 4, hospital: 'A 병원 4', amount: '65,500,050' },
  { id: 5, hospital: 'A 병원 5', amount: '0' },
];

export default function StatisticsCustomer() {
  const [selectedTab, setSelectedTab] = useState('정산내역');
  const [isPeriodCompleted, setIsPeriodCompleted] = useState(true);
  const [startDate, setStartDate] = useState('2025-07');
  const [endDate, setEndDate] = useState('2025-11');
  const [searchValue, setSearchValue] = useState('A 병원');

  return (
    <ContentContainer>
      <Typography variant='h4' sx={{ mb: 4, fontWeight: 'bold', color: '#333' }}>
        정산
      </Typography>

      <Box sx={{ mb: 3 }}>
        <TabButton
          className={selectedTab === '정산내역' ? 'selected' : ''}
          onClick={() => setSelectedTab('정산내역')}
        >
          정산내역
        </TabButton>
        <TabButton
          className={selectedTab === '매출통계' ? 'selected' : ''}
          onClick={() => setSelectedTab('매출통계')}
        >
          매출통계
        </TabButton>
      </Box>

      <PeriodToggle>
        <Typography variant='body2' sx={{ color: isPeriodCompleted ? '#999' : '#6B3AA0', fontWeight: 500 }}>
          진행예정
        </Typography>
        <Switch
          checked={isPeriodCompleted}
          onChange={(e) => setIsPeriodCompleted(e.target.checked)}
          sx={{
            '& .MuiSwitch-switchBase.Mui-checked': {
              color: '#6B3AA0',
            },
            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
              backgroundColor: '#6B3AA0',
            },
          }}
        />
        <Typography variant='body2' sx={{ color: isPeriodCompleted ? '#6B3AA0' : '#999', fontWeight: 500 }}>
          지급완료
        </Typography>
      </PeriodToggle>

      <FilterContainer>
        <TextField
          type='month'
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          size='small'
          sx={{ width: '140px' }}
        />
        <Typography variant='body2' sx={{ color: '#666' }}>-</Typography>
        <TextField
          type='month'
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          size='small'
          sx={{ width: '140px' }}
        />
        <TextField
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          size='small'
          sx={{ width: '200px' }}
          InputProps={{
            endAdornment: (
              <InputAdornment position='end'>
                <Search sx={{ color: '#999', cursor: 'pointer' }} />
              </InputAdornment>
            ),
          }}
        />
      </FilterContainer>

      <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e0e0e0' }}>
        <Table>
          <StyledTableHead>
            <TableRow>
              <StyledTableCell>거래처명</StyledTableCell>
              <StyledTableCell>정산(환)금액(VAT포함)</StyledTableCell>
              <StyledTableCell>관리</StyledTableCell>
            </TableRow>
          </StyledTableHead>
          <TableBody>
            {mockData.map((row) => (
              <TableRow key={row.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                <StyledTableCell>{row.hospital}</StyledTableCell>
                <StyledTableCell>{row.amount}</StyledTableCell>
                <StyledTableCell>
                  <ActionButton
                    component={RouterLink}
                    to={`/statistics/customer/${row.id}`}
                  >
                    신규
                  </ActionButton>
                </StyledTableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </ContentContainer>
  );
}

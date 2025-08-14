import { Search } from '@mui/icons-material';
import {
  Box,
  Button,
  Checkbox,
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
import { useParams } from 'react-router';

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

const ChartArea = styled(Box)({
  backgroundColor: '#f5f5f5',
  borderRadius: '8px',
  padding: '120px 40px',
  textAlign: 'center',
  color: '#999',
  fontSize: '18px',
  marginBottom: '24px',
});

const NoticeText = styled(Typography)({
  color: '#f44336',
  fontSize: '14px',
  marginBottom: '16px',
  textAlign: 'center',
});

const StyledTableHead = styled(TableHead)({
  backgroundColor: '#f8f9fa',
  '& .MuiTableCell-head': {
    fontWeight: 600,
    color: '#333',
    borderBottom: '1px solid #e0e0e0',
    padding: '16px',
  },
});

const StyledTableCell = styled(TableCell)({
  padding: '16px',
  borderBottom: '1px solid #f0f0f0',
  fontSize: '14px',
});

const mockData = [
  { id: 1, company: '지역혁 종합병', prescriptionAmount: '60,500만원', settlementAmount: '60,500만원' },
  { id: 2, company: '동구바이오', prescriptionAmount: '24,500만원', settlementAmount: '24,500만원' },
  { id: 3, company: '한미약품', prescriptionAmount: '24,500만원', settlementAmount: '24,500만원' },
  { id: 4, company: '셀트리온', prescriptionAmount: '24,500만원', settlementAmount: '24,500만원' },
  { id: 5, company: '종근당', prescriptionAmount: '24,500만원', settlementAmount: '24,500만원' },
  { id: 6, company: '대웅제약', prescriptionAmount: '24,500만원', settlementAmount: '24,500만원' },
];

export default function StatisticsCustomerDetail() {
  const { id } = useParams();
  const [selectedTab, setSelectedTab] = useState('정산내역');
  const [isPeriodCompleted, setIsPeriodCompleted] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [startDate, setStartDate] = useState('2025-07');
  const [endDate, setEndDate] = useState('2025-11');
  const [searchValue, setSearchValue] = useState('A 병원');

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedItems(mockData.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id: number) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

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

      <ChartArea>
        그래프 영역
      </ChartArea>

      <NoticeText>
        * 정산대 기준으로 산정된 금액이며, 안전인터 아바는 불상환 금액으로 표시 됩니다.
      </NoticeText>

      <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e0e0e0' }}>
        <Table>
          <StyledTableHead>
            <TableRow>
              <StyledTableCell padding='checkbox'>
                <Checkbox
                  indeterminate={selectedItems.length > 0 && selectedItems.length < mockData.length}
                  checked={mockData.length > 0 && selectedItems.length === mockData.length}
                  onChange={handleSelectAll}
                  sx={{
                    color: '#6B3AA0',
                    '&.Mui-checked': {
                      color: '#6B3AA0',
                    },
                  }}
                />
              </StyledTableCell>
              <StyledTableCell>제약사명</StyledTableCell>
              <StyledTableCell align='right'>처방금액</StyledTableCell>
              <StyledTableCell align='right'>정산(환)금액(VAT포함)</StyledTableCell>
            </TableRow>
          </StyledTableHead>
          <TableBody>
            {mockData.map((row) => (
              <TableRow key={row.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                <StyledTableCell padding='checkbox'>
                  <Checkbox
                    checked={selectedItems.includes(row.id)}
                    onChange={() => handleSelectItem(row.id)}
                    sx={{
                      color: '#6B3AA0',
                      '&.Mui-checked': {
                        color: '#6B3AA0',
                      },
                    }}
                  />
                </StyledTableCell>
                <StyledTableCell>{row.company}</StyledTableCell>
                <StyledTableCell align='right'>{row.prescriptionAmount}</StyledTableCell>
                <StyledTableCell align='right'>{row.settlementAmount}</StyledTableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </ContentContainer>
  );
}

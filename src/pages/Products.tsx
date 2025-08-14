import { Search, TuneOutlined } from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  FormControl,
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

const SearchContainer = styled(Box)({
  backgroundColor: '#6B3AA0',
  borderRadius: '32px',
  padding: '8px 16px',
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  marginBottom: '32px',
  maxWidth: '800px',
  margin: '0 auto 32px',
});

const SearchDropdown = styled(Select)({
  backgroundColor: '#7B4AAA',
  color: '#fff',
  borderRadius: '20px',
  minWidth: '120px',
  '& .MuiSelect-select': {
    padding: '8px 16px',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none',
  },
  '& .MuiSvgIcon-root': {
    color: '#fff',
  },
});

const SearchInput = styled(TextField)({
  flex: 1,
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#fff',
    borderRadius: '20px',
    '& fieldset': {
      border: 'none',
    },
  },
});

const FilterButton = styled(Button)({
  backgroundColor: 'transparent',
  color: '#fff',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: '20px',
  padding: '8px 16px',
  textTransform: 'none',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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

const StatusChip = styled(Chip)(({ status }) => ({
  fontSize: '12px',
  fontWeight: 500,
  ...(status === '프로모션' && {
    backgroundColor: '#6B3AA0',
    color: '#fff',
  }),
  ...(status === '품절' && {
    backgroundColor: '#f44336',
    color: '#fff',
  }),
  ...(status === '판매중단' && {
    backgroundColor: '#ff9800',
    color: '#fff',
  }),
}));

const FeeChangeChip = styled(Chip)({
  backgroundColor: '#f44336',
  color: '#fff',
  fontSize: '11px',
  height: '20px',
});

const mockProducts = [
  {
    id: 1,
    manufacturer: '휴온스생명과학\n(구.크리스탈)',
    productName: '파메졸캡슐50mg',
    composition: '당귀·목과·방풍·속단·오가피·우슬·위령선·육계·진교·천궁·천마·홍화 25% ethanol...',
    price: 1516,
    insuranceStatus: '급여',
    baseFeeRate: '90%',
    status: '프로모션',
    feeChange: '60%',
    changeMonth: '(7월)',
    note: '비고내용~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~@@',
  },
  {
    id: 2,
    manufacturer: '건일바이오팜',
    productName: '파메졸캡슐50mg',
    composition: '당귀·목과·방풍·속단·오가피·우슬·위령선·육계·진교·천궁·천마·홍화 25% ethanol...',
    price: 1516,
    insuranceStatus: '급여',
    baseFeeRate: '90%',
    status: '프로모션',
    feeChange: '60%',
    changeMonth: '(7월)',
    note: '비고내용~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~@@',
  },
  {
    id: 3,
    manufacturer: '건일바이오팜',
    productName: '파메졸캡슐50mg',
    composition: '당귀·목과·방풍·속단·오가피·우슬·위령선·육계·진교·천궁·천마·홍화 25% ethanol...',
    price: 1516,
    insuranceStatus: '비급여',
    baseFeeRate: '90%',
    status: '프로모션',
    feeChange: '60%',
    changeMonth: '(7월)',
    note: '비고내용~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~@@',
  },
  {
    id: 4,
    manufacturer: '건일바이오팜',
    productName: '파메졸캡슐50mg',
    composition: '당귀·목과·방풍·속단·오가피·우슬·위령선·육계·진교·천궁·천마·홍화 25% ethanol...',
    price: 1516,
    insuranceStatus: '비급여',
    baseFeeRate: '90%',
    status: '프로모션',
    feeChange: '60%',
    changeMonth: '(7월)',
    note: '비고내용~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~@@',
  },
  {
    id: 5,
    manufacturer: '휴온스생명과학\n(구.크리스탈)',
    productName: '파메졸캡슐50mg',
    composition: '당귀·목과·방풍·속단·오가피·우슬·위령선·육계·진교·천궁·천마·홍화 25% ethanol...',
    price: 1516,
    insuranceStatus: '급여',
    baseFeeRate: '90%',
    status: '프로모션',
    feeChange: '60%',
    changeMonth: '(7월)',
    note: '비고내용~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~@@',
  },
  {
    id: 6,
    manufacturer: '휴온스생명과학\n(구.크리스탈)',
    productName: '파메졸캡슐50mg',
    composition: '당귀·목과·방풍·속단·오가피·우슬·위령선·육계·진교·천궁·천마·홍화 25% ethanol...',
    price: 1516,
    insuranceStatus: '급여',
    baseFeeRate: '90%',
    status: '프로모션',
    feeChange: '60%',
    changeMonth: '(7월)',
    note: '비고내용~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~@@',
  },
];

export default function Products() {
  const [searchCategory, setSearchCategory] = useState('성분명');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('기본수수료율이 같을 경우 약가가 높은순');

  return (
    <Box>
      <SearchContainer>
        <SearchDropdown value={searchCategory} onChange={e => setSearchCategory(e.target.value)} displayEmpty>
          <MenuItem value='성분명'>성분명</MenuItem>
          <MenuItem value='제품명'>제품명</MenuItem>
          <MenuItem value='제약사명'>제약사명</MenuItem>
        </SearchDropdown>

        <SearchInput
          placeholder='성분명을 검색하세요.'
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position='end'>
                <Search sx={{ color: '#6B3AA0' }} />
              </InputAdornment>
            ),
          }}
        />

        <FilterButton startIcon={<TuneOutlined />}>상세검색</FilterButton>
      </SearchContainer>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant='body2' sx={{ color: '#666' }}>
          전체 : 10,248건
        </Typography>
        <FormControl sx={{ minWidth: 300 }}>
          <Select value={sortOrder} onChange={e => setSortOrder(e.target.value)} size='small'>
            <MenuItem value='기본수수료율이 같을 경우 약가가 높은순'>정렬기준 : 기본수수료율이 같을 경우 약가가 높은순</MenuItem>
            <MenuItem value='약가 높은순'>약가 높은순</MenuItem>
            <MenuItem value='약가 낮은순'>약가 낮은순</MenuItem>
            <MenuItem value='수수료율 높은순'>수수료율 높은순</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e0e0e0' }}>
        <Table>
          <StyledTableHead>
            <TableRow>
              <StyledTableCell sx={{ width: '140px' }}>제약사명</StyledTableCell>
              <StyledTableCell sx={{ width: '30%' }}>제품정보</StyledTableCell>
              <StyledTableCell align='center' sx={{ width: '80px' }}>
                약가
              </StyledTableCell>
              <StyledTableCell align='center' sx={{ width: '100px' }}>
                급여정보
              </StyledTableCell>
              <StyledTableCell align='center' sx={{ width: '120px' }}>
                기본 수수료율
              </StyledTableCell>
              <StyledTableCell align='center' sx={{ width: '100px' }}>
                상태
              </StyledTableCell>
              <StyledTableCell align='center' sx={{ width: '80px' }}>
                변경
              </StyledTableCell>
            </TableRow>
          </StyledTableHead>
          <TableBody>
            {mockProducts.map(product => (
              <TableRow key={product.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                <StyledTableCell>
                  <Typography variant='body2' sx={{ fontSize: '12px', lineHeight: 1.4, whiteSpace: 'pre-line' }}>
                    {product.manufacturer}
                  </Typography>
                </StyledTableCell>
                <StyledTableCell>
                  <Typography variant='body2' sx={{ fontWeight: 500, mb: 0.5 }}>
                    {product.productName}
                  </Typography>
                  <Typography
                    variant='caption'
                    sx={{
                      color: '#666',
                      fontSize: '11px',
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {product.composition}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Typography variant='caption' sx={{ color: '#6B3AA0', fontSize: '10px' }}>
                      비고내용
                    </Typography>
                    <Box
                      sx={{
                        width: '100%',
                        height: '2px',
                        background: 'linear-gradient(to right, #6B3AA0 80%, transparent 80%)',
                        backgroundSize: '10px 2px',
                        backgroundRepeat: 'repeat-x',
                      }}
                    />
                  </Box>
                </StyledTableCell>
                <StyledTableCell align='center'>
                  <Typography variant='body2' sx={{ fontWeight: 500 }}>
                    {product.price.toLocaleString()}
                  </Typography>
                </StyledTableCell>
                <StyledTableCell align='center'>
                  <Chip
                    label={product.insuranceStatus}
                    size='small'
                    sx={{
                      backgroundColor: product.insuranceStatus === '급여' ? '#4caf50' : '#f44336',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                </StyledTableCell>
                <StyledTableCell align='center'>
                  <Typography variant='body2' sx={{ fontWeight: 500 }}>
                    {product.baseFeeRate}
                  </Typography>
                </StyledTableCell>
                <StyledTableCell align='center'>
                  <StatusChip label={product.status} size='small' status={product.status} />
                </StyledTableCell>
                <StyledTableCell align='center'>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                    <FeeChangeChip label={product.feeChange} size='small' />
                    <Typography variant='caption' sx={{ fontSize: '10px', color: '#666' }}>
                      {product.changeMonth}
                    </Typography>
                  </Box>
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
  );
}

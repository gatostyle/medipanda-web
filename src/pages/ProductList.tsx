import { Close, Search } from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TextField,
  Typography,
} from '@mui/material';
import { ArrowDown2, ArrowUp2 } from 'iconsax-reactjs';
import { Fragment, useState } from 'react';
import { MedipandaPagination } from '../components/MedipandaPagination.tsx';
import { MedipandaTableCell, MedipandaTableRow } from '../components/MedipandaTable.tsx';
import { colors, typography } from '../globalStyles.ts';

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
    feeChange: '60%\n(7월)',
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
    feeChange: '60%\n(7월)',
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
    feeChange: '60%\n(7월)',
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
    feeChange: '60%\n(7월)',
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
    feeChange: '60%\n(7월)',
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
    feeChange: '60%\n(7월)',
    note: '비고내용~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~@@',
  },
];

export default function ProductList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('기본수수료율 높은순');
  const [searchType, setSearchType] = useState<string>('성분명');
  const [searchTypeDropdownOpen, setSearchTypeDropdownOpen] = useState(false);

  return (
    <>
      <Stack alignItems='center'>
        <Stack direction='row' gap='10px'>
          <Box
            sx={{
              position: 'relative',
              width: '200px',
              height: '60px',
            }}
          >
            <Button
              variant='contained'
              sx={{
                ...typography.heading5R,
                width: '100%',
                height: '60px',
                backgroundColor: colors.vividViolet,
                borderRadius: '30px',
              }}
              onClick={() => setSearchTypeDropdownOpen(!searchTypeDropdownOpen)}
            >
              <Typography>{searchType}</Typography>
              <ArrowDown2 style={{ marginLeft: 'auto' }} />
            </Button>
            {searchTypeDropdownOpen && (
              <Stack
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  left: 0,
                  color: colors.white,
                }}
              >
                <Button
                  variant='contained'
                  sx={{
                    ...typography.heading5R,
                    width: '100%',
                    height: '60px',
                    backgroundColor: colors.vividViolet,
                    borderTopLeftRadius: '30px',
                    borderTopRightRadius: '30px',
                  }}
                  onClick={() => {
                    setSearchType('성분명');
                    setSearchTypeDropdownOpen(!searchTypeDropdownOpen);
                  }}
                >
                  <Typography>성분명</Typography>
                  <ArrowUp2 style={{ marginLeft: 'auto' }} />
                </Button>
                <Button
                  variant='contained'
                  sx={{
                    ...typography.heading5R,
                    width: '100%',
                    height: '60px',
                    backgroundColor: colors.vividViolet,
                  }}
                  onClick={() => {
                    setSearchType('제품명');
                    setSearchTypeDropdownOpen(!searchTypeDropdownOpen);
                  }}
                >
                  <Typography>제품명</Typography>
                  <ArrowUp2 style={{ marginLeft: 'auto', opacity: 0 }} />
                </Button>
                <Button
                  variant='contained'
                  sx={{
                    ...typography.heading5R,
                    width: '100%',
                    height: '60px',
                    backgroundColor: colors.vividViolet,
                    borderBottomLeftRadius: '30px',
                    borderBottomRightRadius: '30px',
                  }}
                  onClick={() => {
                    setSearchType('제약사명');
                    setSearchTypeDropdownOpen(!searchTypeDropdownOpen);
                  }}
                >
                  <Typography>제약사명</Typography>
                  <ArrowUp2 style={{ marginLeft: 'auto', opacity: 0 }} />
                </Button>
              </Stack>
            )}
          </Box>
          <TextField
            placeholder='성분명을 검색하세요.'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  <Search sx={{ color: colors.white }} />
                </InputAdornment>
              ),
            }}
            sx={{
              width: '550px',
              backgroundColor: colors.vividViolet,
              color: colors.white,
              borderRadius: '50px',
              '& input': {
                ...typography.heading5R,
                color: colors.white,
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'transparent !important',
              },
            }}
          />
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              '&:hover': {
                cursor: 'pointer',
                opacity: 0.8,
              },
            }}
          >
            <img src='/assets/icons/icon-search-detail.svg' />
          </Box>
        </Stack>

        <Stack direction='row' sx={{ alignItems: 'center', width: '100%', marginTop: '40px' }}>
          <Typography sx={{ ...typography.mediumTextR, color: colors.gray500 }}>전체 : 10,248건</Typography>
          <Stack direction='row' alignItems='center' gap='10px' sx={{ marginLeft: 'auto' }}>
            <Typography sx={{ ...typography.mediumTextR, color: colors.navy }}>정렬기준 : </Typography>
            <FormControl
              sx={{
                width: '350px',
              }}
            >
              <Select
                value={sortOrder}
                onChange={e => setSortOrder(e.target.value)}
                size='small'
                sx={{
                  ...typography.mediumTextR,
                  color: colors.vividViolet,
                }}
              >
                <MenuItem
                  value='기본수수료율 높은순'
                  sx={{
                    '&.Mui-selected': { color: colors.vividViolet },
                  }}
                >
                  기본수수료율 높은순
                </MenuItem>
                <MenuItem
                  value='기본수수료율 낮은순'
                  sx={{
                    '&.Mui-selected': { color: colors.vividViolet },
                  }}
                >
                  기본수수료율 낮은순
                </MenuItem>
                <MenuItem
                  value='약가 높은순'
                  sx={{
                    '&.Mui-selected': { color: colors.vividViolet },
                  }}
                >
                  약가 높은순
                </MenuItem>
                <MenuItem
                  value='약가 낮은순'
                  sx={{
                    '&.Mui-selected': { color: colors.vividViolet },
                  }}
                >
                  약가 낮은순
                </MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Stack>

        <Table
          sx={{
            marginTop: '10px',
          }}
        >
          <TableHead>
            <MedipandaTableRow>
              <MedipandaTableCell sx={{ width: '120px' }}>제약사명</MedipandaTableCell>
              <MedipandaTableCell sx={{ width: '450px' }}>제품정보</MedipandaTableCell>
              <MedipandaTableCell sx={{ width: '80px' }}>약가</MedipandaTableCell>
              <MedipandaTableCell sx={{ width: '65px' }}>급여정보</MedipandaTableCell>
              <MedipandaTableCell sx={{ width: '90px' }}>기본 수수료율</MedipandaTableCell>
              <MedipandaTableCell sx={{ width: '80px' }}>상태</MedipandaTableCell>
              <MedipandaTableCell sx={{ width: '60px' }}>변경</MedipandaTableCell>
            </MedipandaTableRow>
          </TableHead>
          <TableBody>
            {mockProducts.map(product => (
              <Fragment key={product.id}>
                <MedipandaTableRow sx={{ borderBottom: 'none' }}>
                  <MedipandaTableCell rowSpan={2}>
                    <Typography
                      sx={{
                        ...typography.smallTextR,
                        whiteSpace: 'pre-line',
                      }}
                    >
                      {product.manufacturer}
                    </Typography>
                  </MedipandaTableCell>
                  <MedipandaTableCell sx={{ textAlign: 'left' }}>
                    <Stack gap='5px' sx={{ width: '450px' }}>
                      <Typography
                        sx={{
                          ...typography.largeTextB,
                          color: colors.gray70,
                        }}
                      >
                        {product.productName}
                      </Typography>
                      <Typography
                        sx={{
                          ...typography.mediumTextR,
                          color: colors.gray50,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {product.composition}
                      </Typography>
                    </Stack>
                  </MedipandaTableCell>
                  <MedipandaTableCell align='center'>{product.price.toLocaleString()}</MedipandaTableCell>
                  <MedipandaTableCell align='center'>{product.insuranceStatus}</MedipandaTableCell>
                  <MedipandaTableCell align='center'>
                    <Typography sx={{ fontWeight: 500 }}>{product.baseFeeRate}</Typography>
                  </MedipandaTableCell>
                  <MedipandaTableCell align='center'>{product.status}</MedipandaTableCell>
                  <MedipandaTableCell align='center'>{product.feeChange}</MedipandaTableCell>
                </MedipandaTableRow>
                <MedipandaTableRow>
                  <MedipandaTableCell colSpan={6} sx={{ textAlign: 'left' }}>
                    <Typography
                      sx={{
                        ...typography.mediumTextR,
                        color: colors.vividViolet,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {product.note}
                    </Typography>
                  </MedipandaTableCell>
                </MedipandaTableRow>
              </Fragment>
            ))}
          </TableBody>
        </Table>

        <MedipandaPagination sx={{ marginTop: '40px' }} count={10} page={1} showFirstButton showLastButton />
      </Stack>
      <Dialog
        sx={{
          '& .MuiDialog-paper': {
            width: '1000px',
            borderRadius: '20px',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            height: '80px',
            padding: '22px 30px',
            boxSizing: 'border-box',
            backgroundColor: colors.gray10,
          }}
        >
          <Typography sx={{ ...typography.heading2B, color: colors.gray80 }}>대체가능 의약품 보기</Typography>
          <IconButton sx={{ marginLeft: 'auto' }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ padding: '40px 0px 60px 0px' }}>
          <Table>
            <TableBody>
              <TableCell></TableCell>
            </TableBody>
          </Table>
          <Stack></Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}

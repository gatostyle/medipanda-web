import { Close, Search } from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
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
import { useFormik } from 'formik';
import { ArrowDown2, ArrowUp2 } from 'iconsax-reactjs';
import { Fragment, useEffect, useState } from 'react';
import { getProductDetails, getProductSummaries, type ProductDetailsResponse, type ProductSummaryResponse } from '../backend';
import { FixedLoader } from '../components/FixedLoader.tsx';
import { MedipandaPagination } from '../custom/components/MedipandaPagination.tsx';
import { colors, typography } from '../custom/globalStyles.ts';
import { MedipandaTableCell, MedipandaTableRow } from 'custom/components/MedipandaTable.tsx';

const searchTypeLabel = {
  composition: '성분명',
  productName: '제품명',
  manufacturerName: '제약사명',
};

const sortTypeLabel = {
  PRICE_ASC: '약가 낮은순',
  PRICE_DESC: '약가 높은순',
  FEE_RATE_ASC: '기본수수료율 낮은순',
  FEE_RATE_DESC: '기본수수료율 높은순',
};

const statusLabel = {
  isAcquisition: '취급품목',
  isPromotion: '프로모션',
  isOutOfStock: '품절',
  isStopSelling: '판매중단',
};

export default function ProductList() {
  const [searchTypeDropdownOpen, setSearchTypeDropdownOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [page, setPage] = useState<ProductSummaryResponse[]>([]);
  const [totalPages, setTotalPages] = useState(0);

  const pageFormik = useFormik({
    initialValues: {
      searchType: 'composition' as 'composition' | 'productName' | 'manufacturerName',
      searchKeyword: '',
      sortType: 'FEE_RATE_DESC' as 'PRICE_ASC' | 'PRICE_DESC' | 'FEE_RATE_ASC' | 'FEE_RATE_DESC',
      pageIndex: 0,
      pageSize: 10,
      totalPages: 1,
    },
    onSubmit: async () => {
      if (pageFormik.values.pageIndex !== 0) {
        await pageFormik.setFieldValue('pageIndex', 0);
      } else {
        await fetchPage();
      }
    },
  });

  const fetchPage = async () => {
    const response = await getProductSummaries({
      composition: pageFormik.values.searchType === 'composition' ? pageFormik.values.searchKeyword : undefined,
      productName: pageFormik.values.searchType === 'productName' ? pageFormik.values.searchKeyword : undefined,
      manufacturerName: pageFormik.values.searchType === 'manufacturerName' ? pageFormik.values.searchKeyword : undefined,
      sortType: pageFormik.values.sortType,
      page: pageFormik.values.pageIndex,
      size: pageFormik.values.pageSize,
    });

    setPage(response.content);
    setTotalPages(response.totalPages);
  };

  useEffect(() => {
    pageFormik.submitForm();
  }, [pageFormik.values.pageIndex, pageFormik.values.pageSize]);

  return (
    <>
      <Stack alignItems='center'>
        <Stack direction='row' gap='10px' component='form' onSubmit={pageFormik.handleSubmit}>
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
              <Typography>
                {
                  {
                    composition: '성분명',
                    productName: '제품명',
                    manufacturerName: '제약사명',
                  }[pageFormik.values.searchType]
                }
              </Typography>
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
                {(['composition', 'productName', 'manufacturerName'] as const).map((type, index, arr) => (
                  <Button
                    variant='contained'
                    sx={{
                      ...typography.heading5R,
                      width: '100%',
                      height: '60px',
                      backgroundColor: colors.vividViolet,
                      ...(index === 0
                        ? {
                            borderTopLeftRadius: '30px',
                            borderTopRightRadius: '30px',
                          }
                        : {
                            borderTopLeftRadius: '0px',
                            borderTopRightRadius: '0px',
                          }),
                      ...(index === arr.length - 1
                        ? {
                            borderBottomLeftRadius: '30px',
                            borderBottomRightRadius: '30px',
                          }
                        : {
                            borderBottomLeftRadius: '0px',
                            borderBottomRightRadius: '0px',
                          }),
                    }}
                    onClick={() => {
                      pageFormik.setFieldValue('searchType', type);
                      pageFormik.submitForm();
                      setSearchTypeDropdownOpen(!searchTypeDropdownOpen);
                    }}
                  >
                    <Typography>{searchTypeLabel[type]}</Typography>
                    <ArrowUp2
                      style={{
                        marginLeft: 'auto',
                        ...(index === 0 ? {} : { opacity: 0 }),
                      }}
                    />
                  </Button>
                ))}
              </Stack>
            )}
          </Box>
          <TextField
            name='searchKeyword'
            value={pageFormik.values.searchKeyword}
            onChange={pageFormik.handleChange}
            placeholder={`${searchTypeLabel[pageFormik.values.searchType]}을 검색하세요.`}
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
          <Typography variant='mediumTextR' sx={{ color: colors.gray500 }}>
            전체 : {totalPages}건
          </Typography>
          <Stack direction='row' alignItems='center' gap='10px' sx={{ marginLeft: 'auto' }}>
            <Typography variant='mediumTextR' sx={{ color: colors.navy }}>
              정렬기준 :{' '}
            </Typography>
            <FormControl
              sx={{
                width: '350px',
              }}
            >
              <Select
                name='sortType'
                value={pageFormik.values.sortType}
                onChange={async e => {
                  await pageFormik.setFieldValue('sortType', e.target.value);
                  await pageFormik.submitForm();
                }}
                size='small'
                sx={{
                  ...typography.mediumTextR,
                  color: colors.vividViolet,
                }}
              >
                {Object.keys(sortTypeLabel).map((key, index) => {
                  return (
                    <MenuItem
                      key={index}
                      value={key}
                      sx={{
                        '&.Mui-selected': { color: colors.vividViolet },
                      }}
                    >
                      {sortTypeLabel[key]}
                    </MenuItem>
                  );
                })}
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
            {page.map(product => (
              <Fragment key={product.id}>
                <MedipandaTableRow
                  onClick={() => setSelectedId(product.id)}
                  sx={{
                    cursor: 'pointer',
                    borderBottomWidth: '0 !important',
                  }}
                >
                  <MedipandaTableCell rowSpan={2}>
                    <Typography variant='smallTextR' sx={{ whiteSpace: 'pre-line' }}>
                      {product.manufacturerName}
                    </Typography>
                  </MedipandaTableCell>
                  <MedipandaTableCell sx={{ textAlign: 'left' }}>
                    <Stack gap='5px' sx={{ width: '450px' }}>
                      <Typography variant='largeTextB' sx={{ color: colors.gray70 }}>
                        {product.productName}
                      </Typography>
                      <Typography
                        variant='mediumTextR'
                        sx={{ color: colors.gray50, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      >
                        {product.composition}
                      </Typography>
                    </Stack>
                  </MedipandaTableCell>
                  <MedipandaTableCell align='center'>{product.price?.toLocaleString() ?? '-'}</MedipandaTableCell>
                  <MedipandaTableCell align='center'>{product.note ?? '-'}</MedipandaTableCell>
                  <MedipandaTableCell align='center'>
                    <Typography sx={{ fontWeight: 500 }}>{product.feeRate ?? '-'}</Typography>
                  </MedipandaTableCell>
                  <MedipandaTableCell align='center'>
                    {Object.keys(statusLabel)
                      .map(key => (product[key] ? statusLabel[key] : ''))
                      .filter(Boolean)
                      .join(', ') || '-'}
                  </MedipandaTableCell>
                  <MedipandaTableCell align='center'>{product.changedFeeRate ?? '-'}</MedipandaTableCell>
                </MedipandaTableRow>
                <MedipandaTableRow>
                  <MedipandaTableCell colSpan={6} sx={{ textAlign: 'left' }}>
                    <Typography
                      variant='mediumTextR'
                      sx={{ color: colors.vividViolet, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >
                      {product.note}
                    </Typography>
                  </MedipandaTableCell>
                </MedipandaTableRow>
              </Fragment>
            ))}
          </TableBody>
        </Table>

        <MedipandaPagination
          count={totalPages}
          page={pageFormik.values.pageIndex + 1}
          showFirstButton
          showLastButton
          onChange={(_, page) => {
            pageFormik.setFieldValue('pageIndex', page - 1);
          }}
          sx={{ marginTop: '40px' }}
        />
      </Stack>

      <ReplaceableProductDialog open={selectedId !== null} id={selectedId} onClose={() => setSelectedId(null)} />
    </>
  );
}

function ReplaceableProductDialog({ open, onClose, id }: { open?: boolean; onClose?: () => void; id: number | null }) {
  const [detail, setDetail] = useState<ProductDetailsResponse | null>(null);

  const fetchDetail = async (id: number) => {
    const response = await getProductDetails(id);

    setDetail(response);
  };

  useEffect(() => {
    if (id === null) {
      return;
    }

    fetchDetail(id);
  }, [id]);

  const [page, setPage] = useState<ProductSummaryResponse[]>([]);

  if (!open) {
    return null;
  }

  if (!detail) {
    return <FixedLoader />;
  }

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth={false}
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
        <Typography variant='heading2B' sx={{ color: colors.gray80 }}>
          대체가능 의약품 보기
        </Typography>
        <IconButton sx={{ marginLeft: 'auto' }}>
          <Close />
        </IconButton>
      </DialogTitle>
      <Table>
        <TableBody>
          <TableCell></TableCell>
        </TableBody>
      </Table>
      <Stack>
        <table style={{ margin: '40px 30px' }}>
          <tr style={{ height: '39px' }}>
            <td style={{ width: '100px' }}>제약사명:</td>
            <td style={{ width: '320px' }}>{detail.manufacturer}</td>
            <td style={{ width: '100px' }}>약가:</td>
            <td style={{ width: '320px' }}>{detail.price}</td>
          </tr>
          <tr style={{ height: '39px' }}>
            <td>제품명:</td>
            <td>{detail.productName}</td>
            <td>기본: 수수료율</td>
            <td>{detail.feeRate}</td>
          </tr>
          <tr style={{ height: '39px' }}>
            <td>성분명:</td>
            <td>{detail.composition}</td>
            <td>상태:</td>
            <td>
              {Object.keys(statusLabel)
                .map(key => (detail[key] ? statusLabel[key] : ''))
                .filter(Boolean)
                .join(', ') || '-'}
            </td>
          </tr>
          <tr style={{ height: '39px' }}>
            <td>제품코드:</td>
            <td>{detail.productCode}</td>
            <td>비고:</td>
            <td>{detail.note}</td>
          </tr>
        </table>
        <Table
          sx={{
            marginTop: '10px',
            marginBottom: '40px',
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
            {page.map(product => (
              <Fragment key={product.id}>
                <MedipandaTableRow sx={{ borderBottomWidth: '0 !important' }}>
                  <MedipandaTableCell rowSpan={2}>
                    <Typography variant='smallTextR' sx={{ whiteSpace: 'pre-line' }}>
                      {product.manufacturerName}
                    </Typography>
                  </MedipandaTableCell>
                  <MedipandaTableCell sx={{ textAlign: 'left' }}>
                    <Stack gap='5px' sx={{ width: '450px' }}>
                      <Typography variant='largeTextB' sx={{ color: colors.gray70 }}>
                        {product.productName}
                      </Typography>
                      <Typography
                        variant='mediumTextR'
                        sx={{ color: colors.gray50, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      >
                        {product.composition}
                      </Typography>
                    </Stack>
                  </MedipandaTableCell>
                  <MedipandaTableCell align='center'>{product.price?.toLocaleString() ?? '-'}</MedipandaTableCell>
                  <MedipandaTableCell align='center'>{product.note ?? '-'}</MedipandaTableCell>
                  <MedipandaTableCell align='center'>
                    <Typography sx={{ fontWeight: 500 }}>{product.feeRate ?? '-'}</Typography>
                  </MedipandaTableCell>
                  <MedipandaTableCell align='center'>
                    {Object.keys(statusLabel)
                      .map(key => (product[key] ? statusLabel[key] : ''))
                      .filter(Boolean)
                      .join(', ') || '-'}
                  </MedipandaTableCell>
                  <MedipandaTableCell align='center'>{product.changedFeeRate ?? '-'}</MedipandaTableCell>
                </MedipandaTableRow>
                <MedipandaTableRow>
                  <MedipandaTableCell colSpan={6} sx={{ textAlign: 'left' }}>
                    <Typography
                      variant='mediumTextR'
                      sx={{ color: colors.vividViolet, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >
                      {product.note}
                    </Typography>
                  </MedipandaTableCell>
                </MedipandaTableRow>
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </Stack>
    </Dialog>
  );
}

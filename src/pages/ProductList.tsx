import { getProductDetails, getProductSummaries, type ProductDetailsResponse } from '@/backend';
import type { ProductSortType } from '@/backend-types';
import { MedipandaButton } from '@/custom/components/MedipandaButton';
import { MedipandaDialog, MedipandaDialogTitle } from '@/custom/components/MedipandaDialog';
import { MedipandaOutlinedInput } from '@/custom/components/MedipandaOutlinedInput';
import { MedipandaPagination } from '@/custom/components/MedipandaPagination';
import { MedipandaTableCell, MedipandaTableRow } from '@/custom/components/MedipandaTable';
import { FixedLinearLoader } from '@/lib/react/FixedLinearLoader';
import { usePageFetchFormik } from '@/lib/react/usePageFetchFormik';
import { colors, typography } from '@/themes';
import { Search } from '@mui/icons-material';
import {
  Box,
  Button,
  FormControl,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableHead,
  TextField,
  Typography,
} from '@mui/material';
import { ArrowDown2, ArrowUp2 } from 'iconsax-reactjs';
import { Fragment, useEffect, useState } from 'react';

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

  const {
    content: page,
    pageCount: totalPages,
    formik: pageFormik,
  } = usePageFetchFormik({
    initialFormValues: {
      searchType: 'composition' as 'composition' | 'productName' | 'manufacturerName',
      searchKeyword: '',
      sortType: 'FEE_RATE_DESC' as ProductSortType,
      advancedSearchOpen: false,
      composition: '',
      manufacturerName: '',
      productName: '',
      isAcquisition: false,
      isPromotion: false,
      isOutOfStock: false,
    },
    fetcher: values => {
      return getProductSummaries({
        composition: values.advancedSearchOpen
          ? values.composition !== ''
            ? values.composition
            : undefined
          : values.searchType === 'composition'
            ? values.searchKeyword
            : undefined,
        productName: values.advancedSearchOpen
          ? values.productName !== ''
            ? values.productName
            : undefined
          : values.searchType === 'productName'
            ? values.searchKeyword
            : undefined,
        manufacturerName: values.advancedSearchOpen
          ? values.manufacturerName !== ''
            ? values.manufacturerName
            : undefined
          : values.searchType === 'manufacturerName'
            ? values.searchKeyword
            : undefined,
        isAcquisition: values.advancedSearchOpen && values.isAcquisition ? values.isAcquisition : undefined,
        isPromotion: values.advancedSearchOpen && values.isPromotion ? values.isPromotion : undefined,
        isOutOfStock: values.advancedSearchOpen && values.isOutOfStock ? values.isOutOfStock : undefined,
        sortType: values.sortType,
        page: values.pageIndex,
        size: values.pageSize,
      });
    },
    contentSelector: response => response.content,
    pageCountSelector: response => response.totalPages,
    initialContent: [],
  });

  useEffect(() => {
    pageFormik.submitForm();
  }, [pageFormik.values.sortType]);

  return (
    <>
      <Stack
        direction='row'
        gap='10px'
        component='form'
        onSubmit={pageFormik.handleSubmit}
        sx={{
          alignSelf: 'center',
        }}
      >
        <Stack
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
                zIndex: 1,
                position: 'absolute',
                top: 0,
                right: 0,
                left: 0,
                color: colors.white,
              }}
            >
              {(['composition', 'productName', 'manufacturerName'] as const).map((type, index, arr) => (
                <Button
                  key={type}
                  variant='contained'
                  sx={{
                    ...typography.heading5R,
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
        </Stack>
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
          onClick={() => pageFormik.setFieldValue('advancedSearchOpen', !pageFormik.values.advancedSearchOpen)}
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
      {pageFormik.values.advancedSearchOpen && (
        <Stack
          component='form'
          onSubmit={pageFormik.handleSubmit}
          sx={{
            padding: '30px',
            backgroundColor: colors.gray10,
          }}
        >
          <Stack direction='row' justifyContent='center' alignItems='center' gap='100px'>
            <Stack direction='row' alignItems='center' gap='16px'>
              <Typography
                variant='largeTextM'
                sx={{
                  width: '42px',
                  color: colors.gray70,
                }}
              >
                성분명
              </Typography>
              <MedipandaOutlinedInput
                name='composition'
                value={pageFormik.values.composition}
                onChange={pageFormik.handleChange}
                placeholder='성분명을 입력하세요.'
                sx={{
                  width: '400px',
                  height: '50px',
                  border: `1px solid ${colors.vividViolet}`,
                  borderRadius: '50px',
                  backgroundColor: colors.white,
                }}
              />
            </Stack>
            <Stack direction='row' alignItems='center' gap='16px'>
              <Typography
                variant='largeTextM'
                sx={{
                  width: '42px',
                  color: colors.gray70,
                }}
              >
                제약사
              </Typography>
              <MedipandaOutlinedInput
                name='manufacturerName'
                value={pageFormik.values.manufacturerName}
                onChange={pageFormik.handleChange}
                placeholder='제약사를 입력하세요.'
                sx={{
                  width: '400px',
                  height: '50px',
                  border: `1px solid ${colors.vividViolet}`,
                  borderRadius: '50px',
                  backgroundColor: colors.white,
                }}
              />
            </Stack>
          </Stack>
          <Stack
            direction='row'
            justifyContent='center'
            alignItems='center'
            gap='100px'
            sx={{
              marginTop: '15px',
            }}
          >
            <Stack direction='row' alignItems='center' gap='16px'>
              <Typography
                variant='largeTextM'
                sx={{
                  width: '42px',
                  color: colors.gray70,
                }}
              >
                제품명
              </Typography>
              <MedipandaOutlinedInput
                name='productName'
                value={pageFormik.values.productName}
                onChange={pageFormik.handleChange}
                placeholder='제품명을 입력하세요.'
                sx={{
                  width: '400px',
                  height: '50px',
                  border: `1px solid ${colors.vividViolet}`,
                  borderRadius: '50px',
                  backgroundColor: colors.white,
                }}
              />
            </Stack>
            <Stack direction='row' alignItems='center' gap='16px'>
              <Typography
                variant='largeTextM'
                sx={{
                  width: '42px',
                  color: colors.gray70,
                }}
              >
                상태
              </Typography>
              <Stack direction='row' alignItems='center' gap='8px'>
                <MedipandaButton
                  onClick={() => {
                    pageFormik.setValues({
                      ...pageFormik.values,
                      isAcquisition: false,
                      isPromotion: false,
                      isOutOfStock: false,
                    });
                  }}
                  variant={
                    !pageFormik.values.isAcquisition && !pageFormik.values.isPromotion && !pageFormik.values.isOutOfStock
                      ? 'contained'
                      : 'outlined'
                  }
                  color='secondary'
                  sx={{
                    width: '94px',
                    borderRadius: '50px',
                    backgroundColor:
                      !pageFormik.values.isAcquisition && !pageFormik.values.isPromotion && !pageFormik.values.isOutOfStock
                        ? undefined
                        : colors.white,
                  }}
                >
                  전체
                </MedipandaButton>
                <MedipandaButton
                  onClick={() => {
                    pageFormik.setFieldValue('isAcquisition', !pageFormik.values.isAcquisition);
                  }}
                  variant={pageFormik.values.isAcquisition ? 'contained' : 'outlined'}
                  color='secondary'
                  sx={{
                    width: '94px',
                    borderRadius: '50px',
                    backgroundColor: pageFormik.values.isAcquisition ? undefined : colors.white,
                  }}
                >
                  취급품목
                </MedipandaButton>
                <MedipandaButton
                  onClick={() => {
                    pageFormik.setFieldValue('isPromotion', !pageFormik.values.isPromotion);
                  }}
                  variant={pageFormik.values.isPromotion ? 'contained' : 'outlined'}
                  color='secondary'
                  sx={{
                    width: '94px',
                    borderRadius: '50px',
                    backgroundColor: pageFormik.values.isPromotion ? undefined : colors.white,
                  }}
                >
                  프로모션
                </MedipandaButton>
                <MedipandaButton
                  onClick={() => {
                    pageFormik.setFieldValue('isOutOfStock', !pageFormik.values.isOutOfStock);
                  }}
                  variant={pageFormik.values.isOutOfStock ? 'contained' : 'outlined'}
                  color='secondary'
                  sx={{
                    width: '94px',
                    borderRadius: '50px',
                    backgroundColor: pageFormik.values.isOutOfStock ? undefined : colors.white,
                  }}
                >
                  품절
                </MedipandaButton>
              </Stack>
            </Stack>
          </Stack>
          <Stack
            direction='row'
            justifyContent='center'
            alignItems='center'
            gap='10px'
            sx={{
              marginTop: '30px',
            }}
          >
            <MedipandaButton
              onClick={() => {
                pageFormik.setValues({
                  ...pageFormik.values,
                  composition: '',
                  manufacturerName: '',
                  productName: '',
                  isAcquisition: false,
                  isPromotion: false,
                  isOutOfStock: false,
                });
              }}
              variant='contained'
              size='large'
              sx={{
                width: '160px',
                backgroundColor: colors.gray50,
              }}
            >
              초기화
            </MedipandaButton>
            <MedipandaButton
              type='submit'
              variant='contained'
              size='large'
              sx={{
                width: '160px',
              }}
            >
              상세검색
            </MedipandaButton>
          </Stack>
        </Stack>
      )}

      <Stack direction='row' sx={{ alignItems: 'center', marginTop: '40px' }}>
        <Typography variant='mediumTextR' sx={{ color: colors.navy }}>
          전체 : {totalPages}건
        </Typography>
        <Stack direction='row' alignItems='center' gap='10px' sx={{ marginLeft: 'auto' }}>
          <Typography variant='mediumTextR' sx={{ color: colors.navy }}>
            정렬기준 :
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
              {Object.keys(sortTypeLabel).map(key => {
                return (
                  <MenuItem
                    key={key}
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
        sx={{
          alignSelf: 'center',
          marginTop: '40px',
        }}
      />

      <ReplaceableProductDialog open={selectedId !== null} productId={selectedId} onClose={() => setSelectedId(null)} />
    </>
  );
}

function ReplaceableProductDialog({ open, onClose, productId }: { open?: boolean; onClose?: () => void; productId: number | null }) {
  const [detail, setDetail] = useState<ProductDetailsResponse | null>(null);

  useEffect(() => {
    if (productId === null) {
      return;
    }

    fetchDetail(productId);
  }, [productId]);

  const fetchDetail = async (id: number) => {
    const response = await getProductDetails(id);

    setDetail(response);
  };

  if (!open) {
    return null;
  }

  if (!detail) {
    return <FixedLinearLoader />;
  }

  return (
    <MedipandaDialog open onClose={onClose} width='1000px'>
      <MedipandaDialogTitle title='대체가능 의약품 보기' onClose={onClose} />
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
              <MedipandaTableCell sx={{ width: '120px' }}>대체</MedipandaTableCell>
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
            {detail?.alternativeProducts.map(product => (
              <Fragment key={product.kdCode}>
                <MedipandaTableRow sx={{ borderBottomWidth: '0 !important' }}>
                  <MedipandaTableCell rowSpan={2}>
                    <Typography variant='smallTextR' sx={{ whiteSpace: 'pre-line' }}>
                      {product.substituent ?? '-'}
                    </Typography>
                  </MedipandaTableCell>
                  <MedipandaTableCell rowSpan={2}>
                    <Typography variant='smallTextR' sx={{ whiteSpace: 'pre-line' }}>
                      {product.manufacturer ?? '-'}
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
                  <MedipandaTableCell align='center'>{product.note ?? '-'}</MedipandaTableCell>
                  <MedipandaTableCell align='center'>{product.feeRate ?? '-'}</MedipandaTableCell>
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
    </MedipandaDialog>
  );
}

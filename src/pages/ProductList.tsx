import {
  type BoardDetailsResponse,
  getProductDetails,
  getProductSummaries,
  type ProductDetailsResponse,
  ProductSortType,
  ProductSortTypeLabel,
  type ProductSummaryResponse,
} from '@/backend';
import { MedipandaButton } from '@/custom/components/MedipandaButton';
import { MedipandaDialog, MedipandaDialogTitle } from '@/custom/components/MedipandaDialog';
import { MedipandaOutlinedInput } from '@/custom/components/MedipandaOutlinedInput';
import { MedipandaPagination } from '@/custom/components/MedipandaPagination';
import { MedipandaTableCell, MedipandaTableRow } from '@/custom/components/MedipandaTable';
import { useMedipandaEditor } from '@/hooks/useMedipandaEditor';
import { FixedLinearProgress } from '@/lib/components/FixedLinearProgress';
import { useSearchParamsOrDefault } from '@/lib/hooks/useSearchParamsOrDefault';
import { trimTiptapContent } from '@/lib/Tiptap';
import { setUrlParams } from '@/lib/utils/url';
import { withSequence } from '@/lib/utils/withSequence';
import { colors, typography } from '@/themes';
import { PercentUtils } from '@/utils/PercentUtils';
import { Search } from '@mui/icons-material';
import {
  Box,
  Button,
  FormControl,
  InputAdornment,
  MenuItem,
  PaginationItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableHead,
  TextField,
  Typography,
} from '@mui/material';
import { EditorContent } from '@tiptap/react';
import { ArrowDown2, ArrowUp2 } from 'iconsax-reactjs';
import { Fragment, useEffect, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import type { RequiredDeep } from 'type-fest';

const searchTypeLabel = {
  composition: '성분명',
  productName: '제품명',
  manufacturerName: '제약사명',
};

const statusLabel = {
  isAcquisition: '취급품목',
  isPromotion: '프로모션',
  isOutOfStock: '품절',
  isStopSelling: '판매중단',
};

export default function ProductList() {
  const navigate = useNavigate();

  const [contents, setContents] = useState<ProductSummaryResponse[]>([]);
  const [totalPages, setTotalPages] = useState(0);

  const initialSearchParams = {
    searchType: 'composition' as 'productName' | 'composition' | 'manufacturerName',
    searchKeyword: '',
    compositionKeyword: '',
    manufacturerNameKeyword: '',
    productNameKeyword: '',
    isAcquisition: '' as 'true' | 'false' | '',
    isPromotion: '' as 'true' | 'false' | '',
    isOutOfStock: '' as 'true' | 'false' | '',
    sortType: ProductSortType.FEE_RATE_DESC,
    page: '1',
  };

  const {
    searchType,
    searchKeyword,
    compositionKeyword,
    manufacturerNameKeyword,
    productNameKeyword,
    isAcquisition: paramIsAcquisition,
    isPromotion: paramIsPromotion,
    isOutOfStock: paramIsOutOfStock,
    sortType,
    page: paramPage,
  } = useSearchParamsOrDefault(initialSearchParams);
  const isAcquisition = paramIsAcquisition === '' ? null : paramIsAcquisition === 'true';
  const isPromotion = paramIsPromotion === '' ? null : paramIsPromotion === 'true';
  const isOutOfStock = paramIsOutOfStock === '' ? null : paramIsOutOfStock === 'true';
  const page = Number(paramPage);
  const pageSize = 10;
  const advancedSearch =
    compositionKeyword !== '' ||
    manufacturerNameKeyword !== '' ||
    productNameKeyword !== '' ||
    isAcquisition !== null ||
    isPromotion !== null ||
    isOutOfStock !== null;

  const form = useForm({
    defaultValues: {
      ...initialSearchParams,
      advancedSearch,
      isAcquisition: null as boolean | null,
      isPromotion: null as boolean | null,
      isOutOfStock: null as boolean | null,
    },
  });
  const formSearchType = form.watch('searchType');
  const formAdvancedSearch = form.watch('advancedSearch');
  const formIsAcquisition = form.watch('isAcquisition');
  const formIsPromotion = form.watch('isPromotion');
  const formIsOutOfStock = form.watch('isOutOfStock');

  const submitHandler: SubmitHandler<RequiredDeep<(typeof form)['control']['_defaultValues']>> = async values => {
    const url = setUrlParams(
      {
        ...values,
        searchType: values.advancedSearch ? 'composition' : values.searchType,
        searchKeyword: values.advancedSearch ? '' : values.searchKeyword,
        advancedSearch: undefined,
        page: 1,
      },
      initialSearchParams,
    );

    navigate(url);
  };

  const fetchContents = async () => {
    try {
      const response = await getProductSummaries({
        composition: advancedSearch
          ? compositionKeyword !== ''
            ? compositionKeyword
            : undefined
          : searchType === 'composition'
            ? searchKeyword
            : undefined,
        productName: advancedSearch
          ? productNameKeyword !== ''
            ? productNameKeyword
            : undefined
          : searchType === 'productName'
            ? searchKeyword
            : undefined,
        manufacturerName: advancedSearch
          ? manufacturerNameKeyword !== ''
            ? manufacturerNameKeyword
            : undefined
          : searchType === 'manufacturerName'
            ? searchKeyword
            : undefined,
        isAcquisition: isAcquisition !== null ? isAcquisition : undefined,
        isPromotion: isPromotion !== null ? isPromotion : undefined,
        isOutOfStock: isOutOfStock !== null ? isOutOfStock : undefined,
        sortType: sortType,
        page: page - 1,
        size: pageSize,
      });

      setContents(withSequence(response).content);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch product list:', error);
      alert('의약품 목록을 불러오는 중 오류가 발생했습니다.');
      setContents([]);
      setTotalPages(0);
    }
  };

  useEffect(() => {
    form.setValue('searchType', searchType);
    form.setValue('searchKeyword', searchKeyword);
    form.setValue('compositionKeyword', compositionKeyword);
    form.setValue('manufacturerNameKeyword', manufacturerNameKeyword);
    form.setValue('productNameKeyword', productNameKeyword);
    form.setValue('isAcquisition', isAcquisition);
    form.setValue('isPromotion', isPromotion);
    form.setValue('isOutOfStock', isOutOfStock);
    form.setValue('sortType', sortType);
    fetchContents();
  }, [
    searchType,
    searchKeyword,
    compositionKeyword,
    manufacturerNameKeyword,
    productNameKeyword,
    isAcquisition,
    isPromotion,
    isOutOfStock,
    sortType,
    page,
  ]);

  const [searchTypeDropdownOpen, setSearchTypeDropdownOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  return (
    <>
      <Stack
        direction='row'
        gap='10px'
        component='form'
        onSubmit={form.handleSubmit(submitHandler)}
        sx={{
          alignSelf: 'center',
        }}
      >
        <Controller
          control={form.control}
          name={'searchType'}
          render={({ field }) => (
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
                <Typography>{searchTypeLabel[field.value]}</Typography>
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
                        field.onChange(type);
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
          )}
        />
        <Controller
          control={form.control}
          name={'searchKeyword'}
          render={({ field }) => (
            <TextField
              {...field}
              placeholder={`${searchTypeLabel[formSearchType]}을 검색하세요.`}
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
          )}
        />
        <Controller
          control={form.control}
          name={'advancedSearch'}
          render={({ field }) => (
            <Box
              onClick={() => field.onChange(!field.value)}
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
          )}
        />
      </Stack>
      {formAdvancedSearch && (
        <Stack
          component='form'
          onSubmit={form.handleSubmit(submitHandler)}
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
              <Controller
                control={form.control}
                name={'compositionKeyword'}
                render={({ field }) => (
                  <MedipandaOutlinedInput
                    {...field}
                    placeholder='성분명을 입력하세요.'
                    sx={{
                      width: '400px',
                      height: '50px',
                      border: `1px solid ${colors.vividViolet}`,
                      borderRadius: '50px',
                      backgroundColor: colors.white,
                    }}
                  />
                )}
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
              <Controller
                control={form.control}
                name={'manufacturerNameKeyword'}
                render={({ field }) => (
                  <MedipandaOutlinedInput
                    {...field}
                    placeholder='제약사를 입력하세요.'
                    sx={{
                      width: '400px',
                      height: '50px',
                      border: `1px solid ${colors.vividViolet}`,
                      borderRadius: '50px',
                      backgroundColor: colors.white,
                    }}
                  />
                )}
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
              <Controller
                control={form.control}
                name={'productNameKeyword'}
                render={({ field }) => (
                  <MedipandaOutlinedInput
                    {...field}
                    placeholder='제품명을 입력하세요.'
                    sx={{
                      width: '400px',
                      height: '50px',
                      border: `1px solid ${colors.vividViolet}`,
                      borderRadius: '50px',
                      backgroundColor: colors.white,
                    }}
                  />
                )}
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
                    form.setValue('isAcquisition', null);
                    form.setValue('isPromotion', null);
                    form.setValue('isOutOfStock', null);
                  }}
                  variant={!(formIsAcquisition || formIsPromotion || formIsOutOfStock) ? 'contained' : 'outlined'}
                  color='secondary'
                  sx={{
                    width: '94px',
                    borderRadius: '50px',
                    backgroundColor: !(formIsAcquisition || formIsPromotion || formIsOutOfStock) ? undefined : colors.white,
                  }}
                >
                  전체
                </MedipandaButton>
                <Controller
                  control={form.control}
                  name={'isAcquisition'}
                  render={({ field }) => (
                    <MedipandaButton
                      onClick={() => {
                        field.onChange(!field.value);
                      }}
                      variant={field.value ? 'contained' : 'outlined'}
                      color='secondary'
                      sx={{
                        width: '94px',
                        borderRadius: '50px',
                        backgroundColor: field.value ? undefined : colors.white,
                      }}
                    >
                      취급품목
                    </MedipandaButton>
                  )}
                />
                <Controller
                  control={form.control}
                  name={'isPromotion'}
                  render={({ field }) => (
                    <MedipandaButton
                      onClick={() => {
                        field.onChange(!field.value);
                      }}
                      variant={field.value ? 'contained' : 'outlined'}
                      color='secondary'
                      sx={{
                        width: '94px',
                        borderRadius: '50px',
                        backgroundColor: field.value ? undefined : colors.white,
                      }}
                    >
                      프로모션
                    </MedipandaButton>
                  )}
                />
                <Controller
                  control={form.control}
                  name={'isOutOfStock'}
                  render={({ field }) => (
                    <MedipandaButton
                      onClick={() => {
                        field.onChange(!field.value);
                      }}
                      variant={field.value ? 'contained' : 'outlined'}
                      color='secondary'
                      sx={{
                        width: '94px',
                        borderRadius: '50px',
                        backgroundColor: field.value ? undefined : colors.white,
                      }}
                    >
                      품절
                    </MedipandaButton>
                  )}
                />
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
              variant='contained'
              size='large'
              component={RouterLink}
              to={''}
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
          전체 : {totalPages.toLocaleString()}건
        </Typography>
        <Stack direction='row' alignItems='center' gap='10px' sx={{ marginLeft: 'auto' }}>
          <Typography variant='mediumTextR' sx={{ color: colors.navy }}>
            정렬기준 :
          </Typography>
          <FormControl
            sx={{
              width: '200px',
            }}
          >
            <Controller
              control={form.control}
              name={'sortType'}
              render={({ field }) => (
                <Select
                  {...field}
                  size='small'
                  sx={{
                    ...typography.mediumTextR,
                    color: colors.vividViolet,
                  }}
                >
                  {[ProductSortType.FEE_RATE_DESC, ProductSortType.FEE_RATE_ASC, ProductSortType.PRICE_DESC, ProductSortType.PRICE_ASC].map(
                    key => {
                      return (
                        <MenuItem
                          key={key}
                          value={key}
                          sx={{
                            '&.Mui-selected': { color: colors.vividViolet },
                          }}
                        >
                          {ProductSortTypeLabel[key]}
                        </MenuItem>
                      );
                    },
                  )}
                </Select>
              )}
            />
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
          {contents.map(product => (
            <Fragment key={product.id}>
              <MedipandaTableRow
                onClick={() => setSelectedId(product.id)}
                sx={{
                  cursor: 'pointer',
                  borderBottomWidth: '0 !important',
                }}
              >
                <MedipandaTableCell rowSpan={2}>
                  <Typography variant='smallTextR'>{product.manufacturerName}</Typography>
                </MedipandaTableCell>
                <MedipandaTableCell sx={{ textAlign: 'left' }}>
                  <Stack gap='5px' sx={{ width: '450px' }}>
                    <Typography variant='largeTextB' sx={{ color: colors.gray70, whiteSpace: 'pre-line' }}>
                      {product.productName}
                    </Typography>
                    <Typography variant='mediumTextR' sx={{ color: colors.gray50, whiteSpace: 'pre-line' }}>
                      {product.composition}
                    </Typography>
                  </Stack>
                </MedipandaTableCell>
                <MedipandaTableCell align='center'>
                  <Typography sx={{ fontWeight: 500 }}>{product.price?.toLocaleString() ?? '-'}</Typography>
                </MedipandaTableCell>
                <MedipandaTableCell align='center'>
                  <Typography sx={{ fontWeight: 500 }}>{product.note ?? '-'}</Typography>
                </MedipandaTableCell>
                <MedipandaTableCell align='center'>
                  <Typography sx={{ fontWeight: 500 }}>
                    {product.roundedFeeRate !== null ? `${PercentUtils.decimalToPercent(product.roundedFeeRate)}%` : '-'}
                  </Typography>
                </MedipandaTableCell>
                <MedipandaTableCell align='center'>
                  <Typography sx={{ fontWeight: 500 }}>
                    {Object.keys(statusLabel)
                      .map(key => (product[key] ? statusLabel[key] : ''))
                      .filter(Boolean)
                      .join(', ') || '-'}
                  </Typography>
                </MedipandaTableCell>
                <MedipandaTableCell align='center'>
                  <Typography sx={{ fontWeight: 500 }}>
                    {product.changedMonth !== null ? (
                      <>
                        {`${PercentUtils.decimalToPercent(product.roundedChangedFeeRate ?? 0)}%`}
                        <br />
                        {`(${new Date(product.changedMonth).getMonth() + 1}월)`}
                      </>
                    ) : (
                      '-'
                    )}
                  </Typography>
                </MedipandaTableCell>
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
        page={page}
        showFirstButton
        showLastButton
        renderItem={item => <PaginationItem {...item} component={RouterLink} to={setUrlParams({ page: item.page }, initialSearchParams)} />}
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

  const [detailInfoDialogOpen, setDetailInfoDialogOpen] = useState(false);

  if (!open) {
    return null;
  }

  if (!detail) {
    return <FixedLinearProgress />;
  }

  return (
    <>
      <MedipandaDialog
        open
        onClose={() => {
          setDetail(null);
          onClose?.();
        }}
        width='1000px'
      >
        <MedipandaDialogTitle
          title='대체가능 의약품 보기'
          onClose={() => {
            setDetail(null);
            onClose?.();
          }}
        />
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
              <td>
                {detail.productName}
                {trimTiptapContent(detail.boardDetailsResponse.content) !== '' && (
                  <MedipandaButton
                    variant='contained'
                    size='small'
                    onClick={() => setDetailInfoDialogOpen(true)}
                    sx={{
                      marginLeft: '10px',
                      paddingX: '20px',
                      borderRadius: '50px',
                    }}
                  >
                    <Typography variant='smallTextM'>Detail Info</Typography>
                  </MedipandaButton>
                )}
              </td>
              <td>기본:</td>
              <td>{detail.roundedFeeRate !== null ? `${PercentUtils.decimalToPercent(detail.roundedFeeRate)}%` : '-'}</td>
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
                <MedipandaTableCell sx={{ width: '300px' }}>제약사명</MedipandaTableCell>
                <MedipandaTableCell>제품정보</MedipandaTableCell>
                <MedipandaTableCell sx={{ width: '80px' }}>약가</MedipandaTableCell>
                <MedipandaTableCell sx={{ width: '65px' }}>급여정보</MedipandaTableCell>
                <MedipandaTableCell sx={{ width: '90px' }}>기본 수수료율</MedipandaTableCell>
                <MedipandaTableCell sx={{ width: '80px' }}>상태</MedipandaTableCell>
              </MedipandaTableRow>
            </TableHead>
            <TableBody>
              {detail?.alternativeProducts.map(product => (
                <Fragment key={product.kdCode}>
                  <MedipandaTableRow sx={{ borderBottomWidth: '0 !important' }}>
                    <MedipandaTableCell rowSpan={2}>
                      <Typography variant='smallTextR' sx={{ fontSize: '15px' }}>
                        {product.substituent ?? '-'}
                      </Typography>
                    </MedipandaTableCell>
                    <MedipandaTableCell rowSpan={2}>
                      <Typography variant='smallTextR' sx={{ fontSize: '15px' }}>
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
                    <MedipandaTableCell align='center'>
                      <Typography sx={{ fontWeight: 500 }}>{product.price?.toLocaleString() ?? '-'}</Typography>
                    </MedipandaTableCell>
                    <MedipandaTableCell align='center'>
                      <Typography sx={{ fontWeight: 500 }}>{product.note ?? '-'}</Typography>
                    </MedipandaTableCell>
                    <MedipandaTableCell align='center'>
                      <Typography sx={{ fontWeight: 500 }}>{product.feeRate ?? '-'}</Typography>
                    </MedipandaTableCell>
                    <MedipandaTableCell align='center'>
                      <Typography sx={{ fontWeight: 500 }}>{product.note ?? '-'}</Typography>
                    </MedipandaTableCell>
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

      <ProductDetailInfoDialog
        open={detailInfoDialogOpen}
        boardDetailsResponse={detail.boardDetailsResponse}
        onClose={() => setDetailInfoDialogOpen(false)}
      />
    </>
  );
}

function ProductDetailInfoDialog({
  open,
  onClose,
  boardDetailsResponse,
}: {
  open?: boolean;
  onClose?: () => void;
  boardDetailsResponse: BoardDetailsResponse;
}) {
  const { editor } = useMedipandaEditor();

  useEffect(() => {
    editor.setEditable(false);
    editor.commands.setContent(boardDetailsResponse.content);
  }, [boardDetailsResponse, editor]);

  if (!open) {
    return null;
  }

  return (
    <MedipandaDialog fullScreen open onClose={onClose}>
      <MedipandaDialogTitle title='Detail Info' onClose={onClose} />
      <Stack sx={{ margin: '40px 30px', overflow: 'auto' }}>
        <EditorContent editor={editor} />
      </Stack>
    </MedipandaDialog>
  );
}

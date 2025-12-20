import { setUrlParams } from '@/lib/utils/url';
import { useSearchParamsOrDefault } from '@/lib/hooks/useSearchParamsOrDefault';
import { useMpModal } from '@/hooks/useMpModal';
import { PercentUtils } from '@/utils/PercentUtils';
import { DocumentDownload } from 'iconsax-reactjs';
import {
  Button,
  Card,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  InputLabel,
  Link,
  MenuItem,
  Pagination,
  PaginationItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { getDownloadProductSummariesExcel, getProductSummaries, type ProductSummaryResponse } from '@/backend';
import { SearchFilterActions, MpSearchFilterBar, SearchFilterItem } from '@/components/MpSearchFilterBar';
import { type Sequenced, withSequence } from '@/lib/utils/withSequence';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';
import type { RequiredDeep } from 'type-fest';

export default function MpAdminProductList() {
  const navigate = useNavigate();

  const initialSearchParams = {
    searchType: '' as 'productName' | 'productCode' | 'manufacturerName' | 'composition' | 'note' | '',
    searchKeyword: '',
    isAcquisition: 'false',
    isPromotion: 'false',
    isOutOfStock: 'false',
    isStopSelling: 'false',
    page: '1',
  };

  const {
    searchType,
    searchKeyword,
    isAcquisition: paramIsAcquisition,
    isPromotion: paramIsPromotion,
    isOutOfStock: paramIsOutOfStock,
    isStopSelling: paramIsStopSelling,
    page: paramPage,
  } = useSearchParamsOrDefault(initialSearchParams);
  const isAcquisition = paramIsAcquisition === 'true';
  const isPromotion = paramIsPromotion === 'true';
  const isOutOfStock = paramIsOutOfStock === 'true';
  const isStopSelling = paramIsStopSelling === 'true';
  const page = Number(paramPage);
  const pageSize = 20;

  const [loading, setLoading] = useState(false);
  const [contents, setContents] = useState<Sequenced<ProductSummaryResponse>[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const { alert, alertError } = useMpModal();

  const form = useForm({
    defaultValues: {
      ...initialSearchParams,
      isAcquisition: false,
      isPromotion: false,
      isOutOfStock: false,
      isStopSelling: false,
    },
  });

  const submitHandler: SubmitHandler<RequiredDeep<(typeof form)['control']['_defaultValues']>> = async values => {
    if (values.searchType === '' && values.searchKeyword !== '') {
      await alert('검색유형을 선택하세요.');
      return;
    }

    const url = setUrlParams(
      {
        ...values,
        page: 1,
      },
      initialSearchParams,
    );

    navigate(url);
  };

  const handleReset = () => {
    navigate('');
    form.reset();
  };

  const fetchContents = async () => {
    setLoading(true);
    try {
      const response = await getProductSummaries({
        [searchType]: searchKeyword !== '' ? searchKeyword : undefined,
        isAcquisition: isAcquisition || undefined,
        isPromotion: isPromotion || undefined,
        isOutOfStock: isOutOfStock || undefined,
        isStopSelling: isStopSelling || undefined,
        page: page - 1,
        size: pageSize,
      });

      setContents(withSequence(response).content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch product list:', error);
      await alertError('제품 목록을 불러오는 중 오류가 발생했습니다.');
      setContents([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    form.setValue('searchType', searchType);
    form.setValue('searchKeyword', searchKeyword);
    form.setValue('isAcquisition', isAcquisition);
    form.setValue('isPromotion', isPromotion);
    form.setValue('isOutOfStock', isOutOfStock);
    form.setValue('isStopSelling', isStopSelling);
    fetchContents();
  }, [searchType, searchKeyword, isAcquisition, isPromotion, isOutOfStock, isStopSelling, page]);

  const getStatusDisplay = (product: ProductSummaryResponse): string => {
    const statuses: string[] = [];
    if (product.isAcquisition) statuses.push('취급품목');
    if (product.isPromotion) statuses.push('프로모션');
    if (product.isOutOfStock) statuses.push('품절');
    if (product.isStopSelling) statuses.push('판매중단');
    return statuses.join(', ');
  };

  return (
    <Stack sx={{ gap: 3 }}>
      <Typography variant='h4'>제품관리</Typography>

      <Card sx={{ padding: 3 }}>
        <MpSearchFilterBar component='form' onSubmit={form.handleSubmit(submitHandler)}>
          <SearchFilterItem minWidth={140}>
            <FormControl fullWidth size='small'>
              <InputLabel>검색유형</InputLabel>
              <Controller
                control={form.control}
                name='searchType'
                render={({ field }) => (
                  <Select {...field}>
                    <MenuItem value={'productName'}>제품명</MenuItem>
                    <MenuItem value={'productCode'}>제품코드</MenuItem>
                    <MenuItem value={'manufacturerName'}>제약사</MenuItem>
                    <MenuItem value={'composition'}>성분명</MenuItem>
                    <MenuItem value={'note'}>비고</MenuItem>
                  </Select>
                )}
              />
            </FormControl>
          </SearchFilterItem>
          <SearchFilterItem flexGrow={1} minWidth={200}>
            <Controller
              control={form.control}
              name='searchKeyword'
              render={({ field }) => <TextField {...field} size='small' label='검색어' fullWidth />}
            />
          </SearchFilterItem>
          <SearchFilterItem minWidth={300}>
            <FormGroup row>
              <FormControlLabel
                control={
                  <Controller
                    control={form.control}
                    name={'isAcquisition'}
                    render={({ field }) => <Checkbox {...field} checked={field.value} size='small' />}
                  />
                }
                label='취급품목'
              />
              <FormControlLabel
                control={
                  <Controller
                    control={form.control}
                    name={'isPromotion'}
                    render={({ field }) => <Checkbox {...field} checked={field.value} size='small' />}
                  />
                }
                label='프로모션'
              />
              <FormControlLabel
                control={
                  <Controller
                    control={form.control}
                    name={'isOutOfStock'}
                    render={({ field }) => <Checkbox {...field} checked={field.value} size='small' />}
                  />
                }
                label='품절'
              />
              <FormControlLabel
                control={
                  <Controller
                    control={form.control}
                    name={'isStopSelling'}
                    render={({ field }) => <Checkbox {...field} checked={field.value} size='small' />}
                  />
                }
                label='판매중단'
              />
            </FormGroup>
          </SearchFilterItem>
          <SearchFilterActions>
            <Button variant='contained' size='small' type='submit'>
              검색
            </Button>
            <Button variant='outlined' size='small' onClick={handleReset}>
              초기화
            </Button>
          </SearchFilterActions>
        </MpSearchFilterBar>
      </Card>

      <Card sx={{ padding: 3 }}>
        <Stack direction='row' justifyContent='space-between' alignItems='center' mb={2}>
          <Stack direction='row' spacing={2}>
            <Typography variant='subtitle1'>검색결과: {totalElements.toLocaleString()} 건</Typography>
          </Stack>
          <Stack direction='row' spacing={1}>
            <Button
              variant='contained'
              color='success'
              size='small'
              href={getDownloadProductSummariesExcel({
                [searchType]: searchKeyword !== '' ? searchKeyword : undefined,
                isAcquisition: isAcquisition || undefined,
                isPromotion: isPromotion || undefined,
                isOutOfStock: isOutOfStock || undefined,
                isStopSelling: isStopSelling || undefined,
                size: 2 ** 31 - 1,
              })}
              target='_blank'
              startIcon={<DocumentDownload size={16} />}
            >
              Excel
            </Button>
          </Stack>
        </Stack>

        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table size='small'>
            <TableHead>
              <TableRow>
                <TableCell width={60}>No</TableCell>
                <TableCell width={150}>제약사</TableCell>
                <TableCell width={300}>제품명</TableCell>
                <TableCell>성분명</TableCell>
                <TableCell width={120}>제품코드</TableCell>
                <TableCell width={100}>약가</TableCell>
                <TableCell width={120}>기본수수료율</TableCell>
                <TableCell width={120}>변경요율</TableCell>
                <TableCell width={200}>상태</TableCell>
                <TableCell width={200}>비고</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} align='center' sx={{ py: 3 }}>
                    <Typography variant='body2' color='text.secondary'>
                      데이터를 로드하는 중입니다.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : contents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align='center' sx={{ py: 3 }}>
                    <Typography variant='body2' color='text.secondary'>
                      검색 결과가 없습니다.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                contents.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>{item.sequence}</TableCell>
                    <TableCell>{item.manufacturerName ?? '-'}</TableCell>
                    <TableCell>
                      <Link component={RouterLink} to={`/admin/products/${item.id}`}>
                        {item.productName ?? '-'}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <p
                        dangerouslySetInnerHTML={{ __html: item.composition ?? '-' }}
                        style={{
                          margin: 0,
                          width: '250px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      />
                    </TableCell>
                    <TableCell>{item.productCode}</TableCell>
                    <TableCell>{item.price !== null ? `${item.price.toLocaleString()}` : '-'}</TableCell>
                    <TableCell>{item.feeRate !== null ? PercentUtils.formatDecimal(item.feeRate) + '%' : '-'}</TableCell>
                    <TableCell>
                      {item.changedFeeRate !== null
                        ? PercentUtils.formatDecimal(item.changedFeeRate) +
                          '%' +
                          (item.changedMonth !== null ? ` (${item.changedMonth})` : '')
                        : '-'}
                    </TableCell>
                    <TableCell>{getStatusDisplay(item)}</TableCell>
                    <TableCell>{item.note ?? '-'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Stack direction='row' justifyContent='center' sx={{ mt: 2 }}>
          <Pagination
            count={totalPages}
            page={page}
            renderItem={item => (
              <PaginationItem
                {...item}
                color='primary'
                variant='outlined'
                component={RouterLink}
                to={setUrlParams({ page: item.page }, initialSearchParams)}
              />
            )}
            color='primary'
            variant='outlined'
            showFirstButton
            showLastButton
          />
        </Stack>
      </Card>
    </Stack>
  );
}

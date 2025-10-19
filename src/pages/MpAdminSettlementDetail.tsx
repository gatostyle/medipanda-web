// noinspection ES6UnusedImports

import { normalizeBusinessNumber } from '@/lib/utils/form';
import { useMpModal } from '@/hooks/useMpModal';
import {
  Box,
  Button,
  Card,
  CircularProgress,
  FormControl,
  IconButton,
  Link,
  MenuItem,
  Pagination,
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
import { ArrowLeft, DocumentDownload } from 'iconsax-reactjs';
import { getDownloadSettlementPartnerSummaryExcel, getSettlementPartnerSummary, type SettlementPartnerResponse } from '@/backend';
import { type Sequenced, withSequence } from '@/lib/utils/withSequence';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import type { RequiredDeep } from 'type-fest';

export default function MpAdminSettlementDetail() {
  const navigate = useNavigate();
  const { settlementId: paramSettlementId } = useParams();
  const isNew = paramSettlementId === undefined;
  const settlementId = Number(paramSettlementId);

  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const { alertError } = useMpModal();

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
  });

  const form = useForm({
    defaultValues: {
      searchType: 'institutionName' as 'institutionName' | 'businessNumber' | 'institutionCode',
      searchKeyword: '',
    },
  });
  const formSearchType = form.watch('searchType');
  const formSearchKeyword = form.watch('searchKeyword');

  const submitHandler: SubmitHandler<RequiredDeep<(typeof form)['control']['_defaultValues']>> = async () => {
    if (!isNew) {
      fetchSettlementData(settlementId);
    }
  };

  const [settlementSummaries, setSettlementSummaries] = useState<Sequenced<SettlementPartnerResponse>[]>([]);

  useEffect(() => {
    if (!isNew) {
      fetchSettlementData(settlementId);
    }
  }, [isNew, settlementId, pagination.pageIndex, pagination.pageSize]);

  const fetchSettlementData = async (settlementId: number) => {
    if (Number.isNaN(settlementId)) {
      await alertError('잘못된 접근입니다.');
      return navigate('/admin/settlements');
    }

    setLoading(true);
    try {
      const response = await getSettlementPartnerSummary({
        settlementId: settlementId,
        institutionName: (form.getValues('searchType') === 'institutionName' && form.getValues('searchKeyword')) || undefined,
        businessNumber: (form.getValues('searchType') === 'businessNumber' && form.getValues('searchKeyword')) || undefined,
        institutionCode: (form.getValues('searchType') === 'institutionCode' && form.getValues('searchKeyword')) || undefined,
        page: pagination.pageIndex,
        size: pagination.pageSize,
      });

      setSettlementSummaries(withSequence(response).content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch settlement data:', error);
      enqueueSnackbar('정산 데이터를 불러오는데 실패했습니다.', { variant: 'error' });
      return window.history.back();
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack sx={{ gap: 3 }}>
      <Stack direction='row' alignItems='center' spacing={2}>
        <IconButton component={RouterLink} to='/admin/settlements' sx={{ width: '24px', height: '24px', padding: 0 }}>
          <ArrowLeft size={24} />
        </IconButton>
        <Typography variant='h4'>정산상세내역</Typography>
      </Stack>

      <Card sx={{ padding: 3 }}>
        <Stack direction='row' component='form' onSubmit={form.handleSubmit(submitHandler)} sx={{ alignItems: 'center', gap: 2 }}>
          <FormControl size='small' sx={{ width: '120px' }}>
            <Controller
              control={form.control}
              name='searchType'
              render={({ field }) => (
                <Select {...field}>
                  <MenuItem value='institutionName'>거래처명</MenuItem>
                  <MenuItem value='businessNumber'>사업자등록번호</MenuItem>
                  <MenuItem value='institutionCode'>거래처코드</MenuItem>
                </Select>
              )}
            />
          </FormControl>
          <Controller
            control={form.control}
            name='searchKeyword'
            render={({ field }) => <TextField {...field} size='small' label='검색어' sx={{ width: '300px' }} />}
          />
          <Button variant='contained' size='small' type='submit'>
            검색
          </Button>
        </Stack>

        <Stack direction='row' justifyContent='space-between' alignItems='center' sx={{ marginTop: 4, marginBottom: 2 }}>
          <Typography variant='subtitle1'>검색결과: {totalElements.toLocaleString()} 건</Typography>
          <Button
            variant='contained'
            size='small'
            color='success'
            href={getDownloadSettlementPartnerSummaryExcel({
              settlementId: parseInt(paramSettlementId!),
              institutionName: (formSearchType === 'institutionName' && formSearchKeyword) || undefined,
              businessNumber: (formSearchType === 'businessNumber' && formSearchKeyword) || undefined,
              institutionCode: (formSearchType === 'institutionCode' && formSearchKeyword) || undefined,
              size: 2 ** 31 - 1,
            })}
            target='_blank'
          >
            <DocumentDownload style={{ marginRight: 8 }} />
            Excel
          </Button>
        </Stack>

        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table size='small'>
            <TableHead>
              <TableRow>
                <TableCell width={60}>No</TableCell>
                <TableCell width={120}>회사명</TableCell>
                <TableCell width={100}>딜러명</TableCell>
                <TableCell width={120}>거래처코드</TableCell>
                <TableCell width={120}>거래처명</TableCell>
                <TableCell width={140}>사업자등록번호</TableCell>
                <TableCell width={120}>공급가액</TableCell>
                <TableCell width={100}>세액</TableCell>
                <TableCell width={130}>합계금액(수수료금액)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align='center' sx={{ py: 3 }}>
                    <Typography variant='body2' color='text.secondary'>
                      데이터를 로드하는 중입니다.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : settlementSummaries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align='center' sx={{ py: 3 }}>
                    <Typography variant='body2' color='text.secondary'>
                      검색 결과가 없습니다.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                settlementSummaries.map(item => (
                  <TableRow key={item.settlementPartnerId}>
                    <TableCell>{item.sequence}</TableCell>
                    <TableCell>{item.companyName}</TableCell>
                    <TableCell>{item.dealerName}</TableCell>
                    <TableCell>{item.institutionCode}</TableCell>
                    <TableCell>
                      <Link component={RouterLink} to={`/admin/settlements/${settlementId}/partners/${item.settlementPartnerId}`}>
                        {item.institutionName}
                      </Link>
                    </TableCell>
                    <TableCell>{normalizeBusinessNumber(item.businessNumber)}</TableCell>
                    <TableCell>{item.supplyAmount.toLocaleString()}</TableCell>
                    <TableCell>{item.taxAmount.toLocaleString()}</TableCell>
                    <TableCell>{item.totalAmount.toLocaleString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Stack direction='row' justifyContent='center' sx={{ mt: 2 }}>
          <Pagination
            count={totalPages}
            page={pagination.pageIndex + 1}
            onChange={(_, value) => {
              setPagination({ ...pagination, pageIndex: value - 1 });
            }}
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

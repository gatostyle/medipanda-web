import {
  Box,
  CircularProgress,
  Grid,
  IconButton,
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
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import { ArrowLeft } from 'iconsax-react';
import {
  getSettlementPartnerProducts,
  getSettlementPartnerSummary,
  getSettlements,
  SettlementPartnerProductResponse,
  SettlementPartnerResponse,
  SettlementResponse,
} from 'medipanda/backend';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

interface SettlementResponseWithMockData extends SettlementResponse {
  prescriptionMonth: string;
}

function withMock<T extends SettlementResponse>(data: T): T & SettlementResponseWithMockData {
  return {
    ...data,
    prescriptionMonth: '2025-01',
  };
}

export default function MpAdminSettlementBusinessPartnerDetail() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { settlementId, id } = useParams();
  const [loading, setLoading] = useState(true);
  const [settlementDetail, setSettlementDetail] = useState<SettlementResponseWithMockData | null>(null);
  const [settlementPartnerDetail, setSettlementPartnerDetail] = useState<SettlementPartnerResponse | null>(null);
  const [products, setProducts] = useState<SettlementPartnerProductResponse[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [settlementResponse, partnerResponse, products] = await Promise.all([
        getSettlements(),
        getSettlementPartnerSummary({
          settlementId: parseInt(settlementId!),
          institutionCode: id,
        }),
        getSettlementPartnerProducts(parseInt(id!)),
      ]);

      setSettlementDetail(settlementResponse.content.map(withMock)[0]);
      setSettlementPartnerDetail(partnerResponse.content[0]);
      setProducts(products);
    } catch (error) {
      console.error('Failed to load data:', error);
      enqueueSnackbar('데이터를 불러오는데 실패했습니다.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const table = useReactTable({
    data: products,
    columns: [
      {
        header: 'No',
        accessorFn: (_, index) => index + 1,
        size: 60,
      },
      {
        header: '보험코드',
        cell: ({ row }) => row.original.productCode,
        size: 120,
      },
      {
        header: '제품명',
        cell: ({ row }) => row.original.productName,
        size: 150,
      },
      {
        header: '표준코드',
        cell: ({ row }) => row.original.productCode,
        size: 140,
      },
      {
        header: '수량',
        cell: ({ row }) => row.original.quantity,
        size: 80,
      },
      {
        header: '약가',
        cell: ({ row }) => row.original.unitPrice?.toLocaleString() ?? '-',
        size: 100,
      },
      {
        header: '처방금액',
        cell: ({ row }) => row.original.prescriptionAmount?.toLocaleString() ?? '-',
        size: 120,
      },
      {
        header: '기본수수료율',
        cell: ({ row }) => (row.original.feeRate !== null ? `${row.original.feeRate}%` : '-'),
        size: 120,
      },
      {
        header: '거래수수료율',
        cell: ({ row }) => (row.original.extraFeeRate !== null ? `${row.original.extraFeeRate}%` : '-'),
        size: 120,
      },
      {
        header: '수수료 금액',
        cell: ({ row }) => row.original.feeAmount?.toLocaleString() ?? '-',
        size: 120,
      },
      {
        header: '비고',
        cell: ({ row }) => row.original.note ?? '-',
        size: 200,
      },
    ],
    getCoreRowModel: getCoreRowModel(),
  });

  const handleBack = () => {
    navigate('/admin/settlements');
  };

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
        <CircularProgress />
      </Box>
    );
  }

  if (!settlementDetail) {
    return null;
  }

  if (!settlementPartnerDetail) {
    return null;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction='row' alignItems='center' spacing={2} sx={{ mb: 3 }}>
        <IconButton onClick={handleBack} sx={{ p: 0 }}>
          <ArrowLeft size={24} />
        </IconButton>
        <Typography variant='h4'>거래처별 제품상세</Typography>
      </Stack>

      <MainCard sx={{ mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <TextField label='딜러명' value={settlementPartnerDetail.dealerName} fullWidth size='small' InputProps={{ readOnly: true }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label='거래처코드'
              value={settlementPartnerDetail.institutionCode}
              fullWidth
              size='small'
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label='거래처명'
              value={settlementPartnerDetail.institutionName}
              fullWidth
              size='small'
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label='사업자등록번호'
              value={settlementPartnerDetail.businessNumber}
              fullWidth
              size='small'
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label='처방월' value={settlementDetail.prescriptionMonth} fullWidth size='small' InputProps={{ readOnly: true }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label='정산월' value={settlementDetail.settlementMonth} fullWidth size='small' InputProps={{ readOnly: true }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label='처방금액'
              value={settlementDetail.prescriptionAmount.toLocaleString()}
              fullWidth
              size='small'
              InputProps={{ readOnly: true }}
            />
          </Grid>
        </Grid>
      </MainCard>

      <MainCard content={false}>
        <ScrollX>
          <TableContainer>
            <Table size='small'>
              <TableHead>
                {table.getHeaderGroups().map(headerGroup => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <TableCell key={header.id} style={{ width: header.getSize() }}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableHead>
              <TableBody>
                {table.getRowModel().rows.map(row => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </ScrollX>
      </MainCard>
    </Box>
  );
}

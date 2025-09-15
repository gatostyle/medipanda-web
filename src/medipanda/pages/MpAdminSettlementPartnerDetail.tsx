import { useMpModal } from '@/medipanda/hooks/useMpModal';
import {
  Box,
  Card,
  CircularProgress,
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
import { ArrowLeft } from 'iconsax-react';
import {
  getSettlement,
  getSettlementPartnerProducts,
  getSettlementPartnerSummary,
  SettlementPartnerProductResponse,
  SettlementPartnerResponse,
  SettlementResponse,
} from '@/backend';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';

export default function MpAdminSettlementPartnerDetail() {
  const navigate = useNavigate();
  const { settlementId: paramSettlementId, settlementPartnerId: paramSettlementPartnerId } = useParams();
  const settlementId = Number(paramSettlementId);
  const settlementPartnerId = Number(paramSettlementPartnerId);

  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<SettlementResponse | null>(null);
  const [partnerDetail, setPartnerDetail] = useState<SettlementPartnerResponse | null>(null);
  const [partnerProducts, setPartnerProducts] = useState<SettlementPartnerProductResponse[]>([]);

  const { alertError } = useMpModal();

  const fetchDetail = async (settlementId: number, settlementPartnerId: number) => {
    if (Number.isNaN(settlementId)) {
      await alertError('잘못된 접근입니다.');
      return navigate('/admin/settlements');
    }

    if (Number.isNaN(settlementPartnerId)) {
      await alertError('잘못된 접근입니다.');
      return navigate('/admin/settlements');
    }

    try {
      setLoading(true);
      const [detail, partnerDetail, partnerProducts] = await Promise.all([
        getSettlement(settlementId),
        getSettlementPartnerSummary({
          settlementId: settlementId,
        }),
        getSettlementPartnerProducts(settlementPartnerId),
      ]);

      setDetail(detail);
      setPartnerDetail(partnerDetail.content[0]);
      setPartnerProducts(partnerProducts);
    } catch (error) {
      console.error('Failed to load data:', error);
      enqueueSnackbar('데이터를 불러오는데 실패했습니다.', { variant: 'error' });
      return window.history.back();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail(settlementId, settlementPartnerId);
  }, [settlementId, settlementPartnerId]);

  const table = useReactTable({
    data: partnerProducts,
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

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
        <CircularProgress />
      </Box>
    );
  }

  if (detail === null) {
    return null;
  }

  if (!partnerDetail) {
    return null;
  }

  return (
    <Stack sx={{ gap: 3 }}>
      <Stack direction='row' alignItems='center' spacing={2}>
        <IconButton component={RouterLink} to={`/admin/settlements/${settlementId}`} sx={{ width: '24px', height: '24px', padding: 0 }}>
          <ArrowLeft size={24} />
        </IconButton>
        <Typography variant='h4'>거래처별 제품상세</Typography>
      </Stack>

      <Card sx={{ padding: 3 }}>
        <Stack sx={{ gap: 3 }}>
          <Stack direction='row' sx={{ gap: 3 }}>
            <TextField
              label='딜러명'
              value={partnerDetail.dealerName}
              fullWidth
              size='small'
              InputProps={{
                readOnly: true,
              }}
            />
            <TextField
              label='거래처코드'
              value={partnerDetail.institutionCode}
              fullWidth
              size='small'
              InputProps={{
                readOnly: true,
              }}
            />
            <TextField
              label='거래처명'
              value={partnerDetail.institutionName}
              fullWidth
              size='small'
              InputProps={{
                readOnly: true,
              }}
            />
          </Stack>
          <Stack direction='row' sx={{ gap: 3 }}>
            <TextField
              label='사업자등록번호'
              value={partnerDetail.businessNumber}
              fullWidth
              size='small'
              InputProps={{
                readOnly: true,
              }}
            />
            <TextField
              label='정산월'
              value={detail.settlementMonth}
              fullWidth
              size='small'
              InputProps={{
                readOnly: true,
              }}
            />
            <TextField
              label='처방금액'
              value={detail.prescriptionAmount.toLocaleString()}
              fullWidth
              size='small'
              InputProps={{
                readOnly: true,
              }}
            />
          </Stack>
        </Stack>
      </Card>

      <Card sx={{ padding: 3, marginTop: 3 }}>
        <TableContainer sx={{ overflowX: 'auto' }}>
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
      </Card>
    </Stack>
  );
}

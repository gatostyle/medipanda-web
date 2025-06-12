import { useNavigate, useParams } from 'react-router-dom';
import { useState, useMemo, useEffect } from 'react';
import {
  IconButton,
  Box,
  Typography,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField
} from '@mui/material';
import { ArrowLeft } from 'iconsax-react';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import {
  MpSettlementPartnerDetail,
  MpSettlementProduct,
  mpGetSettlementBusinessPartnerDetail,
  mpGetSettlementBusinessPartnerProducts
} from 'medipanda/api-definitions/MpSettlementDetail';

export default function MpAdminSettlementBusinessPartnerDetail() {
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _id } = useParams<{ id: string }>();
  const [partnerDetail, setPartnerDetail] = useState<MpSettlementPartnerDetail | null>(null);
  const [products, setProducts] = useState<MpSettlementProduct[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const [detailData, productsData] = await Promise.all([
        mpGetSettlementBusinessPartnerDetail(),
        mpGetSettlementBusinessPartnerProducts()
      ]);
      setPartnerDetail(detailData);
      setProducts(productsData);
    };
    loadData();
  }, []);

  const columns = useMemo<ColumnDef<MpSettlementProduct>[]>(
    () => [
      {
        header: 'No',
        accessorFn: (_, index) => index + 1,
        size: 60
      },
      {
        header: '보험코드',
        accessorKey: 'insuranceCode',
        size: 120
      },
      {
        header: '제품명',
        accessorKey: 'productName',
        size: 150
      },
      {
        header: '표준코드',
        accessorKey: 'standardCode',
        size: 140
      },
      {
        header: '수량',
        accessorKey: 'quantity',
        size: 80
      },
      {
        header: '약가',
        accessorKey: 'unitPrice',
        cell: ({ row }) => row.original.unitPrice.toLocaleString(),
        size: 100
      },
      {
        header: '처방금액',
        accessorKey: 'prescriptionAmount',
        cell: ({ getValue }) => (getValue() as number).toLocaleString(),
        size: 120
      },
      {
        header: '기본수수료율',
        accessorKey: 'feeRate',
        cell: ({ getValue }) => `${getValue() as number}%`,
        size: 120
      },
      {
        header: '거래수수료율',
        accessorKey: 'transactionFeeRate',
        cell: ({ getValue }) => `${getValue() as number}%`,
        size: 120
      },
      {
        header: '수수료 금액',
        accessorKey: 'feeAmount',
        cell: ({ getValue }) => (getValue() as number).toLocaleString(),
        size: 120
      },
      {
        header: '비고',
        accessorKey: 'notes',
        size: 200
      }
    ],
    []
  );

  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel()
  });

  const handleBack = () => {
    navigate('/admin/settlements');
  };

  if (!partnerDetail) {
    return <Box>Loading...</Box>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <IconButton onClick={handleBack} sx={{ p: 0 }}>
          <ArrowLeft size={24} />
        </IconButton>
        <Typography variant="h4">거래처별 제품상세</Typography>
      </Stack>

      <MainCard sx={{ mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <TextField label="딜러명" value={partnerDetail.dealerName} fullWidth size="small" InputProps={{ readOnly: true }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="거래처코드" value={partnerDetail.institutionCode} fullWidth size="small" InputProps={{ readOnly: true }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="거래처명" value={partnerDetail.institutionName} fullWidth size="small" InputProps={{ readOnly: true }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="사업자등록번호" value={partnerDetail.businessNumber} fullWidth size="small" InputProps={{ readOnly: true }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="처방월" value={partnerDetail.prescriptionMonth} fullWidth size="small" InputProps={{ readOnly: true }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="정산월" value={partnerDetail.settlementMonth} fullWidth size="small" InputProps={{ readOnly: true }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="처방금액"
              value={partnerDetail.prescriptionAmount.toLocaleString()}
              fullWidth
              size="small"
              InputProps={{ readOnly: true }}
            />
          </Grid>
        </Grid>
      </MainCard>

      <MainCard content={false}>
        <ScrollX>
          <TableContainer>
            <Table size="small">
              <TableHead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableCell key={header.id} style={{ width: header.getSize() }}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableHead>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
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

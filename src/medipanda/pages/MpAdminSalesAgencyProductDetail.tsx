import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  Chip,
  Grid,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography,
  Pagination,
  CircularProgress
} from '@mui/material';
import { ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import ScrollX from 'components/ScrollX';
import {
  SalesAgencyProductApplicantResponse,
  SalesAgencyProductDetailsResponse,
  getSalesAgencyProductDetails,
  getProductApplicants
} from 'medipanda/backend';
import { useSnackbar } from 'notistack';
import { TiptapEditor } from 'medipanda/components/TiptapEditor';
import { Sequenced, withSequence } from 'medipanda/utils/withSequence';

export default function MpAdminSalesAgencyProductDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { enqueueSnackbar } = useSnackbar();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);

  const [productDetail, setProductDetail] = useState<SalesAgencyProductDetailsResponse | null>(null);

  const [applicants, setApplicants] = useState<Sequenced<SalesAgencyProductApplicantResponse>[]>([]);

  const columns = useMemo<ColumnDef<Sequenced<SalesAgencyProductApplicantResponse>>[]>(
    () => [
      {
        header: 'No',
        accessorKey: 'sequence',
        size: 60
      },
      {
        header: '회원번호',
        accessorKey: 'id',
        size: 100
      },
      {
        header: '아이디',
        accessorKey: 'userId',
        size: 120
      },
      {
        header: '회원명',
        accessorKey: 'memberName',
        size: 100
      },
      {
        header: '핸드폰번호',
        accessorKey: 'phoneNumber',
        size: 140
      },
      {
        header: '신청일',
        accessorKey: 'applicationDate',
        size: 120
      },
      {
        header: '파트너사 계약여부',
        accessorKey: 'partnerContract',
        cell: ({ row }) => (
          <Chip
            label={row.original.contractStatus === 'CONTRACT' ? 'Y' : 'N'}
            size="small"
            color={row.original.contractStatus === 'CONTRACT' ? 'success' : 'default'}
          />
        ),
        size: 140
      },
      {
        header: '비고',
        accessorKey: 'note',
        size: 100
      }
    ],
    []
  );

  const table = useReactTable({
    data: applicants,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      pagination: { pageIndex: 0, pageSize: 20 }
    },
    pageCount: 1,
    manualPagination: true
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEdit = () => {
    navigate(`/admin/sales-agency-products/${id}/edit`);
  };

  const handleBackToList = () => {
    navigate('/admin/sales-agency-products');
  };

  useEffect(() => {
    const fetchProductDetail = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [detail, applicantsResponse] = await Promise.all([
          getSalesAgencyProductDetails(parseInt(id)),
          getProductApplicants(parseInt(id))
        ]);

        setProductDetail(detail);
        setApplicants(withSequence(applicantsResponse).content);
      } catch (error) {
        console.error('Failed to fetch product detail:', error);
        enqueueSnackbar('상품 정보를 불러오는데 실패했습니다.', { variant: 'error' });
        navigate('/admin/sales-agency-products');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetail();
  }, [id, navigate, enqueueSnackbar]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        영업대행상품 상세
      </Typography>

      <Card>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="기본정보" />
          <Tab label="신청자" />
        </Tabs>

        {tabValue === 0 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      위탁사명
                    </Typography>
                    <Typography variant="body1">{productDetail?.clientName}</Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      상품명
                    </Typography>
                    <Typography variant="body1">{productDetail?.productName}</Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      노출상태
                    </Typography>
                    <Typography variant="body1">{productDetail?.boardPostDetail?.isExposed ? '노출' : '미노출'}</Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      노출범위
                    </Typography>
                    <Typography variant="body1">{productDetail?.boardPostDetail?.exposureRange}</Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      진행상태
                    </Typography>
                    <Chip label={productDetail?.boardPostDetail?.isExposed ? '진행중' : '미노출'} color="success" size="small" />
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      내용
                    </Typography>
                    <TiptapEditor content={productDetail?.boardPostDetail?.content ?? ''} readOnly />
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      영상url
                    </Typography>
                    <Typography variant="body1">{productDetail?.videoUrl}</Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      계약일
                    </Typography>
                    <Typography variant="body1">{productDetail?.contractDate}</Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      비고
                    </Typography>
                    <Typography variant="body1">{productDetail?.note}</Typography>
                  </Box>

                  <Stack direction="row" spacing={4}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        게시기간
                      </Typography>
                      <Typography variant="body1">{`${productDetail?.startDate} ~ ${productDetail?.endDate}`}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        조회수
                      </Typography>
                      <Typography variant="body1">{productDetail?.boardPostDetail?.viewsCount?.toLocaleString()}</Typography>
                    </Box>
                  </Stack>
                </Stack>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box
                  component="img"
                  src={productDetail?.thumbnailUrl}
                  alt="Product"
                  sx={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: 400,
                    objectFit: 'contain',
                    backgroundColor: 'grey.100',
                    borderRadius: 1
                  }}
                  onError={(e: any) => {
                    e.target.src =
                      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2Y1ZjVmNSIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5OTkiPkltYWdlIE5vdCBBdmFpbGFibGU8L3RleHQ+Cjwvc3ZnPg==';
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Stack direction="row" spacing={2} justifyContent="center">
                  <Button variant="outlined" onClick={handleBackToList} sx={{ minWidth: 120 }}>
                    목록
                  </Button>
                  <Button variant="contained" onClick={handleEdit} sx={{ minWidth: 120 }}>
                    수정
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Box>
        )}

        {tabValue === 1 && (
          <Box sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  위탁사명: {productDetail?.clientName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  상품명: {productDetail?.productName}
                </Typography>
              </Stack>

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

              <Stack direction="row" justifyContent="center" sx={{ mt: 2 }}>
                <Pagination count={1} page={1} color="primary" variant="outlined" showFirstButton showLastButton />
              </Stack>
            </Stack>
          </Box>
        )}
      </Card>
    </Box>
  );
}

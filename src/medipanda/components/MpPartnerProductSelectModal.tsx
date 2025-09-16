import { useMpModal } from '@/medipanda/hooks/useMpModal';
import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
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
import { useFormik } from 'formik';
import { SearchNormal1 } from 'iconsax-react';
import { getProductSummaries, ProductSummaryResponse } from '@/backend';
import { useEffect, useState } from 'react';

export interface MpPartnerProductSelectModalProps {
  open: boolean;
  onClose?: () => void;
  onSelect?: (product: ProductSummaryResponse) => void;
}

function MpPartnerProductSelectModalInternal({ open, onClose, onSelect }: MpPartnerProductSelectModalProps) {
  const [products, setProducts] = useState<ProductSummaryResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const { alertError } = useMpModal();

  const formik = useFormik({
    initialValues: {
      searchKeyword: '',
    },
    onSubmit: async values => {
      try {
        setLoading(true);
        const response = await getProductSummaries({
          productName: values.searchKeyword !== '' ? values.searchKeyword : undefined,
        });

        setProducts(response.content);
      } catch (error) {
        console.error('Failed to search partners:', error);
        await alertError('제품 검색 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    },
  });

  const handleSelectProduct = (product: ProductSummaryResponse) => {
    onSelect?.(product);
    onClose?.();
  };

  useEffect(() => {
    formik.submitForm();
  }, []);

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle>
        <Box display='flex' justifyContent='space-between' alignItems='center'>
          <Typography variant='h6'>제품명 조회</Typography>
          <IconButton onClick={onClose} size='small'>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Stack direction='row' spacing={1} alignItems='center' component='form' onSubmit={formik.handleSubmit}>
            <TextField
              size='small'
              fullWidth
              placeholder='제품명 검색'
              name='searchKeyword'
              onChange={formik.handleChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton edge='end' size='small' onClick={formik.submitForm} disabled={loading}>
                      <SearchNormal1 size={16} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button variant='contained' color='primary' type='submit' disabled={loading} sx={{ minWidth: 80 }}>
              검색
            </Button>
          </Stack>
        </Box>

        <TableContainer sx={{ maxHeight: 400 }}>
          <Table size='small' stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>제약사명</TableCell>
                <TableCell>제품코드</TableCell>
                <TableCell>제품명</TableCell>
                <TableCell align='center' sx={{ width: 100 }}>
                  선택
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align='center' sx={{ py: 3 }}>
                    <Typography variant='body2' color='text.secondary'>
                      데이터를 로드하는 중입니다.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align='center' sx={{ py: 3 }}>
                    <Typography variant='body1' color='text.secondary'>
                      검색 결과가 없습니다.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                products.map(product => (
                  <TableRow key={product.id} hover>
                    <TableCell>{product.manufacturerName}</TableCell>
                    <TableCell>{product.productCode}</TableCell>
                    <TableCell>{product.productName}</TableCell>
                    <TableCell align='center'>
                      <Button variant='contained' color='success' size='small' onClick={() => handleSelectProduct(product)}>
                        선택
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color='inherit'>
          취소
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function MpPartnerProductSelectModal(props: MpPartnerProductSelectModalProps) {
  if (!props.open) {
    return null;
  }

  return <MpPartnerProductSelectModalInternal {...props} />;
}

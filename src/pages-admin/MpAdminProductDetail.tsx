import { useMedipandaEditor } from '@/hooks/useMedipandaEditor';
import { PercentUtils } from '@/utils/PercentUtils';
import {
  TableCell,
  Box,
  Button,
  Card,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Stack,
  Table,
  TableBody,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { getProductDetails, PostAttachmentType, type ProductDetailsResponse } from '@/backend';
import { EditorContent } from '@tiptap/react';
import { useSnackbar } from 'notistack';
import { Fragment, useEffect, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';

export default function MpAdminProductDetail() {
  const { productId: paramProductId } = useParams();
  const productId = Number(paramProductId);

  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<ProductDetailsResponse | null>(null);

  useEffect(() => {
    fetchDetail(productId);
  }, [productId]);

  const { editor, setAttachments: setEditorAttachments } = useMedipandaEditor();

  useEffect(() => {
    if (detail !== null) {
      editor.setEditable(false);
      editor.commands.setContent(detail.boardDetailsResponse.content);
      setEditorAttachments(detail.boardDetailsResponse.attachments.filter(a => a.type === PostAttachmentType.EDITOR));
    }
  }, [detail, editor]);

  const fetchDetail = async (productId: number) => {
    setLoading(true);
    try {
      const detail = await getProductDetails(productId);
      setDetail(detail);
    } catch (error) {
      console.error('Failed to fetch product detail:', error);
      enqueueSnackbar('데이터를 불러오는데 실패했습니다.', { variant: 'error' });
      return window.history.back();
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <Stack sx={{ gap: 3 }}>
      <Typography variant='h4'>제품정보</Typography>

      <Stack sx={{ gap: 3 }}>
        <Card sx={{ p: 3 }}>
          <Stack sx={{ gap: 2 }}>
            <Stack direction='row'>
              <Typography variant='subtitle2' color='text.secondary' sx={{ flex: '0 0 150px' }}>
                제약사
              </Typography>
              <Typography variant='body1'>{detail.manufacturer}</Typography>
            </Stack>
            <Stack direction='row'>
              <Typography variant='subtitle2' color='text.secondary' sx={{ flex: '0 0 150px' }}>
                제품명
              </Typography>
              <Typography variant='body1'>{detail.productName}</Typography>
            </Stack>
            <Stack direction='row'>
              <Typography variant='subtitle2' color='text.secondary' sx={{ flex: '0 0 150px' }}>
                성분명
              </Typography>
              <p dangerouslySetInnerHTML={{ __html: detail.composition ?? '' }} style={{ margin: 0 }} />
            </Stack>
            <Stack direction='row'>
              <Typography variant='subtitle2' color='text.secondary' sx={{ flex: '0 0 150px' }}>
                제품코드
              </Typography>
              <Typography variant='body1'>{detail.productCode}</Typography>
            </Stack>
            <Stack direction='row'>
              <Typography variant='subtitle2' color='text.secondary' sx={{ flex: '0 0 150px' }}>
                약가
              </Typography>
              <Typography variant='body1'>
                {detail.price !== null && detail.price !== undefined ? `${detail.price.toLocaleString()}원 (${detail.insurance})` : '-'}
              </Typography>
            </Stack>
            <Stack direction='row'>
              <Typography variant='subtitle2' color='text.secondary' sx={{ flex: '0 0 150px' }}>
                기본수수료율
              </Typography>
              <Typography variant='body1'>{detail.feeRate !== null ? PercentUtils.formatDecimal(detail.feeRate) + '%' : '-'}</Typography>
            </Stack>
            <Stack direction='row'>
              <Typography variant='subtitle2' color='text.secondary' sx={{ flex: '0 0 150px' }}>
                변경요율/변경월
              </Typography>
              <Typography variant='body1'>
                {detail.changedFeeRate !== null
                  ? PercentUtils.formatDecimal(detail.changedFeeRate) +
                    '%' +
                    (detail.changedMonth !== null ? ` (${detail.changedMonth})` : '')
                  : '-'}
              </Typography>
            </Stack>
            <Stack direction='row'>
              <Typography variant='subtitle2' color='text.secondary' sx={{ flex: '0 0 150px' }}>
                상태
              </Typography>
              <Stack direction='row' sx={{ gap: 2 }}>
                <FormControlLabel control={<Checkbox checked={detail.isAcquisition ?? undefined} disabled />} label='취급품목' />
                <FormControlLabel control={<Checkbox checked={detail.isPromotion ?? undefined} disabled />} label='프로모션' />
                <FormControlLabel control={<Checkbox checked={detail.isOutOfStock ?? undefined} disabled />} label='품절' />
                <FormControlLabel control={<Checkbox checked={detail.isStopSelling ?? undefined} disabled />} label='판매중단' />
              </Stack>
            </Stack>
            <Stack direction='row'>
              <Typography variant='subtitle2' color='text.secondary' sx={{ flex: '0 0 150px' }}>
                비고
              </Typography>
              <Typography variant='body1' style={{ whiteSpace: 'pre-wrap' }}>
                {detail.note}
              </Typography>
            </Stack>
            <Stack direction='row'>
              <Typography variant='subtitle2' color='text.secondary' sx={{ flex: '0 0 150px' }}>
                대체가능의약품
              </Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell width={100} align='center'>
                      대체
                    </TableCell>
                    <TableCell width={200}>제약사명</TableCell>
                    <TableCell>제품정보</TableCell>
                    <TableCell width={80} align='center'>
                      약가
                    </TableCell>
                    <TableCell width={120} align='center'>
                      급여정보
                    </TableCell>
                    <TableCell width={100} align='center'>
                      기본 수수료율
                    </TableCell>
                    <TableCell width={80} align='center'>
                      상태
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {detail?.alternativeProducts.map(product => (
                    <Fragment key={product.kdCode}>
                      <TableRow>
                        <TableCell rowSpan={2} align='center'>
                          {product.substituent ?? '-'}
                        </TableCell>
                        <TableCell rowSpan={2}>{product.manufacturer ?? '-'}</TableCell>
                        <TableCell sx={{ borderBottom: 'none' }}>
                          <Stack gap='5px'>
                            <Typography>{product.productName}</Typography>
                            <p dangerouslySetInnerHTML={{ __html: product.composition ?? '' }} style={{ margin: 0 }} />
                          </Stack>
                        </TableCell>
                        <TableCell align='center' sx={{ borderBottom: 'none' }}>
                          {product.price?.toLocaleString() ?? '-'}
                        </TableCell>
                        <TableCell align='center' sx={{ borderBottom: 'none' }}>
                          {product.note ?? '-'}
                        </TableCell>
                        <TableCell align='center' sx={{ borderBottom: 'none' }}>
                          {product.feeRate !== null ? PercentUtils.formatDecimal(product.feeRate) + '%' : '-'}
                        </TableCell>
                        <TableCell align='center' sx={{ borderBottom: 'none' }}>
                          {product.note ?? '-'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          sx={{
                            borderBottom: '1px solid rgba(219, 224, 229, 0.65) !important',
                            textAlign: 'left',
                          }}
                        >
                          <Typography
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {product.note}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </Fragment>
                  ))}
                </TableBody>
              </Table>
            </Stack>
          </Stack>
        </Card>

        <Card component={Stack} sx={{ p: 3, gap: 3 }}>
          <Typography variant='h6'>Detail Info</Typography>

          <Box sx={{ mt: 1 }}>
            <EditorContent editor={editor} />
          </Box>
        </Card>

        <Stack direction='row' sx={{ justifyContent: 'center', gap: 2 }}>
          <Button variant='outlined' size='large' component={RouterLink} to='/admin/products' sx={{ minWidth: 120 }}>
            취소
          </Button>
          <Button variant='contained' size='large' component={RouterLink} to={`/admin/products/${productId}/edit`} sx={{ minWidth: 120 }}>
            수정
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
}

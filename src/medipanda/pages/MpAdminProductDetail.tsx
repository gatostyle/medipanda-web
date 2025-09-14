import { useMedipandaEditor } from '@/medipanda/components/useMedipandaEditor';
import {
  TableCell,
  Box,
  Button,
  Card,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Grid,
  Stack,
  Table,
  TableBody,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { getProductDetails, PostAttachmentType, ProductDetailsResponse } from '@/backend';
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

  const fetchDetail = async (productId: number) => {
    setLoading(true);
    try {
      const detail = await getProductDetails(productId);
      setDetail(detail);

      editor.setEditable(false);
      editor.commands.setContent(detail.boardDetailsResponse.content);
      setEditorAttachments(detail.boardDetailsResponse.attachments.filter(a => a.type === PostAttachmentType.EDITOR));
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

  const getChangedRateDisplay = () => {
    if (detail.changedFeeRate && detail.changedMonth) {
      return `${detail.changedFeeRate}% / ${detail.changedMonth}`;
    } else if (detail.changedFeeRate) {
      return `${detail.changedFeeRate}%`;
    }
    return '-';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant='h4' gutterBottom sx={{ mb: 3 }}>
        제품정보
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card sx={{ p: 3 }}>
            <Typography variant='h6' gutterBottom sx={{ mb: 3 }}>
              제품정보
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={2}>
                <Typography variant='subtitle2' color='text.secondary'>
                  제약사
                </Typography>
              </Grid>
              <Grid item xs={10}>
                <Typography variant='body1'>{detail.manufacturer}</Typography>
              </Grid>

              <Grid item xs={2}>
                <Typography variant='subtitle2' color='text.secondary'>
                  제품명
                </Typography>
              </Grid>
              <Grid item xs={10}>
                <Typography variant='body1'>{detail.productName}</Typography>
              </Grid>

              <Grid item xs={2}>
                <Typography variant='subtitle2' color='text.secondary'>
                  성분명
                </Typography>
              </Grid>
              <Grid item xs={10}>
                <Typography variant='body1'>{detail.composition}</Typography>
              </Grid>

              <Grid item xs={2}>
                <Typography variant='subtitle2' color='text.secondary'>
                  제품코드
                </Typography>
              </Grid>
              <Grid item xs={10}>
                <Typography variant='body1'>{detail.productCode}</Typography>
              </Grid>

              <Grid item xs={2}>
                <Typography variant='subtitle2' color='text.secondary'>
                  약가
                </Typography>
              </Grid>
              <Grid item xs={10}>
                <Typography variant='body1'>
                  {detail.price !== null && detail.price !== undefined
                    ? `${detail.price.toLocaleString()}원${detail.productCode !== '비급여' ? ' (급여)' : ''}`
                    : '-'}
                </Typography>
              </Grid>

              <Grid item xs={2}>
                <Typography variant='subtitle2' color='text.secondary'>
                  기본수수료율
                </Typography>
              </Grid>
              <Grid item xs={10}>
                <Typography variant='body1'>
                  {detail.feeRate !== null && detail.feeRate !== undefined ? `${detail.feeRate}%` : '-'}
                </Typography>
              </Grid>

              <Grid item xs={2}>
                <Typography variant='subtitle2' color='text.secondary'>
                  변경요율/변경월
                </Typography>
              </Grid>
              <Grid item xs={10}>
                <Typography variant='body1'>{getChangedRateDisplay()}</Typography>
              </Grid>

              <Grid item xs={2}>
                <Typography variant='subtitle2' color='text.secondary'>
                  상태
                </Typography>
              </Grid>
              <Grid item xs={10}>
                <Box>
                  <FormControlLabel control={<Checkbox checked={detail.isAcquisition ?? undefined} disabled />} label='취급품목' />
                  <FormControlLabel control={<Checkbox checked={detail.isPromotion ?? undefined} disabled />} label='프로모션' />
                  <FormControlLabel control={<Checkbox checked={detail.isOutOfStock ?? undefined} disabled />} label='품절' />
                  <FormControlLabel control={<Checkbox checked={detail.isStopSelling ?? undefined} disabled />} label='판매중단' />
                </Box>
              </Grid>

              <Grid item xs={2}>
                <Typography variant='subtitle2' color='text.secondary'>
                  비고
                </Typography>
              </Grid>
              <Grid item xs={10}>
                <Typography variant='body1' style={{ whiteSpace: 'pre-wrap' }}>
                  {detail.note}
                </Typography>
              </Grid>

              <Grid item xs={2}>
                <Typography variant='subtitle2' color='text.secondary'>
                  대체가능의약품
                </Typography>
              </Grid>
              <Grid item xs={10}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>대체</TableCell>
                      <TableCell>제약사명</TableCell>
                      <TableCell>제품정보</TableCell>
                      <TableCell>약가</TableCell>
                      <TableCell>급여정보</TableCell>
                      <TableCell>기본 수수료율</TableCell>
                      <TableCell>상태</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {detail?.alternativeProducts.map(product => (
                      <Fragment key={product.kdCode}>
                        <TableRow>
                          <TableCell rowSpan={2}>
                            <Typography sx={{ whiteSpace: 'pre-line' }}>{product.substituent ?? '-'}</Typography>
                          </TableCell>
                          <TableCell rowSpan={2}>
                            <Typography sx={{ whiteSpace: 'pre-line' }}>{product.manufacturer ?? '-'}</Typography>
                          </TableCell>
                          <TableCell sx={{ borderBottom: 'none', textAlign: 'left' }}>
                            <Stack gap='5px'>
                              <Typography>{product.productName}</Typography>
                              <Typography
                                sx={{
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {product.composition}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell align='center' sx={{ borderBottom: 'none' }}>
                            {product.price?.toLocaleString() ?? '-'}
                          </TableCell>
                          <TableCell align='center' sx={{ borderBottom: 'none' }}>
                            {product.note ?? '-'}
                          </TableCell>
                          <TableCell align='center' sx={{ borderBottom: 'none' }}>
                            <Typography sx={{ fontWeight: 500 }}>{product.feeRate ?? '-'}</Typography>
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
              </Grid>
            </Grid>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card sx={{ p: 3 }}>
            <Typography variant='h6' gutterBottom sx={{ mb: 3 }}>
              상세 정보
            </Typography>

            <Box sx={{ mt: 1 }}>
              <EditorContent editor={editor} />
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Stack direction='row' spacing={2} justifyContent='center'>
            <Button variant='outlined' size='large' component={RouterLink} to='/admin/products' sx={{ minWidth: 120 }}>
              취소
            </Button>
            <Button variant='contained' size='large' component={RouterLink} to={`/admin/products/${productId}/edit`} sx={{ minWidth: 120 }}>
              수정
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

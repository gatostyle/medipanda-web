import { TiptapMenuBar } from '@/medipanda/components/Tiptap';
import { useMedipandaEditor } from '@/medipanda/components/useMedipandaEditor';
import { useMpModal } from '@/medipanda/hooks/useMpModal';
import {
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
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { EditorContent } from '@tiptap/react';
import { isAxiosError } from 'axios';
import { useFormik } from 'formik';
import {
  BoardExposureRange,
  BoardType,
  createProductExtraInfo,
  getProductDetails,
  PostAttachmentType,
  PriceUnit,
  ProductDetailsResponse,
  updateProductExtraInfo,
} from '@/backend';
import { useSession } from '@/medipanda/hooks/useSession';
import { useSnackbar } from 'notistack';
import { Fragment, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function MpAdminProductEdit() {
  const navigate = useNavigate();
  const { productId: paramProductId } = useParams();
  const isNew = paramProductId === undefined;
  const productId = Number(paramProductId);

  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const { session } = useSession();
  const [detail, setDetail] = useState<ProductDetailsResponse | null>(null);

  const { alert, alertError } = useMpModal();

  const formik = useFormik({
    initialValues: {
      manufacturer: '',
      productName: '',
      composition: '',
      productCode: '',
      price: '0',
      feeRate: '0',
      changedFeeRate: undefined as number | undefined,
      changedMonth: '',
      isAcquisition: false,
      isPromotion: false,
      isOutOfStock: false,
      isStopSelling: false,
      note: '',
    },
    onSubmit: async (values, { setSubmitting }) => {
      if (values.manufacturer === '') {
        await alert('제약사를 입력해주세요.');
        return;
      }

      if (values.productName === '') {
        await alert('제품명을 입력해주세요.');
        return;
      }

      if (values.productCode === '') {
        await alert('제품코드를 입력해주세요.');
        return;
      }

      if (values.composition === '') {
        await alert('성분명을 입력해주세요.');
        return;
      }

      if (Number(values.price) <= 0) {
        await alert('약가는 0보다 커야 합니다.');
        return;
      }

      if (Number(values.feeRate) < 0 || Number(values.feeRate) > 100) {
        await alert('기본수수료율은 0 이상 100 이하이어야 합니다.');
        return;
      }

      if (Number(values.changedFeeRate) < 0 || Number(values.changedFeeRate) > 100) {
        await alert('변경요율은 0 이상 100 이하이어야 합니다.');
        return;
      }

      try {
        if (isNew) {
          await createProductExtraInfo({
            boardPostCreateRequest: {
              boardType: BoardType.PRODUCT,
              userId: session!.userId,
              nickname: session!.userId,
              hiddenNickname: false,
              title: values.productName,
              content: editor.getHTML(),
              parentId: null,
              isExposed: true,
              editorFileIds: editorAttachments.map(image => image.s3fileId),
              exposureRange: BoardExposureRange.ALL,
              noticeProperties: null,
            },
            productExtraInfoCreateRequest: {
              manufacturer: values.manufacturer,
              productName: values.productName,
              composition: values.composition,
              productCode: values.productCode,
              changedFeeRate: values.changedFeeRate ?? null,
              changedMonth: Number(values.changedMonth),
              priceUnit: PriceUnit.KRW,
              feeRate: values.feeRate,
              price: Number(values.price),
              note: values.note,
              detailInfo: editor.getHTML(),
              isPromotion: values.isPromotion,
              isOutOfStock: values.isOutOfStock,
              isStopSelling: values.isStopSelling,
              isAcquisition: values.isAcquisition,
            },
            files: undefined,
          });
          enqueueSnackbar('제품이 성공적으로 등록되었습니다.', { variant: 'success' });
        } else {
          await updateProductExtraInfo(productId, {
            boardPostUpdateRequest: {
              title: values.productName,
              content: editor.getHTML(),
              hiddenNickname: null,
              isBlind: null,
              isExposed: null,
              exposureRange: null,
              keepFileIds: [...editorAttachments].map(image => image.s3fileId),
              editorFileIds: editorAttachments.map(image => image.s3fileId),
              noticeProperties: null,
            },
            productExtraInfoCreateRequest: {
              manufacturer: values.manufacturer,
              productName: values.productName,
              composition: values.composition,
              productCode: values.productCode,
              changedFeeRate: values.changedFeeRate ?? null,
              changedMonth: values.changedMonth,
              priceUnit: PriceUnit.KRW,
              feeRate: values.feeRate,
              price: Number(values.price),
              note: values.note,
              detailInfo: editor.getHTML(),
              isPromotion: values.isPromotion,
              isOutOfStock: values.isOutOfStock,
              isStopSelling: values.isStopSelling,
              isAcquisition: values.isAcquisition,
            },
            newFiles: [],
          });
          enqueueSnackbar('제품이 성공적으로 수정되었습니다.', { variant: 'success' });
        }
        navigate('/admin/products');
      } catch (error) {
        if (isAxiosError(error)) {
          if (
            error.response !== undefined &&
            typeof error.response.data === 'string' &&
            error.response.data.startsWith('Bad request: Invalid product code format:')
          ) {
            await alert(`"${values.productCode}"는 잘못된 코드 형식입니다.`);
            return;
          }
        }

        console.error('Failed to submit form:', error);
        await alertError(isNew ? '제품 등록 중 오류가 발생했습니다.' : '제품 수정 중 오류가 발생했습니다.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const { editor, attachments: editorAttachments, setAttachments: setEditorAttachments } = useMedipandaEditor();

  useEffect(() => {
    if (!isNew) {
      fetchDetail(productId);
    }
  }, [isNew, productId]);

  const fetchDetail = async (productId: number) => {
    if (Number.isNaN(productId)) {
      await alertError('잘못된 접근입니다.');
      return navigate('/admin/products');
    }

    setLoading(true);
    try {
      const detail = await getProductDetails(productId);
      setDetail(detail);

      editor.commands.setContent(detail.boardDetailsResponse.content);
      setEditorAttachments(detail.boardDetailsResponse.attachments.filter(a => a.type === PostAttachmentType.EDITOR));

      const changedMonth = Number(detail.changedMonth?.slice(-2));

      formik.setValues({
        manufacturer: detail.manufacturer ?? '',
        productName: detail.productName ?? '',
        composition: detail.composition ?? '',
        productCode: detail.productCode ?? '',
        price: (detail.price ?? 0).toLocaleString(),
        feeRate: (detail.feeRate ?? 0).toString(),
        changedFeeRate: detail.changedFeeRate ?? undefined,
        changedMonth: Number.isNaN(changedMonth) ? '' : changedMonth.toString(),
        isAcquisition: detail.isAcquisition ?? false,
        isPromotion: detail.isPromotion ?? false,
        isOutOfStock: detail.isOutOfStock ?? false,
        isStopSelling: detail.isStopSelling ?? false,
        note: detail.note ?? '',
      });
    } catch (error) {
      console.error('Failed to fetch product detail:', error);
      await alertError('제품 정보를 불러오는 중 오류가 발생했습니다.');
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

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant='h4' gutterBottom sx={{ mb: 3 }}>
        제품정보 {isNew ? '등록' : '수정'}
      </Typography>

      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ p: 3 }}>
              <Typography variant='h6' gutterBottom sx={{ mb: 3 }}>
                제품정보
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={3} md={2}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    제약사
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={9} md={10}>
                  <TextField
                    fullWidth
                    size='small'
                    name='manufacturer'
                    placeholder='제약사를 입력하세요'
                    required
                    value={formik.values.manufacturer}
                    onChange={formik.handleChange}
                  />
                </Grid>

                <Grid item xs={12} sm={3} md={2}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    제품명
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={9} md={10}>
                  <TextField
                    fullWidth
                    size='small'
                    name='productName'
                    placeholder='제품명을 입력하세요'
                    required
                    value={formik.values.productName}
                    onChange={formik.handleChange}
                  />
                </Grid>

                <Grid item xs={12} sm={3} md={2}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    성분명
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={9} md={10}>
                  <TextField
                    fullWidth
                    size='small'
                    name='composition'
                    placeholder='성분명을 입력하세요'
                    required
                    value={formik.values.composition}
                    onChange={formik.handleChange}
                  />
                </Grid>

                <Grid item xs={12} sm={3} md={2}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    제품코드
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={9} md={10}>
                  <TextField
                    fullWidth
                    size='small'
                    name='productCode'
                    placeholder='제품코드를 입력하세요'
                    required
                    value={formik.values.productCode}
                    onChange={formik.handleChange}
                  />
                </Grid>

                <Grid item xs={12} sm={3} md={2}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    약가
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={9} md={10}>
                  <TextField
                    fullWidth
                    size='small'
                    name='price'
                    placeholder='약가를 입력하세요'
                    required
                    value={formik.values.price}
                    onChange={event => {
                      const numberValue = Number(event.target.value.replace(/,/g, ''));

                      if (!Number.isNaN(numberValue)) {
                        if (numberValue > Number.MAX_SAFE_INTEGER) {
                          formik.setFieldValue('price', Number.MAX_SAFE_INTEGER.toLocaleString());
                        } else {
                          formik.setFieldValue('price', numberValue.toLocaleString());
                        }
                      }
                    }}
                    InputProps={{
                      endAdornment: <Typography variant='body2'>원</Typography>,
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={3} md={2}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    기본수수료율
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={9} md={10}>
                  <TextField
                    fullWidth
                    size='small'
                    name='feeRate'
                    placeholder='수수료율을 입력하세요'
                    required
                    type='number'
                    value={formik.values.feeRate}
                    onChange={event => {
                      const numberValue = Number(event.target.value.replace(/,/g, ''));

                      if (!Number.isNaN(numberValue)) {
                        formik.setFieldValue('feeRate', String(numberValue));
                      }
                    }}
                    InputProps={{
                      endAdornment: <Typography variant='body2'>%</Typography>,
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={3} md={2}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    변경요율/변경월
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={9} md={10}>
                  <Box display='flex' gap={2} flexDirection={{ xs: 'column', sm: 'row' }}>
                    <TextField
                      size='small'
                      name='changedFeeRate'
                      label='변경요율'
                      type='number'
                      value={formik.values.changedFeeRate ?? ''}
                      onChange={event => {
                        const numberValue = Number(event.target.value.replace(/,/g, ''));

                        if (!Number.isNaN(numberValue)) {
                          formik.setFieldValue('changedFeeRate', String(numberValue));
                        }
                      }}
                      InputProps={{
                        endAdornment: <Typography variant='body2'>%</Typography>,
                      }}
                      sx={{ width: { xs: '100%', sm: '200px' } }}
                    />
                    <TextField
                      size='small'
                      name='changedMonth'
                      placeholder='변경월 (예: 4)'
                      value={formik.values.changedMonth}
                      onChange={formik.handleChange}
                      sx={{ width: { xs: '100%', sm: '200px' } }}
                    />
                  </Box>
                </Grid>

                <Grid item xs={12} sm={3} md={2}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    상태
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={9} md={10}>
                  <Box>
                    <FormControlLabel
                      control={<Checkbox name='isAcquisition' checked={formik.values.isAcquisition} onChange={formik.handleChange} />}
                      label='취급품목'
                    />
                    <FormControlLabel
                      control={<Checkbox name='isPromotion' checked={formik.values.isPromotion} onChange={formik.handleChange} />}
                      label='프로모션'
                    />
                    <FormControlLabel
                      control={<Checkbox name='isOutOfStock' checked={formik.values.isOutOfStock} onChange={formik.handleChange} />}
                      label='품절'
                    />
                    <FormControlLabel
                      control={<Checkbox name='isStopSelling' checked={formik.values.isStopSelling} onChange={formik.handleChange} />}
                      label='판매중단'
                    />
                  </Box>
                </Grid>

                <Grid item xs={12} sm={3} md={2}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    비고
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={9} md={10}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    size='small'
                    name='note'
                    placeholder='비고를 입력하세요'
                    value={formik.values.note}
                    onChange={formik.handleChange}
                  />
                </Grid>

                <Grid item xs={12} sm={3} md={2}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    대체가능의약품
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={9} md={10}>
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
                디테일 정보
              </Typography>

              <Stack
                gap='10px'
                sx={{
                  '.tiptap[contenteditable=true]': {
                    border: `1px solid #cccccc`,
                    padding: '12px 15px',
                  },
                }}
              >
                <TiptapMenuBar editor={editor} />
                <EditorContent editor={editor} placeholder='제품 상세 정보를 입력하세요' />
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Stack direction='row' spacing={2} justifyContent='center'>
              <Button
                variant='outlined'
                size='large'
                onClick={() => window.history.back()}
                sx={{ minWidth: 120 }}
                disabled={formik.isSubmitting}
              >
                취소
              </Button>
              <Button
                variant='contained'
                size='large'
                type='submit'
                sx={{ minWidth: 120 }}
                disabled={formik.isSubmitting}
                startIcon={formik.isSubmitting ? <CircularProgress size={20} /> : null}
              >
                {formik.isSubmitting ? '저장 중...' : '저장'}
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
}

import { TiptapMenuBar } from '@/medipanda/components/Tiptap';
import { useMedipandaEditor } from '@/medipanda/components/useMedipandaEditor';
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
import { NotImplementedError } from '@/medipanda/api-definitions/NotImplementedError';
import { createProductExtraInfo, getProductDetails, ProductDetailsResponse, updateProductExtraInfo } from '@/backend';
import { useMpErrorDialog } from '@/medipanda/hooks/useMpErrorDialog';
import { useMpNotImplementedDialog } from '@/medipanda/hooks/useMpNotImplementedDialog';
import { useSession } from '@/medipanda/hooks/useSession';
import { useSnackbar } from 'notistack';
import { Fragment, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as Yup from 'yup';

export default function MpAdminProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const notImplementedDialog = useMpNotImplementedDialog();
  const errorDialog = useMpErrorDialog();
  const { session } = useSession();
  const [productDetail, setProductDetail] = useState<ProductDetailsResponse | null>(null);

  const isNew = id === undefined;

  const formik = useFormik({
    initialValues: {
      manufacturer: '',
      productName: '',
      composition: '',
      productCode: '',
      price: 0,
      feeRate: 0,
      changedFeeRate: undefined as number | undefined,
      changedMonth: '',
      isAcquisition: false,
      isPromotion: false,
      isOutOfStock: false,
      isStopSelling: false,
      note: '',
      detailContent: '',
    },
    validationSchema: Yup.object().shape({
      manufacturer: Yup.string().required('제약사를 입력해주세요.'),
      productName: Yup.string().required('제품명을 입력해주세요.'),
      productCode: Yup.string().required('제품코드를 입력해주세요.'),
      composition: Yup.string().required('성분명을 입력해주세요.'),
      price: Yup.number().required('약가를 입력해주세요.').min(0, '약가는 0 이상이어야 합니다.'),
      feeRate: Yup.number()
        .required('기본수수료율을 입력해주세요.')
        .min(0, '수수료율은 0 이상이어야 합니다.')
        .max(100, '수수료율은 100 이하여야 합니다.'),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        if (isNew) {
          await createProductExtraInfo({
            boardPostCreateRequest: {
              boardType: 'PRODUCT',
              userId: session!.userId,
              nickname: session!.userId,
              hiddenNickname: false,
              title: values.productName,
              content: editor.getHTML(),
              parentId: null,
              isExposed: true,
              editorFileIds: editorAttachments.map(image => image.s3fileId),
              exposureRange: 'ALL',
              noticeProperties: null,
            },
            productExtraInfoCreateRequest: {
              manufacturer: values.manufacturer,
              productName: values.productName,
              composition: values.composition,
              productCode: values.productCode,
              changedFeeRate: values.changedFeeRate?.toString() ?? null,
              changedMonth: values.changedMonth,
              priceUnit: 'KRW',
              feeRate: values.feeRate.toString(),
              price: values.price,
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
          await updateProductExtraInfo(parseInt(id!, 10), {
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
              changedFeeRate: values.changedFeeRate?.toString() ?? null,
              changedMonth: values.changedMonth,
              priceUnit: 'KRW',
              feeRate: values.feeRate.toString(),
              price: values.price,
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
            alert(`"${values.productCode}"는 잘못된 코드 형식입니다.`);
            return;
          }
        }

        if (error instanceof NotImplementedError) {
          notImplementedDialog.open(error.message);
        } else {
          console.error('Failed to submit form:', error);
          errorDialog.showError(isNew ? '제품 등록 중 오류가 발생했습니다.' : '제품 수정 중 오류가 발생했습니다.');
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  const { editor, attachments: editorAttachments, setAttachments: setEditorAttachments } = useMedipandaEditor();

  useEffect(() => {
    if (!isNew && id) {
      fetchData(parseInt(id, 10));
    }
  }, [id, isNew]);

  const fetchData = async (productId: number) => {
    setLoading(true);
    try {
      const response = await getProductDetails(productId);
      setProductDetail(response);
      editor.commands.setContent(response.boardDetailsResponse.content);
      setEditorAttachments(response.boardDetailsResponse.attachments.filter(a => a.type === 'EDITOR'));

      const changedMonth = Number(response.changedMonth?.slice(-2));

      formik.setValues({
        manufacturer: response.manufacturer ?? '',
        productName: response.productName ?? '',
        composition: response.composition ?? '',
        productCode: response.productCode ?? '',
        price: response.price ?? 0,
        feeRate: response.feeRate ?? 0,
        changedFeeRate: response.changedFeeRate ?? undefined,
        changedMonth: Number.isNaN(changedMonth) ? '' : changedMonth.toString(),
        isAcquisition: response.isAcquisition ?? false,
        isPromotion: response.isPromotion ?? false,
        isOutOfStock: response.isOutOfStock ?? false,
        isStopSelling: response.isStopSelling ?? false,
        note: response.note ?? '',
        detailContent: response.boardDetailsResponse.content ?? '',
      });
    } catch (error) {
      console.error('Failed to fetch product detail:', error);
      errorDialog.showError('제품 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (isNew) {
      navigate('/admin/products');
    } else {
      navigate(`/admin/products/${id}`);
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
                    onBlur={formik.handleBlur}
                    error={!!(formik.touched.manufacturer && formik.errors.manufacturer)}
                    helperText={formik.touched.manufacturer && formik.errors.manufacturer}
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
                    onBlur={formik.handleBlur}
                    error={!!(formik.touched.productName && formik.errors.productName)}
                    helperText={formik.touched.productName && formik.errors.productName}
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
                    onBlur={formik.handleBlur}
                    error={!!(formik.touched.composition && formik.errors.composition)}
                    helperText={formik.touched.composition && formik.errors.composition}
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
                    onBlur={formik.handleBlur}
                    error={!!(formik.touched.productCode && formik.errors.productCode)}
                    helperText={formik.touched.productCode && formik.errors.productCode}
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
                    type='number'
                    value={formik.values.price}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={!!(formik.touched.price && formik.errors.price)}
                    helperText={formik.touched.price && formik.errors.price}
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
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={!!(formik.touched.feeRate && formik.errors.feeRate)}
                    helperText={formik.touched.feeRate && formik.errors.feeRate}
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
                      placeholder='변경요율'
                      type='number'
                      value={formik.values.changedFeeRate ?? ''}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
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
                      onBlur={formik.handleBlur}
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
                    onBlur={formik.handleBlur}
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
                      {productDetail?.alternativeProducts.map(product => (
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
              <Button variant='outlined' size='large' onClick={handleCancel} sx={{ minWidth: 120 }} disabled={formik.isSubmitting}>
                취소
              </Button>
              <Button
                variant='contained'
                color='success'
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

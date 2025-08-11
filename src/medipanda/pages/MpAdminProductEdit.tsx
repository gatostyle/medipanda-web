import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useFormik } from 'formik';
import { NotImplementedError } from 'medipanda/api-definitions/NotImplementedError';
import { createProductExtraInfo, getProductDetails, updateProductExtraInfo } from 'medipanda/backend';
import { TiptapEditor } from 'medipanda/components/TiptapEditor';
import { useMpErrorDialog } from 'medipanda/hooks/useMpErrorDialog';
import { useMpNotImplementedDialog } from 'medipanda/hooks/useMpNotImplementedDialog';
import { useMpSession } from 'medipanda/hooks/useMpSession';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as Yup from 'yup';

export default function MpAdminProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const notImplementedDialog = useMpNotImplementedDialog();
  const errorDialog = useMpErrorDialog();
  const { session } = useMpSession();

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
      alternativeProducts: [] as string[],
      detailContent: ''
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
        .max(100, '수수료율은 100 이하여야 합니다.')
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        if (isNew) {
          const boardPostCreateRequest = {
            boardType: 'PRODUCT' as const,
            userId: session!.userId,
            nickname: session!.name,
            title: values.productName,
            content: values.detailContent,
            parentId: null,
            isExposed: true,
            editorFileIds: null,
            exposureRange: 'ALL' as const,
            noticeProperties: null
          };
          const productExtraInfoRequest = {
            manufacturer: values.manufacturer,
            productName: values.productName,
            composition: values.composition,
            productCode: values.productCode,
            changedFeeRate: values.changedFeeRate?.toString() ?? null,
            changedMonth: values.changedMonth,
            priceUnit: 'KRW' as const,
            feeRate: values.feeRate.toString(),
            price: values.price,
            note: values.note,
            detailInfo: values.alternativeProducts.join(', '),
            isPromotion: values.isPromotion,
            isOutOfStock: values.isOutOfStock,
            isStopSelling: values.isStopSelling,
            isAcquisition: values.isAcquisition
          };
          await createProductExtraInfo({
            boardPostCreateRequest: boardPostCreateRequest,
            productExtraInfoCreateRequest: productExtraInfoRequest,
            files: undefined
          });
          enqueueSnackbar('제품이 성공적으로 등록되었습니다.', { variant: 'success' });
        } else {
          const boardPostUpdateRequest = {
            title: values.productName,
            content: values.detailContent,
            isBlind: null,
            isExposed: true,
            exposureRange: 'ALL' as const,
            keepFileIds: [], // Empty array for now
            editorFileIds: null,
            noticeProperties: null
          };
          const productExtraInfoRequest = {
            manufacturer: values.manufacturer,
            productName: values.productName,
            composition: values.composition,
            productCode: values.productCode,
            changedFeeRate: values.changedFeeRate?.toString() ?? null,
            changedMonth: values.changedMonth,
            priceUnit: 'KRW' as const,
            feeRate: values.feeRate.toString(),
            price: values.price,
            note: values.note,
            detailInfo: values.alternativeProducts.join(', '),
            isPromotion: values.isPromotion,
            isOutOfStock: values.isOutOfStock,
            isStopSelling: values.isStopSelling,
            isAcquisition: values.isAcquisition
          };
          await updateProductExtraInfo(parseInt(id!, 10), {
            boardPostUpdateRequest: boardPostUpdateRequest,
            productExtraInfoCreateRequest: productExtraInfoRequest,
            newFiles: undefined
          });
          enqueueSnackbar('제품이 성공적으로 수정되었습니다.', { variant: 'success' });
        }
        navigate('/admin/products');
      } catch (error) {
        if (error instanceof NotImplementedError) {
          notImplementedDialog.open(error.message);
        } else {
          console.error('Failed to submit form:', error);
          errorDialog.showError(isNew ? '제품 등록 중 오류가 발생했습니다.' : '제품 수정 중 오류가 발생했습니다.');
        }
      } finally {
        setSubmitting(false);
      }
    }
  });

  useEffect(() => {
    if (!isNew && id) {
      fetchData(parseInt(id, 10));
    }
  }, [id, isNew]);

  const fetchData = async (productId: number) => {
    setLoading(true);
    try {
      const response = await getProductDetails(productId);
      formik.setValues({
        manufacturer: response.manufacturer ?? '',
        productName: response.productName ?? '',
        composition: response.composition ?? '',
        productCode: response.productCode ?? '',
        price: response.price ?? 0,
        feeRate: response.feeRate ?? 0,
        changedFeeRate: response.changedFeeRate ?? undefined,
        changedMonth: response.changedMonth ?? '',
        isAcquisition: response.isAcquisition ?? false,
        isPromotion: response.isPromotion ?? false,
        isOutOfStock: response.isOutOfStock ?? false,
        isStopSelling: response.isStopSelling ?? false,
        note: response.note ?? '',
        alternativeProducts: response.alternativeProducts ?? [],
        detailContent: response.boardDetailsResponse.content ?? ''
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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        제품정보 {isNew ? '등록' : '수정'}
      </Typography>

      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                제품정보
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={3} md={2}>
                  <Typography variant="subtitle2" color="text.secondary">
                    제약사
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={9} md={10}>
                  <TextField
                    fullWidth
                    size="small"
                    name="manufacturer"
                    placeholder="제약사를 입력하세요"
                    required
                    value={formik.values.manufacturer}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={!!(formik.touched.manufacturer && formik.errors.manufacturer)}
                    helperText={formik.touched.manufacturer && formik.errors.manufacturer}
                  />
                </Grid>

                <Grid item xs={12} sm={3} md={2}>
                  <Typography variant="subtitle2" color="text.secondary">
                    제품명
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={9} md={10}>
                  <TextField
                    fullWidth
                    size="small"
                    name="productName"
                    placeholder="제품명을 입력하세요"
                    required
                    value={formik.values.productName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={!!(formik.touched.productName && formik.errors.productName)}
                    helperText={formik.touched.productName && formik.errors.productName}
                  />
                </Grid>

                <Grid item xs={12} sm={3} md={2}>
                  <Typography variant="subtitle2" color="text.secondary">
                    성분명
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={9} md={10}>
                  <TextField
                    fullWidth
                    size="small"
                    name="composition"
                    placeholder="성분명을 입력하세요"
                    required
                    value={formik.values.composition}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={!!(formik.touched.composition && formik.errors.composition)}
                    helperText={formik.touched.composition && formik.errors.composition}
                  />
                </Grid>

                <Grid item xs={12} sm={3} md={2}>
                  <Typography variant="subtitle2" color="text.secondary">
                    제품코드
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={9} md={10}>
                  <TextField
                    fullWidth
                    size="small"
                    name="productCode"
                    placeholder="제품코드를 입력하세요"
                    required
                    value={formik.values.productCode}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={!!(formik.touched.productCode && formik.errors.productCode)}
                    helperText={formik.touched.productCode && formik.errors.productCode}
                  />
                </Grid>

                <Grid item xs={12} sm={3} md={2}>
                  <Typography variant="subtitle2" color="text.secondary">
                    약가
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={9} md={10}>
                  <TextField
                    fullWidth
                    size="small"
                    name="price"
                    placeholder="약가를 입력하세요"
                    required
                    type="number"
                    value={formik.values.price}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={!!(formik.touched.price && formik.errors.price)}
                    helperText={formik.touched.price && formik.errors.price}
                    InputProps={{
                      endAdornment: <Typography variant="body2">원</Typography>
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={3} md={2}>
                  <Typography variant="subtitle2" color="text.secondary">
                    기본수수료율
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={9} md={10}>
                  <TextField
                    fullWidth
                    size="small"
                    name="feeRate"
                    placeholder="수수료율을 입력하세요"
                    required
                    type="number"
                    value={formik.values.feeRate}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={!!(formik.touched.feeRate && formik.errors.feeRate)}
                    helperText={formik.touched.feeRate && formik.errors.feeRate}
                    InputProps={{
                      endAdornment: <Typography variant="body2">%</Typography>
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={3} md={2}>
                  <Typography variant="subtitle2" color="text.secondary">
                    변경요율/변경월
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={9} md={10}>
                  <Box display="flex" gap={2} flexDirection={{ xs: 'column', sm: 'row' }}>
                    <TextField
                      size="small"
                      name="changedFeeRate"
                      placeholder="변경요율"
                      type="number"
                      value={formik.values.changedFeeRate ?? ''}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      InputProps={{
                        endAdornment: <Typography variant="body2">%</Typography>
                      }}
                      sx={{ width: { xs: '100%', sm: '200px' } }}
                    />
                    <TextField
                      size="small"
                      name="changedMonth"
                      placeholder="변경월 (예: 4월)"
                      value={formik.values.changedMonth}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      sx={{ width: { xs: '100%', sm: '200px' } }}
                    />
                  </Box>
                </Grid>

                <Grid item xs={12} sm={3} md={2}>
                  <Typography variant="subtitle2" color="text.secondary">
                    상태
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={9} md={10}>
                  <Box>
                    <FormControlLabel
                      control={<Checkbox name="isAcquisition" checked={formik.values.isAcquisition} onChange={formik.handleChange} />}
                      label="취급품목"
                    />
                    <FormControlLabel
                      control={<Checkbox name="isPromotion" checked={formik.values.isPromotion} onChange={formik.handleChange} />}
                      label="프로모션"
                    />
                    <FormControlLabel
                      control={<Checkbox name="isOutOfStock" checked={formik.values.isOutOfStock} onChange={formik.handleChange} />}
                      label="품절"
                    />
                    <FormControlLabel
                      control={<Checkbox name="isStopSelling" checked={formik.values.isStopSelling} onChange={formik.handleChange} />}
                      label="판매중단"
                    />
                  </Box>
                </Grid>

                <Grid item xs={12} sm={3} md={2}>
                  <Typography variant="subtitle2" color="text.secondary">
                    비고
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={9} md={10}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    size="small"
                    name="note"
                    placeholder="비고를 입력하세요"
                    value={formik.values.note}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </Grid>

                <Grid item xs={12} sm={3} md={2}>
                  <Typography variant="subtitle2" color="text.secondary">
                    대체가능의약품
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={9} md={10}>
                  <TextField
                    fullWidth
                    size="small"
                    name="alternativeProducts"
                    placeholder="대체가능의약품을 입력하세요"
                    value={formik.values.alternativeProducts.join(', ')}
                    onChange={(e) => formik.setFieldValue('alternativeProducts', e.target.value.split(', '))}
                    onBlur={formik.handleBlur}
                  />
                </Grid>
              </Grid>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                디테일 정보
              </Typography>

              <TiptapEditor
                content={formik.values.detailContent}
                onChange={(content) => formik.setFieldValue('detailContent', content)}
                placeholder="제품 상세 정보를 입력하세요"
              />
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button variant="outlined" size="large" onClick={handleCancel} sx={{ minWidth: 120 }} disabled={formik.isSubmitting}>
                취소
              </Button>
              <Button
                variant="contained"
                color="success"
                size="large"
                type="submit"
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

import { MainToolbarContent, MobileToolbarContent } from '@/lib/Tiptap/components/tiptap-templates/simple/simple-editor';
import { Toolbar } from '@/lib/Tiptap/components/tiptap-ui-primitive/toolbar';
import { normalizeLocaleNumber } from '@/lib/utils/form';
import { useMedipandaEditor } from '@/hooks/useMedipandaEditor';
import { useMpModal } from '@/hooks/useMpModal';
import { DATEFORMAT_YYYY_MM } from '@/lib/utils/dateFormat';
import { PercentUtils } from '@/utils/PercentUtils';
import {
  Box,
  Button,
  Card,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { EditorContent, EditorContext } from '@tiptap/react';
import { isAxiosError } from 'axios';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import {
  BoardExposureRange,
  BoardType,
  createProductExtraInfo,
  getProductDetails,
  PostAttachmentType,
  PriceUnit,
  type ProductDetailsResponse,
  updateProductExtraInfo,
} from '@/backend';
import { useSession } from '@/hooks/useSession';
import { Fragment, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import type { RequiredDeep } from 'type-fest';

export default function MpAdminProductEdit() {
  const navigate = useNavigate();
  const { productId: paramProductId } = useParams();
  const isNew = paramProductId === undefined;
  const productId = Number(paramProductId);

  const [loading, setLoading] = useState(false);
  const { session } = useSession();
  const [detail, setDetail] = useState<ProductDetailsResponse | null>(null);

  const { alert, alertError } = useMpModal();

  const form = useForm({
    defaultValues: {
      manufacturer: '',
      productName: '',
      composition: '',
      productCode: '',
      price: '0',
      feeRate: '0',
      changedFeeRate: '0',
      changedMonth: null as Date | null,
      isAcquisition: false,
      isPromotion: false,
      isOutOfStock: false,
      isStopSelling: false,
      note: '',
    },
  });

  const submitHandler: SubmitHandler<RequiredDeep<(typeof form)['control']['_defaultValues']>> = async values => {
    const price = Number(values.price.replace(/,/g, ''));
    const changedFeeRate = Number(values.changedFeeRate);
    const editorContent = editor
      .getHTML()
      .replace(/^<p><\/p>$/, '')
      .trim();

    if (isNew) {
      if (values.manufacturer === '') {
        await alert('제약사를 입력하세요.');
        return;
      }

      if (values.productName === '') {
        await alert('제품명을 입력하세요.');
        return;
      }

      if (values.composition === '') {
        await alert('성분명을 입력하세요.');
        return;
      }

      if (values.productCode === '') {
        await alert('제품코드를 입력하세요.');
        return;
      }
    } else {
      if (changedFeeRate !== 0 && values.changedMonth === null) {
        await alert('변경월을 선택하세요.');
        return;
      }
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
            content: editorContent,
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
            changedFeeRate: String(PercentUtils.percentStringToDecimal(values.changedFeeRate)),
            changedMonth: values.changedMonth !== null ? values.changedMonth.getMonth() + 1 : null,
            priceUnit: PriceUnit.KRW,
            feeRate: String(PercentUtils.percentStringToDecimal(values.feeRate)),
            price: price,
            note: values.note,
            detailInfo: editorContent,
            isPromotion: values.isPromotion,
            isOutOfStock: values.isOutOfStock,
            isStopSelling: values.isStopSelling,
            isAcquisition: values.isAcquisition,
          },
          files: undefined,
        });
        await alert('제품이 성공적으로 등록되었습니다.');
      } else {
        await updateProductExtraInfo(productId, {
          boardPostUpdateRequest: {
            title: values.productName,
            content: editorContent,
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
            changedFeeRate: String(PercentUtils.percentStringToDecimal(values.changedFeeRate)),
            changedMonth: values.changedMonth !== null ? values.changedMonth.getMonth() + 1 : null,
            priceUnit: PriceUnit.KRW,
            feeRate: String(PercentUtils.percentStringToDecimal(values.feeRate)),
            price: price,
            note: values.note,
            detailInfo: editorContent,
            isPromotion: values.isPromotion,
            isOutOfStock: values.isOutOfStock,
            isStopSelling: values.isStopSelling,
            isAcquisition: values.isAcquisition,
          },
          newFiles: [],
        });
        await alert('제품이 성공적으로 수정되었습니다.');
      }
      navigate('/admin/products');
    } catch (error) {
      if (isAxiosError(error)) {
        switch (true) {
          case typeof error.response?.data === 'string' && error.response.data.startsWith('Bad request: Invalid product code format:'):
            await alert(`제품코드 "${values.productCode}"는 잘못된 코드 형식입니다.`);
            return;
          case typeof error.response?.data === 'string' && error.response.data.startsWith('Bad request: Product not found. code='):
            await alert(`제품코드 "${values.productCode}"에 해당하는 제품을 찾을 수 없습니다.`);
            return;
          default:
            break;
        }
      }

      console.error('Failed to submit form:', error);
      await alertError(isNew ? '제품 등록 중 오류가 발생했습니다.' : '제품 수정 중 오류가 발생했습니다.');
    }
  };

  const { editor, attachments: editorAttachments, setAttachments: setEditorAttachments } = useMedipandaEditor();
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [mobileView, setMobileView] = useState<'main' | 'highlighter' | 'link' | 'youtube'>('main');

  useEffect(() => {
    if (!isNew) {
      fetchDetail(productId);
    }
  }, [isNew, productId]);

  useEffect(() => {
    if (detail !== null) {
      editor.commands.setContent(detail.boardDetailsResponse.content);
      setEditorAttachments(detail.boardDetailsResponse.attachments.filter(a => a.type === PostAttachmentType.EDITOR));
    }
  }, [detail, editor]);

  const fetchDetail = async (productId: number) => {
    if (Number.isNaN(productId)) {
      await alertError('잘못된 접근입니다.');
      return navigate('/admin/products');
    }

    setLoading(true);
    try {
      const detail = await getProductDetails(productId);
      setDetail(detail);

      form.reset({
        manufacturer: detail.manufacturer ?? '',
        productName: detail.productName ?? '',
        composition: detail.composition ?? '',
        productCode: detail.productCode ?? '',
        price: (detail.price ?? 0).toLocaleString(),
        feeRate: (detail.feeRate !== null ? PercentUtils.decimalToPercent(detail.feeRate) : 0).toString(),
        changedFeeRate: (detail.changedFeeRate !== null ? PercentUtils.decimalToPercent(detail.changedFeeRate) : 0).toString(),
        changedMonth: detail.changedMonth !== null ? new Date(detail.changedMonth) : null,
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
    <Stack sx={{ gap: 3 }}>
      <Typography variant='h4'>제품정보 {isNew ? '등록' : '수정'}</Typography>

      <Stack sx={{ gap: 3 }}>
        <Card sx={{ p: 3 }}>
          <Stack sx={{ gap: 2 }}>
            <Stack direction='row'>
              <Typography variant='subtitle2' color='text.secondary' sx={{ flex: '0 0 150px' }}>
                제약사
              </Typography>
              <Controller
                control={form.control}
                name={'manufacturer'}
                render={({ field }) => <TextField {...field} fullWidth size='small' disabled={!isNew} />}
              />
            </Stack>

            <Stack direction='row'>
              <Typography variant='subtitle2' color='text.secondary' sx={{ flex: '0 0 150px' }}>
                제품명
              </Typography>
              <Controller
                control={form.control}
                name={'productName'}
                render={({ field }) => <TextField {...field} fullWidth size='small' disabled={!isNew} />}
              />
            </Stack>

            <Stack direction='row'>
              <Typography variant='subtitle2' color='text.secondary' sx={{ flex: '0 0 150px' }}>
                성분명
              </Typography>
              <Controller
                control={form.control}
                name={'composition'}
                render={({ field }) => <TextField {...field} fullWidth size='small' disabled={!isNew} />}
              />
            </Stack>

            <Stack direction='row'>
              <Typography variant='subtitle2' color='text.secondary' sx={{ flex: '0 0 150px' }}>
                제품코드
              </Typography>
              <Controller
                control={form.control}
                name={'productCode'}
                render={({ field }) => <TextField {...field} fullWidth size='small' disabled={!isNew} />}
              />
            </Stack>

            <Stack direction='row'>
              <Typography variant='subtitle2' color='text.secondary' sx={{ flex: '0 0 150px' }}>
                약가
              </Typography>
              <Controller
                control={form.control}
                name={'price'}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    size='small'
                    onChange={e => {
                      field.onChange(normalizeLocaleNumber(e.target.value, { min: 0 }));
                    }}
                    disabled={!isNew}
                    InputProps={{
                      endAdornment: <Typography variant='body2'>원</Typography>,
                    }}
                  />
                )}
              />
            </Stack>

            <Stack direction='row'>
              <Typography variant='subtitle2' color='text.secondary' sx={{ flex: '0 0 150px' }}>
                기본수수료율
              </Typography>
              <Controller
                control={form.control}
                name={'feeRate'}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    size='small'
                    placeholder='수수료율을 입력하세요'
                    required
                    onChange={e => {
                      field.onChange(
                        normalizeLocaleNumber(e.target.value, {
                          maximumFractionDigits: 1,
                          min: 0,
                          max: 100,
                        }),
                      );
                    }}
                    InputProps={{
                      endAdornment: <Typography variant='body2'>%</Typography>,
                    }}
                  />
                )}
              />
            </Stack>

            {!isNew && (
              <Stack direction='row'>
                <Typography variant='subtitle2' color='text.secondary' sx={{ flex: '0 0 150px' }}>
                  변경요율/변경월
                </Typography>
                <Stack direction='row' sx={{ gap: 2 }}>
                  <Controller
                    control={form.control}
                    name={'changedFeeRate'}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size='small'
                        label='변경요율'
                        onChange={e => {
                          field.onChange(
                            normalizeLocaleNumber(e.target.value, {
                              maximumFractionDigits: 1,
                              min: 0,
                              max: 100,
                            }),
                          );
                        }}
                        InputProps={{
                          endAdornment: <Typography variant='body2'>%</Typography>,
                        }}
                        sx={{ width: { xs: '100%', sm: '200px' } }}
                      />
                    )}
                  />
                  <Controller
                    control={form.control}
                    name={'changedMonth'}
                    render={({ field }) => (
                      <DatePicker
                        {...field}
                        format={DATEFORMAT_YYYY_MM}
                        views={['month']}
                        label='변경월'
                        slotProps={{
                          textField: {
                            size: 'small',
                          },
                        }}
                      />
                    )}
                  />
                </Stack>
              </Stack>
            )}

            <Stack direction='row'>
              <Typography variant='subtitle2' color='text.secondary' sx={{ flex: '0 0 150px' }}>
                상태
              </Typography>
              <Stack direction='row'>
                <FormControlLabel
                  control={
                    <Controller
                      control={form.control}
                      name={'isAcquisition'}
                      render={({ field }) => <Checkbox {...field} checked={field.value} />}
                    />
                  }
                  label='취급품목'
                />
                <FormControlLabel
                  control={
                    <Controller
                      control={form.control}
                      name={'isPromotion'}
                      render={({ field }) => <Checkbox {...field} checked={field.value} />}
                    />
                  }
                  label='프로모션'
                />
                <FormControlLabel
                  control={
                    <Controller
                      control={form.control}
                      name={'isOutOfStock'}
                      render={({ field }) => <Checkbox {...field} checked={field.value} />}
                    />
                  }
                  label='품절'
                />
                <FormControlLabel
                  control={
                    <Controller
                      control={form.control}
                      name={'isStopSelling'}
                      render={({ field }) => <Checkbox {...field} checked={field.value} />}
                    />
                  }
                  label='판매중단'
                />
              </Stack>
            </Stack>

            <Stack direction='row'>
              <Typography variant='subtitle2' color='text.secondary' sx={{ flex: '0 0 150px' }}>
                비고
              </Typography>
              <Controller
                control={form.control}
                name={'note'}
                render={({ field }) => <TextField {...field} fullWidth multiline rows={4} size='small' placeholder='비고를 입력하세요' />}
              />
            </Stack>

            {!isNew && (
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
                            {product.feeRate ? PercentUtils.formatDecimal(product.feeRate) + '%' : '-'}
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
            )}
          </Stack>
        </Card>

        <Card component={Stack} sx={{ p: 3, gap: 3 }}>
          <Typography variant='h6'>Detail Info</Typography>

          <Stack
            sx={{
              '& .tiptap': {
                minHeight: '300px',
                padding: '10px',
                border: `1px solid #CCCCCC`,
              },
            }}
          >
            <EditorContext.Provider value={{ editor }}>
              <Toolbar ref={toolbarRef}>
                {mobileView === 'main' ? (
                  <MainToolbarContent
                    onHighlighterClick={() => setMobileView('highlighter')}
                    onLinkClick={() => setMobileView('link')}
                    onYoutubeClick={() => setMobileView('youtube')}
                    isMobile={false}
                  />
                ) : (
                  <MobileToolbarContent type={mobileView === 'highlighter' ? 'highlighter' : 'link'} onBack={() => setMobileView('main')} />
                )}
              </Toolbar>

              <EditorContent editor={editor} />
            </EditorContext.Provider>
          </Stack>
        </Card>

        <Stack direction='row' sx={{ justifyContent: 'center', gap: 2 }}>
          <Button
            variant='outlined'
            size='large'
            component={RouterLink}
            to={isNew ? '/admin/products' : `/admin/products/${productId}`}
            sx={{ minWidth: 120 }}
          >
            취소
          </Button>
          <Button variant='contained' size='large' onClick={form.handleSubmit(submitHandler)} sx={{ minWidth: 120 }}>
            저장
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
}

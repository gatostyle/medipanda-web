import { setUrlParams } from '@/lib/url';
import { useSearchParamsOrDefault } from '@/lib/useSearchParamsOrDefault';
import { MpSalesAgencyProductApplicantsTab } from '@/medipanda/components/MpSalesAgencyProductApplicantsTab';
import { useMedipandaEditor } from '@/medipanda/components/useMedipandaEditor';
import { useMpModal } from '@/medipanda/hooks/useMpModal';
import {
  Box,
  Button,
  Card,
  CircularProgress,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { EditorContent } from '@tiptap/react';
import { useFormik } from 'formik';
import {
  type AttachmentResponse,
  BoardExposureRange,
  BoardExposureRangeLabel,
  BoardType,
  createSalesAgencyProductBoard,
  getSalesAgencyProductDetails,
  PostAttachmentType,
  type SalesAgencyProductDetailsResponse,
  updateSalesAgencyProductBoard,
} from '@/backend';
import { useSession } from '@/medipanda/hooks/useSession';
import { useSnackbar } from 'notistack';
import { type SyntheticEvent, useEffect, useState } from 'react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import { DateFix, formatYyyyMmDd } from '../utils/dateFormat';

export default function MpAdminSalesAgencyProductEdit() {
  const navigate = useNavigate();
  const { salesAgencyProductId: paramSalesAgencyProductId } = useParams();
  const isNew = paramSalesAgencyProductId === undefined;
  const salesAgencyProductId = Number(paramSalesAgencyProductId);

  const initialSearchParams = { tab: 'info' };
  const { tab } = useSearchParamsOrDefault(initialSearchParams);

  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<SalesAgencyProductDetailsResponse | null>(null);

  const { alertError } = useMpModal();

  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (!isNew) {
      loadProductDetail(salesAgencyProductId);
    }
  }, [isNew, salesAgencyProductId]);

  const loadProductDetail = async (salesAgencyProductId: number) => {
    if (Number.isNaN(salesAgencyProductId)) {
      await alertError('잘못된 접근입니다.');
      return navigate('/admin/sales-agency-products');
    }

    setLoading(true);
    try {
      const detail = await getSalesAgencyProductDetails(salesAgencyProductId);
      setDetail(detail);
    } catch (error) {
      console.error('Failed to load product detail:', error);
      enqueueSnackbar('영업대행상품 정보를 불러오는데 실패했습니다.', { variant: 'error' });
      return window.history.back();
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_: SyntheticEvent, value: string) => {
    const url = setUrlParams({ tab: value, searchKeyword: undefined }, initialSearchParams);

    navigate(url);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack sx={{ gap: 3 }}>
      <Typography variant='h4'>영업대행상품 {isNew ? '등록' : '상세'}</Typography>

      <Card>
        <Tabs value={tab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab value='info' label='기본정보' />
          <Tab value='applicants' label='신청자' />
        </Tabs>

        {tab === 'info' && <InfoTab detail={detail} />}

        {!isNew && tab === 'applicants' && <MpSalesAgencyProductApplicantsTab detail={detail!} />}
      </Card>
    </Stack>
  );
}

function InfoTab({ detail }: { detail: SalesAgencyProductDetailsResponse | null }) {
  const isNew = detail === null;

  const { session } = useSession();

  const navigate = useNavigate();

  const { alert, alertError } = useMpModal();
  const { enqueueSnackbar } = useSnackbar();

  const formik = useFormik({
    initialValues: {
      clientName: '',
      productName: '',
      isExposed: true,
      exposureRange: '' as keyof typeof BoardExposureRange | '',
      thumbnail: null as File | null,
      thumbnailUrl: '',
      videoUrl: '',
      contractDate: null as Date | null,
      note: '',
      startDate: null as Date | null,
      endDate: null as Date | null,
      attachedFiles: [] as AttachmentResponse[],
      newFiles: [] as File[],
    },
    onSubmit: async values => {
      if (values.clientName === '') {
        await alert('위탁사명은 필수입니다');
        return;
      }
      if (values.productName === '') {
        await alert('상품명은 필수입니다');
        return;
      }
      if (values.exposureRange === '') {
        await alert('노출범위는 필수입니다');
        return;
      }
      if (values.thumbnailUrl === '') {
        await alert('썸네일은 필수입니다');
        return;
      }
      if (values.contractDate === null) {
        await alert('계약일은 필수입니다');
        return;
      }
      if (values.startDate === null) {
        await alert('게시 시작일은 필수입니다');
        return;
      }
      if (values.endDate === null) {
        await alert('게시 종료일은 필수입니다');
        return;
      }
      if (values.endDate < values.startDate) {
        await alert('종료일은 시작일 이후여야 합니다');
        return;
      }

      try {
        if (isNew) {
          await createSalesAgencyProductBoard({
            boardPostCreateRequest: {
              boardType: BoardType.SALES_AGENCY,
              userId: session!.userId,
              nickname: session!.name,
              hiddenNickname: false,
              title: values.productName,
              content: editor.getHTML(),
              parentId: null,
              isExposed: values.isExposed,
              exposureRange: values.exposureRange,
              editorFileIds: editorAttachments.map(image => image.s3fileId),
              noticeProperties: null,
            },
            salesAgencyProductCreateRequest: {
              clientName: values.clientName,
              productName: values.productName,
              contractDate: formatYyyyMmDd(values.contractDate!),
              videoUrl: values.videoUrl,
              note: values.note,
              startAt: formatYyyyMmDd(values.startDate!),
              endAt: formatYyyyMmDd(values.endDate!),
              quantity: 1,
            },
            thumbnail: values.thumbnail!,
            files: [],
          });
          enqueueSnackbar('영업대행상품이 등록되었습니다.', { variant: 'success' });
          navigate('/admin/sales-agency-products');
        } else {
          await updateSalesAgencyProductBoard(detail!.productId, {
            boardPostUpdateRequest: {
              title: values.productName,
              content: editor.getHTML(),
              hiddenNickname: null,
              isBlind: null,
              isExposed: values.isExposed,
              exposureRange: values.exposureRange,
              keepFileIds: [...values.attachedFiles, ...editorAttachments].map(file => file.s3fileId),
              editorFileIds: editorAttachments.map(attachment => attachment.s3fileId),
              noticeProperties: null,
            },
            salesAgencyProductUpdateRequest: {
              clientName: values.clientName,
              productName: values.productName,
              contractDate: formatYyyyMmDd(values.contractDate!),
              videoUrl: values.videoUrl,
              note: values.note,
              startAt: formatYyyyMmDd(values.startDate!),
              endAt: formatYyyyMmDd(values.endDate!),
              quantity: null,
            },
            thumbnail: values.thumbnail ?? undefined,
          });
          enqueueSnackbar('영업대행상품이 수정되었습니다.', { variant: 'success' });
          navigate(`/admin/sales-agency-products/${detail!.productId}`);
        }
      } catch (error) {
        console.error('Failed to save sales agency product:', error);
      }
    },
  });

  const { editor, attachments: editorAttachments, setAttachments: setEditorAttachments } = useMedipandaEditor();

  useEffect(() => {
    if (detail !== null) {
      editor.commands.setContent(detail.boardPostDetail.content);
      setEditorAttachments(detail.boardPostDetail.attachments.filter(a => a.type === PostAttachmentType.EDITOR));
    }
  }, [detail, editor]);

  useEffect(() => {
    if (detail !== null) {
      formik.setValues({
        clientName: detail.clientName,
        productName: detail.productName,
        isExposed: detail.boardPostDetail.isExposed,
        exposureRange: detail.boardPostDetail.exposureRange,
        thumbnail: null,
        thumbnailUrl: detail.thumbnailUrl,
        videoUrl: detail.videoUrl ?? '',
        contractDate: DateFix(detail.contractDate),
        note: detail.note ?? '',
        startDate: DateFix(detail.startDate),
        endDate: DateFix(detail.endDate),
        attachedFiles: detail.boardPostDetail.attachments.filter(a => a.type === PostAttachmentType.ATTACHMENT),
        newFiles: [],
      });
    }
  }, [detail]);

  const handleFileUpload = async () => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async e => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const fileReader = new FileReader();
          fileReader.onload = async () => {
            if (!fileReader.result) {
              await alertError('파일을 읽는 데 실패했습니다.');
              return;
            }

            formik.setFieldValue('thumbnail', file);
            formik.setFieldValue('thumbnailUrl', fileReader.result as string);
          };

          fileReader.readAsDataURL(file);
        }
      };
      input.click();
    } catch (error) {
      console.error('Failed to upload file:', error);
      await alertError('파일 업로드 중 오류가 발생했습니다.');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack sx={{ gap: 3 }}>
        <TextField fullWidth label='위탁사명' name='clientName' value={formik.values.clientName} onChange={formik.handleChange} required />

        <TextField fullWidth label='상품명' name='productName' value={formik.values.productName} onChange={formik.handleChange} required />

        <Stack sx={{ gap: 1.5 }}>
          <Typography variant='subtitle2'>노출상태</Typography>
          <FormControl>
            <RadioGroup
              row
              name='isExposed'
              value={formik.values.isExposed ? 'true' : 'false'}
              onChange={e => formik.setFieldValue('isExposed', e.target.value === 'true')}
            >
              <FormControlLabel value={'true'} control={<Radio />} label={'노출'} />
              <FormControlLabel value={'false'} control={<Radio />} label={'미노출'} />
            </RadioGroup>
          </FormControl>
        </Stack>

        <Stack sx={{ gap: 1.5 }}>
          <Typography variant='subtitle2'>
            노출범위 <span style={{ color: 'red' }}>*</span>
          </Typography>
          <FormControl>
            <RadioGroup row name='exposureRange' value={formik.values.exposureRange} onChange={formik.handleChange}>
              {Object.keys(BoardExposureRange).map(exposureRange => (
                <FormControlLabel
                  key={exposureRange}
                  value={exposureRange}
                  control={<Radio />}
                  label={BoardExposureRangeLabel[exposureRange]}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </Stack>

        <Stack sx={{ gap: 1.5 }}>
          <Typography variant='subtitle2'>
            썸네일 <span style={{ color: 'red' }}>*</span>
          </Typography>
          <Box>
            <Button variant='contained' onClick={handleFileUpload}>
              첨부파일
            </Button>
          </Box>
          {formik.values.thumbnailUrl && (
            <Box>
              <img src={formik.values.thumbnailUrl} alt='썸네일 미리보기' style={{ maxWidth: 200, maxHeight: 200 }} />
            </Box>
          )}
        </Stack>

        <Stack sx={{ gap: 1.5 }}>
          <Typography variant='subtitle2'>
            내용 <span style={{ color: 'red' }}>*</span>
          </Typography>
          <Stack
            sx={{
              '.tiptap': {
                border: `1px solid #cccccc`,
                padding: '20px 10px',
              },
            }}
          >
            <EditorContent editor={editor} placeholder='내용을 입력하세요' />
          </Stack>
        </Stack>

        <TextField fullWidth label='영상url' name='videoUrl' value={formik.values.videoUrl} onChange={formik.handleChange} />

        <Box>
          <DatePicker
            value={formik.values.contractDate}
            onChange={value => formik.setFieldValue('contractDate', value)}
            format='yyyy-MM-dd'
            views={['year', 'month', 'day']}
            label='계약일 *'
            slotProps={{
              textField: {
                size: 'small',
              },
            }}
          />
        </Box>

        <TextField fullWidth label='비고' name='note' value={formik.values.note} onChange={formik.handleChange} multiline rows={3} />

        <Stack direction='row'>
          <Box sx={{ width: '100%' }}>
            <DatePicker
              value={formik.values.startDate}
              onChange={value => formik.setFieldValue('startDate', value)}
              format='yyyy-MM-dd'
              views={['year', 'month', 'day']}
              label='게시 시작일 *'
              slotProps={{
                textField: {
                  size: 'small',
                },
              }}
            />
          </Box>

          <Box sx={{ width: '100%' }}>
            <DatePicker
              value={formik.values.endDate}
              onChange={value => formik.setFieldValue('endDate', value)}
              format='yyyy-MM-dd'
              views={['year', 'month', 'day']}
              label='게시 종료일 *'
              slotProps={{
                textField: {
                  size: 'small',
                },
              }}
            />
          </Box>
        </Stack>
        {detail !== null && (
          <Stack>
            <Typography variant='subtitle2'>조회수</Typography>
            <Typography variant='body1'>{detail.boardPostDetail.viewsCount.toLocaleString()}</Typography>
          </Stack>
        )}
      </Stack>

      <Stack direction='row' spacing={2} justifyContent='center' sx={{ mt: 4 }}>
        <Button
          variant='outlined'
          size='large'
          component={RouterLink}
          to={detail !== null ? `/admin/sales-agency-products/${detail.productId}` : '/admin/sales-agency-products'}
          sx={{ minWidth: 120 }}
        >
          취소
        </Button>
        <Button variant='contained' size='large' sx={{ minWidth: 120 }} onClick={formik.submitForm}>
          저장
        </Button>
      </Stack>
    </Box>
  );
}

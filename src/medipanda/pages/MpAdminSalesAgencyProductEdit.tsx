import { setUrlParams } from '@/lib/url';
import { useSearchParamsOrDefault } from '@/lib/useSearchParamsOrDefault';
import { MpSalesAgencyProductApplicantsTab } from '@/medipanda/components/MpSalesAgencyProductApplicantsTab';
import { useMedipandaEditor } from '@/medipanda/components/useMedipandaEditor';
import {
  Box,
  Button,
  Card,
  CircularProgress,
  FormControl,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { EditorContent } from '@tiptap/react';
import { useFormik } from 'formik';
import {
  AttachmentResponse,
  createSalesAgencyProductBoard,
  getSalesAgencyProductDetails,
  SalesAgencyProductDetailsResponse,
  updateSalesAgencyProductBoard,
} from '@/backend';
import MpFormikDatePicker from '@/medipanda/components/MpFormikDatePicker';
import { useMpErrorDialog } from '@/medipanda/hooks/useMpErrorDialog';
import { useSession } from '@/medipanda/hooks/useSession';
import { EXPOSURE_RANGE_LABELS } from '@/medipanda/ui-labels';
import { useSnackbar } from 'notistack';
import { SyntheticEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

  const { enqueueSnackbar } = useSnackbar();
  const { session } = useSession();

  const { editor, attachments: editorAttachments, setAttachments: setEditorAttachments } = useMedipandaEditor();

  const formik = useFormik({
    initialValues: {
      clientName: '',
      productName: '',
      isExposed: true,
      exposureRange: '' as 'ALL' | 'CONTRACTED' | 'UNCONTRACTED' | '',
      thumbnail: null as File | null,
      thumbnailUrl: '',
      videoUrl: '',
      contractDate: null as Date | null,
      note: '',
      startDate: null as Date | null,
      endDate: null as Date | null,
      viewCount: 0,
      attachedFiles: [] as AttachmentResponse[],
      newFiles: [] as File[],
    },
    onSubmit: async values => {
      if (values.clientName === '') {
        alert('위탁사명은 필수입니다');
        return;
      }
      if (values.productName === '') {
        alert('상품명은 필수입니다');
        return;
      }
      if (values.exposureRange === '') {
        alert('노출범위는 필수입니다');
        return;
      }
      if (values.thumbnailUrl === '') {
        alert('썸네일은 필수입니다');
        return;
      }
      if (values.contractDate === null) {
        alert('계약일은 필수입니다');
        return;
      }
      if (values.startDate === null) {
        alert('게시 시작일은 필수입니다');
        return;
      }
      if (values.endDate === null) {
        alert('게시 종료일은 필수입니다');
        return;
      }
      if (values.endDate < values.startDate) {
        alert('종료일은 시작일 이후여야 합니다');
        return;
      }

      try {
        if (isNew) {
          await createSalesAgencyProductBoard({
            boardPostCreateRequest: {
              boardType: 'SALES_AGENCY',
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
          alert('영업대행상품이 등록되었습니다.');
          navigate('/admin/sales-agency-products');
        } else {
          await updateSalesAgencyProductBoard(salesAgencyProductId, {
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
          alert('영업대행상품이 수정되었습니다.');
          navigate(`/admin/sales-agency-products/${salesAgencyProductId}`);
        }
      } catch (error) {
        console.error('Failed to save sales agency product:', error);
      }
    },
  });

  useEffect(() => {
    if (!isNew) {
      loadProductDetail(salesAgencyProductId);
    }
  }, [isNew, salesAgencyProductId]);

  const loadProductDetail = async (salesAgencyProductId: number) => {
    if (Number.isNaN(salesAgencyProductId)) {
      alert('잘못된 접근입니다.');
      return navigate('/admin/sales-agency-products');
    }

    setLoading(true);
    try {
      const detail = await getSalesAgencyProductDetails(salesAgencyProductId);
      setDetail(detail);

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
        viewCount: detail.boardPostDetail.viewsCount,
        attachedFiles: detail.boardPostDetail.attachments.filter(a => a.type === 'ATTACHMENT'),
        newFiles: [],
      });
      editor.commands.setContent(detail.boardPostDetail.content);
      setEditorAttachments(detail.boardPostDetail.attachments.filter(a => a.type === 'EDITOR'));
    } catch (error) {
      console.error('Failed to load product detail:', error);
      enqueueSnackbar('영업대행상품 정보를 불러오는데 실패했습니다.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_: SyntheticEvent, value: string) => {
    const url = setUrlParams({ tab: value, searchKeyword: undefined }, initialSearchParams);

    navigate(url);
  };

  if (loading || detail === null) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant='h4' gutterBottom sx={{ mb: 3 }}>
        영업대행상품 {isNew ? '등록' : '상세'}
      </Typography>

      <Card>
        <Tabs value={tab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab value='info' label='기본정보' />
          <Tab value='applicants' label='신청자' />
        </Tabs>

        {tab === 'info' && <InfoTab detail={detail} />}

        {!isNew && tab === 'applicants' && <MpSalesAgencyProductApplicantsTab detail={detail!} />}
      </Card>
    </Box>
  );
}

function InfoTab({ detail }: { detail: SalesAgencyProductDetailsResponse | null }) {
  const isNew = detail === null;

  const { session } = useSession();

  const navigate = useNavigate();

  const errorDialog = useMpErrorDialog();

  const formik = useFormik({
    initialValues: {
      clientName: '',
      productName: '',
      isExposed: true,
      exposureRange: '' as 'ALL' | 'CONTRACTED' | 'UNCONTRACTED' | '',
      thumbnail: null as File | null,
      thumbnailUrl: '',
      videoUrl: '',
      contractDate: null as Date | null,
      note: '',
      startDate: null as Date | null,
      endDate: null as Date | null,
      viewCount: 0,
      attachedFiles: [] as AttachmentResponse[],
      newFiles: [] as File[],
    },
    onSubmit: async values => {
      if (values.clientName === '') {
        alert('위탁사명은 필수입니다');
        return;
      }
      if (values.productName === '') {
        alert('상품명은 필수입니다');
        return;
      }
      if (values.exposureRange === '') {
        alert('노출범위는 필수입니다');
        return;
      }
      if (values.thumbnailUrl === '') {
        alert('썸네일은 필수입니다');
        return;
      }
      if (values.contractDate === null) {
        alert('계약일은 필수입니다');
        return;
      }
      if (values.startDate === null) {
        alert('게시 시작일은 필수입니다');
        return;
      }
      if (values.endDate === null) {
        alert('게시 종료일은 필수입니다');
        return;
      }
      if (values.endDate < values.startDate) {
        alert('종료일은 시작일 이후여야 합니다');
        return;
      }

      try {
        if (isNew) {
          await createSalesAgencyProductBoard({
            boardPostCreateRequest: {
              boardType: 'SALES_AGENCY',
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
          alert('영업대행상품이 등록되었습니다.');
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
          alert('영업대행상품이 수정되었습니다.');
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
        viewCount: detail.boardPostDetail.viewsCount,
        attachedFiles: detail.boardPostDetail.attachments.filter(a => a.type === 'ATTACHMENT'),
        newFiles: [],
      });

      editor.commands.setContent(detail.boardPostDetail.content);
      setEditorAttachments(detail.boardPostDetail.attachments.filter(a => a.type === 'EDITOR'));
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
          fileReader.onload = () => {
            if (!fileReader.result) {
              errorDialog.showError('파일을 읽는 데 실패했습니다.');
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
      errorDialog.showError('파일 업로드 중 오류가 발생했습니다.');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label='위탁사명'
            name='clientName'
            value={formik.values.clientName}
            onChange={formik.handleChange}
            required
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label='상품명'
            name='productName'
            value={formik.values.productName}
            onChange={formik.handleChange}
            required
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant='subtitle2' gutterBottom>
            노출상태
          </Typography>
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
        </Grid>

        <Grid item xs={12}>
          <Typography variant='subtitle2' gutterBottom>
            노출범위 <span style={{ color: 'red' }}>*</span>
          </Typography>
          <FormControl>
            <RadioGroup row name='exposureRange' value={formik.values.exposureRange} onChange={formik.handleChange}>
              <FormControlLabel value={'ALL'} control={<Radio />} label={EXPOSURE_RANGE_LABELS['ALL']} />
              <FormControlLabel value={'CONTRACTED'} control={<Radio />} label={EXPOSURE_RANGE_LABELS['CONTRACTED']} />
              <FormControlLabel value={'UNCONTRACTED'} control={<Radio />} label={EXPOSURE_RANGE_LABELS['UNCONTRACTED']} />
            </RadioGroup>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Typography variant='subtitle2' gutterBottom>
            썸네일 <span style={{ color: 'red' }}>*</span>
          </Typography>
          <Button variant='contained' onClick={handleFileUpload}>
            첨부파일
          </Button>
          {formik.values.thumbnailUrl && (
            <Box sx={{ mt: 2 }}>
              <img src={formik.values.thumbnailUrl} alt='썸네일 미리보기' style={{ maxWidth: 200, maxHeight: 200 }} />
            </Box>
          )}
        </Grid>

        <Grid item xs={12}>
          <Typography variant='subtitle2' gutterBottom>
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
        </Grid>

        <Grid item xs={12}>
          <TextField fullWidth label='영상url' name='videoUrl' value={formik.values.videoUrl} onChange={formik.handleChange} />
        </Grid>

        <Grid item xs={12} md={6}>
          <MpFormikDatePicker name='contractDate' label='계약일 *' formik={formik} />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label='비고'
            name='notes'
            value={formik.values.note}
            onChange={formik.handleChange}
            multiline
            rows={3}
            placeholder='비고'
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <MpFormikDatePicker name='startDate' label='게시기간 - 시작일 *' formik={formik} />
        </Grid>

        <Grid item xs={12} md={6}>
          <MpFormikDatePicker name='endDate' label='게시기간 - 종료일 *' formik={formik} />
        </Grid>

        <Grid item xs={12}>
          <Typography variant='subtitle2' gutterBottom>
            조회수
          </Typography>
          <Typography variant='body1'>{formik.values.viewCount.toLocaleString()}</Typography>
        </Grid>
      </Grid>

      <Stack direction='row' spacing={2} justifyContent='center' sx={{ mt: 4 }}>
        <Button variant='outlined' size='large' onClick={window.history.back} sx={{ minWidth: 120 }}>
          취소
        </Button>
        <Button variant='contained' size='large' sx={{ minWidth: 120 }} onClick={formik.submitForm}>
          저장
        </Button>
      </Stack>
    </Box>
  );
}

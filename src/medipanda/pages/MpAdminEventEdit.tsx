import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MainCard from 'components/MainCard';
import { TiptapEditor } from 'medipanda/components/TiptapEditor';
import MpFormikDatePicker from 'medipanda/components/MpFormikDatePicker';
import { createEventBoard, updateEventBoard, getEventBoardDetails } from 'medipanda/backend';
import { useMpNotImplementedDialog } from 'medipanda/hooks/useMpNotImplementedDialog';
import { useMpInfoDialog } from 'medipanda/hooks/useMpInfoDialog';
import { useMpErrorDialog } from 'medipanda/hooks/useMpErrorDialog';
import { NotImplementedError } from 'medipanda/api-definitions/NotImplementedError';

const validationSchema = Yup.object({
  title: Yup.string().required('제목을 입력해주세요'),
  content: Yup.string().required('내용을 입력해주세요'),
  startDate: Yup.date().nullable().required('시작일을 선택해주세요'),
  endDate: Yup.date().nullable().required('종료일을 선택해주세요')
});

export default function MpAdminEventEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const notImplementedDialog = useMpNotImplementedDialog();
  const infoDialog = useMpInfoDialog();
  const errorDialog = useMpErrorDialog();

  const isNew = id === '';

  const formik = useFormik({
    initialValues: {
      isExposed: true,
      exposureRange: 'ALL' as 'ALL' | 'CONTRACTED' | 'UNCONTRACTED',
      startDate: new Date() as Date | null,
      endDate: new Date() as Date | null,
      title: '',
      description: '',
      content: '',
      videoUrl: '',
      note: '',
      internalName: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const eventRequest = {
          startAt: values.startDate ? values.startDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          endAt: values.endDate ? values.endDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          description: values.description,
          videoUrl: values.videoUrl,
          note: values.note
        };

        if (isNew) {
          const boardRequest = {
            boardType: 'EVENT' as const,
            userId: 'admin',
            nickname: '관리자',
            title: values.title,
            content: values.content,
            isExposed: values.isExposed,
            exposureRange: values.exposureRange
          };

          await createEventBoard({
            request: boardRequest,
            eventRequest: eventRequest,
            thumbnail: thumbnailFile!,
            files: undefined
          });
          infoDialog.showInfo('이벤트가 등록되었습니다.');
        } else {
          const boardRequest = {
            title: values.title,
            content: values.content,
            isExposed: values.isExposed,
            keepFileIds: [],
            editorFileIds: []
          };

          await updateEventBoard(parseInt(id!), {
            request: boardRequest,
            eventRequest: eventRequest,
            thumbnail: thumbnailFile ?? undefined,
            newFiles: undefined
          });
          infoDialog.showInfo('이벤트가 수정되었습니다.');
        }
        navigate('/admin/events');
      } catch (error) {
        if (error instanceof NotImplementedError) {
          notImplementedDialog.open(error.message);
        } else {
          console.error('Failed to save event:', error);
          errorDialog.showError('이벤트 저장에 실패했습니다.');
        }
      }
    }
  });

  useEffect(() => {
    const fetchEventDetail = async () => {
      if (!isNew && id) {
        setLoading(true);
        try {
          const event = await getEventBoardDetails(parseInt(id));
          formik.setValues({
            isExposed: event.boardPostDetail.isExposed,
            exposureRange: event.boardPostDetail.exposureRange,
            startDate: new Date(event.eventStartDate),
            endDate: new Date(event.eventEndDate),
            title: event.boardPostDetail.title,
            description: event.description,
            content: event.boardPostDetail.content,
            videoUrl: event.videoUrl ?? '',
            note: event.note ?? '',
            internalName: ''
          });
          if (event.thumbnailUrl) {
            setThumbnailPreview(event.thumbnailUrl);
          }
        } catch (error) {
          if (error instanceof NotImplementedError) {
            notImplementedDialog.open(error.message);
          } else {
            console.error('Failed to fetch event detail:', error);
            errorDialog.showError('이벤트 정보를 불러오는데 실패했습니다.');
          }
          navigate('/admin/events');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchEventDetail();
  }, [id, isNew, navigate]);

  const handleThumbnailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCancel = () => {
    navigate('/admin/events');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          이벤트 {isNew ? '등록' : '수정'}
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <MainCard>
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  노출상태 *
                </Typography>
                <RadioGroup
                  row
                  name="isExposed"
                  value={formik.values.isExposed ? 'true' : 'false'}
                  onChange={(e) => formik.setFieldValue('isExposed', e.target.value === 'true')}
                >
                  <FormControlLabel value={'true'} control={<Radio />} label="노출" />
                  <FormControlLabel value={'false'} control={<Radio />} label="미노출" />
                </RadioGroup>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  노출범위 *
                </Typography>
                <RadioGroup row name="exposureRange" value={formik.values.exposureRange} onChange={formik.handleChange}>
                  <FormControlLabel value={'ALL'} control={<Radio />} label="전체" />
                  <FormControlLabel value={'CONTRACTED'} control={<Radio />} label="계약" />
                  <FormControlLabel value={'UNCONTRACTED'} control={<Radio />} label="미계약" />
                </RadioGroup>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  이벤트기간 *
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <MpFormikDatePicker name="startDate" label="시작일" formik={formik} />
                  <Typography>~</Typography>
                  <MpFormikDatePicker name="endDate" label="종료일" formik={formik} />
                </Stack>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  name="title"
                  label="제목 *"
                  fullWidth
                  placeholder=""
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  error={formik.touched.title && Boolean(formik.errors.title)}
                  helperText={formik.touched.title && formik.errors.title}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  name="description"
                  label="이벤트 설명"
                  fullWidth
                  placeholder=""
                  value={formik.values.description}
                  onChange={formik.handleChange}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  썸네일 *
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Button variant="contained" component="label" color="success">
                    첨부파일
                    <input type="file" hidden accept="image/*" onChange={handleThumbnailChange} />
                  </Button>
                  <Typography variant="body2" color="text.secondary">
                    {thumbnailFile ? thumbnailFile.name : '파일을 선택해주세요'}
                  </Typography>
                </Stack>
                {thumbnailPreview && (
                  <Box mt={2}>
                    <img
                      src={thumbnailPreview}
                      alt="썸네일 미리보기"
                      style={{
                        maxWidth: '300px',
                        maxHeight: '200px',
                        objectFit: 'contain',
                        border: '1px solid #e0e0e0',
                        borderRadius: '4px'
                      }}
                    />
                  </Box>
                )}
              </Grid>

              <Grid item xs={12}>
                <TextField name="internalName" label="썸네일" fullWidth value={formik.values.internalName} onChange={formik.handleChange} />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  내용 *
                </Typography>
                <TiptapEditor
                  content={formik.values.content}
                  onChange={(content) => formik.setFieldValue('content', content)}
                  placeholder=""
                  error={!!(formik.touched.content && formik.errors.content)}
                  helperText={formik.touched.content && formik.errors.content ? formik.errors.content : undefined}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  name="videoUrl"
                  label="영상url"
                  fullWidth
                  placeholder=""
                  value={formik.values.videoUrl}
                  onChange={formik.handleChange}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  name="note"
                  label="비고"
                  fullWidth
                  multiline
                  rows={3}
                  placeholder=""
                  value={formik.values.note}
                  onChange={formik.handleChange}
                />
              </Grid>

              <Grid item xs={12}>
                <Stack direction="row" spacing={2} justifyContent="center">
                  <Button variant="outlined" size="large" onClick={handleCancel}>
                    취소
                  </Button>
                  <Button variant="contained" size="large" color="success" type="submit" disabled={formik.isSubmitting}>
                    저장
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </form>
        </MainCard>
      </Grid>
    </Grid>
  );
}

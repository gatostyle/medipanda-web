import { useMedipandaEditor } from '@/medipanda/components/useMedipandaEditor';
import { useMpModal } from '@/medipanda/hooks/useMpModal';
import { Box, Button, CircularProgress, FormControlLabel, Grid, Radio, RadioGroup, Stack, TextField, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { EditorContent } from '@tiptap/react';
import MainCard from 'components/MainCard';
import { useFormik } from 'formik';
import {
  AttachmentResponse,
  BoardExposureRange,
  BoardExposureRangeLabel,
  BoardType,
  createEventBoard,
  getEventBoardDetails,
  PostAttachmentType,
  updateEventBoard,
} from '@/backend';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import { useSession } from '../hooks/useSession';
import { DateFix, formatYyyyMmDd } from '../utils/dateFormat';

export default function MpAdminEventEdit() {
  const navigate = useNavigate();
  const { eventId: paramEventId } = useParams();
  const isNew = paramEventId === undefined;
  const eventId = Number(paramEventId);

  const [loading, setLoading] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const { session } = useSession();
  const { alert, alertError } = useMpModal();
  const { enqueueSnackbar } = useSnackbar();

  const { editor, attachments: editorAttachments, setAttachments: setEditorAttachments } = useMedipandaEditor();

  const formik = useFormik({
    initialValues: {
      isExposed: true,
      exposureRange: BoardExposureRange.ALL,
      startDate: new Date(),
      endDate: new Date(),
      title: '',
      description: '',
      videoUrl: '',
      note: '',
      internalName: '',
      attachedFiles: [] as AttachmentResponse[],
      newFiles: [] as File[],
    },
    onSubmit: async values => {
      if (values.title === '') {
        await alert('제목을 입력해주세요');
        return;
      }

      if (values.startDate === null) {
        await alert('시작일을 선택해주세요');
        return;
      }

      if (values.endDate === null) {
        await alert('종료일을 선택해주세요');
        return;
      }

      try {
        if (isNew) {
          await createEventBoard({
            request: {
              boardType: BoardType.EVENT,
              userId: session!.userId,
              nickname: session!.name,
              hiddenNickname: false,
              title: values.title,
              content: editor.getHTML(),
              parentId: null,
              isExposed: values.isExposed,
              editorFileIds: editorAttachments.map(image => image.s3fileId),
              exposureRange: values.exposureRange,
              noticeProperties: null,
            },
            eventRequest: {
              startAt: formatYyyyMmDd(values.startDate),
              endAt: formatYyyyMmDd(values.endDate),
              description: values.description,
              videoUrl: values.videoUrl,
              note: values.note,
            },
            thumbnail: thumbnailFile!,
            files: values.newFiles,
          });
          enqueueSnackbar('이벤트가 등록되었습니다.', { variant: 'success' });
          navigate('/admin/events');
        } else {
          await updateEventBoard(eventId, {
            request: {
              title: values.title,
              content: editor.getHTML(),
              hiddenNickname: null,
              isBlind: null,
              isExposed: values.isExposed,
              exposureRange: values.exposureRange,
              keepFileIds: [...values.attachedFiles, ...editorAttachments].map(file => file.s3fileId),
              editorFileIds: editorAttachments.map(attachment => attachment.s3fileId),
              noticeProperties: null,
            },
            eventRequest: {
              startAt: formatYyyyMmDd(values.startDate),
              endAt: formatYyyyMmDd(values.endDate),
              description: values.description,
              videoUrl: values.videoUrl,
              note: values.note,
            },
            thumbnail: thumbnailFile ?? undefined,
            newFiles: values.newFiles,
          });
          enqueueSnackbar('이벤트가 수정되었습니다.', { variant: 'success' });
          navigate(`/admin/events/${eventId}`);
        }
      } catch (error) {
        console.error('Failed to save event:', error);
        await alertError('이벤트 저장에 실패했습니다.');
      }
    },
  });

  useEffect(() => {
    if (!isNew) {
      fetchDetail(eventId);
    }
  }, [isNew, eventId]);

  const fetchDetail = async (eventId: number) => {
    if (Number.isNaN(eventId)) {
      await alertError('잘못된 접근입니다.');
      return navigate('/admin/events');
    }

    setLoading(true);
    try {
      const detail = await getEventBoardDetails(eventId);

      editor.commands.setContent(detail.boardPostDetail.content);
      setEditorAttachments(detail.boardPostDetail.attachments.filter(a => a.type === PostAttachmentType.EDITOR));

      formik.setValues({
        isExposed: detail.boardPostDetail.isExposed,
        exposureRange: detail.boardPostDetail.exposureRange as BoardExposureRange,
        startDate: DateFix(detail.eventStartDate),
        endDate: DateFix(detail.eventEndDate),
        title: detail.boardPostDetail.title,
        description: detail.description,
        videoUrl: detail.videoUrl ?? '',
        note: detail.note ?? '',
        internalName: '',
        attachedFiles: detail.boardPostDetail.attachments.filter(a => a.type === PostAttachmentType.ATTACHMENT),
        newFiles: [],
      });

      if (detail.thumbnailUrl) {
        setThumbnailPreview(detail.thumbnailUrl);
      }
    } catch (error) {
      console.error('Failed to fetch event detail:', error);
      await alertError('이벤트 정보를 불러오는데 실패했습니다.');
      return window.history.back();
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant='h4' gutterBottom>
          이벤트 {isNew ? '등록' : '수정'}
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <MainCard>
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant='subtitle1' gutterBottom>
                  노출상태 *
                </Typography>
                <RadioGroup
                  row
                  name='isExposed'
                  value={formik.values.isExposed ? 'true' : 'false'}
                  onChange={e => formik.setFieldValue('isExposed', e.target.value === 'true')}
                >
                  <FormControlLabel value={'true'} control={<Radio />} label='노출' />
                  <FormControlLabel value={'false'} control={<Radio />} label='미노출' />
                </RadioGroup>
              </Grid>

              <Grid item xs={12}>
                <Typography variant='subtitle1' gutterBottom>
                  노출범위 *
                </Typography>
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
              </Grid>

              <Grid item xs={12}>
                <Typography variant='subtitle1' gutterBottom>
                  이벤트기간 *
                </Typography>
                <Stack direction='row' spacing={2} alignItems='center'>
                  <DatePicker
                    value={formik.values.startDate}
                    onChange={value => formik.setFieldValue('startDate', value)}
                    format='yyyy-MM-dd'
                    views={['year', 'month', 'day']}
                    label='시작일'
                    slotProps={{
                      textField: {
                        size: 'small',
                      },
                    }}
                  />
                  <Typography>~</Typography>
                  <DatePicker
                    value={formik.values.endDate}
                    onChange={value => formik.setFieldValue('endDate', value)}
                    format='yyyy-MM-dd'
                    views={['year', 'month', 'day']}
                    label='종료일'
                    slotProps={{
                      textField: {
                        size: 'small',
                      },
                    }}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  name='title'
                  label='제목 *'
                  fullWidth
                  placeholder=''
                  value={formik.values.title}
                  onChange={formik.handleChange}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  name='description'
                  label='이벤트 설명'
                  fullWidth
                  placeholder=''
                  value={formik.values.description}
                  onChange={formik.handleChange}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant='subtitle1' gutterBottom>
                  썸네일 *
                </Typography>
                <Stack direction='row' spacing={2} alignItems='center'>
                  <Button variant='contained' component='label'>
                    첨부파일
                    <input type='file' hidden accept='image/*' onChange={handleThumbnailChange} />
                  </Button>
                  <Typography variant='body2' color='text.secondary'>
                    {thumbnailFile ? thumbnailFile.name : '파일을 선택해주세요'}
                  </Typography>
                </Stack>
                {thumbnailPreview && (
                  <Box mt={2}>
                    <img
                      src={thumbnailPreview}
                      alt='썸네일 미리보기'
                      style={{
                        maxWidth: '300px',
                        maxHeight: '200px',
                        objectFit: 'contain',
                        borderRadius: '4px',
                      }}
                    />
                  </Box>
                )}
              </Grid>

              <Grid item xs={12}>
                <TextField name='internalName' label='썸네일' fullWidth value={formik.values.internalName} onChange={formik.handleChange} />
              </Grid>

              <Grid item xs={12}>
                <Typography variant='subtitle1' gutterBottom>
                  내용 *
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
                <TextField
                  name='videoUrl'
                  label='영상url'
                  fullWidth
                  placeholder=''
                  value={formik.values.videoUrl}
                  onChange={formik.handleChange}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  name='note'
                  label='비고'
                  fullWidth
                  multiline
                  rows={3}
                  placeholder=''
                  value={formik.values.note}
                  onChange={formik.handleChange}
                />
              </Grid>

              <Grid item xs={12}>
                <Stack direction='row' spacing={2} justifyContent='center'>
                  <Button variant='outlined' size='large' component={RouterLink} to={isNew ? '/admin/events' : `/admin/events/${eventId}`}>
                    취소
                  </Button>
                  <Button variant='contained' size='large' type='submit' disabled={formik.isSubmitting}>
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

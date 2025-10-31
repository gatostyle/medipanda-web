import { useMedipandaEditor } from '@/hooks/useMedipandaEditor';
import { useMpModal } from '@/hooks/useMpModal';
import { MainToolbarContent, MobileToolbarContent } from '@/lib/Tiptap/components/tiptap-templates/simple/simple-editor';
import { Toolbar } from '@/lib/Tiptap/components/tiptap-ui-primitive/toolbar';
import { Box, Button, Card, CircularProgress, FormControlLabel, Radio, RadioGroup, Stack, TextField, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { EditorContent, EditorContext } from '@tiptap/react';
import { format } from 'date-fns';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import {
  type AttachmentResponse,
  BoardExposureRange,
  BoardExposureRangeLabel,
  BoardType,
  createEventBoard,
  type EventBoardDetailsResponse,
  getEventBoardDetails,
  PostAttachmentType,
  updateEventBoard,
} from '@/backend';
import { type ChangeEvent, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import type { RequiredDeep } from 'type-fest';
import { useSession } from '@/hooks/useSession';
import { DATEFORMAT_YYYY_MM_DD, DateUtils } from '@/lib/utils/dateFormat';

export default function MpAdminEventEdit() {
  const navigate = useNavigate();
  const { eventId: paramEventId } = useParams();
  const isNew = paramEventId === undefined;
  const eventId = Number(paramEventId);

  const [detail, setDetail] = useState<EventBoardDetailsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const { session } = useSession();
  const { alert, alertError } = useMpModal();

  const { editor, attachments: editorAttachments, setAttachments: setEditorAttachments } = useMedipandaEditor();
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [mobileView, setMobileView] = useState<'main' | 'highlighter' | 'link' | 'youtube'>('main');

  const form = useForm({
    defaultValues: {
      isExposed: true,
      exposureRange: BoardExposureRange.ALL as keyof typeof BoardExposureRange,
      startDate: new Date(),
      endDate: new Date(),
      title: '',
      description: '',
      videoUrl: '',
      note: '',
      attachedFiles: [] as AttachmentResponse[],
      newFiles: [] as File[],
    },
  });
  const formStartDate = form.watch('startDate');
  const formEndDate = form.watch('endDate');

  const submitHandler: SubmitHandler<RequiredDeep<(typeof form)['control']['_defaultValues']>> = async values => {
    const editorContent = editor
      .getHTML()
      .replace(/^<p><\/p>$/, '')
      .trim();

    if (values.title === '') {
      await alert('제목을 입력하세요.');
      return;
    }

    if (editorContent === '') {
      await alert('내용을 입력하세요.');
      return;
    }

    if (values.startDate === null) {
      await alert('시작일을 선택하세요.');
      return;
    }

    if (values.endDate === null) {
      await alert('종료일을 선택하세요.');
      return;
    }

    if (thumbnailFile === null && isNew) {
      await alert('썸네일을 선택하세요.');
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
            content: editorContent,
            parentId: null,
            isExposed: values.isExposed,
            editorFileIds: editorAttachments.map(image => image.s3fileId),
            exposureRange: values.exposureRange,
            noticeProperties: null,
          },
          eventRequest: {
            startAt: format(values.startDate, DATEFORMAT_YYYY_MM_DD),
            endAt: format(values.endDate, DATEFORMAT_YYYY_MM_DD),
            description: values.description,
            videoUrl: values.videoUrl,
            note: values.note,
          },
          thumbnail: thumbnailFile!,
          files: values.newFiles,
        });
        await alert('이벤트가 등록되었습니다.');
        navigate('/admin/events');
      } else {
        await updateEventBoard(eventId, {
          request: {
            title: values.title,
            content: editorContent,
            hiddenNickname: null,
            isBlind: null,
            isExposed: values.isExposed,
            exposureRange: values.exposureRange,
            keepFileIds: [...values.attachedFiles, ...editorAttachments].map(file => file.s3fileId),
            editorFileIds: editorAttachments.map(attachment => attachment.s3fileId),
            noticeProperties: null,
          },
          eventRequest: {
            startAt: format(values.startDate, DATEFORMAT_YYYY_MM_DD),
            endAt: format(values.endDate, DATEFORMAT_YYYY_MM_DD),
            description: values.description,
            videoUrl: values.videoUrl,
            note: values.note,
          },
          thumbnail: thumbnailFile ?? undefined,
          newFiles: values.newFiles,
        });
        await alert('이벤트가 수정되었습니다.');
        navigate(`/admin/events/${eventId}`);
      }
    } catch (error) {
      console.error('Failed to save event:', error);
      await alertError('이벤트 저장에 실패했습니다.');
    }
  };

  useEffect(() => {
    if (!isNew) {
      fetchDetail(eventId);
    }
  }, [isNew, eventId]);

  useEffect(() => {
    if (detail !== null) {
      editor.commands.setContent(detail.boardPostDetail.content);
      setEditorAttachments(detail.boardPostDetail.attachments.filter(a => a.type === PostAttachmentType.EDITOR));
    }
  }, [detail, editor]);

  const fetchDetail = async (eventId: number) => {
    if (Number.isNaN(eventId)) {
      await alertError('잘못된 접근입니다.');
      return navigate('/admin/events');
    }

    setLoading(true);
    try {
      const detail = await getEventBoardDetails(eventId);
      setDetail(detail);

      form.reset({
        isExposed: detail.boardPostDetail.isExposed,
        exposureRange: detail.boardPostDetail.exposureRange,
        startDate: DateUtils.utcToKst(new Date(detail.eventStartDate)),
        endDate: DateUtils.utcToKst(new Date(detail.eventEndDate)),
        title: detail.boardPostDetail.title,
        description: detail.description,
        videoUrl: detail.videoUrl ?? '',
        note: detail.note ?? '',
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

  const handleThumbnailChange = (event: ChangeEvent<HTMLInputElement>) => {
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
    <Stack sx={{ gap: 3 }}>
      <Typography variant='h4'>이벤트 {isNew ? '등록' : '수정'}</Typography>

      <Card sx={{ padding: 3 }}>
        <Stack sx={{ gap: 3 }}>
          <Stack sx={{ gap: 1 }}>
            <Typography variant='subtitle2' color='text.secondary'>
              노출상태 *
            </Typography>
            <Controller
              control={form.control}
              name={'isExposed'}
              render={({ field }) => (
                <RadioGroup
                  {...field}
                  row
                  value={String(field.value)}
                  onChange={e => form.setValue('isExposed', e.target.value === 'true')}
                >
                  <FormControlLabel value='true' control={<Radio />} label='노출' />
                  <FormControlLabel value='false' control={<Radio />} label='미노출' />
                </RadioGroup>
              )}
            />
          </Stack>

          <Stack sx={{ gap: 1 }}>
            <Typography variant='subtitle2' color='text.secondary'>
              노출범위 *
            </Typography>
            <Controller
              control={form.control}
              name={'exposureRange'}
              render={({ field }) => (
                <RadioGroup {...field} row>
                  {Object.keys(BoardExposureRange).map(exposureRange => (
                    <FormControlLabel
                      key={exposureRange}
                      value={exposureRange}
                      control={<Radio />}
                      label={BoardExposureRangeLabel[exposureRange]}
                    />
                  ))}
                </RadioGroup>
              )}
            />
          </Stack>

          <Stack sx={{ gap: 1 }}>
            <Typography variant='subtitle2' color='text.secondary'>
              이벤트기간 *
            </Typography>
            <Stack direction='row' spacing={2} alignItems='center'>
              <Controller
                control={form.control}
                name={'startDate'}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    format={DATEFORMAT_YYYY_MM_DD}
                    views={['year', 'month', 'day']}
                    maxDate={formEndDate ?? undefined}
                    label='시작일'
                    slotProps={{
                      textField: {
                        size: 'small',
                      },
                    }}
                  />
                )}
              />
              <Typography>~</Typography>
              <Controller
                control={form.control}
                name={'endDate'}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    format={DATEFORMAT_YYYY_MM_DD}
                    views={['year', 'month', 'day']}
                    minDate={formStartDate ?? undefined}
                    label='종료일'
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

          <Controller control={form.control} name={'title'} render={({ field }) => <TextField {...field} label='제목 *' fullWidth />} />

          <Controller
            control={form.control}
            name={'description'}
            render={({ field }) => <TextField {...field} label='이벤트 설명' fullWidth />}
          />

          <Stack sx={{ gap: 1 }}>
            <Typography variant='subtitle2' color='text.secondary'>
              썸네일 *
            </Typography>
            <Stack direction='row' spacing={2} alignItems='center'>
              <Button variant='contained' component='label'>
                첨부파일
                <input type='file' hidden accept='image/*' onChange={handleThumbnailChange} />
              </Button>
              <Typography variant='body2' color='text.secondary'>
                {thumbnailFile ? thumbnailFile.name : '파일을 선택하세요'}
              </Typography>
            </Stack>
            {thumbnailPreview && (
              <Box>
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
          </Stack>

          <Stack sx={{ gap: 1 }}>
            <Typography variant='subtitle2' color='text.secondary'>
              내용 *
            </Typography>
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
                    <MobileToolbarContent
                      type={mobileView === 'highlighter' ? 'highlighter' : 'link'}
                      onBack={() => setMobileView('main')}
                    />
                  )}
                </Toolbar>

                <EditorContent editor={editor} />
              </EditorContext.Provider>
            </Stack>
          </Stack>

          <Controller control={form.control} name={'videoUrl'} render={({ field }) => <TextField {...field} label='영상url' fullWidth />} />

          <Controller
            control={form.control}
            name={'note'}
            render={({ field }) => <TextField {...field} label='비고' fullWidth multiline rows={3} />}
          />

          <Stack direction='row' spacing={2} justifyContent='center'>
            <Button variant='outlined' size='large' component={RouterLink} to={isNew ? '/admin/events' : `/admin/events/${eventId}`}>
              취소
            </Button>
            <Button variant='contained' size='large' onClick={form.handleSubmit(submitHandler)}>
              저장
            </Button>
          </Stack>
        </Stack>
      </Card>
    </Stack>
  );
}

import { useMedipandaEditor } from '@/medipanda/components/useMedipandaEditor';
import { useMpModal } from '@/medipanda/hooks/useMpModal';
import { Box, Button, Chip, CircularProgress, Divider, Grid, Stack, Typography } from '@mui/material';
import { EditorContent } from '@tiptap/react';
import MainCard from 'components/MainCard';
import { BoardExposureRangeLabel, EventBoardDetailsResponse, getEventBoardDetails, PostAttachmentType } from '@/backend';
import { formatYyyyMmDd } from '@/medipanda/utils/dateFormat';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';

export default function MpAdminEventDetail() {
  const navigate = useNavigate();
  const { eventId: paramEventId } = useParams();
  const eventId = Number(paramEventId);

  const { enqueueSnackbar } = useSnackbar();
  const [event, setDetail] = useState<EventBoardDetailsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const { alertError } = useMpModal();

  const { editor, setAttachments: setEditorAttachments } = useMedipandaEditor();

  const fetchDetail = async (eventId: number) => {
    if (Number.isNaN(eventId)) {
      await alertError('잘못된 접근입니다.');
      return navigate('/admin/events');
    }

    setLoading(true);
    try {
      const detail = await getEventBoardDetails(eventId);
      setDetail(detail);

      editor.setEditable(false);
      editor.commands.setContent(detail.boardPostDetail.content);
      setEditorAttachments(detail.boardPostDetail.attachments.filter(a => a.type === PostAttachmentType.EDITOR));
    } catch (error) {
      console.error('Failed to fetch event detail:', error);
      enqueueSnackbar('데이터를 불러오는데 실패했습니다.', { variant: 'error' });
      return window.history.back();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail(eventId);
  }, [eventId]);

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
        <CircularProgress />
      </Box>
    );
  }

  if (!event) {
    return null;
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant='h4' gutterBottom>
          이벤트 상세
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <MainCard>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Stack spacing={1}>
                <Typography variant='subtitle2' color='text.secondary'>
                  노출상태
                </Typography>
                <Box>
                  <Chip
                    label={event.boardPostDetail.isExposed ? '노출' : '미노출'}
                    color={event.boardPostDetail.isExposed ? 'success' : 'default'}
                    variant='light'
                    size='small'
                  />
                </Box>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Stack spacing={1}>
                <Typography variant='subtitle2' color='text.secondary'>
                  노출범위
                </Typography>
                <Box>
                  <Chip label={BoardExposureRangeLabel[event.boardPostDetail.exposureRange]} color='success' variant='light' size='small' />
                </Box>
              </Stack>
            </Grid>

            <Grid item xs={12}>
              <Stack spacing={1}>
                <Typography variant='subtitle2' color='text.secondary'>
                  이벤트기간
                </Typography>
                <Typography variant='body1'>
                  {formatYyyyMmDd(event.eventStartDate)} ~ {formatYyyyMmDd(event.eventEndDate)}
                </Typography>
              </Stack>
            </Grid>

            <Grid item xs={12}>
              <Stack spacing={1}>
                <Typography variant='subtitle2' color='text.secondary'>
                  제목
                </Typography>
                <Typography variant='body1'>{event.boardPostDetail.title}</Typography>
              </Stack>
            </Grid>

            <Grid item xs={12}>
              <Stack spacing={1}>
                <Typography variant='subtitle2' color='text.secondary'>
                  이벤트 썸네일
                </Typography>
                <Typography variant='body1'>{event.description}</Typography>
              </Stack>
            </Grid>

            {event.thumbnailUrl && (
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    썸네일
                  </Typography>
                  <Box>
                    <img
                      src={event.thumbnailUrl}
                      alt='썸네일'
                      style={{
                        maxWidth: '300px',
                        maxHeight: '200px',
                        objectFit: 'contain',
                        border: '1px solid #e0e0e0',
                        borderRadius: '4px',
                      }}
                    />
                  </Box>
                </Stack>
              </Grid>
            )}

            <Grid item xs={12}>
              <Divider />
            </Grid>

            <Grid item xs={12}>
              <Stack spacing={1}>
                <Typography variant='subtitle2' color='text.secondary'>
                  내용
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <EditorContent editor={editor} />
                </Box>
              </Stack>
            </Grid>

            {event.videoUrl && (
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    영상url
                  </Typography>
                  <Typography
                    variant='body1'
                    component='a'
                    href={event.videoUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                  >
                    {event.videoUrl}
                  </Typography>
                </Stack>
              </Grid>
            )}

            {event.note && (
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    비고
                  </Typography>
                  <Typography variant='body1'>{event.note}</Typography>
                </Stack>
              </Grid>
            )}

            <Grid item xs={12}>
              <Stack spacing={1}>
                <Typography variant='subtitle2' color='text.secondary'>
                  조회수
                </Typography>
                <Typography variant='body1'>{event.boardPostDetail.viewsCount.toLocaleString()}</Typography>
              </Stack>
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            <Grid item xs={12}>
              <Stack direction='row' spacing={2} justifyContent='center'>
                <Button variant='outlined' size='large' component={RouterLink} to='/admin/events'>
                  취소
                </Button>
                <Button variant='contained' size='large' component={RouterLink} to={`/admin/events/${eventId}/edit`}>
                  수정
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </MainCard>
      </Grid>
    </Grid>
  );
}

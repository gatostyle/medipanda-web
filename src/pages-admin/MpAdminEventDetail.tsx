import { useMedipandaEditor } from '@/hooks/useMedipandaEditor';
import { useMpModal } from '@/hooks/useMpModal';
import { setSchema } from '@/lib/utils/url';
import { Box, Button, Card, Chip, CircularProgress, Divider, Stack, Typography } from '@mui/material';
import { EditorContent } from '@tiptap/react';
import { BoardExposureRangeLabel, type EventBoardDetailsResponse, getEventBoardDetails, PostAttachmentType } from '@/backend';
import { DATEFORMAT_YYYY_MM_DD, DateUtils } from '@/lib/utils/dateFormat';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';

export default function MpAdminEventDetail() {
  const navigate = useNavigate();
  const { eventId: paramEventId } = useParams();
  const eventId = Number(paramEventId);

  const { enqueueSnackbar } = useSnackbar();
  const [detail, setDetail] = useState<EventBoardDetailsResponse | null>(null);
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

  useEffect(() => {
    if (detail !== null) {
      editor.setEditable(false);
      editor.commands.setContent(detail.boardPostDetail.content);
      setEditorAttachments(detail.boardPostDetail.attachments.filter(a => a.type === PostAttachmentType.EDITOR));
    }
  }, [detail, editor]);

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
        <CircularProgress />
      </Box>
    );
  }

  if (!detail) {
    return null;
  }

  return (
    <Stack sx={{ gap: 3 }}>
      <Typography variant='h4'>이벤트 상세</Typography>

      <Card sx={{ padding: 3 }}>
        <Stack sx={{ gap: 3 }}>
          <Stack direction='row'>
            <Stack sx={{ flex: '1 0', gap: 1 }}>
              <Typography variant='subtitle2' color='text.secondary'>
                노출상태
              </Typography>
              <Box>
                <Chip
                  label={detail.boardPostDetail.isExposed ? '노출' : '미노출'}
                  color={detail.boardPostDetail.isExposed ? 'success' : 'default'}
                  variant='light'
                  size='small'
                />
              </Box>
            </Stack>

            <Stack sx={{ flex: '1 0', gap: 1 }}>
              <Typography variant='subtitle2' color='text.secondary'>
                노출범위
              </Typography>
              <Box>
                <Chip label={BoardExposureRangeLabel[detail.boardPostDetail.exposureRange]} color='success' variant='light' size='small' />
              </Box>
            </Stack>
          </Stack>

          <Stack spacing={1}>
            <Typography variant='subtitle2' color='text.secondary'>
              이벤트기간
            </Typography>
            <Typography variant='body1'>
              {DateUtils.parseUtcAndFormatKst(detail.eventStartDate, DATEFORMAT_YYYY_MM_DD)} ~{' '}
              {DateUtils.parseUtcAndFormatKst(detail.eventEndDate, DATEFORMAT_YYYY_MM_DD)}
            </Typography>
          </Stack>

          <Stack spacing={1}>
            <Typography variant='subtitle2' color='text.secondary'>
              제목
            </Typography>
            <Typography variant='body1'>{detail.boardPostDetail.title}</Typography>
          </Stack>

          <Stack spacing={1}>
            <Typography variant='subtitle2' color='text.secondary'>
              설명
            </Typography>
            <Typography variant='body1'>{detail.description}</Typography>
          </Stack>

          {detail.thumbnailUrl && (
            <Stack spacing={1}>
              <Typography variant='subtitle2' color='text.secondary'>
                썸네일
              </Typography>
              <Box>
                <img
                  src={detail.thumbnailUrl}
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
          )}

          <Divider />

          <Stack spacing={1}>
            <Typography variant='subtitle2' color='text.secondary'>
              내용
            </Typography>
            <Box sx={{ mt: 1 }}>
              <EditorContent editor={editor} />
            </Box>
          </Stack>

          {detail.videoUrl && (
            <Stack spacing={1}>
              <Typography variant='subtitle2' color='text.secondary'>
                영상url
              </Typography>
              <Typography
                variant='body1'
                component='a'
                href={setSchema(detail.videoUrl)}
                target='_blank'
                rel='noopener noreferrer'
                sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                {detail.videoUrl}
              </Typography>
            </Stack>
          )}

          {detail.note && (
            <Stack spacing={1}>
              <Typography variant='subtitle2' color='text.secondary'>
                비고
              </Typography>
              <Typography variant='body1'>{detail.note}</Typography>
            </Stack>
          )}

          <Stack spacing={1}>
            <Typography variant='subtitle2' color='text.secondary'>
              조회수
            </Typography>
            <Typography variant='body1'>{detail.boardPostDetail.viewsCount.toLocaleString()}</Typography>
          </Stack>

          <Divider />

          <Stack direction='row' spacing={2} justifyContent='center'>
            <Button variant='outlined' size='large' component={RouterLink} to='/admin/events'>
              취소
            </Button>
            <Button variant='contained' size='large' component={RouterLink} to={`/admin/events/${eventId}/edit`}>
              수정
            </Button>
          </Stack>
        </Stack>
      </Card>
    </Stack>
  );
}

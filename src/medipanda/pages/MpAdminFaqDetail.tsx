import { useMedipandaEditor } from '@/medipanda/components/useMedipandaEditor';
import { useMpModal } from '@/medipanda/hooks/useMpModal';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { Box, Button, Card, CircularProgress, Link, Stack, Typography } from '@mui/material';
import { EditorContent } from '@tiptap/react';
import { BoardDetailsResponse, getBoardDetails, PostAttachmentType } from '@/backend';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { formatYyyyMmDd } from '../utils/dateFormat';

export default function MpAdminCustomerCenterFaqDetail() {
  const navigate = useNavigate();
  const { boardId: paramBoardId } = useParams();
  const boardId = Number(paramBoardId);

  const { alertError } = useMpModal();
  const { enqueueSnackbar } = useSnackbar();
  const [detail, setDetail] = useState<BoardDetailsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDetail(boardId);
  }, [boardId]);

  const { editor, setAttachments: setEditorAttachments } = useMedipandaEditor();

  const fetchDetail = async (boardId: number) => {
    if (Number.isNaN(boardId)) {
      await alertError('잘못된 접근입니다.');
      return navigate('/admin/faqs');
    }

    setLoading(true);
    try {
      const detail = await getBoardDetails(boardId);
      setDetail(detail);

      editor.setEditable(false);
      editor.commands.setContent(detail.content);
      setEditorAttachments(detail.attachments.filter(a => a.type === PostAttachmentType.EDITOR));
    } catch (error) {
      console.error('Failed to fetch FAQ detail:', error);
      enqueueSnackbar('데이터를 불러오는데 실패했습니다.', { variant: 'error' });
      return window.history.back();
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

  if (detail === null) {
    return null;
  }

  return (
    <Stack sx={{ gap: 3 }}>
      <Typography variant='h4'>FAQ 상세</Typography>

      <Card component={Stack} sx={{ padding: 3, gap: 3 }}>
        <Stack>
          <Typography variant='body2' color='text.secondary'>
            제목
          </Typography>
          <Typography variant='body1'>{detail.title}</Typography>
        </Stack>

        <Stack>
          <Typography variant='body2' color='text.secondary'>
            내용
          </Typography>
          <Box sx={{ mt: 1 }}>
            <EditorContent editor={editor} />
          </Box>
        </Stack>

        <Stack>
          <Typography variant='body2' color='text.secondary'>
            첨부파일
          </Typography>
          {detail.attachments && detail.attachments.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {detail.attachments.map((file, index) => {
                return (
                  <Link
                    key={index}
                    href={file.fileUrl}
                    download
                    target='_blank'
                    rel='noopener noreferrer'
                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                    underline='hover'
                  >
                    <AttachFileIcon fontSize='small' />
                    {file.fileUrl}
                  </Link>
                );
              })}
            </Box>
          ) : (
            <Typography variant='body2'>-</Typography>
          )}
        </Stack>

        <Stack direction='row'>
          <Stack sx={{ flex: '1 0' }}>
            <Typography variant='body2' color='text.secondary'>
              노출상태
            </Typography>
            <Typography variant='body1'>{detail.isExposed ? '노출' : '미노출'}</Typography>
          </Stack>

          <Stack sx={{ flex: '1 0' }}>
            <Typography variant='body2' color='text.secondary'>
              조회수
            </Typography>
            <Typography variant='body1'>{detail.viewsCount.toLocaleString()}</Typography>
          </Stack>
        </Stack>

        <Stack>
          <Typography variant='body2' color='text.secondary'>
            작성일
          </Typography>
          <Typography variant='body1'>{formatYyyyMmDd(detail.createdAt)}</Typography>
        </Stack>

        <Stack direction='row' sx={{ justifyContent: 'center', gap: 2 }}>
          <Button
            variant='outlined'
            component={RouterLink}
            to='/admin/faqs'
            sx={{
              minWidth: 120,
            }}
          >
            취소
          </Button>
          <Button
            variant='contained'
            component={RouterLink}
            to={`/admin/faqs/${boardId}/edit`}
            sx={{
              minWidth: 120,
            }}
          >
            수정
          </Button>
        </Stack>
      </Card>
    </Stack>
  );
}

import { useMedipandaEditor } from '@/medipanda/components/useMedipandaEditor';
import { useMpModal } from '@/medipanda/hooks/useMpModal';
import { useSession } from '@/medipanda/hooks/useSession';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { Box, Button, Card, CircularProgress, Link, Stack, TextField, Typography } from '@mui/material';
import { EditorContent } from '@tiptap/react';
import { useFormik } from 'formik';
import {
  type BoardDetailsResponse,
  BoardExposureRange,
  BoardType,
  createBoardPost,
  getBoardDetails,
  PostAttachmentType,
  updateBoardPost,
} from '@/backend';
import { formatYyyyMmDdHhMm } from '@/medipanda/utils/dateFormat';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';

export default function MpAdminInquiryDetail() {
  const navigate = useNavigate();
  const { boardId: paramBoardId } = useParams();
  const isNew = paramBoardId === undefined;
  const boardId = Number(paramBoardId);

  const { enqueueSnackbar } = useSnackbar();
  const [detail, setDetail] = useState<BoardDetailsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const { session } = useSession();

  const { alert, alertError } = useMpModal();

  const formik = useFormik({
    initialValues: {
      newFiles: [] as File[],
    },
    onSubmit: async values => {
      if (isNew) return;

      if (responseEditor.getHTML() === '<p></p>') {
        await alert('답변 내용을 입력하세요.');
        return;
      }

      try {
        if (detail!.children.length === 0) {
          await createBoardPost({
            request: {
              boardType: BoardType.INQUIRY,
              title: '',
              content: responseEditor.getHTML(),
              userId: session!.userId,
              nickname: session!.name,
              hiddenNickname: false,
              parentId: boardId,
              isExposed: true,
              editorFileIds: responseEditorAttachments.map(image => image.s3fileId),
              exposureRange: BoardExposureRange.ALL,
              noticeProperties: null,
            },
            files: values.newFiles,
          });
        } else {
          await updateBoardPost(detail!.children[0].id, {
            updateRequest: {
              title: '',
              content: responseEditor.getHTML(),
              hiddenNickname: null,
              isBlind: null,
              isExposed: null,
              exposureRange: BoardExposureRange.ALL,
              keepFileIds: [
                ...(detail!.children[0].attachments.filter(a => a.type === PostAttachmentType.ATTACHMENT) ?? []),
                ...responseEditorAttachments,
              ].map(file => file.s3fileId),
              editorFileIds: responseEditorAttachments.map(image => image.s3fileId),
              noticeProperties: null,
            },
            newFiles: values.newFiles,
          });
        }
        enqueueSnackbar('답변이 저장되었습니다.', { variant: 'success' });
        navigate('/admin/inquiries');
      } catch (error) {
        console.error('Failed to save response:', error);
        await alertError('답변 저장 중 오류가 발생했습니다.');
      }
    },
  });

  const { editor, setAttachments: setEditorAttachments } = useMedipandaEditor();
  const {
    editor: responseEditor,
    attachments: responseEditorAttachments,
    setAttachments: setResponseEditorAttachments,
  } = useMedipandaEditor();

  useEffect(() => {
    if (!isNew) {
      fetchDetail(boardId);
    }
  }, [boardId]);

  useEffect(() => {
    if (detail !== null) {
      editor.setEditable(false);
      editor.commands.setContent(detail.content);
      setEditorAttachments(detail.attachments.filter(a => a.type === PostAttachmentType.EDITOR));

      if (detail.children.length > 0) {
        responseEditor.commands.setContent(detail.children[0].content);
        responseEditor.setEditable(false);
        setResponseEditorAttachments(detail.children[0].attachments.filter(a => a.type === PostAttachmentType.EDITOR));
      }
    }
  }, [detail, editor]);

  const fetchDetail = async (boardId: number) => {
    if (Number.isNaN(boardId)) {
      await alertError('잘못된 접근입니다.');
      return navigate('/admin/inquiries');
    }

    setLoading(true);
    try {
      const detail = await getBoardDetails(boardId);
      setDetail(detail);
    } catch (error) {
      console.error('Failed to fetch inquiry detail:', error);
      enqueueSnackbar('문의 정보를 불러오는데 실패했습니다.', { variant: 'error' });
      return window.history.back();
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (detail === null) {
    return null;
  }

  return (
    <Stack sx={{ gap: 3 }}>
      <Typography variant='h4'>1:1 문의 수정</Typography>

      <Card component={Stack} sx={{ padding: 3, gap: 3 }}>
        <Stack direction='row' sx={{ gap: 2 }}>
          <Stack sx={{ flex: '1 0', gap: 2 }}>
            <Typography variant='subtitle2' color='text.secondary'>
              회원정보
            </Typography>
            <TextField
              fullWidth
              size='small'
              value={`${detail.nickname}(${detail.userId})`}
              InputProps={{ readOnly: true }}
              sx={{ '& .MuiInputBase-input': { backgroundColor: '#f5f5f5' } }}
            />
          </Stack>
          <Stack sx={{ flex: '1 0', gap: 2 }}>
            <Typography variant='subtitle2' color='text.secondary'>
              회사정보
            </Typography>
            <TextField
              fullWidth
              size='small'
              value={'-'}
              InputProps={{ readOnly: true }}
              sx={{ '& .MuiInputBase-input': { backgroundColor: '#f5f5f5' } }}
            />
          </Stack>
          <Stack sx={{ flex: '1 0', gap: 2 }}>
            <Typography variant='subtitle2' color='text.secondary'>
              휴대폰번호
            </Typography>
            <TextField
              fullWidth
              size='small'
              value={'-'}
              InputProps={{ readOnly: true }}
              sx={{ '& .MuiInputBase-input': { backgroundColor: '#f5f5f5' } }}
            />
          </Stack>
        </Stack>

        <Stack sx={{ gap: 2 }}>
          <Typography variant='subtitle2' color='text.secondary'>
            제목
          </Typography>
          <TextField
            fullWidth
            size='small'
            value={detail.title}
            InputProps={{ readOnly: true }}
            sx={{ '& .MuiInputBase-input': { backgroundColor: '#f5f5f5' } }}
          />
        </Stack>

        <Stack sx={{ gap: 2 }}>
          <Typography variant='subtitle2' color='text.secondary'>
            내용
          </Typography>
          <EditorContent editor={editor} />
        </Stack>

        <Stack sx={{ gap: 2 }}>
          <Typography variant='subtitle2' color='text.secondary'>
            첨부파일
          </Typography>
          {detail.attachments
            .filter(a => a.type === PostAttachmentType.ATTACHMENT)
            .map(file => {
              return (
                <Box key={file.s3fileId} sx={{ mb: 1 }}>
                  <Link
                    href={file.fileUrl}
                    download
                    target='_blank'
                    rel='noopener noreferrer'
                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                    underline='hover'
                  >
                    <AttachFileIcon fontSize='small' />
                    {file.originalFileName}
                  </Link>
                </Box>
              );
            })}
        </Stack>

        <Stack sx={{ gap: 2 }}>
          <Typography variant='subtitle2' color='text.secondary'>
            문의시간
          </Typography>
          <TextField
            fullWidth
            size='small'
            value={formatYyyyMmDdHhMm(detail.createdAt)}
            InputProps={{ readOnly: true }}
            sx={{ '& .MuiInputBase-input': { backgroundColor: '#f5f5f5' } }}
          />
        </Stack>

        <Stack sx={{ gap: 2 }}>
          <Typography variant='subtitle2' color='text.secondary'>
            답변내용
          </Typography>
          <Stack
            sx={{
              '.tiptap': {
                padding: '20px 10px',
                border: '1px solid #c4c4c4',
              },
            }}
          >
            <EditorContent editor={responseEditor} />
          </Stack>
        </Stack>

        {detail.children.length > 0 && (
          <>
            <Stack sx={{ gap: 2 }}>
              <Typography variant='subtitle2' color='text.secondary'>
                첨부파일
              </Typography>
              {detail.children[0].attachments
                .filter(a => a.type === PostAttachmentType.ATTACHMENT)
                .map(file => {
                  return (
                    <Box key={file.s3fileId} sx={{ mb: 1 }}>
                      <Link
                        href={file.fileUrl}
                        download
                        target='_blank'
                        rel='noopener noreferrer'
                        sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                        underline='hover'
                      >
                        <AttachFileIcon fontSize='small' />
                        {file.originalFileName}
                      </Link>
                    </Box>
                  );
                })}
            </Stack>
            <Stack sx={{ gap: 2 }}>
              <Typography variant='subtitle2' color='text.secondary'>
                답변시간
              </Typography>
              <TextField
                fullWidth
                size='small'
                value={formatYyyyMmDdHhMm(detail.children[0].createdAt)}
                InputProps={{ readOnly: true }}
                sx={{ '& .MuiInputBase-input': { backgroundColor: '#f5f5f5' } }}
              />
            </Stack>
          </>
        )}

        <Stack direction='row' sx={{ justifyContent: 'center', gap: 2 }}>
          {detail.children.length > 0 ? (
            <Button variant='outlined' size='large' component={RouterLink} to='/admin/inquiries'>
              뒤로
            </Button>
          ) : (
            <>
              <Button variant='outlined' size='large' component={RouterLink} to='/admin/inquiries'>
                취소
              </Button>
              <Button variant='contained' size='large' onClick={() => formik.handleSubmit()}>
                답변하기
              </Button>
            </>
          )}
        </Stack>
      </Card>
    </Stack>
  );
}

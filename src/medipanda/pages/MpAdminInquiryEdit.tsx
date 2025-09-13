import { useMedipandaEditor } from '@/medipanda/components/useMedipandaEditor';
import { useMpModal } from '@/medipanda/hooks/useMpModal';
import { useSession } from '@/medipanda/hooks/useSession';
import { Box, Button, CircularProgress, Grid, Stack, TextField, Typography } from '@mui/material';
import { EditorContent } from '@tiptap/react';
import MainCard from 'components/MainCard';
import { useFormik } from 'formik';
import {
  BoardDetailsResponse,
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
import { useNavigate, useParams } from 'react-router-dom';

export default function MpAdminInquiryEdit() {
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
        await alert('답변 내용을 입력해주세요.');
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
        await alert('답변이 저장되었습니다.');
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

  const fetchDetail = async (boardId: number) => {
    if (Number.isNaN(boardId)) {
      await alertError('잘못된 접근입니다.');
      return navigate('/admin/inquiries');
    }

    setLoading(true);
    try {
      const detail = await getBoardDetails(boardId);
      setDetail(detail);

      editor.commands.setContent(detail.content);
      editor.setEditable(false);
      setEditorAttachments(detail.attachments.filter(a => a.type === PostAttachmentType.EDITOR));

      if (detail.children.length > 0) {
        responseEditor.commands.setContent(detail.children[0].content);
        setResponseEditorAttachments(detail.children[0].attachments.filter(a => a.type === PostAttachmentType.EDITOR));
      }
    } catch (error) {
      console.error('Failed to fetch inquiry detail:', error);
      enqueueSnackbar('문의 정보를 불러오는데 실패했습니다.', { variant: 'error' });
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
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant='h4' gutterBottom>
          1:1 문의 수정
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <MainCard>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Box>
                    <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                      회원정보
                    </Typography>
                    <TextField
                      fullWidth
                      size='small'
                      value={`${detail.nickname}(${detail.userId})`}
                      InputProps={{ readOnly: true }}
                      sx={{ '& .MuiInputBase-input': { backgroundColor: '#f5f5f5' } }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box>
                    <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                      회사정보
                    </Typography>
                    <TextField
                      fullWidth
                      size='small'
                      value={'-'}
                      InputProps={{ readOnly: true }}
                      sx={{ '& .MuiInputBase-input': { backgroundColor: '#f5f5f5' } }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box>
                    <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                      휴대폰번호
                    </Typography>
                    <TextField
                      fullWidth
                      size='small'
                      value={'-'}
                      InputProps={{ readOnly: true }}
                      sx={{ '& .MuiInputBase-input': { backgroundColor: '#f5f5f5' } }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Box>
                <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                  제목
                </Typography>
                <TextField
                  fullWidth
                  size='small'
                  value={detail.title}
                  InputProps={{ readOnly: true }}
                  sx={{ '& .MuiInputBase-input': { backgroundColor: '#f5f5f5' } }}
                />
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Box>
                <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                  내용
                </Typography>
                <EditorContent editor={editor} />
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Typography variant='subtitle2' color='text.secondary' gutterBottom></Typography>
            </Grid>

            <Grid item xs={12}>
              <Box>
                <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                  문의시간
                </Typography>
                <TextField
                  fullWidth
                  size='small'
                  value={formatYyyyMmDdHhMm(detail.createdAt)}
                  InputProps={{ readOnly: true }}
                  sx={{ '& .MuiInputBase-input': { backgroundColor: '#f5f5f5' } }}
                />
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Box>
                <Typography variant='subtitle2' color='text.secondary' gutterBottom>
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
              </Box>
            </Grid>

            {detail.children.length > 0 && (
              <Grid item xs={12}>
                <Box>
                  <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                    답변시간
                  </Typography>
                  <TextField
                    fullWidth
                    size='small'
                    value={formatYyyyMmDdHhMm(detail.children[0].createdAt)}
                    InputProps={{ readOnly: true }}
                    sx={{ '& .MuiInputBase-input': { backgroundColor: '#f5f5f5' } }}
                  />
                </Box>
              </Grid>
            )}

            <Grid item xs={12}>
              <Stack direction='row' spacing={2} justifyContent='center'>
                <Button variant='outlined' size='large' onClick={() => window.history.back()}>
                  취소
                </Button>
                <Button variant='contained' size='large' onClick={() => formik.handleSubmit()}>
                  답변하기
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </MainCard>
      </Grid>
    </Grid>
  );
}

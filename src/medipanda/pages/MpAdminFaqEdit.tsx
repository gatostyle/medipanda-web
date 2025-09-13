import { useMedipandaEditor } from '@/medipanda/components/useMedipandaEditor';
import { Close } from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  Link,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { EditorContent } from '@tiptap/react';
import MainCard from 'components/MainCard';
import { useFormik } from 'formik';
import {
  AttachmentResponse,
  BoardExposureRange,
  BoardType,
  createBoardPost,
  getBoardDetails,
  PostAttachmentType,
  updateBoardPost,
} from '@/backend';
import { useSession } from '@/medipanda/hooks/useSession';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';

export default function MpAdminFaqEdit() {
  const navigate = useNavigate();
  const { boardId: paramBoardId } = useParams();
  const isNew = paramBoardId === undefined;
  const boardId = Number(paramBoardId);

  const { enqueueSnackbar } = useSnackbar();
  const { session } = useSession();
  const [loading, setLoading] = useState(false);

  const { editor, attachments: editorAttachments, setAttachments: setEditorAttachments } = useMedipandaEditor();

  const formik = useFormik({
    initialValues: {
      title: '',
      isExposed: true,
      attachedFiles: [] as AttachmentResponse[],
      newFiles: [] as File[],
    },
    onSubmit: async (values, { setSubmitting }) => {
      if (values.title === '') {
        alert('제목을 입력해주세요.');
        return;
      }

      try {
        if (isNew) {
          await createBoardPost({
            request: {
              boardType: BoardType.FAQ,
              title: values.title,
              content: editor.getHTML(),
              userId: session!.userId,
              nickname: session!.name,
              hiddenNickname: false,
              parentId: null,
              isExposed: values.isExposed,
              editorFileIds: editorAttachments.map(image => image.s3fileId),
              exposureRange: BoardExposureRange.ALL,
              noticeProperties: null,
            },
            files: values.newFiles && values.newFiles.length > 0 ? values.newFiles : undefined,
          });
          enqueueSnackbar('FAQ가 성공적으로 등록되었습니다.', { variant: 'success' });
          navigate('/admin/faqs');
        } else {
          await updateBoardPost(boardId, {
            updateRequest: {
              title: values.title,
              content: editor.getHTML(),
              hiddenNickname: null,
              isBlind: null,
              isExposed: values.isExposed,
              exposureRange: BoardExposureRange.ALL,
              keepFileIds: [...values.attachedFiles, ...editorAttachments].map(file => file.s3fileId),
              editorFileIds: editorAttachments.map(attachment => attachment.s3fileId),
              noticeProperties: null,
            },
            newFiles: values.newFiles ? values.newFiles : undefined,
          });
          enqueueSnackbar('FAQ가 성공적으로 수정되었습니다.', { variant: 'success' });
          navigate(`/admin/faqs/${boardId}`);
        }
      } catch (error) {
        console.error('Failed to submit form:', error);
        enqueueSnackbar(isNew ? 'FAQ 등록에 실패했습니다.' : 'FAQ 수정에 실패했습니다.', { variant: 'error' });
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (!isNew) {
      fetchDetail(boardId);
    }
  }, [isNew, boardId]);

  const fetchDetail = async (boardId: number) => {
    if (Number.isNaN(boardId)) {
      alert('잘못된 접근입니다.');
      return navigate('/admin/faqs');
    }

    setLoading(true);
    try {
      const detail = await getBoardDetails(boardId);

      editor.commands.setContent(detail.content);
      setEditorAttachments(detail.attachments.filter(a => a.type === PostAttachmentType.EDITOR));

      formik.setValues({
        title: detail.title,
        isExposed: detail.isExposed,
        attachedFiles: detail.attachments.filter(a => a.type === PostAttachmentType.ATTACHMENT),
        newFiles: [],
      });
    } catch (error) {
      console.error('Failed to fetch FAQ detail:', error);
      enqueueSnackbar('데이터를 불러오는데 실패했습니다.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length > 0) {
      formik.setFieldValue('newFiles', [...formik.values.newFiles, ...files]);
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
    <form onSubmit={formik.handleSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant='h4' gutterBottom>
            FAQ 등록
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <MainCard>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant='body2' color='text.secondary' gutterBottom>
                  제목
                </Typography>
                <TextField fullWidth name='title' placeholder='' value={formik.values.title} onChange={formik.handleChange} />
              </Grid>

              <Grid item xs={12}>
                <Typography variant='body2' color='text.secondary' gutterBottom>
                  내용
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
                <Typography variant='body2' color='text.secondary' gutterBottom>
                  첨부파일
                </Typography>
                <Button variant='contained' component='label'>
                  파일첨부
                  <input type='file' hidden multiple onChange={handleFileChange} accept='*' />
                </Button>

                {(formik.values.attachedFiles.length > 0 || formik.values.newFiles.length > 0) && (
                  <Stack sx={{ mt: 2 }}>
                    {formik.values.attachedFiles.map(file => (
                      <Stack key={file.s3fileId} direction='row' alignItems='center'>
                        <Link component={RouterLink} to={file.fileUrl} target='_blank'>
                          {file.originalFileName}
                        </Link>
                        <IconButton
                          size='small'
                          onClick={() => {
                            formik.setFieldValue(
                              'attachedFiles',
                              formik.values.attachedFiles.filter(a => a.s3fileId !== file.s3fileId),
                            );
                          }}
                          sx={{
                            marginLeft: '10px',
                          }}
                        >
                          <Close />
                        </IconButton>
                      </Stack>
                    ))}
                    {formik.values.newFiles.map((file, index) => (
                      <Stack key={`${index}:${file.name}`} direction='row' alignItems='center'>
                        <Link underline='none'>{file.name}</Link>
                        <IconButton
                          size='small'
                          onClick={() => {
                            formik.setFieldValue(
                              'newFiles',
                              formik.values.newFiles.filter((_, i) => i !== index),
                            );
                          }}
                          sx={{
                            marginLeft: '10px',
                          }}
                        >
                          <Close />
                        </IconButton>
                      </Stack>
                    ))}
                  </Stack>
                )}
              </Grid>

              <Grid item xs={12}>
                <Typography variant='body2' color='text.secondary' gutterBottom>
                  노출상태
                </Typography>
                <FormControl component='fieldset'>
                  <RadioGroup
                    row
                    value={formik.values.isExposed ? 'visible' : 'hidden'}
                    onChange={e => formik.setFieldValue('isExposed', e.target.value === 'visible')}
                  >
                    <FormControlLabel value='visible' control={<Radio />} label='노출' />
                    <FormControlLabel value='hidden' control={<Radio />} label='미노출' />
                  </RadioGroup>
                </FormControl>
              </Grid>
            </Grid>

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button
                variant='outlined'
                onClick={() => window.history.back()}
                sx={{
                  minWidth: 120,
                }}
                disabled={formik.isSubmitting}
              >
                취소
              </Button>
              <Button
                variant='contained'
                type='submit'
                sx={{
                  minWidth: 120,
                }}
                disabled={formik.isSubmitting}
                startIcon={formik.isSubmitting ? <CircularProgress size={20} /> : null}
              >
                {formik.isSubmitting ? '저장 중...' : '저장'}
              </Button>
            </Box>
          </MainCard>
        </Grid>
      </Grid>
    </form>
  );
}

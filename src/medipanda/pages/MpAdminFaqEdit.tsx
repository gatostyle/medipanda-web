import { useMedipandaEditor } from '@/medipanda/components/useMedipandaEditor';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { EditorContent } from '@tiptap/react';
import MainCard from 'components/MainCard';
import { useFormik } from 'formik';
import { AttachmentResponse, createBoardPost, getBoardDetails, updateBoardPost } from '@/backend';
import { useSession } from '@/medipanda/hooks/useSession';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as Yup from 'yup';

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
      files: [] as File[],
      attachedFiles: [] as AttachmentResponse[],
      newFiles: [] as File[],
    },
    validationSchema: Yup.object().shape({
      title: Yup.string().required('제목을 입력해주세요.').max(100, '제목은 100자를 초과할 수 없습니다.'),
      content: Yup.string().required('내용을 입력해주세요.'),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      if (!session?.userId) {
        enqueueSnackbar('로그인이 필요합니다.', { variant: 'error' });
        return;
      }

      try {
        if (isNew) {
          await createBoardPost({
            request: {
              boardType: 'FAQ',
              title: values.title,
              content: editor.getHTML(),
              userId: session.userId,
              nickname: session.name,
              hiddenNickname: false,
              parentId: null,
              isExposed: values.isExposed,
              editorFileIds: editorAttachments.map(image => image.s3fileId),
              exposureRange: 'ALL',
              noticeProperties: null,
            },
            files: values.files && values.files.length > 0 ? values.files : undefined,
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
              exposureRange: 'ALL',
              keepFileIds: [...values.attachedFiles, ...editorAttachments].map(file => file.s3fileId),
              editorFileIds: editorAttachments.map(attachment => attachment.s3fileId),
              noticeProperties: null,
            },
            newFiles: values.files ? values.files : undefined,
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
      fetchData(boardId);
    }
  }, [isNew, boardId]);

  const fetchData = async (boardId: number) => {
    if (Number.isNaN(boardId)) {
      alert('잘못된 접근입니다.');
      return navigate('/admin/faqs');
    }

    setLoading(true);
    try {
      const response = await getBoardDetails(boardId);
      formik.setValues({
        title: response.title,
        isExposed: response.isExposed,
        files: [],
        attachedFiles: response.attachments.filter(a => a.type === 'ATTACHMENT'),
        newFiles: [],
      });
      editor.commands.setContent(response.content);
      setEditorAttachments(response.attachments.filter(a => a.type === 'EDITOR'));
    } catch (error) {
      console.error('Failed to fetch FAQ detail:', error);
      enqueueSnackbar('데이터를 불러오는데 실패했습니다.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/faqs');
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length > 0) {
      formik.setFieldValue('files', [...formik.values.files, ...files]);
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
                <TextField
                  fullWidth
                  name='title'
                  placeholder=''
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={!!(formik.touched.title && formik.errors.title)}
                  helperText={formik.touched.title && formik.errors.title}
                />
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
                <Button
                  variant='contained'
                  component='label'
                  sx={{
                    bgcolor: '#4caf50',
                    '&:hover': { bgcolor: '#45a049' },
                  }}
                >
                  파일첨부
                  <input type='file' hidden multiple onChange={handleFileChange} accept='*' />
                </Button>

                {formik.values.attachedFiles && formik.values.attachedFiles.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant='body2' sx={{ mb: 1 }}>
                      기존 파일:
                    </Typography>
                    {formik.values.attachedFiles.map((fileId, index) => (
                      <Chip
                        key={index}
                        label={`파일 ${index + 1}`}
                        onDelete={() => {
                          formik.setFieldValue(
                            'attachedFiles',
                            formik.values.attachedFiles.filter((_, i) => i !== index),
                          );
                        }}
                        sx={{ mr: 1, mb: 1 }}
                      />
                    ))}
                  </Box>
                )}

                {formik.values.files && formik.values.files.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant='body2' sx={{ mb: 1 }}>
                      새 파일:
                    </Typography>
                    {formik.values.files.map((file, index) => (
                      <Chip
                        key={index}
                        label={file.name}
                        onDelete={() => {
                          formik.setFieldValue(
                            'files',
                            formik.values.files.filter((_, i) => i !== index),
                          );
                        }}
                        sx={{ mr: 1, mb: 1 }}
                      />
                    ))}
                  </Box>
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
                onClick={handleCancel}
                sx={{
                  minWidth: 120,
                  color: '#666',
                  borderColor: '#ccc',
                  '&:hover': {
                    borderColor: '#999',
                    bgcolor: '#f5f5f5',
                  },
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
                  bgcolor: '#4caf50',
                  '&:hover': { bgcolor: '#45a049' },
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

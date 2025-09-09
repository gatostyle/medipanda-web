import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  Radio,
  RadioGroup,
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
import { useMedipandaEditor } from '../components/useMedipandaEditor';

export default function MpAdminAtoZEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { session } = useSession();
  const [loading, setLoading] = useState(false);

  const isNew = id === undefined;

  const formik = useFormik({
    initialValues: {
      title: '',
      attachedFiles: [] as AttachmentResponse[],
      newFiles: [] as File[],
      isExposed: true,
    },
    validationSchema: Yup.object().shape({
      title: Yup.string().required('제목을 입력해주세요.').max(100, '제목은 100자를 초과할 수 없습니다.'),
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
              boardType: 'CSO_A_TO_Z',
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
            files: values.newFiles,
          });
          enqueueSnackbar('CSO A to Z가 성공적으로 등록되었습니다.', { variant: 'success' });
        } else {
          await updateBoardPost(parseInt(id), {
            updateRequest: {
              title: values.title,
              content: editor.getHTML(),
              hiddenNickname: null,
              isBlind: null,
              isExposed: values.isExposed,
              exposureRange: 'ALL',
              keepFileIds: [...values.attachedFiles, ...editorAttachments].map(file => file.s3fileId),
              editorFileIds: editorAttachments.map(image => image.s3fileId),
              noticeProperties: null,
            },
            newFiles: values.newFiles,
          });
          enqueueSnackbar('CSO A to Z가 성공적으로 수정되었습니다.', { variant: 'success' });
        }
        navigate('/admin/atoz');
      } catch (error) {
        console.error('Failed to submit form:', error);
        enqueueSnackbar(isNew ? 'CSO A to Z 등록에 실패했습니다.' : 'CSO A to Z 수정에 실패했습니다.', { variant: 'error' });
      } finally {
        setSubmitting(false);
      }
    },
  });

  const { editor, attachments: editorAttachments, setAttachments: setEditorAttachments } = useMedipandaEditor();

  useEffect(() => {
    if (!isNew && id) {
      fetchData(parseInt(id, 10));
    }
  }, [id, isNew]);

  const fetchData = async (itemId: number) => {
    setLoading(true);
    try {
      const response = await getBoardDetails(itemId);
      formik.setValues({
        title: response.title,
        isExposed: response.isExposed,
        attachedFiles: response.attachments.filter(a => a.type === 'ATTACHMENT'),
        newFiles: [],
      });
      editor.commands.setContent(response.content);
      setEditorAttachments(response.attachments.filter(a => a.type === 'EDITOR'));
      console.log('Fetched CSO A to Z detail:', response);
    } catch (error) {
      console.error('Failed to fetch CSO A to Z detail:', error);
      enqueueSnackbar('데이터를 불러오는데 실패했습니다.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = async () => {
      formik.setFieldValue('newFiles', [...formik.values.newFiles, ...(Array.from(input.files ?? []) as File[])]);
    };
    input.click();
  };

  const handleCancel = () => {
    if (isNew) {
      navigate('/admin/atoz');
    } else {
      navigate(`/admin/atoz/${id}`);
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
            CSO A TO Z {isNew ? '등록' : '상세'}
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <MainCard>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name='title'
                  label='제목'
                  placeholder=''
                  required
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={!!(formik.touched.title && formik.errors.title)}
                  helperText={formik.touched.title && formik.errors.title}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant='body2' sx={{ mb: 1 }}>
                  내용 <span style={{ color: 'red' }}>*</span>
                </Typography>
                <EditorContent editor={editor} />
              </Grid>

              <Grid item xs={12}>
                <Typography variant='body2' sx={{ mb: 1 }}>
                  첨부파일
                </Typography>
                <Button onClick={handleFileUpload} variant='contained' color='success' component='label' size='small'>
                  파일첨부
                </Button>
                {formik.values.attachedFiles.map(attachedFile => {
                  return (
                    <Typography variant='body2' sx={{ mt: 1 }}>
                      {attachedFile.originalFileName}
                    </Typography>
                  );
                })}
                {formik.values.newFiles.map(newFile => {
                  return (
                    <Typography variant='body2' sx={{ mt: 1 }}>
                      {newFile.name}
                    </Typography>
                  );
                })}
              </Grid>

              <Grid item xs={12}>
                <FormControl component='fieldset'>
                  <FormLabel component='legend'>노출상태</FormLabel>
                  <RadioGroup
                    row
                    value={formik.values.isExposed ? 'true' : 'false'}
                    onChange={e => formik.setFieldValue('isExposed', e.target.value === 'true')}
                  >
                    <FormControlLabel value='true' control={<Radio />} label='노출' />
                    <FormControlLabel value='false' control={<Radio />} label='미노출' />
                  </RadioGroup>
                </FormControl>
              </Grid>
            </Grid>

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button variant='outlined' onClick={handleCancel} sx={{ minWidth: 120 }} disabled={formik.isSubmitting}>
                취소
              </Button>
              <Button
                variant='contained'
                color='success'
                type='submit'
                sx={{ minWidth: 120 }}
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

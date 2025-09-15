import { useMpModal } from '@/medipanda/hooks/useMpModal';
import { Close } from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormLabel,
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
import { useMedipandaEditor } from '../components/useMedipandaEditor';

export default function MpAdminAtoZEdit() {
  const navigate = useNavigate();
  const { boardId: paramBoardId } = useParams();
  const isNew = paramBoardId === undefined;
  const boardId = Number(paramBoardId);

  const { enqueueSnackbar } = useSnackbar();
  const { session } = useSession();
  const [loading, setLoading] = useState(false);

  const { alert, alertError } = useMpModal();

  const formik = useFormik({
    initialValues: {
      title: '',
      attachedFiles: [] as AttachmentResponse[],
      newFiles: [] as File[],
      isExposed: true,
    },
    onSubmit: async (values, { setSubmitting }) => {
      if (values.title === '') {
        await alert('제목을 입력하세요.');
        return;
      }

      try {
        if (isNew) {
          await createBoardPost({
            request: {
              boardType: BoardType.CSO_A_TO_Z,
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
            files: values.newFiles,
          });
          enqueueSnackbar('CSO A to Z가 성공적으로 등록되었습니다.', { variant: 'success' });
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
        await alertError(isNew ? 'CSO A to Z 등록에 실패했습니다.' : 'CSO A to Z 수정에 실패했습니다.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const { editor, attachments: editorAttachments, setAttachments: setEditorAttachments } = useMedipandaEditor();

  useEffect(() => {
    if (!isNew) {
      fetchDetail(boardId);
    }
  }, [isNew, boardId]);

  const fetchDetail = async (itemId: number) => {
    setLoading(true);
    try {
      const detail = await getBoardDetails(itemId);

      editor.commands.setContent(detail.content);
      setEditorAttachments(detail.attachments.filter(a => a.type === PostAttachmentType.EDITOR));

      formik.setValues({
        title: detail.title,
        isExposed: detail.isExposed,
        attachedFiles: detail.attachments.filter(a => a.type === PostAttachmentType.ATTACHMENT),
        newFiles: [],
      });
    } catch (error) {
      console.error('Failed to fetch CSO A to Z detail:', error);
      enqueueSnackbar('데이터를 불러오는데 실패했습니다.', { variant: 'error' });
      return window.history.back();
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
                <Button onClick={handleFileUpload} variant='contained' component='label' size='small'>
                  파일첨부
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
              <Button
                variant='outlined'
                component={RouterLink}
                to={isNew ? '/admin/atoz' : `/admin/atoz/${boardId}`}
                sx={{ minWidth: 120 }}
                disabled={formik.isSubmitting}
              >
                취소
              </Button>
              <Button
                variant='contained'
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

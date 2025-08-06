import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import { useSnackbar } from 'notistack';
import MainCard from 'components/MainCard';
import { TiptapEditor } from 'medipanda/components/TiptapEditor';
import { getBoardDetails, createBoardPost, updateBoardPost } from 'medipanda/backend';
import { useMpSession } from 'medipanda/hooks/useMpSession';

const validationSchema = Yup.object().shape({
  title: Yup.string().required('제목을 입력해주세요.').max(100, '제목은 100자를 초과할 수 없습니다.'),
  content: Yup.string().required('내용을 입력해주세요.')
});

export default function MpAdminContentManagementAtoZEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { session } = useMpSession();
  const [loading, setLoading] = useState(false);

  const isNew = !id;

  const formik = useFormik({
    initialValues: {
      title: '',
      content: '',
      isExposed: true,
      attachmentFile: null as File | null
    },
    validationSchema,
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
              content: values.content,
              userId: session.userId,
              nickname: session.name,
              parentId: null,
              isExposed: values.isExposed,
              editorFileIds: null,
              exposureRange: 'ALL',
              noticeProperties: null
            },
            files: values.attachmentFile ? [values.attachmentFile] : undefined
          });
          enqueueSnackbar('CSO A to Z가 성공적으로 등록되었습니다.', { variant: 'success' });
        } else {
          await updateBoardPost(parseInt(id!), {
            updateRequest: {
              title: values.title,
              content: values.content,
              isBlind: null,
              isExposed: values.isExposed,
              exposureRange: 'ALL',
              keepFileIds: [],
              editorFileIds: [],
              noticeProperties: null
            },
            newFiles: values.attachmentFile ? [values.attachmentFile] : undefined
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
    }
  });

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
        content: response.content,
        isExposed: response.isExposed,
        attachmentFile: null
      });
    } catch (error) {
      console.error('Failed to fetch CSO A to Z detail:', error);
      enqueueSnackbar('데이터를 불러오는데 실패했습니다.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <form onSubmit={formik.handleSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4" gutterBottom>
            CSO A TO Z {isNew ? '등록' : '상세'}
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <MainCard>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="title"
                  label="제목"
                  placeholder=""
                  required
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={!!(formik.touched.title && formik.errors.title)}
                  helperText={formik.touched.title && formik.errors.title}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  내용 <span style={{ color: 'red' }}>*</span>
                </Typography>
                <TiptapEditor
                  content={formik.values.content}
                  onChange={(content) => formik.setFieldValue('content', content)}
                  placeholder="내용을 입력하세요"
                  error={!!(formik.touched.content && formik.errors.content)}
                  helperText={formik.touched.content && formik.errors.content ? formik.errors.content : undefined}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  첨부파일
                </Typography>
                <Button variant="contained" color="success" component="label" size="small">
                  파일첨부
                  <input
                    type="file"
                    hidden
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      formik.setFieldValue('attachmentFile', file ?? null);
                    }}
                  />
                </Button>
                {formik.values.attachmentFile && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    선택된 파일: {formik.values.attachmentFile.name}
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">노출상태</FormLabel>
                  <RadioGroup
                    row
                    value={formik.values.isExposed ? 'true' : 'false'}
                    onChange={(e) => formik.setFieldValue('isExposed', e.target.value === 'true')}
                  >
                    <FormControlLabel value="true" control={<Radio />} label="노출" />
                    <FormControlLabel value="false" control={<Radio />} label="미노출" />
                  </RadioGroup>
                </FormControl>
              </Grid>
            </Grid>

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button variant="outlined" onClick={handleCancel} sx={{ minWidth: 120 }} disabled={formik.isSubmitting}>
                취소
              </Button>
              <Button
                variant="contained"
                color="success"
                type="submit"
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

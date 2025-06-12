import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch';
import Chip from '@mui/material/Chip';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import { useSnackbar } from 'notistack';
import MainCard from 'components/MainCard';
import { TiptapEditor } from 'medipanda/components/TiptapEditor';
import { useMpSession } from 'medipanda/hooks/useMpSession';
import { NOTICE_TYPE_LABELS } from 'medipanda/ui-labels';
import { createBoardPost, getBoardDetails, updateBoardPost } from 'medipanda/backend';
import { mockNumber } from 'medipanda/mockup';

const noticeCategoryOptions = Object.entries(NOTICE_TYPE_LABELS).map(([value, label]) => ({
  label,
  value: value as
    | 'PRODUCT_STATUS'
    | 'MANUFACTURING_SUSPENSION'
    | 'NEW_PRODUCT'
    | 'POLICY'
    | 'GENERAL'
    | 'ANONYMOUS_BOARD'
    | 'MR_CSO_MATCHING'
}));

const validationSchema = Yup.object().shape({
  title: Yup.string().required('제목을 입력해주세요.').max(100, '제목은 100자를 초과할 수 없습니다.'),
  content: Yup.string().required('내용을 입력해주세요.'),
  noticeCategory: Yup.string().required('공지분류를 선택해주세요.'),
  manufacturerName: Yup.string().when('noticeCategory', {
    is: (val: string) => val !== 'GENERAL',
    then: (schema) => schema.required('제약사명을 선택해주세요.'),
    otherwise: (schema) => schema
  })
});

export default function MpAdminCustomerCenterNoticeEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { session } = useMpSession();
  const [loading, setLoading] = useState(false);

  const isNew = !id;

  const formik = useFormik({
    initialValues: {
      displayBoard: 'NOTICE' as
        | 'ANONYMOUS'
        | 'MR_CSO_MATCHING'
        | 'NOTICE'
        | 'INQUIRY'
        | 'FAQ'
        | 'CSO_A_TO_Z'
        | 'EVENT'
        | 'SALES_AGENCY'
        | 'PRODUCT',
      noticeCategory: 'GENERAL' as
        | 'PRODUCT_STATUS'
        | 'MANUFACTURING_SUSPENSION'
        | 'NEW_PRODUCT'
        | 'POLICY'
        | 'GENERAL'
        | 'ANONYMOUS_BOARD'
        | 'MR_CSO_MATCHING',
      manufacturerName: '',
      isExposed: true,
      exposureRange: 'ALL' as 'ALL' | 'CONTRACTED' | 'UNCONTRACTED',
      isTopFixed: false,
      title: '',
      content: '',
      files: [] as File[],
      existingFiles: [] as string[]
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
              boardType: values.displayBoard,
              title: values.title,
              content: values.content,
              userId: session.userId,
              nickname: session.name || session.userId,
              isExposed: values.isExposed,
              exposureRange: values.exposureRange,
              noticeProperties: {
                noticeType: values.noticeCategory,
                drugCompany: values.manufacturerName ?? '',
                fixedTop: values.isTopFixed
              }
            },
            files: values.files
          });
          enqueueSnackbar('공지사항이 성공적으로 등록되었습니다.', { variant: 'success' });
        } else {
          await updateBoardPost(parseInt(id!), {
            updateRequest: {
              title: values.title,
              content: values.content,
              isExposed: values.isExposed,
              keepFileIds: values.existingFiles.map((att) => mockNumber()).filter(Boolean),
              editorFileIds: []
            },
            newFiles: values.files
          });
          enqueueSnackbar('공지사항이 성공적으로 수정되었습니다.', { variant: 'success' });
        }
        navigate('/admin/notices');
      } catch (error) {
        console.error('Failed to submit form:', error);
        enqueueSnackbar(isNew ? '공지사항 등록에 실패했습니다.' : '공지사항 수정에 실패했습니다.', { variant: 'error' });
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
        displayBoard: response.boardType as
          | 'ANONYMOUS'
          | 'MR_CSO_MATCHING'
          | 'NOTICE'
          | 'INQUIRY'
          | 'FAQ'
          | 'CSO_A_TO_Z'
          | 'EVENT'
          | 'SALES_AGENCY'
          | 'PRODUCT',
        noticeCategory: response.noticeProperties?.noticeType || 'GENERAL',
        manufacturerName: response.noticeProperties?.drugCompany ?? '',
        isExposed: response.isExposed,
        exposureRange: response.exposureRange || 'ALL',
        isTopFixed: response.noticeProperties?.fixedTop || false,
        title: response.title,
        content: response.content,
        files: [],
        existingFiles: response.attachments.map((it) => it.s3fileId.toString()) || []
      });
    } catch (error) {
      console.error('Failed to fetch notice detail:', error);
      enqueueSnackbar('데이터를 불러오는데 실패했습니다.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/notices');
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const MAX_FILE_SIZE = 1 * 1024 * 1024;

    const validFiles: File[] = [];
    const oversizedFiles: string[] = [];

    files.forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        oversizedFiles.push(file.name);
      } else {
        validFiles.push(file);
      }
    });

    if (oversizedFiles.length > 0) {
      enqueueSnackbar(`다음 파일이 1MB를 초과합니다: ${oversizedFiles.join(', ')}`, { variant: 'error' });
    }

    if (validFiles.length > 0) {
      formik.setFieldValue('files', [...formik.values.files, ...validFiles]);
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
            공지사항 {isNew ? '등록' : '수정'}
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <MainCard>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  노출게시판 <span style={{ color: 'red' }}>*</span>
                </Typography>
                <RadioGroup row name="displayBoard" value={formik.values.displayBoard} onChange={formik.handleChange}>
                  <FormControlLabel value={'NOTICE'} control={<Radio />} label="공지사항" />
                  <FormControlLabel value={'ANONYMOUS'} control={<Radio />} label="익명게시판" />
                  <FormControlLabel value={'MR_CSO_MATCHING'} control={<Radio />} label="MR-CSO매칭" />
                </RadioGroup>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>공지분류 *</InputLabel>
                  <Select
                    name="noticeCategory"
                    value={formik.values.noticeCategory}
                    onChange={formik.handleChange}
                    label="공지분류 *"
                    error={!!(formik.touched.noticeCategory && formik.errors.noticeCategory)}
                  >
                    {noticeCategoryOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="manufacturerName"
                  label="제약사명"
                  placeholder={formik.values.noticeCategory === 'GENERAL' ? '' : '일반공지 제외한 모든분류에 노출'}
                  disabled={formik.values.noticeCategory === 'GENERAL'}
                  value={formik.values.manufacturerName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={!!(formik.touched.manufacturerName && formik.errors.manufacturerName)}
                  helperText={formik.touched.manufacturerName && formik.errors.manufacturerName}
                  InputProps={{
                    endAdornment: formik.values.noticeCategory !== 'GENERAL' && (
                      <InputAdornment position="end">
                        <IconButton edge="end">
                          <SearchIcon />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  노출상태 <span style={{ color: 'red' }}>*</span>
                </Typography>
                <RadioGroup
                  row
                  name="isExposed"
                  value={formik.values.isExposed ? 'true' : 'false'}
                  onChange={(e) => formik.setFieldValue('isExposed', e.target.value === 'true')}
                >
                  <FormControlLabel value="true" control={<Radio />} label="노출" />
                  <FormControlLabel value="false" control={<Radio />} label="미노출" />
                </RadioGroup>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  노출범위 <span style={{ color: 'red' }}>*</span>
                </Typography>
                <RadioGroup row name="exposureRange" value={formik.values.exposureRange} onChange={formik.handleChange}>
                  <FormControlLabel value={'ALL'} control={<Radio />} label="전체" />
                  <FormControlLabel value={'CONTRACTED'} control={<Radio />} label="계약" />
                  <FormControlLabel value={'UNCONTRACTED'} control={<Radio />} label="미계약" />
                </RadioGroup>
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formik.values.isTopFixed}
                      onChange={(e) => formik.setFieldValue('isTopFixed', e.target.checked)}
                      name="isTopFixed"
                    />
                  }
                  label="상단고정"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="title"
                  label="제목"
                  placeholder="제목을 입력하세요"
                  required
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={!!(formik.touched.title && formik.errors.title)}
                  helperText={(formik.touched.title && formik.errors.title) || `${formik.values.title.length}/100자`}
                  inputProps={{ maxLength: 100 }}
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
                <Button variant="contained" color="success" component="label">
                  파일첨부
                  <input type="file" hidden multiple onChange={handleFileChange} accept="*" />
                </Button>

                {formik.values.existingFiles && formik.values.existingFiles.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      기존 파일:
                    </Typography>
                    {formik.values.existingFiles.map((file, index) => (
                      <Chip
                        key={index}
                        label={file}
                        onDelete={() => {
                          formik.setFieldValue(
                            'existingFiles',
                            formik.values.existingFiles.filter((_, i) => i !== index)
                          );
                        }}
                        sx={{ mr: 1, mb: 1 }}
                      />
                    ))}
                  </Box>
                )}

                {formik.values.files && formik.values.files.length > 0 && (
                  <Box>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      새 파일:
                    </Typography>
                    {formik.values.files.map((file, index) => (
                      <Chip
                        key={index}
                        label={file.name}
                        onDelete={() => {
                          formik.setFieldValue(
                            'files',
                            formik.values.files.filter((_, i) => i !== index)
                          );
                        }}
                        sx={{ mr: 1, mb: 1 }}
                      />
                    ))}
                  </Box>
                )}
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

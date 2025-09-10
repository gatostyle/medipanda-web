import { useMedipandaEditor } from '@/medipanda/components/useMedipandaEditor';
import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import Stack from '@mui/material/Stack';
import { EditorContent } from '@tiptap/react';
import MainCard from 'components/MainCard';
import { useFormik } from 'formik';
import { AttachmentResponse, BoardDetailsResponse, createBoardPost, getBoardDetails, updateBoardPost } from '@/backend';
import { useSession } from '@/medipanda/hooks/useSession';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as Yup from 'yup';

export default function MpAdminNoticeEdit() {
  const navigate = useNavigate();
  const { boardId: paramBoardId } = useParams();
  const isNew = paramBoardId === undefined;
  const boardId = Number(paramBoardId);

  const { enqueueSnackbar } = useSnackbar();
  const { session } = useSession();
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<BoardDetailsResponse | null>(null);

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
      files: [] as File[],
      attachedFiles: [] as AttachmentResponse[],
      newFiles: [] as File[],
    },
    validationSchema: Yup.object().shape({
      title: Yup.string().required('제목을 입력해주세요.').max(100, '제목은 100자를 초과할 수 없습니다.'),
      noticeCategory: Yup.string().required('공지분류를 선택해주세요.'),
      manufacturerName: Yup.string().when('noticeCategory', {
        is: (val: string) => val !== 'GENERAL',
        then: schema => schema.required('제약사명을 선택해주세요.'),
        otherwise: schema => schema,
      }),
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
              boardType: values.displayBoard,
              title: values.title,
              content: editor.getHTML(),
              userId: session.userId,
              nickname: session.name || session.userId,
              hiddenNickname: false,
              parentId: null,
              isExposed: values.isExposed,
              editorFileIds: editorAttachments.map(image => image.s3fileId),
              exposureRange: values.exposureRange,
              noticeProperties: {
                noticeType: values.noticeCategory,
                drugCompany: values.manufacturerName ?? '',
                fixedTop: values.isTopFixed,
              },
            },
            files: values.files,
          });
          enqueueSnackbar('공지사항이 성공적으로 등록되었습니다.', { variant: 'success' });
          navigate('/admin/notices');
        } else {
          await updateBoardPost(boardId, {
            updateRequest: {
              title: values.title,
              content: editor.getHTML(),
              hiddenNickname: null,
              isBlind: null,
              isExposed: values.isExposed,
              exposureRange: values.exposureRange,
              keepFileIds: [...values.attachedFiles, ...editorAttachments].map(file => file.s3fileId),
              editorFileIds: editorAttachments.map(attachment => attachment.s3fileId),
              noticeProperties: {
                noticeType: values.noticeCategory,
                drugCompany: values.manufacturerName ?? '',
                fixedTop: values.isTopFixed,
              },
            },
            newFiles: values.files,
          });
          enqueueSnackbar('공지사항이 성공적으로 수정되었습니다.', { variant: 'success' });
          navigate(`/admin/notices/${paramBoardId}`);
        }
      } catch (error) {
        console.error('Failed to submit form:', error);
        enqueueSnackbar(isNew ? '공지사항 등록에 실패했습니다.' : '공지사항 수정에 실패했습니다.', { variant: 'error' });
      } finally {
        setSubmitting(false);
      }
    },
  });

  const { editor, attachments: editorAttachments, setAttachments: setEditorAttachments } = useMedipandaEditor();

  useEffect(() => {
    if (!isNew) {
      fetchData(boardId);
    }
  }, [isNew, boardId]);

  const fetchData = async (boardId: number) => {
    if (Number.isNaN(boardId)) {
      alert('잘못된 접근입니다.');
      return navigate('/admin/notices');
    }

    setLoading(true);
    try {
      const response = await getBoardDetails(boardId);
      setDetail(response);
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
        files: [],
        attachedFiles: response.attachments,
        newFiles: [],
      });
      editor.commands.setContent(response.content);
      setEditorAttachments(response.attachments.filter(a => a.type === 'EDITOR'));
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

    files.forEach(file => {
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
            공지사항 {isNew ? '등록' : '수정'}
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <MainCard>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant='body2' sx={{ mb: 1 }}>
                  노출게시판 <span style={{ color: 'red' }}>*</span>
                </Typography>
                <RadioGroup row name='displayBoard' value={formik.values.displayBoard} onChange={formik.handleChange}>
                  <FormControlLabel value={'NOTICE'} control={<Radio />} label='공지사항' />
                  <FormControlLabel value={'ANONYMOUS'} control={<Radio />} label='익명게시판' />
                  <FormControlLabel value={'MR_CSO_MATCHING'} control={<Radio />} label='MR-CSO매칭' />
                </RadioGroup>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>공지분류 *</InputLabel>
                  <Select
                    name='noticeCategory'
                    value={formik.values.noticeCategory}
                    onChange={formik.handleChange}
                    error={!!(formik.touched.noticeCategory && formik.errors.noticeCategory)}
                  >
                    <MenuItem value={'PRODUCT_STATUS'}>제약사 - 제품현향</MenuItem>
                    <MenuItem value={'MANUFACTURING_SUSPENSION'}>제약사 - 정산 및 생산중단</MenuItem>
                    <MenuItem value={'NEW_PRODUCT'}>제약사 - 신제품 정보</MenuItem>
                    <MenuItem value={'POLICY'}>제약사 정책</MenuItem>
                    <MenuItem value={'GENERAL'}>일반공지</MenuItem>
                    <MenuItem value={'ANONYMOUS_BOARD'}>익명게시판</MenuItem>
                    <MenuItem value={'MR_CSO_MATCHING'}>MR-CSO 매칭</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name='manufacturerName'
                  label='제약사명'
                  placeholder={formik.values.noticeCategory === 'GENERAL' ? '' : '일반공지 제외한 모든분류에 노출'}
                  disabled={formik.values.noticeCategory === 'GENERAL'}
                  value={formik.values.manufacturerName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={!!(formik.touched.manufacturerName && formik.errors.manufacturerName)}
                  helperText={formik.touched.manufacturerName && formik.errors.manufacturerName}
                  InputProps={{
                    endAdornment: formik.values.noticeCategory !== 'GENERAL' && (
                      <InputAdornment position='end'>
                        <IconButton edge='end'>
                          <SearchIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant='body2' sx={{ mb: 1 }}>
                  노출상태 <span style={{ color: 'red' }}>*</span>
                </Typography>
                <RadioGroup
                  row
                  name='isExposed'
                  value={formik.values.isExposed ? 'true' : 'false'}
                  onChange={e => formik.setFieldValue('isExposed', e.target.value === 'true')}
                >
                  <FormControlLabel value='true' control={<Radio />} label='노출' />
                  <FormControlLabel value='false' control={<Radio />} label='미노출' />
                </RadioGroup>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant='body2' sx={{ mb: 1 }}>
                  노출범위 <span style={{ color: 'red' }}>*</span>
                </Typography>
                <RadioGroup row name='exposureRange' value={formik.values.exposureRange} onChange={formik.handleChange}>
                  <FormControlLabel value={'ALL'} control={<Radio />} label='전체' />
                  <FormControlLabel value={'CONTRACTED'} control={<Radio />} label='계약' />
                  <FormControlLabel value={'UNCONTRACTED'} control={<Radio />} label='미계약' />
                </RadioGroup>
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formik.values.isTopFixed}
                      onChange={e => formik.setFieldValue('isTopFixed', e.target.checked)}
                      name='isTopFixed'
                    />
                  }
                  label='상단고정'
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name='title'
                  label='제목'
                  placeholder='제목을 입력하세요'
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
                <Typography variant='body2' sx={{ mb: 1 }}>
                  내용 <span style={{ color: 'red' }}>*</span>
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
                <Typography variant='body2' sx={{ mb: 1 }}>
                  첨부파일
                </Typography>
                <Button variant='contained' color='success' component='label'>
                  파일첨부
                  <input type='file' hidden multiple onChange={handleFileChange} accept='*' />
                </Button>

                {formik.values.attachedFiles && formik.values.attachedFiles.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant='body2' sx={{ mb: 1 }}>
                      기존 파일:
                    </Typography>
                    {formik.values.attachedFiles.map((file, index) => (
                      <Chip
                        key={index}
                        label={file.originalFileName}
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
                  <Box>
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

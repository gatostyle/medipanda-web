import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import Chip from '@mui/material/Chip';
import { useSnackbar } from 'notistack';
import MainCard from 'components/MainCard';
import { TiptapEditor } from 'components/medipanda/TiptapEditor';
import {
  mpFetchBoardDetail,
  mpCreateBoard,
  mpUpdateBoard,
  MpBoardCreateRequestExtended,
  MpBoardUpdateRequestExtended
} from 'api-definitions/MpBoard';
import { useMpSession } from 'hooks/medipanda/useMpSession';

interface FormData {
  title: string;
  content: string;
  status: string;
  files?: File[];
  existingFiles?: string[];
}

interface FormErrors {
  title?: string;
  content?: string;
}

export default function MpAdminCustomerCenterFaqEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { session } = useMpSession();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    content: '',
    status: '노출',
    files: [],
    existingFiles: []
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const isNew = !id;

  useEffect(() => {
    if (!isNew && id) {
      fetchData(parseInt(id, 10));
    }
  }, [id, isNew]);

  const fetchData = async (itemId: number) => {
    setLoading(true);
    try {
      const response = await mpFetchBoardDetail(itemId);
      setFormData({
        title: response.title,
        content: response.content,
        status: response.isBlind ? '미노출' : '노출',
        existingFiles: response.attachments || []
      });
    } catch (error) {
      console.error('Failed to fetch FAQ detail:', error);
      enqueueSnackbar('데이터를 불러오는데 실패했습니다.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = '제목을 입력해주세요.';
    } else if (formData.title.length > 100) {
      newErrors.title = '제목은 100자를 초과할 수 없습니다.';
    }

    if (!formData.content.trim()) {
      newErrors.content = '내용을 입력해주세요.';
    } else if (formData.content.length > 5000) {
      newErrors.content = '내용은 5000자를 초과할 수 없습니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      enqueueSnackbar('입력 내용을 확인해주세요.', { variant: 'error' });
      return;
    }

    if (!session?.userId) {
      enqueueSnackbar('로그인이 필요합니다.', { variant: 'error' });
      return;
    }

    setSubmitting(true);
    try {
      if (isNew) {
        await mpCreateBoard(
          {
            boardType: 'FAQ',
            title: formData.title,
            content: formData.content,
            userId: session.userId,
            nickname: session.name || session.userId
          } as MpBoardCreateRequestExtended,
          formData.files
        );
        enqueueSnackbar('FAQ가 성공적으로 등록되었습니다.', { variant: 'success' });
      } else {
        await mpUpdateBoard(
          parseInt(id!, 10),
          {
            title: formData.title,
            content: formData.content,
            isBlind: formData.status === '미노출'
          } as MpBoardUpdateRequestExtended,
          formData.files,
          formData.existingFiles
        );
        enqueueSnackbar('FAQ가 성공적으로 수정되었습니다.', { variant: 'success' });
      }

      if (isNew) {
        setFormData({
          title: '',
          content: '',
          status: '노출',
          files: [],
          existingFiles: []
        });
        setErrors({});
      }

      navigate('/admin/customer-center/faqs');
    } catch (error) {
      console.error('Failed to submit form:', error);
      enqueueSnackbar(isNew ? 'FAQ 등록에 실패했습니다.' : 'FAQ 수정에 실패했습니다.', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isNew) {
      navigate('/admin/customer-center/faqs');
    } else {
      navigate(`/admin/customer-center/faq/${id}`);
    }
  };

  const handleInputChange = (field: keyof FormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));

    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB

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
      setFormData((prev) => ({
        ...prev,
        files: [...(prev.files || []), ...validFiles]
      }));
    }
  };

  const removeFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      files: prev.files?.filter((_, i) => i !== index) || []
    }));
  };

  const removeExistingFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      existingFiles: prev.existingFiles?.filter((_, i) => i !== index) || []
    }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          FAQ {isNew ? '등록' : '수정'}
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <MainCard>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="제목"
                value={formData.title}
                onChange={handleInputChange('title')}
                placeholder="제목을 입력하세요"
                required
                error={!!errors.title}
                helperText={errors.title || `${formData.title.length}/100자`}
                inputProps={{ maxLength: 100 }}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                내용 <span style={{ color: 'red' }}>*</span>
              </Typography>
              <TiptapEditor
                content={formData.content}
                onChange={(content) => setFormData((prev) => ({ ...prev, content }))}
                placeholder="내용을 입력하세요"
                error={!!errors.content}
                helperText={errors.content}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                첨부파일
              </Typography>
              <Button variant="outlined" component="label" sx={{ mb: 2 }}>
                파일 업로드
                <input type="file" hidden multiple onChange={handleFileChange} accept="*" />
              </Button>
              <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                (파일당 최대 1MB)
              </Typography>

              {formData.existingFiles && formData.existingFiles.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    기존 파일:
                  </Typography>
                  {formData.existingFiles.map((file, index) => (
                    <Chip key={index} label={file} onDelete={() => removeExistingFile(index)} sx={{ mr: 1, mb: 1 }} />
                  ))}
                </Box>
              )}

              {formData.files && formData.files.length > 0 && (
                <Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    새 파일:
                  </Typography>
                  {formData.files.map((file, index) => (
                    <Chip key={index} label={file.name} onDelete={() => removeFile(index)} sx={{ mr: 1, mb: 1 }} />
                  ))}
                </Box>
              )}
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                노출상태 <span style={{ color: 'red' }}>*</span>
              </Typography>
              <FormControl>
                <RadioGroup row value={formData.status} onChange={handleInputChange('status')}>
                  <FormControlLabel value="노출" control={<Radio />} label="노출" />
                  <FormControlLabel value="미노출" control={<Radio />} label="미노출" />
                </RadioGroup>
              </FormControl>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button variant="outlined" onClick={handleCancel} sx={{ minWidth: 120 }} disabled={submitting}>
              취소
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={handleSubmit}
              sx={{ minWidth: 120 }}
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={20} /> : null}
            >
              {submitting ? '저장 중...' : '저장'}
            </Button>
          </Box>
        </MainCard>
      </Grid>
    </Grid>
  );
}

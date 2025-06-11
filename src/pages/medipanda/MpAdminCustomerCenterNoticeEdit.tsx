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
import Switch from '@mui/material/Switch';
import Autocomplete from '@mui/material/Autocomplete';
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
  noticeType: string;
  manufacturerName: string;
  exposureScope: string;
  isTopFixed: boolean;
  files?: File[];
  existingFiles?: string[];
}

interface FormErrors {
  title?: string;
  content?: string;
  noticeType?: string;
  manufacturerName?: string;
}

const noticeTypeOptions = [
  { label: '일반', value: '일반' },
  { label: '제약사', value: '제약사' }
];

const manufacturerOptions = [
  { label: '동구바이오', value: '동구바이오' },
  { label: '한국화이자', value: '한국화이자' },
  { label: '노바티스', value: '노바티스' },
  { label: '애브비', value: '애브비' }
];

export default function MpAdminCustomerCenterNoticeEdit() {
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
    noticeType: '일반',
    manufacturerName: '',
    exposureScope: '전체',
    isTopFixed: false,
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
        noticeType: '일반', // FIXME Need API fix for noticeType field
        manufacturerName: '', // FIXME Need API fix for manufacturerName field
        exposureScope: '전체', // FIXME Need API fix for exposureScope field
        isTopFixed: false, // FIXME Need API fix for isTopFixed field
        existingFiles: response.attachments || []
      });
    } catch (error) {
      console.error('Failed to fetch notice detail:', error);
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

    if (!formData.noticeType) {
      newErrors.noticeType = '공지분류를 선택해주세요.';
    }

    if (formData.noticeType === '제약사' && !formData.manufacturerName.trim()) {
      newErrors.manufacturerName = '제작사명을 선택해주세요.';
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
            boardType: 'NOTICE',
            title: formData.title,
            content: formData.content,
            userId: session.userId,
            nickname: session.name || session.userId,
            noticeType: formData.noticeType,
            manufacturerName: formData.manufacturerName,
            exposureScope: formData.exposureScope,
            isTopFixed: formData.isTopFixed
          } as MpBoardCreateRequestExtended,
          formData.files
        );
        enqueueSnackbar('공지사항이 성공적으로 등록되었습니다.', { variant: 'success' });
      } else {
        await mpUpdateBoard(
          parseInt(id!, 10),
          {
            title: formData.title,
            content: formData.content,
            isBlind: formData.status === '미노출',
            noticeType: formData.noticeType,
            manufacturerName: formData.manufacturerName,
            exposureScope: formData.exposureScope,
            isTopFixed: formData.isTopFixed
          } as MpBoardUpdateRequestExtended,
          formData.files,
          formData.existingFiles
        );
        enqueueSnackbar('공지사항이 성공적으로 수정되었습니다.', { variant: 'success' });
      }

      if (isNew) {
        setFormData({
          title: '',
          content: '',
          status: '노출',
          noticeType: '일반',
          manufacturerName: '',
          exposureScope: '전체',
          isTopFixed: false,
          files: [],
          existingFiles: []
        });
        setErrors({});
      }

      navigate('/admin/customer-center/notices');
    } catch (error) {
      console.error('Failed to submit form:', error);
      enqueueSnackbar(isNew ? '공지사항 등록에 실패했습니다.' : '공지사항 수정에 실패했습니다.', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isNew) {
      navigate('/admin/customer-center/notices');
    } else {
      navigate(`/admin/customer-center/notice/${id}`);
    }
  };

  const handleInputChange = (field: keyof FormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
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
    setFormData((prev) => ({
      ...prev,
      files: [...(prev.files || []), ...files]
    }));
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
          공지사항 {isNew ? '등록' : '수정'}
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <MainCard>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.noticeType}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  공지분류 <span style={{ color: 'red' }}>*</span>
                </Typography>
                <Autocomplete
                  options={noticeTypeOptions}
                  value={noticeTypeOptions.find((option) => option.value === formData.noticeType) || null}
                  onChange={(_, newValue) => {
                    setFormData((prev) => ({ ...prev, noticeType: newValue?.value || '' }));
                    if (errors.noticeType) {
                      setErrors((prev) => ({ ...prev, noticeType: undefined }));
                    }
                  }}
                  renderInput={(params) => (
                    <TextField {...params} placeholder="공지분류 선택" error={!!errors.noticeType} helperText={errors.noticeType} />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip {...getTagProps({ index })} key={option.value} label={option.label} color="error" size="small" />
                    ))
                  }
                />
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.manufacturerName}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  제작사명 {formData.noticeType === '제약사' && <span style={{ color: 'red' }}>*</span>}
                </Typography>
                <Autocomplete
                  options={manufacturerOptions}
                  value={manufacturerOptions.find((option) => option.value === formData.manufacturerName) || null}
                  onChange={(_, newValue) => {
                    setFormData((prev) => ({ ...prev, manufacturerName: newValue?.value || '' }));
                    if (errors.manufacturerName) {
                      setErrors((prev) => ({ ...prev, manufacturerName: undefined }));
                    }
                  }}
                  disabled={formData.noticeType !== '제약사'}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="제작사명 검색"
                      error={!!errors.manufacturerName}
                      helperText={errors.manufacturerName}
                    />
                  )}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
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

            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                노출범위 <span style={{ color: 'red' }}>*</span>
              </Typography>
              <FormControl>
                <RadioGroup row value={formData.exposureScope} onChange={handleInputChange('exposureScope')}>
                  <FormControlLabel value="전체" control={<Radio />} label="전체" />
                  <FormControlLabel value="계약" control={<Radio />} label="계약" />
                  <FormControlLabel value="미계약" control={<Radio />} label="미계약" />
                </RadioGroup>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" alignItems="center">
                <Typography variant="body2" sx={{ mr: 2 }}>
                  상단고정
                </Typography>
                <Switch checked={formData.isTopFixed} onChange={handleInputChange('isTopFixed')} color="success" />
              </Box>
            </Grid>

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

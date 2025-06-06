import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import { Box, Button, FormControl, FormControlLabel, Grid, Paper, Radio, RadioGroup, TextField, Typography } from '@mui/material';
import { MpCsoAtoZDetail, mpFetchCsoAtoZDetail } from 'api-definitions/MpContent';
import { useMpErrorDialog } from 'hooks/medipanda/useMpErrorDialog';
import { useMpNotImplementedDialog } from 'hooks/medipanda/useMpNotImplementedDialog';

export default function MpAdminContentManagementAtoZEdit() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [detail, setDetail] = useState<MpCsoAtoZDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showError } = useMpErrorDialog();
  const { open: openNotImplementedDialog } = useMpNotImplementedDialog();

  const formik = useFormik({
    initialValues: {
      author: '',
      title: '',
      content: '',
      status: 'expose'
    },
    onSubmit: async (values) => {
      openNotImplementedDialog('저장');
    }
  });

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        const data = await mpFetchCsoAtoZDetail(parseInt(id));
        setDetail(data);
        formik.setValues({
          author: data.author,
          title: data.title,
          content: data.content,
          status: data.status === '노출' ? 'expose' : 'hide'
        });
      } catch (error) {
        console.error('Failed to fetch CSO A to Z detail:', error);
        showError('CSO A to Z 상세 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const handleBack = () => {
    navigate(`/admin/content-management/atoz/${id}`);
  };

  if (isLoading || !detail) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="body2" sx={{ color: '#6B7280' }}>
          데이터를 불러오는 중...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontSize: '24px', fontWeight: 600, mb: 3 }}>
        CSO A TO Z 등록
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, minWidth: '80px' }}>
                작성자
              </Typography>
              <TextField
                name="author"
                value={formik.values.author}
                onChange={formik.handleChange}
                size="small"
                sx={{
                  width: '300px',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '20px',
                    '& fieldset': {
                      borderColor: '#D1D5DB'
                    }
                  }
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, minWidth: '80px' }}>
                제목
              </Typography>
              <TextField
                name="title"
                value={formik.values.title}
                onChange={formik.handleChange}
                size="small"
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '20px',
                    '& fieldset': {
                      borderColor: '#D1D5DB'
                    }
                  }
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, minWidth: '80px', mt: 1 }}>
                내용
              </Typography>
              <Box sx={{ width: '100%' }}>
                <Box
                  sx={{
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    p: 1,
                    mb: 1,
                    display: 'flex',
                    gap: 1,
                    alignItems: 'center',
                    bgcolor: '#F9FAFB'
                  }}
                >
                  <Button size="small" sx={{ minWidth: 'auto', p: 0.5 }}>
                    B
                  </Button>
                  <Button size="small" sx={{ minWidth: 'auto', p: 0.5 }}>
                    U
                  </Button>
                  <Button size="small" sx={{ minWidth: 'auto', p: 0.5 }}>
                    S
                  </Button>
                  <Button size="small" sx={{ minWidth: 'auto', p: 0.5 }}>
                    "
                  </Button>
                  <Typography sx={{ fontSize: '14px', color: '#6B7280' }}>Normal</Typography>
                  <Button size="small" sx={{ minWidth: 'auto', p: 0.5 }}>
                    A
                  </Button>
                </Box>
                <TextField
                  name="content"
                  value={formik.values.content}
                  onChange={formik.handleChange}
                  multiline
                  rows={12}
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                      '& fieldset': {
                        borderColor: '#D1D5DB'
                      }
                    }
                  }}
                />
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, minWidth: '80px' }}>
                노출상태
              </Typography>
              <FormControl>
                <RadioGroup row name="status" value={formik.values.status} onChange={formik.handleChange}>
                  <FormControlLabel
                    value="expose"
                    control={<Radio sx={{ color: '#10B981', '&.Mui-checked': { color: '#10B981' } }} />}
                    label="노출"
                  />
                  <FormControlLabel value="hide" control={<Radio />} label="미노출" />
                </RadioGroup>
              </FormControl>
            </Box>
          </Grid>

          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
            <Button
              variant="outlined"
              onClick={handleBack}
              sx={{
                borderColor: '#6B7280',
                color: '#6B7280',
                borderRadius: '20px',
                px: 4,
                '&:hover': {
                  borderColor: '#4B5563',
                  bgcolor: 'rgba(107, 114, 128, 0.04)'
                }
              }}
            >
              취소
            </Button>
            <Button
              variant="contained"
              onClick={() => formik.submitForm()}
              sx={{
                bgcolor: '#10B981',
                borderRadius: '20px',
                px: 4,
                '&:hover': { bgcolor: '#059669' }
              }}
            >
              저장
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}

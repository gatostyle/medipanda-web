import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Grid, Paper, Typography } from '@mui/material';
import { MpFaqDetail, mpFetchFaqDetail } from 'api-definitions/MpContent';
import { useMpErrorDialog } from 'hooks/medipanda/useMpErrorDialog';

export default function MpAdminCustomerCenterFaqDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [detail, setDetail] = useState<MpFaqDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showError } = useMpErrorDialog();

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        const data = await mpFetchFaqDetail(parseInt(id));
        setDetail(data);
      } catch (error) {
        console.error('Failed to fetch FAQ detail:', error);
        showError('FAQ 상세 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const handleBack = () => {
    navigate('/admin/customer-center/faqs');
  };

  const handleEdit = () => {
    navigate(`/admin/customer-center/faq/${id}/edit`);
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
        FAQ 상세
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, minWidth: '80px' }}>
                작성자
              </Typography>
              <Typography variant="body2">{detail.author}</Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, minWidth: '80px' }}>
                분류
              </Typography>
              <Typography variant="body2">{detail.category || '-'}</Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, minWidth: '80px' }}>
                제목
              </Typography>
              <Typography variant="body2">{detail.title}</Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, minWidth: '80px' }}>
                내용
              </Typography>
              <Box
                sx={{
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  p: 2,
                  minHeight: '200px',
                  width: '100%',
                  whiteSpace: 'pre-wrap'
                }}
              >
                {detail.content}
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, minWidth: '80px' }}>
                노출상태
              </Typography>
              <Typography variant="body2">{detail.status}</Typography>
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
              onClick={handleEdit}
              sx={{
                bgcolor: '#10B981',
                borderRadius: '20px',
                px: 4,
                '&:hover': { bgcolor: '#059669' }
              }}
            >
              수정
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}

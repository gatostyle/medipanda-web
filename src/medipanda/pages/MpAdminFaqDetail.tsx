import AttachFileIcon from '@mui/icons-material/AttachFile';
import { Box, Button, CircularProgress, Grid, Link as MuiLink, Typography } from '@mui/material';
import MainCard from 'components/MainCard';
import { BoardDetailsResponse, getBoardDetails } from '@/backend';
import { TiptapEditor } from '@/medipanda/components/TiptapEditor';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { formatYyyyMmDd } from '../utils/dateFormat';

export default function MpAdminCustomerCenterFaqDetail() {
  const { id } = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const [data, setData] = useState<BoardDetailsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchData(parseInt(id, 10));
    }
  }, [id]);

  const fetchData = async (itemId: number) => {
    setLoading(true);
    try {
      const response = await getBoardDetails(itemId);
      setData(response);
    } catch (error) {
      console.error('Failed to fetch FAQ detail:', error);
      enqueueSnackbar('데이터를 불러오는데 실패했습니다.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
        <CircularProgress />
      </Box>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant='h4' gutterBottom>
          FAQ 상세
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <MainCard>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant='body2' color='text.secondary' gutterBottom>
                제목
              </Typography>
              <Typography variant='body1'>{data.title}</Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant='body2' color='text.secondary' gutterBottom>
                내용
              </Typography>
              <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 1, minHeight: 200 }}>
                <TiptapEditor content={data.content} readOnly />
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Typography variant='body2' color='text.secondary' gutterBottom>
                첨부파일
              </Typography>
              {data.attachments && data.attachments.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {data.attachments.map((file, index) => {
                    return (
                      <MuiLink
                        key={index}
                        href={file.fileUrl}
                        download
                        target='_blank'
                        rel='noopener noreferrer'
                        sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                        underline='hover'
                      >
                        <AttachFileIcon fontSize='small' />
                        {file.fileUrl}
                      </MuiLink>
                    );
                  })}
                </Box>
              ) : (
                <Typography variant='body2'>-</Typography>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant='body2' color='text.secondary' gutterBottom>
                노출상태
              </Typography>
              <Typography variant='body1'>{data.isExposed ? '노출' : '미노출'}</Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant='body2' color='text.secondary' gutterBottom>
                조회수
              </Typography>
              <Typography variant='body1'>{data.viewsCount.toLocaleString()}</Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant='body2' color='text.secondary' gutterBottom>
                작성일
              </Typography>
              <Typography variant='body1'>{formatYyyyMmDd(data.createdAt)}</Typography>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant='outlined'
              component={Link}
              to='/admin/faqs'
              sx={{
                minWidth: 120,
                color: '#666',
                borderColor: '#ccc',
                '&:hover': {
                  borderColor: '#999',
                  bgcolor: '#f5f5f5',
                },
              }}
            >
              취소
            </Button>
            <Button
              variant='contained'
              component={Link}
              to={`/admin/faqs/${id}/edit`}
              sx={{
                minWidth: 120,
                bgcolor: '#4caf50',
                '&:hover': { bgcolor: '#45a049' },
              }}
            >
              수정
            </Button>
          </Box>
        </MainCard>
      </Grid>
    </Grid>
  );
}

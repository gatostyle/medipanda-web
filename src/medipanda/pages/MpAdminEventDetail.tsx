import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import MainCard from 'components/MainCard';
import { EventBoardDetailsResponse, getEventBoardDetails } from 'medipanda/backend';
import { format } from 'date-fns';
import CircularProgress from '@mui/material/CircularProgress';
import { TiptapEditor } from 'medipanda/components/TiptapEditor';

export default function MpAdminEventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventBoardDetailsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEventDetail = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const data = await getEventBoardDetails(parseInt(id));
        setEvent(data);
      } catch (error) {
        console.error('Failed to fetch event detail:', error);
        navigate('/admin/events');
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetail();
  }, [id, navigate]);

  const handleEdit = () => {
    navigate(`/admin/events/${id}/edit`);
  };

  const handleCancel = () => {
    navigate('/admin/events');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!event) {
    return null;
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          이벤트 상세
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <MainCard>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Stack spacing={1}>
                <Typography variant="subtitle2" color="text.secondary">
                  노출상태
                </Typography>
                <Box>
                  <Chip
                    label={event.boardPostDetail.isExposed ? '노출' : '미노출'}
                    color={event.boardPostDetail.isExposed ? 'success' : 'default'}
                    variant="light"
                    size="small"
                  />
                </Box>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Stack spacing={1}>
                <Typography variant="subtitle2" color="text.secondary">
                  노출범위
                </Typography>
                <Box>
                  <Chip
                    label={
                      event.boardPostDetail.exposureRange === 'ALL'
                        ? '전체'
                        : event.boardPostDetail.exposureRange === 'CONTRACTED'
                          ? '계약'
                          : '미계약'
                    }
                    color="primary"
                    variant="light"
                    size="small"
                  />
                </Box>
              </Stack>
            </Grid>

            <Grid item xs={12}>
              <Stack spacing={1}>
                <Typography variant="subtitle2" color="text.secondary">
                  이벤트기간
                </Typography>
                <Typography variant="body1">
                  {format(new Date(event.eventStartDate), 'yyyy-MM-dd')} ~ {format(new Date(event.eventEndDate), 'yyyy-MM-dd')}
                </Typography>
              </Stack>
            </Grid>

            <Grid item xs={12}>
              <Stack spacing={1}>
                <Typography variant="subtitle2" color="text.secondary">
                  제목
                </Typography>
                <Typography variant="body1">{event.boardPostDetail.title}</Typography>
              </Stack>
            </Grid>

            <Grid item xs={12}>
              <Stack spacing={1}>
                <Typography variant="subtitle2" color="text.secondary">
                  이벤트 썸네일
                </Typography>
                <Typography variant="body1">{event.description}</Typography>
              </Stack>
            </Grid>

            {event.thumbnailUrl && (
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <Typography variant="subtitle2" color="text.secondary">
                    썸네일
                  </Typography>
                  <Box>
                    <img
                      src={event.thumbnailUrl}
                      alt="썸네일"
                      style={{
                        maxWidth: '300px',
                        maxHeight: '200px',
                        objectFit: 'contain',
                        border: '1px solid #e0e0e0',
                        borderRadius: '4px'
                      }}
                    />
                  </Box>
                </Stack>
              </Grid>
            )}

            <Grid item xs={12}>
              <Divider />
            </Grid>

            <Grid item xs={12}>
              <Stack spacing={1}>
                <Typography variant="subtitle2" color="text.secondary">
                  내용
                </Typography>
                <TiptapEditor content={event.boardPostDetail.content} readOnly />
              </Stack>
            </Grid>

            {event.videoUrl && (
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <Typography variant="subtitle2" color="text.secondary">
                    영상url
                  </Typography>
                  <Typography
                    variant="body1"
                    component="a"
                    href={event.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                  >
                    {event.videoUrl}
                  </Typography>
                </Stack>
              </Grid>
            )}

            {event.note && (
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <Typography variant="subtitle2" color="text.secondary">
                    비고
                  </Typography>
                  <Typography variant="body1">{event.note}</Typography>
                </Stack>
              </Grid>
            )}

            <Grid item xs={12}>
              <Stack spacing={1}>
                <Typography variant="subtitle2" color="text.secondary">
                  조회수
                </Typography>
                <Typography variant="body1">{event.boardPostDetail.viewsCount.toLocaleString()}</Typography>
              </Stack>
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            <Grid item xs={12}>
              <Stack direction="row" spacing={2} justifyContent="center">
                <Button variant="outlined" size="large" onClick={handleCancel}>
                  취소
                </Button>
                <Button variant="contained" size="large" color="success" onClick={handleEdit}>
                  수정
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </MainCard>
      </Grid>
    </Grid>
  );
}

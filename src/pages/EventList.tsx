import { Box, Card, CardContent, Chip, Grid, Pagination, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router';

const EventCard = styled(Card)({
  backgroundColor: '#fff',
  boxShadow: 'none',
  border: '1px solid #e0e0e0',
  borderRadius: '12px',
  overflow: 'hidden',
  cursor: 'pointer',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
});

const EventImage = styled(Box)({
  width: '100%',
  height: '180px',
  backgroundColor: '#e0e0e0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#666',
  fontSize: '14px',
});

const StatusChip = styled(Chip)(({ status }) => ({
  position: 'absolute',
  top: '12px',
  right: '12px',
  fontSize: '12px',
  fontWeight: 500,
  ...(status === 'active' && {
    backgroundColor: '#4caf50',
    color: '#fff',
  }),
  ...(status === 'ended' && {
    backgroundColor: '#424242',
    color: '#fff',
  }),
}));

const mockEvents = [
  {
    id: 1,
    title: '메디판다 그랜드 오픈이벤트!!!!!!',
    description: '해당 이벤트는 메디판다 오픈기념 이벤트입니다.',
    startDate: '2025-06-10',
    endDate: '2025-06-30',
    status: 'active',
    thumbnailUrl: null,
  },
  {
    id: 2,
    title: '이벤트 제목',
    description: '이벤트 설명@@@@@@@@@@@@@@@@@@@@@@',
    startDate: '2025-06-10',
    endDate: '2025-06-30',
    status: 'active',
    thumbnailUrl: null,
  },
  {
    id: 3,
    title: '이벤트 제목',
    description: '이벤트 설명@@@@@@@@@@@@@@@@@@@@@@',
    startDate: '2025-06-10',
    endDate: '2025-06-30',
    status: 'active',
    thumbnailUrl: null,
  },
  {
    id: 4,
    title: '이벤트 제목',
    description: '이벤트 설명@@@@@@@@@@@@@@@@@@@@@@',
    startDate: '2025-06-10',
    endDate: '2025-06-30',
    status: 'ended',
    thumbnailUrl: null,
  },
  {
    id: 5,
    title: '이벤트 제목',
    description: '이벤트 설명@@@@@@@@@@@@@@@@@@@@@@',
    startDate: '2025-06-10',
    endDate: '2025-06-30',
    status: 'ended',
    thumbnailUrl: null,
  },
];

export default function EventList() {
  return (
    <Box>
      <Typography variant='h4' sx={{ mb: 4, fontWeight: 'bold', color: '#333' }}>
        이벤트
      </Typography>

      <Grid container spacing={3}>
        {mockEvents.map(event => (
          <Grid item xs={12} sm={6} md={4} key={event.id}>
            <EventCard component={RouterLink} to={`/events/${event.id}`} sx={{ textDecoration: 'none' }}>
              <Box sx={{ position: 'relative' }}>
                <EventImage>
                  {event.thumbnailUrl ? (
                    <img src={event.thumbnailUrl} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Typography variant='body2' sx={{ color: '#999' }}>
                      이벤트 이미지
                    </Typography>
                  )}
                </EventImage>
                {event.status === 'ended' && <StatusChip label='종료' size='small' status='ended' />}
              </Box>
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant='h6'
                  sx={{
                    fontWeight: 'bold',
                    color: '#333',
                    mb: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {event.title}
                </Typography>
                <Typography
                  variant='body2'
                  sx={{
                    color: '#666',
                    mb: 2,
                    lineHeight: 1.5,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {event.description}
                </Typography>
                <Typography variant='caption' sx={{ color: '#999', fontSize: '13px' }}>
                  {event.startDate} ~ {event.endDate}
                </Typography>
              </CardContent>
            </EventCard>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
        <Pagination
          count={10}
          page={1}
          showFirstButton
          showLastButton
          sx={{
            '& .MuiPaginationItem-root': {
              fontSize: '14px',
            },
            '& .Mui-selected': {
              backgroundColor: '#6B3AA0 !important',
              color: '#fff',
            },
          }}
        />
      </Box>
    </Box>
  );
}

import { type EventBoardSummaryResponse, getEventBoards } from '@/backend';
import { MedipandaPagination } from '@/custom/components/MedipandaPagination';
import { useSearchParamsOrDefault } from '@/lib/hooks/useSearchParamsOrDefault';
import { setUrlParams } from '@/lib/utils/url';
import { colors } from '@/themes';
import { DateUtils, DATEFORMAT_YYYY_MM_DD } from '@/lib/utils/dateFormat';
import { Box, PaginationItem, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

export default function EventList() {
  const [contents, setContents] = useState<EventBoardSummaryResponse[]>([]);
  const [totalPages, setTotalPages] = useState(0);

  const initialSearchParams = {
    page: '1',
  };

  const { page: paramPage } = useSearchParamsOrDefault(initialSearchParams);
  const page = Number(paramPage);
  const pageSize = 10;

  const fetchContents = async () => {
    try {
      const response = await getEventBoards({
        page: page - 1,
        size: pageSize,
      });

      setContents(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch event list:', error);
      alert('이벤트 목록을 불러오는 중 오류가 발생했습니다.');
      setContents([]);
      setTotalPages(0);
    }
  };

  useEffect(() => {
    fetchContents();
  }, [page]);

  return (
    <>
      <Typography variant='heading3M' sx={{ color: colors.gray80 }}>
        이벤트
      </Typography>

      <Stack
        sx={{
          marginTop: '30px',
        }}
      >
        {contents.map(event => (
          <Stack
            key={event.id}
            direction='row'
            component={RouterLink}
            to={`/events/${event.id}`}
            sx={{
              textDecoration: 'none',
            }}
          >
            <Box
              sx={{
                position: 'relative',
                marginBottom: '20px',
              }}
            >
              <img
                src={event.thumbnailUrl}
                width='300px'
                height='150px'
                style={{
                  borderRadius: '10px',
                }}
              />
              {DateUtils.isExpired(DateUtils.utcToKst(new Date(event.eventEndAt))) && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: colors.gray80,
                    opacity: 0.8,
                    borderRadius: '10px',
                  }}
                >
                  <Typography variant='heading4B' sx={{ color: colors.white }}>
                    종료
                  </Typography>
                </Box>
              )}
            </Box>
            <Stack
              sx={{
                flexGrow: 1,
                padding: '24px 20px',
                marginLeft: '30px',
                borderWidth: '1px 0',
                borderStyle: 'solid',
                borderColor: colors.gray50,
              }}
            >
              <Typography variant='heading4B' sx={{ color: colors.gray80 }}>
                {event.title}
              </Typography>
              {/*<Typography variant='largeTextM' sx={{ color: colors.gray80 }}>{event.description}</Typography>*/}
              <Typography variant='smallTextR' sx={{ color: colors.gray50, marginTop: 'auto' }}>
                {DateUtils.parseUtcAndFormatKst(event.eventStartAt, DATEFORMAT_YYYY_MM_DD)} ~{' '}
                {DateUtils.parseUtcAndFormatKst(event.eventEndAt, DATEFORMAT_YYYY_MM_DD)}
              </Typography>
            </Stack>
          </Stack>
        ))}
      </Stack>

      <MedipandaPagination
        count={totalPages}
        page={page}
        showFirstButton
        showLastButton
        renderItem={item => <PaginationItem {...item} component={RouterLink} to={setUrlParams({ page: item.page }, initialSearchParams)} />}
        sx={{
          alignSelf: 'center',
          marginTop: '30px',
        }}
      />
    </>
  );
}

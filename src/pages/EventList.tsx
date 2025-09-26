import { getEventBoards } from '@/backend';
import { MedipandaPagination } from '@/custom/components/MedipandaPagination';
import { usePageFetchFormik } from '@/lib/components/usePageFetchFormik';
import { colors } from '@/themes';
import { formatYyyyMmDd, isExpired } from '@/lib/utils/dateFormat';
import { Box, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export default function EventList() {
  const {
    content: page,
    pageCount: totalPages,
    formik: pageFormik,
  } = usePageFetchFormik({
    fetcher: values => {
      return getEventBoards({
        page: values.pageIndex,
        size: values.pageSize,
      });
    },
    contentSelector: response => response.content,
    pageCountSelector: response => response.totalPages,
    initialContent: [],
  });

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
        {page.map(event => (
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
              {isExpired(event.eventEndAt) && (
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
                {formatYyyyMmDd(event.eventStartAt)} ~ {formatYyyyMmDd(event.eventEndAt)}
              </Typography>
            </Stack>
          </Stack>
        ))}
      </Stack>

      <MedipandaPagination
        count={totalPages}
        page={pageFormik.values.pageIndex + 1}
        showFirstButton
        showLastButton
        onChange={(_, page) => {
          pageFormik.setFieldValue('pageIndex', page - 1);
        }}
        sx={{
          alignSelf: 'center',
          marginTop: '30px',
        }}
      />
    </>
  );
}

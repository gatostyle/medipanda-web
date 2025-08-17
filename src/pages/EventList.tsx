import { Box, Stack, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router';
import { type EventBoardSummaryResponse, getEventBoards } from '../backend';
import { MedipandaPagination } from '../components/MedipandaPagination.tsx';
import { colors, typography } from '../globalStyles.ts';
import { formatYyyyMmDd } from '../utils/dateFormat.ts';

export default function EventList() {
  const [data, setData] = useState<EventBoardSummaryResponse[]>([]);
  const [totalPages, setTotalPages] = useState(0);

  const formik = useFormik({
    initialValues: {
      pageIndex: 0,
      pageSize: 10,
      totalPages: 1,
    },
    onSubmit: async () => {
      if (formik.values.pageIndex !== 0) {
        await formik.setFieldValue('pageIndex', 0);
      } else {
        await fetchData();
      }
    },
  });

  const fetchData = async () => {
    const response = await getEventBoards({
      page: formik.values.pageIndex,
      size: formik.values.pageSize,
    });

    setData(response.content);
    setTotalPages(response.totalPages);
  };

  useEffect(() => {
    fetchData();
  }, [formik.values.pageIndex, formik.values.pageSize]);

  return (
    <Stack>
      <Typography
        sx={{
          ...typography.heading3M,
          color: colors.gray80,
        }}
      >
        이벤트
      </Typography>

      <Stack
        sx={{
          marginTop: '30px',
          marginBottom: '40px',
        }}
      >
        {data.map(event => (
          <Stack
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
              {new Date(event.eventEndAt) < new Date() && (
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
                  <Typography
                    sx={{
                      ...typography.heading4B,
                      color: colors.white,
                    }}
                  >
                    종료
                  </Typography>
                </Box>
              )}
            </Box>
            <Stack
              sx={{
                width: '100%',
                padding: '24px 20px',
                marginLeft: '30px',
                borderWidth: '1px 0',
                borderStyle: 'solid',
                borderColor: colors.gray50,
              }}
            >
              <Typography sx={{ ...typography.heading4B, color: colors.gray80 }}>{event.title}</Typography>
              {/*<Typography sx={{ ...typography.largeTextM, color: colors.gray80 }}>{event.description}</Typography>*/}
              <Typography sx={{ ...typography.smallTextR, color: colors.gray50, marginTop: 'auto' }}>
                {formatYyyyMmDd(event.eventStartAt)} ~ {formatYyyyMmDd(event.eventEndAt)}
              </Typography>
            </Stack>
          </Stack>
        ))}
      </Stack>

      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <MedipandaPagination
          count={totalPages}
          page={formik.values.pageIndex + 1}
          showFirstButton
          showLastButton
          onChange={(_, page) => {
            formik.setFieldValue('pageIndex', page - 1);
          }}
        />
      </Box>
    </Stack>
  );
}

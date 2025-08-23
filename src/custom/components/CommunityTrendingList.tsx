import { withSequence } from '@/lib/withSequence';
import { colors, typography } from '@/themes';
import { Button, Stack, Table, TableBody, TableCell, TableRow, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router';

export function CommunityTrendingList() {
  return (
    <Stack
      sx={{
        padding: '30px',
        border: `1px solid ${colors.gray30}`,
        borderRadius: '5px',
      }}
    >
      <Stack direction='row' gap='5px'>
        <Button
          variant='outlined'
          startIcon={<img src='/assets/icons/icon-fire.svg' />}
          sx={{
            ...typography.smallTextM,
            color: colors.vividViolet,
            width: '60px',
            height: '24px',
            padding: '3px 5px',
            borderColor: colors.vividViolet,
          }}
        >
          인기순
        </Button>
        <Button
          variant='outlined'
          startIcon={<img src='/assets/icons/icon-chat-light.svg' />}
          sx={{
            ...typography.smallTextM,
            color: colors.vividViolet,
            width: '60px',
            height: '24px',
            padding: '3px 5px',
            borderColor: colors.vividViolet,
          }}
        >
          댓글순
        </Button>
      </Stack>
      <Table sx={{ marginTop: '20px' }}>
        <TableBody>
          {withSequence(
            Array.from({ length: 10 }).map((_, index) => {
              return {
                id: index,
                title: '[노하우 공유] "이런 원장님/교수님은 이렇게 뚫었다!" 나만의 디...',
                url: '/community/anonymous/1',
              };
            }),
          ).map(item => (
            <TableRow
              key={item.id}
              sx={{
                height: '28px',
              }}
            >
              <TableCell
                sx={{
                  width: '28px',
                  padding: '0',
                  paddingRight: '5px',
                  borderBottom: `1px solid ${colors.gray20}`,
                  textAlign: 'right',
                }}
              >
                <Typography variant='smallTextB' sx={{ color: colors.gray80 }}>
                  {item.sequence}
                </Typography>
              </TableCell>
              <TableCell
                sx={{
                  padding: '0',
                  borderBottom: `1px solid ${colors.gray20}`,
                }}
              >
                <Typography
                  component={RouterLink}
                  to={item.url}
                  variant='smallTextR'
                  sx={{
                    color: colors.gray80,
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                      color: colors.vividViolet,
                    },
                  }}
                >
                  {item.title}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Stack>
  );
}

import { type BoardPostResponse, BoardSortType, BoardType, getBoards } from '@/backend';
import { colors, typography } from '@/themes';
import { Button, Link, Stack, Table, TableBody, TableCell, TableRow, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

export function CommunityTrendingList({ boardType }: { boardType: keyof typeof BoardType }) {
  const [sortType, setSortType] = useState<keyof typeof BoardSortType>(BoardSortType.LIKES);
  const pageSize = 10;

  const [contents, setContents] = useState<BoardPostResponse[] | null>(null);

  const fetchContents = async () => {
    const response = await getBoards({
      boardType,
      sortType,
      size: pageSize,
    });

    setContents(response.content);
  };

  useEffect(() => {
    fetchContents();
  }, [sortType]);

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
          onClick={() => setSortType(BoardSortType.LIKES)}
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
          onClick={() => setSortType(BoardSortType.COMMENTS)}
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
          {contents?.map((item, index) => (
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
                  {index + 1}
                </Typography>
              </TableCell>
              <TableCell
                sx={{
                  padding: '0',
                  borderBottom: `1px solid ${colors.gray20}`,
                }}
              >
                <Link
                  underline='hover'
                  component={RouterLink}
                  to={`/community/${boardType.toLowerCase()}/${item.id}`}
                  sx={{
                    color: colors.gray80,
                    '&:hover': {
                      color: colors.vividViolet,
                    },
                  }}
                >
                  <Typography variant='smallTextR'>{item.title}</Typography>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Stack>
  );
}

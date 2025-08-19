import { KeyboardArrowRight } from '@mui/icons-material';
import { Box, Button, Stack, type TableProps, Typography } from '@mui/material';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router';
import { type BoardPostResponse, getBoards } from '../backend';
import { LazyImage } from '../components/LazyImage.tsx';
import { MedipandaButton } from '../custom/components/MedipandaButton.tsx';
import { MedipandaTable } from '../custom/components/MedipandaTable.tsx';
import { colors, typography } from '../custom/globalStyles.ts';
import { formatYyyyMmDd } from '../utils/dateFormat.ts';
import { type Sequenced, withSequence } from '../utils/withSequence.ts';

export default function Home() {
  const [recentBoardType, setRecentBoardType] = useState<'ANONYMOUS' | 'MR_CSO_MATCHING'>('ANONYMOUS');

  return (
    <Box>
      <Box sx={{ mb: '32px' }}>
        <LazyImage
          src='/assets/hero.svg'
          alt='Hero Section'
          style={{
            width: '100%',
            height: 'auto',
            borderRadius: '16px',
            display: 'block',
          }}
        />
      </Box>

      <Stack direction='row' alignItems='center' gap='20px' sx={{ mb: 0 }}>
        <Box>
          <RouterLink to='/partnership'>
            <LazyImage
              src='/assets/banner-fixed.svg'
              alt='Banner Fixed'
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'block',
              }}
            />
          </RouterLink>
        </Box>
        <Box>
          <RouterLink to='/sales-agency-products'>
            <LazyImage
              src='/assets/banner-rolling.svg'
              alt='Banner Rolling'
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'block',
              }}
            />
          </RouterLink>
        </Box>
      </Stack>

      <Stack
        direction='row'
        alignItems='center'
        sx={{
          width: '100%',
          marginTop: '40px',
        }}
      >
        <Button
          variant='text'
          onClick={() => setRecentBoardType('ANONYMOUS')}
          sx={{
            ...typography.heading4B,
            color: recentBoardType === 'ANONYMOUS' ? colors.gray80 : colors.gray40,
          }}
        >
          익명게시판
        </Button>
        <Button
          variant='text'
          onClick={() => setRecentBoardType('MR_CSO_MATCHING')}
          sx={{
            ...typography.heading4B,
            color: recentBoardType === 'MR_CSO_MATCHING' ? colors.gray80 : colors.gray40,
            marginLeft: '30px',
          }}
        >
          MR-CSO매칭
        </Button>
        <MedipandaButton
          variant='contained'
          startIcon={<img src='/assets/icons/icon-pen.svg' />}
          component={RouterLink}
          to={recentBoardType === 'ANONYMOUS' ? '/community/anonymous/new' : '/community/mr-cso-matching/new'}
          sx={{
            marginLeft: 'auto',
          }}
        >
          글쓰기
        </MedipandaButton>
        <MedipandaButton
          variant='outlined'
          endIcon={<KeyboardArrowRight />}
          component={RouterLink}
          to={recentBoardType === 'ANONYMOUS' ? '/community/anonymous' : '/community/mr-cso-matching'}
          sx={{
            marginLeft: '10px',
          }}
        >
          더보기
        </MedipandaButton>
      </Stack>

      <RecentBoardTable boardType={recentBoardType} sx={{ marginTop: '15px' }} />
    </Box>
  );
}

function RecentBoardTable({ boardType, ...props }: TableProps & { boardType: 'ANONYMOUS' | 'MR_CSO_MATCHING' }) {
  const [page, setPage] = useState<Sequenced<BoardPostResponse>[]>([]);

  const pageFormik = useFormik({
    initialValues: {
      pageIndex: 0,
      pageSize: 10,
      totalPages: 1,
    },
    onSubmit: async () => {
      if (pageFormik.values.pageIndex !== 0) {
        await pageFormik.setFieldValue('pageIndex', 0);
      } else {
        await fetchPage();
      }
    },
  });

  const fetchPage = async () => {
    const response = await getBoards({
      boardType: boardType,
      page: pageFormik.values.pageIndex,
      size: pageFormik.values.pageSize,
    });

    setPage(withSequence(response).content);
  };

  useEffect(() => {
    pageFormik.submitForm();
  }, [boardType, pageFormik.values.pageIndex, pageFormik.values.pageSize]);

  const table = useReactTable({
    data: page,
    columns: [
      {
        header: 'No',
        cell: ({ row }) => row.original.sequence,
      },
      {
        header: '제목',
        cell: ({ row }) => (
          <Typography
            component={RouterLink}
            to={`/community/${boardType.toLowerCase()}/${row.original.id}`}
            sx={{
              textDecoration: 'none',
              color: colors.gray700,
              fontSize: '14px',
              '&:hover': { textDecoration: 'underline', color: colors.primary },
            }}
          >
            {row.original.title}
          </Typography>
        ),
      },
      {
        header: '댓글',
        cell: ({ row }) => `${row.original.commentCount}개`,
      },
      {
        header: '추천수',
        cell: ({ row }) => row.original.likesCount,
      },
      {
        header: '작성자',
        cell: ({ row }) => row.original.nickname,
      },
      {
        header: '등록일',
        cell: ({ row }) => formatYyyyMmDd(row.original.createdAt),
      },
      {
        header: '조회수',
        cell: ({ row }) => row.original.viewsCount,
      },
    ],
    getCoreRowModel: getCoreRowModel(),
  });

  return <MedipandaTable {...props} table={table} />;
}

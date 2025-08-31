import { getBanners, getBoards } from '@/backend';
import { MedipandaButton } from '@/custom/components/MedipandaButton';
import { MedipandaCarousel, type MedipandaCarouselHandle } from '@/custom/components/MedipandaCarousel';
import { MedipandaTable } from '@/custom/components/MedipandaTable';
import { useSession } from '@/hooks/useSession';
import { LazyImage } from '@/lib/react/LazyImage';
import { usePageFetchFormik } from '@/lib/react/usePageFetchFormik';
import { colors, typography } from '@/themes';
import { formatYyyyMmDd } from '@/lib/dateFormat';
import { withSequence } from '@/lib/withSequence';
import { KeyboardArrowRight } from '@mui/icons-material';
import { Box, Button, Link, Stack, type TableProps } from '@mui/material';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router';

export default function Home() {
  const { session } = useSession();

  const [recentBoardType, setRecentBoardType] = useState<'ANONYMOUS' | 'MR_CSO_MATCHING'>('ANONYMOUS');

  const { content: banners } = usePageFetchFormik({
    initialFormValues: {
      bannerStatus: 'VISIBLE' as 'VISIBLE' | 'HIDDEN',
    },
    fetcher: () => {
      return getBanners({
        bannerStatus: 'VISIBLE',
      });
    },
    contentSelector: response => response.content,
    pageCountSelector: response => response.totalPages,
    initialContent: [],
  });

  const carouselRef = useRef<MedipandaCarouselHandle>(null);

  return (
    <>
      <Box sx={{ marginBottom: '32px' }}>
        <LazyImage
          src='/assets/hero.svg'
          alt='Hero Section'
          style={{
            height: 'auto',
            borderRadius: '16px',
            display: 'block',
          }}
        />
      </Box>

      <Stack direction='row' alignItems='center' gap='20px' sx={{ marginBottom: 0 }}>
        <Box>
          <RouterLink to='/partner-contract'>
            <LazyImage
              src='/assets/banner-fixed.svg'
              alt='Banner Fixed'
              style={{
                height: 'auto',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'block',
              }}
            />
          </RouterLink>
        </Box>
        {session && banners.length > 0 && (
          <Box
            sx={{
              position: 'relative',
            }}
          >
            <MedipandaCarousel ref={carouselRef} interval={5000} width={602}>
              {banners.map(banner => (
                <RouterLink key={banner.id} to={banner.linkUrl}>
                  <LazyImage
                    src={banner.imageUrl}
                    style={{
                      width: '602px',
                      height: '180px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      display: 'block',
                    }}
                  />
                </RouterLink>
              ))}
            </MedipandaCarousel>
            {banners.length > 1 && (
              <>
                <img
                  src='/assets/carousel-left.svg'
                  onClick={carouselRef.current?.prev}
                  style={{
                    position: 'absolute',
                    top: '70px',
                    left: '10px',
                    cursor: 'pointer',
                  }}
                />
                <img
                  src='/assets/carousel-right.svg'
                  onClick={carouselRef.current?.next}
                  style={{
                    position: 'absolute',
                    top: '70px',
                    right: '10px',
                    cursor: 'pointer',
                  }}
                />
              </>
            )}
          </Box>
        )}
      </Stack>

      {session && (
        <>
          <Stack
            direction='row'
            alignItems='center'
            sx={{
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
        </>
      )}
    </>
  );
}

function RecentBoardTable({ boardType, ...props }: TableProps & { boardType: 'ANONYMOUS' | 'MR_CSO_MATCHING' }) {
  const { content: page } = usePageFetchFormik({
    fetcher: async values => {
      const response = await getBoards({
        boardType: boardType,
        page: values.pageIndex,
        size: values.pageSize,
      });

      return withSequence(response);
    },
    contentSelector: response => response.content,
    pageCountSelector: response => response.totalPages,
    initialContent: [],
  });

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
          <Link
            variant='smallTextR'
            component={RouterLink}
            to={`/community/${boardType.toLowerCase()}/${row.original.id}`}
            underline='hover'
            sx={{
              color: colors.gray70,
              '&:hover': {
                color: colors.vividViolet,
              },
            }}
          >
            {row.original.title}
          </Link>
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

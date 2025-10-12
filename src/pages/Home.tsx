import {
  type BannerResponse,
  type BoardPostResponse,
  BoardType,
  DateString,
  getBanners,
  getBoards,
  getRecentlyOpenedCount,
  monthlyCount,
  monthlyTotalAmount,
} from '@/backend';
import { MedipandaButton } from '@/custom/components/MedipandaButton';
import { MedipandaCarousel, type MedipandaCarouselHandle } from '@/custom/components/MedipandaCarousel';
import { MedipandaTable } from '@/custom/components/MedipandaTable';
import { hasCsoMemberPermission, useSession } from '@/hooks/useSession';
import { LazyImage } from '@/lib/components/LazyImage';
import { setSchema } from '@/lib/utils/url';
import { colors, typography } from '@/themes';
import { DateUtils, DATEFORMAT_YYYY_MM_DD } from '@/lib/utils/dateFormat';
import { type Sequenced, withSequence } from '@/lib/utils/withSequence';
import { KeyboardArrowRight } from '@mui/icons-material';
import { Box, Button, Link, Stack, type TableProps, Typography } from '@mui/material';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { format } from 'date-fns';
import { useEffect, useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

export default function Home() {
  const { session } = useSession();

  const [recentBoardType, setRecentBoardType] = useState<keyof typeof BoardType>(BoardType.MR_CSO_MATCHING);
  const [monthlyPrescriptionCount, setMonthlyPrescriptionCount] = useState<number | null>(null);
  const [monthlyFeeAmount, setMonthlyFeeAmount] = useState<number | null>(null);
  const [recentlyOpenedCount, setRecentlyOpenedCount] = useState<number | null>(null);

  const [banners, setBanners] = useState<BannerResponse[]>([]);

  const fetchBanners = async () => {
    const response = await getBanners({ isExposed: true });

    setBanners(
      response.content.filter(banner => {
        return DateUtils.utcToKst(new Date(banner.startAt)) <= new Date() && DateUtils.utcToKst(new Date(banner.endAt)) >= new Date();
      }),
    );
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const carouselRef = useRef<MedipandaCarouselHandle>(null);

  useEffect(() => {
    fetchHomeBanner();
  }, []);

  const fetchHomeBanner = async () => {
    const { count } = await monthlyCount({ referenceDate: Number(format(new Date(), 'yyyyMMdd')) });
    const { feeAmount } = await monthlyTotalAmount({ referenceDate: Number(format(new Date(), 'yyyyMMdd')) });
    const recentlyOpenedCount = await getRecentlyOpenedCount({ referenceDate: new DateString(new Date()) });

    setMonthlyPrescriptionCount(count);
    setMonthlyFeeAmount(feeAmount / 1_000_000);
    setRecentlyOpenedCount(recentlyOpenedCount);
  };

  return (
    <>
      <Box
        sx={{
          position: 'relative',
          marginBottom: '32px',
        }}
      >
        <LazyImage
          src='/assets/hero.svg'
          alt='Hero Section'
          style={{
            height: 'auto',
            borderRadius: '16px',
            display: 'block',
          }}
        />
        <span
          style={{
            position: 'absolute',
            top: '69px',
            left: '702px',
            color: colors.white,
          }}
        >
          <Typography variant='headingPc2B'>
            {monthlyPrescriptionCount !== null ? monthlyPrescriptionCount.toLocaleString() : '-'}
          </Typography>
          <Typography variant='heading2R'>건</Typography>
        </span>
        <span
          style={{
            position: 'absolute',
            top: '211px',
            left: '702px',
            color: colors.white,
          }}
        >
          <Typography
            variant='heading2B'
            sx={{
              fontSize: '50px',
            }}
          >
            {monthlyFeeAmount !== null ? monthlyFeeAmount.toLocaleString() : '-'}
          </Typography>
          <Typography variant='heading2R'>백만원</Typography>
        </span>
        <span
          style={{
            position: 'absolute',
            top: '353px',
            left: '702px',
            color: colors.white,
          }}
        >
          <Typography variant='headingPc2B'>{recentlyOpenedCount !== null ? recentlyOpenedCount.toLocaleString() : '-'}</Typography>
          <Typography variant='heading2R'>개사</Typography>
        </span>
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
                <RouterLink key={banner.id} to={setSchema(banner.linkUrl)} target='_blank'>
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

      {session && hasCsoMemberPermission(session) && (
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
              onClick={() => setRecentBoardType(BoardType.MR_CSO_MATCHING)}
              sx={{
                ...typography.headingPc4B,
                color: recentBoardType === BoardType.MR_CSO_MATCHING ? colors.gray80 : colors.gray40,
              }}
            >
              신규처 매칭
            </Button>
            <Button
              variant='text'
              onClick={() => setRecentBoardType(BoardType.ANONYMOUS)}
              sx={{
                ...typography.headingPc4B,
                color: recentBoardType === BoardType.ANONYMOUS ? colors.gray80 : colors.gray40,
              }}
            >
              익명게시판
            </Button>
            <MedipandaButton
              variant='contained'
              startIcon={<img src='/assets/icons/icon-pen.svg' />}
              component={RouterLink}
              to={`/community/${recentBoardType.toLowerCase().replace(/_/g, '-')}/new`}
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
              to={`/community/${recentBoardType.toLowerCase().replace(/_/g, '-')}`}
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

function RecentBoardTable({ boardType, ...props }: TableProps & { boardType: keyof typeof BoardType }) {
  const [contents, setContents] = useState<Sequenced<BoardPostResponse>[]>([]);

  const fetchContents = async () => {
    const response = await getBoards({
      boardType: boardType,
      page: 0,
      size: 10,
      filterDeleted: true,
      filterBlind: true,
    });

    setContents(withSequence(response.content));
  };

  useEffect(() => {
    fetchContents();
  }, [boardType]);

  const table = useReactTable({
    data: contents,
    columns: [
      {
        header: 'No',
        cell: ({ row }) => row.original.sequence,
      },
      {
        header: '제목',
        cell: ({ row }) => (
          <Link
            variant='smallPcR'
            component={RouterLink}
            to={`/community/${boardType.toLowerCase().replace(/_/g, '-')}/${row.original.id}`}
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
        cell: ({ row }) => DateUtils.parseUtcAndFormatKst(row.original.createdAt, DATEFORMAT_YYYY_MM_DD),
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

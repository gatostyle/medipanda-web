import { type AttachmentResponse, createBoardPost, getBanners, getBoardDetails, getBoards, updateBoardPost } from '@/backend';
import { MedipandaButton } from '@/custom/components/MedipandaButton';
import { MedipandaCarousel, type MedipandaCarouselHandle } from '@/custom/components/MedipandaCarousel';
import { MedipandaSwitch } from '@/custom/components/MedipandaSwitch';
import { MedipandaTable } from '@/custom/components/MedipandaTable';
import { useMedipandaEditor } from '@/hooks/useMedipandaEditor';
import { useSession } from '@/hooks/useSession';
import { LazyImage } from '@/lib/react/LazyImage';
import { Tiptap } from '@/lib/react/Tiptap';
import { usePageFetchFormik } from '@/lib/react/usePageFetchFormik';
import { colors, typography } from '@/themes';
import { formatYyyyMmDd } from '@/lib/dateFormat';
import { withSequence } from '@/lib/withSequence';
import { KeyboardArrowRight } from '@mui/icons-material';
import { Box, Button, FormControlLabel, Link, Stack, type TableProps, Typography } from '@mui/material';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router';

export default function Home() {
  const [recentBoardType, setRecentBoardType] = useState<'ANONYMOUS' | 'MR_CSO_MATCHING'>('ANONYMOUS');

  const boardPostId = 516;
  const boardType = 'ANONYMOUS';
  const title = '에디터 테스트';

  const [loaded, setLoaded] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachmentResponse[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const { editor, attachments: editorAttachments, setAttachments: setEditorAttachments } = useMedipandaEditor();
  const [editable, setEditable] = useState(true);

  const { session } = useSession();

  const handleFileUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = async () => {
      setSelectedFiles(prev => [...prev, ...Array.from(input.files ?? [])]);
    };
    input.click();
  };

  const handleLoad = async () => {
    try {
      const boardDetails = await getBoardDetails(boardPostId);
      setSelectedFiles([]);
      setEditorAttachments(boardDetails.attachments.filter(a => a.type === 'EDITOR'));
      setAttachedFiles(boardDetails.attachments.filter(a => a.type === 'ATTACHMENT'));
      editor.commands.setContent(boardDetails.content);
      setLoaded(true);
    } catch (e) {
      console.error('Error loading board details:', e);
      alert('게시판 정보를 불러오는 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const handleSave = async () => {
    try {
      if (loaded) {
        await updateBoardPost(boardPostId, {
          updateRequest: {
            title,
            content: editor.getHTML(),
            isBlind: null,
            isExposed: null,
            exposureRange: null,
            keepFileIds: [...attachedFiles, ...editorAttachments].map(file => file.s3fileId),
            editorFileIds: editorAttachments.map(attachment => attachment.s3fileId),
            noticeProperties: null,
          },
          newFiles: selectedFiles,
        });
        handleReset();
      } else {
        await createBoardPost({
          request: {
            boardType,
            userId: session!.userId,
            nickname: '익명',
            hiddenNickname: session!.nicknameHidden,
            title,
            content: editor.getHTML(),
            parentId: null,
            isExposed: true,
            editorFileIds: editorAttachments.map(image => image.s3fileId),
            exposureRange: 'ALL',
            noticeProperties: null,
          },
          files: selectedFiles,
        });
      }
    } catch (e) {
      console.error('Error saving post:', e);
      alert('글 작성 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const handleReset = () => {
    editor.commands.setContent('');
    setSelectedFiles([]);
    setAttachedFiles([]);
    setLoaded(false);
  };

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
      <Box>
        <FormControlLabel
          control={
            <MedipandaSwitch
              checked={editable}
              onChange={(_, checked) => {
                editor.setEditable(checked);
                setEditable(checked);
              }}
            />
          }
          label='Editable'
        />
        <Button onClick={handleLoad}>{boardPostId} 로드</Button>
        <Button onClick={handleSave}>{loaded ? '수정' : '생성'}</Button>
        <Button onClick={handleFileUpload}>파일 추가</Button>
        <Button onClick={handleReset}>리셋</Button>
        <Stack>
          {attachedFiles.map(attachment => (
            <Box key={attachment.s3fileId} sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Typography variant='body1'>{attachment.fileName}</Typography>
              <Button
                variant='outlined'
                size='small'
                onClick={() => {
                  setAttachedFiles(prev => prev.filter(it => it.s3fileId !== attachment.s3fileId));
                }}
              >
                삭제
              </Button>
            </Box>
          ))}
          {selectedFiles.map(file => (
            <Box key={file.webkitRelativePath} sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Typography variant='body1'>{file.name}</Typography>
              <Button
                variant='outlined'
                size='small'
                onClick={() => {
                  setSelectedFiles(prev => prev.filter(it => it.webkitRelativePath !== file.webkitRelativePath));
                }}
              >
                삭제
              </Button>
            </Box>
          ))}
        </Stack>
        <Tiptap editor={editor} />
      </Box>

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
        </Box>
      </Stack>

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

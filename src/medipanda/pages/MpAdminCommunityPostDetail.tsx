import { setUrlParams } from '@/lib/url';
import { useSearchParamsOrDefault } from '@/lib/useSearchParamsOrDefault';
import { useMedipandaEditor } from '@/medipanda/components/useMedipandaEditor';
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Pagination,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from '@mui/material';
import { flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import { EditorContent } from '@tiptap/react';
import ScrollX from 'components/ScrollX';
import { BoardDetailsResponse, BoardReportResponse, CommentResponse, getBoardDetails, PostAttachmentType } from '@/backend';
import { formatYyyyMmDd, formatYyyyMmDdHhMm } from '@/medipanda/utils/dateFormat';
import { Sequenced, withSequence } from '@/medipanda/utils/withSequence';
import { useSnackbar } from 'notistack';
import { SyntheticEvent, useEffect, useState } from 'react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';

export default function MpAdminCommunityPostDetail() {
  const navigate = useNavigate();
  const { boardId: paramBoardId } = useParams();
  const boardId = Number(paramBoardId);

  const initialSearchParams = { tab: 'post' };
  const { tab } = useSearchParamsOrDefault(initialSearchParams);

  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<BoardDetailsResponse | null>(null);
  const [comments, setComments] = useState<Sequenced<CommentResponse>[]>([]);
  const [reports, setReports] = useState<Sequenced<BoardReportResponse>[]>([]);

  const { enqueueSnackbar } = useSnackbar();

  const fetchDetail = async (boardId: number) => {
    if (Number.isNaN(boardId)) {
      alert('잘못된 접근입니다.');
      return navigate('/admin/community-posts');
    }

    try {
      setLoading(true);
      const detail = await getBoardDetails(boardId);
      setDetail(detail);

      setComments(withSequence(detail.comments));
      setReports(withSequence(detail.reports));
    } catch (error) {
      console.error('Failed to fetch post data:', error);
      enqueueSnackbar('포스트 정보를 불러오는데 실패했습니다.', { variant: 'error' });
      navigate('/admin/community-posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail(boardId);
  }, [boardId]);

  const handleTabChange = (_: SyntheticEvent, value: string) => {
    const url = setUrlParams({ tab: value }, initialSearchParams);

    navigate(url);
  };

  if (loading || !detail) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant='h4' gutterBottom sx={{ mb: 3 }}>
        포스트 상세
      </Typography>

      <Card>
        <Tabs value={tab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab value='post' label='포스트' />
          <Tab value='comments' label='댓글' />
          <Tab value='reports' label='신고기록' />
        </Tabs>

        {tab === 'post' && <PostTab detail={detail} />}

        {tab === 'comments' && <CommentsTab comments={comments} />}

        {tab === 'reports' && <ReportsTab reports={reports} />}
      </Card>
    </Box>
  );
}

function PostTab({ detail }: { detail: BoardDetailsResponse }) {
  const { editor, setAttachments: setEditorAttachments } = useMedipandaEditor();

  useEffect(() => {
    editor.setEditable(false);
    editor.commands.setContent(detail.content);
    setEditorAttachments(detail.attachments.filter(a => a.type === PostAttachmentType.EDITOR));
  }, [detail]);

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={2}>
        <Stack direction='row' spacing={4}>
          <Box>
            <Typography variant='body2' color='text.secondary'>
              게시판유형
            </Typography>
            <Typography variant='body1'>{detail.boardType}</Typography>
          </Box>
          <Box>
            <Typography variant='body2' color='text.secondary'>
              회원명
            </Typography>
            <Typography variant='body1'>
              {detail.name}({detail.userId})
            </Typography>
          </Box>
          <Box>
            <Typography variant='body2' color='text.secondary'>
              닉네임
            </Typography>
            <Typography variant='body1'>{detail.nickname}</Typography>
          </Box>
        </Stack>

        <Box>
          <Typography variant='body2' color='text.secondary'>
            제목
          </Typography>
          <Typography variant='body1'>{detail.title}</Typography>
        </Box>

        <Box>
          <Typography variant='body2' color='text.secondary'>
            내용
          </Typography>
          <Box sx={{ mt: 1 }}>
            <EditorContent editor={editor} />
          </Box>
        </Box>

        <Stack direction='row' spacing={4}>
          <Box>
            <Typography variant='body2' color='text.secondary'>
              좋아요 수
            </Typography>
            <Typography variant='body1'>{detail.likesCount}</Typography>
          </Box>
          <Box>
            <Typography variant='body2' color='text.secondary'>
              댓글 수
            </Typography>
            <Typography variant='body1'>{detail.commentCount}</Typography>
          </Box>
          <Box>
            <Typography variant='body2' color='text.secondary'>
              조회 수
            </Typography>
            <Typography variant='body1'>{detail.viewsCount}</Typography>
          </Box>
          <Box>
            <Typography variant='body2' color='text.secondary'>
              블라인드 여부
            </Typography>
            <Typography variant='body1'>{detail.isBlind ? 'Y' : 'N'}</Typography>
          </Box>
          <Box>
            <Typography variant='body2' color='text.secondary'>
              등록일
            </Typography>
            <Typography variant='body1'>{formatYyyyMmDd(detail.createdAt)}</Typography>
          </Box>
        </Stack>

        <Stack direction='row' justifyContent='center' sx={{ mt: 4 }}>
          <Button variant='contained' color='inherit' component={RouterLink} to='/admin/community-posts' sx={{ minWidth: 120 }}>
            목록
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

function CommentsTab({ comments }: { comments: Sequenced<CommentResponse>[] }) {
  const table = useReactTable({
    data: comments,
    columns: [
      {
        header: 'No',
        cell: ({ row }) => row.original.sequence,
        size: 60,
      },
      {
        header: '아이디',
        cell: ({ row }) => row.original.userId,
        size: 120,
      },
      {
        header: '회원명',
        cell: ({ row }) => row.original.name,
        size: 100,
      },
      {
        header: '닉네임',
        cell: ({ row }) => row.original.nickname,
        size: 120,
      },
      {
        header: '댓글내용',
        cell: ({ row }) => row.original.content,
        size: 300,
      },
      {
        header: '작성일시',
        cell: ({ row }) => formatYyyyMmDdHhMm(row.original.createdAt),
        size: 160,
      },
    ],
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      pagination: { pageIndex: 0, pageSize: 20 },
    },
    pageCount: 1,
    manualPagination: true,
  });

  return (
    <Box sx={{ p: 3 }}>
      <ScrollX>
        <TableContainer>
          <Table size='small'>
            <TableHead>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <TableCell key={header.id} style={{ width: header.getSize() }}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableHead>
            <TableBody>
              {table.getRowModel().rows.map(row => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </ScrollX>

      <Stack direction='row' justifyContent='center' sx={{ mt: 2 }}>
        <Pagination count={1} page={1} color='primary' variant='outlined' showFirstButton showLastButton />
      </Stack>
    </Box>
  );
}

function ReportsTab({ reports }: { reports: Sequenced<BoardReportResponse>[] }) {
  const table = useReactTable({
    data: reports,
    columns: [
      {
        header: 'No',
        cell: ({ row }) => row.original.sequence,
        size: 60,
      },
      {
        header: '아이디',
        cell: ({ row }) => row.original.userId,
        size: 120,
      },
      {
        header: '회원명',
        cell: ({ row }) => row.original.memberName,
        size: 100,
      },
      {
        header: '닉네임',
        cell: ({ row }) => row.original.nickname,
        size: 120,
      },
      {
        header: '신고유형',
        cell: ({ row }) => row.original.reportType,
        size: 150,
      },
      {
        header: '신고일시',
        cell: ({ row }) => formatYyyyMmDdHhMm(row.original.reportDateTime),
        size: 160,
      },
    ],
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      pagination: { pageIndex: 0, pageSize: 20 },
    },
    pageCount: 1,
    manualPagination: true,
  });

  return (
    <Box sx={{ p: 3 }}>
      <ScrollX>
        <TableContainer>
          <Table size='small'>
            <TableHead>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <TableCell key={header.id} style={{ width: header.getSize() }}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableHead>
            <TableBody>
              {table.getRowModel().rows.map(row => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </ScrollX>

      <Stack direction='row' justifyContent='center' sx={{ mt: 2 }}>
        <Pagination count={1} page={1} color='primary' variant='outlined' showFirstButton showLastButton />
      </Stack>
    </Box>
  );
}

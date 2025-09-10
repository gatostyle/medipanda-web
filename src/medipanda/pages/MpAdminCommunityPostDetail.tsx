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
import ScrollX from 'components/ScrollX';
import { BoardReportResponse, CommentResponse, getBoardDetails } from '@/backend';
import { BOARD_TYPE_LABELS } from '@/medipanda/ui-labels';
import { formatYyyyMmDd, formatYyyyMmDdHhMm } from '@/medipanda/utils/dateFormat';
import { Sequenced, withSequence } from '@/medipanda/utils/withSequence';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

export default function MpAdminCommunityPostDetail() {
  const navigate = useNavigate();
  const { boardId: paramBoardId } = useParams();
  const boardId = Number(paramBoardId);

  const [searchParams, setSearchParams] = useSearchParams();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const { enqueueSnackbar } = useSnackbar();

  // const { editor, attachments: editorAttachments, setAttachments: setEditorAttachments, ...props } = useMedipandaEditor();
  //
  // useEffect(() => {
  //   editor.setEditable(false);
  // }, [editor]);

  const fetchData = async (boardId: number) => {
    if (Number.isNaN(boardId)) {
      alert('잘못된 접근입니다.');
      return navigate('/admin/community-posts');
    }

    try {
      setLoading(true);
      const boardDetail = await getBoardDetails(boardId);

      setPostDetail({
        boardType: BOARD_TYPE_LABELS[boardDetail.boardType],
        name: boardDetail.name,
        userId: boardDetail.userId,
        nickname: boardDetail.nickname,
        title: boardDetail.title,
        likesCount: boardDetail.likesCount,
        commentsCount: boardDetail.commentCount,
        viewsCount: boardDetail.viewsCount,
        isBlind: boardDetail.isBlind,
        registrationDate: boardDetail.createdAt,
      });

      // editor.commands.setContent(boardDetail.content);

      setComments(withSequence(boardDetail.comments));
      setReports(withSequence(boardDetail.reports));
    } catch (error) {
      console.error('Failed to fetch post data:', error);
      enqueueSnackbar('포스트 정보를 불러오는데 실패했습니다.', { variant: 'error' });
      navigate('/admin/community-posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'comments') {
      setTabValue(1);
    } else if (tab === 'reports') {
      setTabValue(2);
    } else {
      setTabValue(0);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchData(boardId);
  }, [boardId]);

  const [postDetail, setPostDetail] = useState({
    boardType: '',
    name: '',
    userId: '',
    nickname: '',
    title: '',
    likesCount: 0,
    commentsCount: 0,
    viewsCount: 0,
    isBlind: false,
    registrationDate: '',
  });

  const [comments, setComments] = useState<Sequenced<CommentResponse>[]>([]);
  const [reports, setReports] = useState<Sequenced<BoardReportResponse>[]>([]);

  const commentTable = useReactTable({
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

  const reportTable = useReactTable({
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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    const tabNames = ['post', 'comments', 'reports'];
    setSearchParams({ tab: tabNames[newValue] });
  };

  const handleBackToList = () => {
    navigate('/admin/community-posts');
  };

  if (loading) {
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
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label='포스트' />
          <Tab label='댓글' />
          <Tab label='신고기록' />
        </Tabs>

        {tabValue === 0 && (
          <Box sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Stack direction='row' spacing={4}>
                <Box>
                  <Typography variant='body2' color='text.secondary'>
                    게시판유형
                  </Typography>
                  <Typography variant='body1'>{postDetail.boardType}</Typography>
                </Box>
                <Box>
                  <Typography variant='body2' color='text.secondary'>
                    회원명
                  </Typography>
                  <Typography variant='body1'>
                    {postDetail.name}({postDetail.userId})
                  </Typography>
                </Box>
                <Box>
                  <Typography variant='body2' color='text.secondary'>
                    닉네임
                  </Typography>
                  <Typography variant='body1'>{postDetail.nickname}</Typography>
                </Box>
              </Stack>

              <Box>
                <Typography variant='body2' color='text.secondary'>
                  제목
                </Typography>
                <Typography variant='body1'>{postDetail.title}</Typography>
              </Box>

              <Box>
                <Typography variant='body2' color='text.secondary'>
                  내용
                </Typography>
                <Box sx={{ mt: 1 }}>{/*<TiptapEditor {...props} editor={editor} />*/}</Box>
              </Box>

              <Stack direction='row' spacing={4}>
                <Box>
                  <Typography variant='body2' color='text.secondary'>
                    좋아요 수
                  </Typography>
                  <Typography variant='body1'>{postDetail.likesCount}</Typography>
                </Box>
                <Box>
                  <Typography variant='body2' color='text.secondary'>
                    댓글 수
                  </Typography>
                  <Typography variant='body1'>{postDetail.commentsCount}</Typography>
                </Box>
                <Box>
                  <Typography variant='body2' color='text.secondary'>
                    조회 수
                  </Typography>
                  <Typography variant='body1'>{postDetail.viewsCount}</Typography>
                </Box>
                <Box>
                  <Typography variant='body2' color='text.secondary'>
                    블라인드 여부
                  </Typography>
                  <Typography variant='body1'>{postDetail.isBlind}</Typography>
                </Box>
                <Box>
                  <Typography variant='body2' color='text.secondary'>
                    등록일
                  </Typography>
                  <Typography variant='body1'>{formatYyyyMmDd(postDetail.registrationDate)}</Typography>
                </Box>
              </Stack>

              <Stack direction='row' justifyContent='center' sx={{ mt: 4 }}>
                <Button variant='contained' color='inherit' onClick={handleBackToList} sx={{ minWidth: 120 }}>
                  목록
                </Button>
              </Stack>
            </Stack>
          </Box>
        )}

        {tabValue === 1 && (
          <Box sx={{ p: 3 }}>
            <ScrollX>
              <TableContainer>
                <Table size='small'>
                  <TableHead>
                    {commentTable.getHeaderGroups().map(headerGroup => (
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
                    {commentTable.getRowModel().rows.map(row => (
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
        )}

        {tabValue === 2 && (
          <Box sx={{ p: 3 }}>
            <ScrollX>
              <TableContainer>
                <Table size='small'>
                  <TableHead>
                    {reportTable.getHeaderGroups().map(headerGroup => (
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
                    {reportTable.getRowModel().rows.map(row => (
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
        )}
      </Card>
    </Box>
  );
}

import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
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
  Pagination,
  CircularProgress
} from '@mui/material';
import { ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import ScrollX from 'components/ScrollX';
import { Sequenced, withSequence } from 'medipanda/utils/withSequence';
import { TiptapEditor } from 'medipanda/components/TiptapEditor';
import { BoardDetailsResponse, BoardReportResponse, CommentResponse, getBoardDetails } from 'medipanda/backend';
import { useSnackbar } from 'notistack';
import { BOARD_TYPE_LABELS } from 'medipanda/ui-labels';

interface BoardDetailsResponseWithMockData extends BoardDetailsResponse {
  userId: string;
  memberName: string;
}

function withMock<T extends BoardDetailsResponse>(data: T): T & BoardDetailsResponseWithMockData {
  return {
    ...data,
    userId: '아이디',
    memberName: '사용자명'
  };
}

interface CommentResponseWithMockData extends CommentResponse {
  userId: string;
  memberName: string;
}

function withMockComments<T extends CommentResponse>(data: T): T & CommentResponseWithMockData {
  return {
    ...data,
    userId: '아이디',
    memberName: '사용자명'
  };
}

export default function MpAdminCommunityPostDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const { enqueueSnackbar } = useSnackbar();

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
    const fetchPostData = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const boardDetail = withMock(await getBoardDetails(parseInt(id)));

        setPostDetail({
          boardType: BOARD_TYPE_LABELS[boardDetail.boardType],
          memberName: boardDetail.memberName,
          userId: boardDetail.userId,
          nickname: boardDetail.nickname,
          title: boardDetail.title,
          content: boardDetail.content,
          likesCount: boardDetail.likesCount,
          commentsCount: boardDetail.commentCount,
          viewsCount: boardDetail.viewsCount,
          isBlind: boardDetail.isBlind,
          registrationDate: boardDetail.createdAt
        });

        setComments(withSequence(boardDetail.comments).map(withMockComments));
        setReports(withSequence(boardDetail.reports));
      } catch (error) {
        console.error('Failed to fetch post data:', error);
        enqueueSnackbar('포스트 정보를 불러오는데 실패했습니다.', { variant: 'error' });
        navigate('/admin/community-posts');
      } finally {
        setLoading(false);
      }
    };

    fetchPostData();
  }, [id, navigate, enqueueSnackbar]);

  const [postDetail, setPostDetail] = useState({
    boardType: '',
    memberName: '',
    userId: '',
    nickname: '',
    title: '',
    content: '',
    likesCount: 0,
    commentsCount: 0,
    viewsCount: 0,
    isBlind: false,
    registrationDate: ''
  });

  const [comments, setComments] = useState<Sequenced<CommentResponse>[]>([]);
  const [reports, setReports] = useState<Sequenced<BoardReportResponse>[]>([]);

  const commentColumns = useMemo<ColumnDef<Sequenced<CommentResponse>>[]>(
    () => [
      {
        header: 'No',
        accessorKey: 'sequence',
        size: 60
      },
      {
        header: '아이디',
        accessorKey: 'userId',
        size: 120
      },
      {
        header: '회원명',
        accessorKey: 'memberName',
        size: 100
      },
      {
        header: '닉네임',
        accessorKey: 'nickname',
        size: 120
      },
      {
        header: '댓글내용',
        accessorKey: 'content',
        size: 300
      },
      {
        header: '작성일시',
        accessorKey: 'createdAt',
        size: 160
      }
    ],
    []
  );

  const reportColumns = useMemo<ColumnDef<Sequenced<BoardReportResponse>>[]>(
    () => [
      {
        header: 'No',
        accessorKey: 'sequence',
        size: 60
      },
      {
        header: '아이디',
        accessorKey: 'userId',
        size: 120
      },
      {
        header: '회원명',
        accessorKey: 'memberName',
        size: 100
      },
      {
        header: '닉네임',
        accessorKey: 'nickname',
        size: 120
      },
      {
        header: '신고유형',
        accessorKey: 'reportType',
        size: 150
      },
      {
        header: '신고일시',
        accessorKey: 'reportDateTime',
        cell: ({ row }) => {
          const value = row.original.reportDateTime;
          return value;
        },
        size: 160
      }
    ],
    []
  );

  const commentTable = useReactTable({
    data: comments,
    columns: commentColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      pagination: { pageIndex: 0, pageSize: 20 }
    },
    pageCount: 1,
    manualPagination: true
  });

  const reportTable = useReactTable({
    data: reports,
    columns: reportColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      pagination: { pageIndex: 0, pageSize: 20 }
    },
    pageCount: 1,
    manualPagination: true
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
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        포스트 상세
      </Typography>

      <Card>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="포스트" />
          <Tab label="댓글" />
          <Tab label="신고기록" />
        </Tabs>

        {tabValue === 0 && (
          <Box sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Stack direction="row" spacing={4}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    게시판유형
                  </Typography>
                  <Typography variant="body1">{postDetail.boardType}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    회원명
                  </Typography>
                  <Typography variant="body1">
                    {postDetail.memberName}({postDetail.userId})
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    닉네임
                  </Typography>
                  <Typography variant="body1">{postDetail.nickname}</Typography>
                </Box>
              </Stack>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  제목
                </Typography>
                <Typography variant="body1">{postDetail.title}</Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  내용
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <TiptapEditor content={postDetail.content} readOnly />
                </Box>
              </Box>

              <Stack direction="row" spacing={4}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    좋아요 수
                  </Typography>
                  <Typography variant="body1">{postDetail.likesCount}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    댓글 수
                  </Typography>
                  <Typography variant="body1">{postDetail.commentsCount}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    조회 수
                  </Typography>
                  <Typography variant="body1">{postDetail.viewsCount}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    블라인드 여부
                  </Typography>
                  <Typography variant="body1">{postDetail.isBlind}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    등록일
                  </Typography>
                  <Typography variant="body1">{postDetail.registrationDate}</Typography>
                </Box>
              </Stack>

              <Stack direction="row" justifyContent="center" sx={{ mt: 4 }}>
                <Button variant="contained" color="inherit" onClick={handleBackToList} sx={{ minWidth: 120 }}>
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
                <Table size="small">
                  <TableHead>
                    {commentTable.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableCell key={header.id} style={{ width: header.getSize() }}>
                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableHead>
                  <TableBody>
                    {commentTable.getRowModel().rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </ScrollX>

            <Stack direction="row" justifyContent="center" sx={{ mt: 2 }}>
              <Pagination count={1} page={1} color="primary" variant="outlined" showFirstButton showLastButton />
            </Stack>
          </Box>
        )}

        {tabValue === 2 && (
          <Box sx={{ p: 3 }}>
            <ScrollX>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    {reportTable.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableCell key={header.id} style={{ width: header.getSize() }}>
                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableHead>
                  <TableBody>
                    {reportTable.getRowModel().rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </ScrollX>

            <Stack direction="row" justifyContent="center" sx={{ mt: 2 }}>
              <Pagination count={1} page={1} color="primary" variant="outlined" showFirstButton showLastButton />
            </Stack>
          </Box>
        )}
      </Card>
    </Box>
  );
}

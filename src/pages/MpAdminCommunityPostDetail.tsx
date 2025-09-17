import { setUrlParams } from '@/lib/utils/url';
import { useSearchParamsOrDefault } from '@/lib/hooks/useSearchParamsOrDefault';
import { useMedipandaEditor } from '@/hooks/useMedipandaEditor';
import { useMpModal } from '@/hooks/useMpModal';
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
import { EditorContent } from '@tiptap/react';
import { type BoardDetailsResponse, type BoardReportResponse, type CommentResponse, getBoardDetails, PostAttachmentType } from '@/backend';
import { formatYyyyMmDd, formatYyyyMmDdHhMm } from '@/lib/utils/dateFormat';
import { type Sequenced, withSequence } from '@/lib/utils/withSequence';
import { useSnackbar } from 'notistack';
import { type SyntheticEvent, useEffect, useState } from 'react';
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
  const { alertError } = useMpModal();

  const { enqueueSnackbar } = useSnackbar();

  const fetchDetail = async (boardId: number) => {
    if (Number.isNaN(boardId)) {
      await alertError('잘못된 접근입니다.');
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
      return window.history.back();
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

  if (loading || detail === null) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack sx={{ gap: 3 }}>
      <Typography variant='h4'>포스트 상세</Typography>

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
    </Stack>
  );
}

function PostTab({ detail }: { detail: BoardDetailsResponse }) {
  const { editor, setAttachments: setEditorAttachments } = useMedipandaEditor();

  useEffect(() => {
    editor.setEditable(false);
    editor.commands.setContent(detail.content);
    setEditorAttachments(detail.attachments.filter(a => a.type === PostAttachmentType.EDITOR));
  }, [detail, editor]);

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
  return (
    <Box sx={{ p: 3 }}>
      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell width={60}>No</TableCell>
              <TableCell width={120}>아이디</TableCell>
              <TableCell width={100}>회원명</TableCell>
              <TableCell width={120}>닉네임</TableCell>
              <TableCell width={300}>댓글내용</TableCell>
              <TableCell width={160}>작성일시</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {comments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align='center' sx={{ py: 3 }}>
                  <Typography variant='body2' color='text.secondary'>
                    검색 결과가 없습니다.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              comments.map(item => (
                <TableRow key={item.id}>
                  <TableCell>{item.sequence}</TableCell>
                  <TableCell>{item.userId}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.nickname}</TableCell>
                  <TableCell>{item.content}</TableCell>
                  <TableCell>{formatYyyyMmDdHhMm(item.createdAt)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Stack direction='row' justifyContent='center' sx={{ mt: 2 }}>
        <Pagination count={1} page={1} color='primary' variant='outlined' showFirstButton showLastButton />
      </Stack>
    </Box>
  );
}

function ReportsTab({ reports }: { reports: Sequenced<BoardReportResponse>[] }) {
  return (
    <Box sx={{ p: 3 }}>
      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell width={60}>No</TableCell>
              <TableCell width={120}>아이디</TableCell>
              <TableCell width={100}>회원명</TableCell>
              <TableCell width={120}>닉네임</TableCell>
              <TableCell width={150}>신고유형</TableCell>
              <TableCell width={160}>신고일시</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align='center' sx={{ py: 3 }}>
                  <Typography variant='body2' color='text.secondary'>
                    검색 결과가 없습니다.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              reports.map(item => (
                <TableRow key={item.id}>
                  <TableCell>{item.sequence}</TableCell>
                  <TableCell>{item.userId}</TableCell>
                  <TableCell>{item.memberName}</TableCell>
                  <TableCell>{item.nickname}</TableCell>
                  <TableCell>{item.reportType}</TableCell>
                  <TableCell>{formatYyyyMmDdHhMm(item.reportDateTime)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Stack direction='row' justifyContent='center' sx={{ mt: 2 }}>
        <Pagination count={1} page={1} color='primary' variant='outlined' showFirstButton showLastButton />
      </Stack>
    </Box>
  );
}

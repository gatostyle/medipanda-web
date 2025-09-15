import { useMpModal } from '@/medipanda/hooks/useMpModal';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from '@mui/material';
import Stack from '@mui/material/Stack';
import { EditorContent } from '@tiptap/react';
import { BoardDetailsResponse, getBoardDetails, PostAttachmentType } from '@/backend';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { useMedipandaEditor } from '../components/useMedipandaEditor';
import { formatYyyyMmDd } from '../utils/dateFormat';

export default function MpAdminAtoZDetail() {
  const navigate = useNavigate();
  const { boardId: paramBoardId } = useParams();
  const boardId = Number(paramBoardId);

  const { enqueueSnackbar } = useSnackbar();
  const [detail, setDetail] = useState<BoardDetailsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const { editor, setAttachments: setEditorAttachments } = useMedipandaEditor();

  const { alertError } = useMpModal();

  useEffect(() => {
    fetchDetail(boardId);
  }, [boardId]);

  const fetchDetail = async (boardId: number) => {
    if (Number.isNaN(boardId)) {
      await alertError('잘못된 접근입니다.');
      return navigate('/admin/atoz');
    }

    setLoading(true);
    try {
      const detail = await getBoardDetails(boardId);
      setDetail(detail);

      editor.setEditable(false);
      editor.commands.setContent(detail.content);
      setEditorAttachments(detail.attachments.filter(a => a.type === PostAttachmentType.EDITOR));
    } catch (error) {
      console.error('Failed to fetch CSO A to Z detail:', error);
      enqueueSnackbar('데이터를 불러오는데 실패했습니다.', { variant: 'error' });
      return window.history.back();
    } finally {
      setLoading(false);
    }
  };

  if (loading || detail === null) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack sx={{ gap: 3 }}>
      <Typography variant='h4'>CSO A TO Z 상세</Typography>

      <Card sx={{ padding: 3 }}>
        <TableContainer>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell component='th' scope='row' sx={{ width: 120, fontWeight: 'bold' }}>
                  제목
                </TableCell>
                <TableCell>{detail.title}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell component='th' scope='row' sx={{ fontWeight: 'bold' }}>
                  내용
                </TableCell>
                <TableCell>
                  <EditorContent editor={editor} />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell component='th' scope='row' sx={{ fontWeight: 'bold' }}>
                  첨부파일
                </TableCell>
                <TableCell>
                  {detail.attachments.map(file => {
                    return (
                      <Box key={file.s3fileId} sx={{ mb: 1 }}>
                        <Link
                          href={file.fileUrl}
                          download
                          target='_blank'
                          rel='noopener noreferrer'
                          sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                          underline='hover'
                        >
                          <AttachFileIcon fontSize='small' />
                          {file.originalFileName}
                        </Link>
                      </Box>
                    );
                  })}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell component='th' scope='row' sx={{ fontWeight: 'bold' }}>
                  노출상태
                </TableCell>
                <TableCell>
                  <Chip
                    label={detail.isExposed ? '노출' : '미노출'}
                    color={detail.isExposed ? 'success' : 'default'}
                    variant='light'
                    size='small'
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell component='th' scope='row' sx={{ fontWeight: 'bold' }}>
                  조회수
                </TableCell>
                <TableCell>{detail.viewsCount.toLocaleString()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell component='th' scope='row' sx={{ fontWeight: 'bold' }}>
                  작성일
                </TableCell>
                <TableCell>{formatYyyyMmDd(detail.createdAt)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button variant='outlined' component={RouterLink} to='/admin/atoz' sx={{ minWidth: 120 }}>
            취소
          </Button>
          <Button variant='contained' component={RouterLink} to={`/admin/atoz/${boardId}/edit`} sx={{ minWidth: 120 }}>
            수정
          </Button>
        </Box>
      </Card>
    </Stack>
  );
}

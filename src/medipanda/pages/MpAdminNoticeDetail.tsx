import { useMedipandaEditor } from '@/medipanda/components/useMedipandaEditor';
import { useMpModal } from '@/medipanda/hooks/useMpModal';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import {
  Box,
  Button,
  Card,
  CircularProgress,
  FormControlLabel,
  Grid,
  Link,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from '@mui/material';
import Stack from '@mui/material/Stack';
import { EditorContent } from '@tiptap/react';
import {
  BoardDetailsResponse,
  BoardExposureRangeLabel,
  getBoardDetails,
  isDrugCompanyNoticeType,
  NoticeType,
  NoticeTypeLabel,
  PostAttachmentType,
} from '@/backend';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { formatYyyyMmDd } from '../utils/dateFormat';

export default function MpAdminNoticeDetail() {
  const navigate = useNavigate();
  const { boardId: paramBoardId } = useParams();
  const boardId = Number(paramBoardId);

  const { enqueueSnackbar } = useSnackbar();
  const [detail, setDetail] = useState<BoardDetailsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const { alertError } = useMpModal();

  const { editor, setAttachments: setEditorAttachments } = useMedipandaEditor();

  useEffect(() => {
    fetchDetail(boardId);
  }, [boardId]);

  const fetchDetail = async (boardId: number) => {
    if (Number.isNaN(boardId)) {
      await alertError('잘못된 접근입니다.');
      return navigate('/admin/notices');
    }

    setLoading(true);
    try {
      const detail = await getBoardDetails(boardId);
      setDetail(detail);

      editor.commands.setContent(detail.content);
      editor.setEditable(false);
      setEditorAttachments(detail.attachments.filter(a => a.type === PostAttachmentType.EDITOR));
    } catch (error) {
      console.error('Failed to fetch notice detail:', error);
      enqueueSnackbar('데이터를 불러오는데 실패했습니다.', { variant: 'error' });
      return window.history.back();
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
        <CircularProgress />
      </Box>
    );
  }

  if (detail === null) {
    return null;
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant='h4' gutterBottom>
          공지사항 상세
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <Card sx={{ padding: 3 }}>
          <TableContainer>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell component='th' scope='row' sx={{ width: 150, fontWeight: 'bold' }}>
                    공지분류 <span style={{ color: 'red' }}>*</span>
                  </TableCell>
                  <TableCell colSpan={5}>{NoticeTypeLabel[detail.noticeProperties!.noticeType]}</TableCell>
                </TableRow>
                {isDrugCompanyNoticeType(detail.noticeProperties!.noticeType as NoticeType) && (
                  <TableRow>
                    <TableCell component='th' scope='row' sx={{ fontWeight: 'bold' }}>
                      제약사명
                    </TableCell>
                    <TableCell colSpan={5}>{detail.noticeProperties?.drugCompany}</TableCell>
                  </TableRow>
                )}
                <TableRow>
                  <TableCell component='th' scope='row' sx={{ fontWeight: 'bold' }}>
                    노출상태 <span style={{ color: 'red' }}>*</span>
                  </TableCell>
                  <TableCell colSpan={5}>{detail.isExposed ? '노출' : '미노출'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component='th' scope='row' sx={{ fontWeight: 'bold' }}>
                    노출범위 <span style={{ color: 'red' }}>*</span>
                  </TableCell>
                  <TableCell colSpan={5}>{BoardExposureRangeLabel[detail.exposureRange]}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component='th' scope='row' sx={{ fontWeight: 'bold' }}>
                    상단고정
                  </TableCell>
                  <TableCell colSpan={5}>
                    <FormControlLabel
                      control={<Switch checked={detail.noticeProperties?.fixedTop || false} disabled />}
                      label={detail.noticeProperties?.fixedTop ? 'ON' : 'OFF'}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component='th' scope='row' sx={{ fontWeight: 'bold' }}>
                    제목 <span style={{ color: 'red' }}>*</span>
                  </TableCell>
                  <TableCell colSpan={5}>{detail.title}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component='th' scope='row' sx={{ fontWeight: 'bold' }}>
                    내용 <span style={{ color: 'red' }}>*</span>
                  </TableCell>
                  <TableCell colSpan={5}>
                    <Stack
                      sx={{
                        '.tiptap': {
                          padding: '20px 10px',
                        },
                      }}
                    >
                      <EditorContent editor={editor} placeholder='내용을 입력하세요' />
                    </Stack>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component='th' scope='row' sx={{ fontWeight: 'bold' }}>
                    첨부파일
                  </TableCell>
                  <TableCell colSpan={5}>
                    {detail.attachments && detail.attachments.length > 0 ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {detail.attachments.map((file, index) => {
                          return (
                            <Link
                              key={index}
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
                          );
                        })}
                      </Box>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 3, borderTop: 1, borderColor: 'divider', pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant='body2' color='text.secondary'>
                  조회수: {detail.viewsCount.toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={6} textAlign='right'>
                <Typography variant='body2' color='text.secondary'>
                  작성일: {formatYyyyMmDd(detail.createdAt)}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button variant='outlined' component={RouterLink} to='/admin/notices' sx={{ minWidth: 120 }}>
              취소
            </Button>
            <Button variant='contained' component={RouterLink} to={`/admin/notices/${boardId}/edit`} sx={{ minWidth: 120 }}>
              수정
            </Button>
          </Box>
        </Card>
      </Grid>
    </Grid>
  );
}

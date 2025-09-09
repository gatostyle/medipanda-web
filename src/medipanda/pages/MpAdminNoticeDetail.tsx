import { useMedipandaEditor } from '@/medipanda/components/useMedipandaEditor';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import {
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  Grid,
  Link as MuiLink,
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
import MainCard from 'components/MainCard';
import { BoardDetailsResponse, getBoardDetails } from '@/backend';
import { EXPOSURE_RANGE_LABELS, NOTICE_TYPE_LABELS } from '@/medipanda/ui-labels';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { formatYyyyMmDd } from '../utils/dateFormat';

export default function MpAdminNoticeDetail() {
  const { id } = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const [data, setData] = useState<BoardDetailsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const { editor, setAttachments: setEditorAttachments } = useMedipandaEditor();

  useEffect(() => {
    if (id) {
      fetchData(parseInt(id, 10));
    }
  }, [id]);

  const fetchData = async (itemId: number) => {
    setLoading(true);
    try {
      const response = await getBoardDetails(itemId);
      setData(response);
      editor.commands.setContent(response.content);
      editor.setEditable(false);
      setEditorAttachments(response.attachments.filter(a => a.type === 'EDITOR'));
    } catch (error) {
      console.error('Failed to fetch notice detail:', error);
      enqueueSnackbar('데이터를 불러오는데 실패했습니다.', { variant: 'error' });
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

  if (!data) {
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
        <MainCard>
          <TableContainer>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell component='th' scope='row' sx={{ width: 150, fontWeight: 'bold' }}>
                    노출게시판 <span style={{ color: 'red' }}>*</span>
                  </TableCell>
                  <TableCell colSpan={5}>공지사항</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component='th' scope='row' sx={{ fontWeight: 'bold' }}>
                    공지분류 <span style={{ color: 'red' }}>*</span>
                  </TableCell>
                  <TableCell colSpan={5}>
                    {data.noticeProperties?.noticeType
                      ? NOTICE_TYPE_LABELS[data.noticeProperties.noticeType] || data.noticeProperties.noticeType
                      : '일반'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component='th' scope='row' sx={{ fontWeight: 'bold' }}>
                    제약사명
                  </TableCell>
                  <TableCell colSpan={5}>{data.noticeProperties?.drugCompany}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component='th' scope='row' sx={{ fontWeight: 'bold' }}>
                    노출상태 <span style={{ color: 'red' }}>*</span>
                  </TableCell>
                  <TableCell colSpan={5}>{data.isExposed ? '노출' : '미노출'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component='th' scope='row' sx={{ fontWeight: 'bold' }}>
                    노출범위 <span style={{ color: 'red' }}>*</span>
                  </TableCell>
                  <TableCell colSpan={5}>
                    {data.exposureRange ? EXPOSURE_RANGE_LABELS[data.exposureRange] || data.exposureRange : '전체'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component='th' scope='row' sx={{ fontWeight: 'bold' }}>
                    상단고정
                  </TableCell>
                  <TableCell colSpan={5}>
                    <FormControlLabel
                      control={<Switch checked={data.noticeProperties?.fixedTop || false} disabled />}
                      label={data.noticeProperties?.fixedTop ? 'ON' : 'OFF'}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component='th' scope='row' sx={{ fontWeight: 'bold' }}>
                    제목 <span style={{ color: 'red' }}>*</span>
                  </TableCell>
                  <TableCell colSpan={5}>{data.title}</TableCell>
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
                    {data.attachments && data.attachments.length > 0 ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {data.attachments.map((file, index) => {
                          return (
                            <MuiLink
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
                            </MuiLink>
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
                  조회수: {data.viewsCount.toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={6} textAlign='right'>
                <Typography variant='body2' color='text.secondary'>
                  작성일: {formatYyyyMmDd(data.createdAt)}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button variant='outlined' component={Link} to='/admin/notices' sx={{ minWidth: 120 }}>
              취소
            </Button>
            <Button variant='contained' color='success' component={Link} to={`/admin/notices/${id}/edit`} sx={{ minWidth: 120 }}>
              수정
            </Button>
          </Box>
        </MainCard>
      </Grid>
    </Grid>
  );
}

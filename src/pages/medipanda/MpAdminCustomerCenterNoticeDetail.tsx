import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Switch from '@mui/material/Switch';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import MuiLink from '@mui/material/Link';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import MainCard from 'components/MainCard';
import { TiptapEditor } from 'components/medipanda/TiptapEditor';
import { MpBoardDetail, mpFetchBoardDetail } from 'api-definitions/MpBoard';

export default function MpAdminCustomerCenterNoticeDetail() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<MpBoardDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchData(parseInt(id, 10));
    }
  }, [id]);

  const fetchData = async (itemId: number) => {
    setLoading(true);
    try {
      const response = await mpFetchBoardDetail(itemId);
      setData(response);
    } catch (error) {
      console.error('Failed to fetch notice detail:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (!data) {
    return <Typography>데이터를 찾을 수 없습니다.</Typography>;
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          공지사항 상세
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <MainCard>
          <TableContainer>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell component="th" scope="row" sx={{ width: 120, fontWeight: 'bold' }}>
                    공지분류 <span style={{ color: 'red' }}>*</span>
                  </TableCell>
                  <TableCell>
                    {/* FIXME Need API fix for category field */}
                    <Chip label="메디판다" color="primary" variant="light" size="small" />
                  </TableCell>
                  <TableCell component="th" scope="row" sx={{ width: 120, fontWeight: 'bold' }}>
                    작성일
                  </TableCell>
                  <TableCell>{data.createdAt}</TableCell>
                  <TableCell component="th" scope="row" sx={{ width: 120, fontWeight: 'bold' }}>
                    조회수
                  </TableCell>
                  <TableCell>{data.viewsCount.toLocaleString()}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                    제약사명
                  </TableCell>
                  <TableCell>{data.nickname}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                    노출범위 <span style={{ color: 'red' }}>*</span>
                  </TableCell>
                  <TableCell>
                    <Chip label="계약" color="success" variant="light" size="small" />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                    상단고정
                  </TableCell>
                  <TableCell>
                    <FormControlLabel control={<Switch checked={true} />} label="" />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                    제목 <span style={{ color: 'red' }}>*</span>
                  </TableCell>
                  <TableCell colSpan={5}>{data.title}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                    내용 <span style={{ color: 'red' }}>*</span>
                  </TableCell>
                  <TableCell colSpan={5}>
                    <TiptapEditor content={data.content} readOnly />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                    첨부파일
                  </TableCell>
                  <TableCell colSpan={5}>
                    {data.attachments && data.attachments.length > 0 ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {data.attachments.map((attachment, index) => {
                          const filename = attachment.split('/').pop() || `파일_${index + 1}`;
                          return (
                            <MuiLink
                              key={index}
                              href={attachment}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                              underline="hover"
                            >
                              <AttachFileIcon fontSize="small" />
                              {filename}
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

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button variant="outlined" component={Link} to="/admin/customer-center/notices" sx={{ minWidth: 120 }}>
              뒤로
            </Button>
            <Button
              variant="contained"
              color="success"
              component={Link}
              to={`/admin/customer-center/notice/edit/${id}`}
              sx={{ minWidth: 120 }}
            >
              수정
            </Button>
          </Box>
        </MainCard>
      </Grid>
    </Grid>
  );
}

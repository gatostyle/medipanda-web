import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import MainCard from 'components/MainCard';
import { TiptapEditor } from 'medipanda/components/TiptapEditor';
import { BoardDetailsResponse, getBoardDetails } from 'medipanda/backend';
import MuiLink from '@mui/material/Link';
import AttachFileIcon from '@mui/icons-material/AttachFile';

export default function MpAdminContentManagementAtoZDetail() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<BoardDetailsResponse | null>(null);
  const [loading, setLoading] = useState(false);

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
    } catch (error) {
      console.error('Failed to fetch CSO A to Z detail:', error);
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
          CSO A TO Z 상세
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <MainCard>
          <TableContainer>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell component="th" scope="row" sx={{ width: 120, fontWeight: 'bold' }}>
                    제목
                  </TableCell>
                  <TableCell>{data.title}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                    내용
                  </TableCell>
                  <TableCell>
                    <TiptapEditor content={data.content} readOnly />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                    첨부파일
                  </TableCell>
                  <TableCell>
                    {data.attachments.map((file) => {
                      return (
                        <Box key={file.s3fileId} sx={{ mb: 1 }}>
                          <MuiLink
                            href={file.fileUrl}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                            underline="hover"
                          >
                            <AttachFileIcon fontSize="small" />
                            {new URL(file.fileUrl).pathname.split('/').pop()}
                          </MuiLink>
                        </Box>
                      );
                    })}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                    노출상태
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={data.isExposed ? '노출' : '미노출'}
                      color={data.isExposed ? 'success' : 'default'}
                      variant="light"
                      size="small"
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                    조회수
                  </TableCell>
                  <TableCell>{data.viewsCount.toLocaleString()}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                    작성일
                  </TableCell>
                  <TableCell>
                    {(() => {
                      try {
                        const date = new Date(data.createdAt);
                        return date
                          .toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                          })
                          .replace(/\. /g, '-')
                          .replace('.', '');
                      } catch {
                        return data.createdAt;
                      }
                    })()}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button variant="outlined" component={Link} to="/admin/atoz" sx={{ minWidth: 120 }}>
              취소
            </Button>
            <Button variant="contained" color="success" component={Link} to={`/admin/atoz/${id}/edit`} sx={{ minWidth: 120 }}>
              수정
            </Button>
          </Box>
        </MainCard>
      </Grid>
    </Grid>
  );
}

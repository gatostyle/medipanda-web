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
import { TiptapEditor } from 'components/medipanda/TiptapEditor';
import { MpBoardDetail, mpFetchBoardDetail } from 'api-definitions/MpBoard';

export default function MpAdminContentManagementAtoZDetail() {
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
                    노출상태
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={data.isBlind ? '미노출' : '노출'}
                      color={data.isBlind ? 'default' : 'success'}
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
                  <TableCell>{data.createdAt}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button variant="outlined" component={Link} to="/admin/content-management/atoz" sx={{ minWidth: 120 }}>
              뒤로
            </Button>
            <Button
              variant="contained"
              color="success"
              component={Link}
              to={`/admin/content-management/atoz/edit/${id}`}
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

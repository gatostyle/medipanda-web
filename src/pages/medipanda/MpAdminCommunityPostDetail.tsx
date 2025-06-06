import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  Grid,
  IconButton,
  Paper,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import { ArrowLeft } from 'iconsax-react';
import {
  MpCommunityPostDetail,
  MpPostReport,
  MpCommunityComment,
  mpFetchPostDetail,
  mpFetchPostReports,
  mpFetchPostComments
} from 'api-definitions/MpCommunity';
import { useMpErrorDialog } from 'hooks/medipanda/useMpErrorDialog';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`post-detail-tabpanel-${index}`}
      aria-labelledby={`post-detail-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function MpAdminCommunityPostDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [postDetail, setPostDetail] = useState<MpCommunityPostDetail | null>(null);
  const [reports, setReports] = useState<MpPostReport[]>([]);
  const [comments, setComments] = useState<MpCommunityComment[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { showError } = useMpErrorDialog();

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        const postId = parseInt(id);
        const [postDetailData, reportsData, commentsData] = await Promise.all([
          mpFetchPostDetail(postId),
          mpFetchPostReports(postId),
          mpFetchPostComments(postId)
        ]);

        setPostDetail(postDetailData);
        setReports(reportsData);
        setComments(commentsData);
      } catch (error) {
        console.error('Failed to fetch post detail:', error);
        showError('게시글 상세 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleBack = () => {
    navigate('/admin/community/posts');
  };

  const getContractChip = (hasContract: boolean) => {
    return (
      <Chip
        label={hasContract ? '계약' : '미계약'}
        sx={{
          bgcolor: hasContract ? '#10B981' : '#EF4444',
          color: 'white',
          fontSize: '12px',
          fontWeight: 600,
          borderRadius: '4px'
        }}
      />
    );
  };

  const getBlindChip = (isBlind: boolean) => {
    return (
      <Chip
        label={isBlind ? 'Y' : 'N'}
        sx={{
          bgcolor: isBlind ? '#EF4444' : '#10B981',
          color: 'white',
          fontSize: '12px',
          fontWeight: 600,
          borderRadius: '4px'
        }}
      />
    );
  };

  if (isLoading || !postDetail) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="body2" sx={{ color: '#6B7280' }}>
          데이터를 불러오는 중...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={handleBack} sx={{ mr: 2 }}>
          <ArrowLeft size="24" />
        </IconButton>
        <Typography variant="h4" sx={{ fontSize: '24px', fontWeight: 600 }}>
          포스트 상세
        </Typography>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="post detail tabs"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600
            },
            '& .MuiTab-root.Mui-selected': {
              color: '#3B82F6'
            }
          }}
        >
          <Tab label="기본정보" />
          <Tab label="신고기록" />
          <Tab label="댓글" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, minWidth: '100px' }}>
                      계정명유형
                    </Typography>
                    <Typography variant="body2">{postDetail.accountType}</Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, minWidth: '100px' }}>
                      닉네임
                    </Typography>
                    <Typography variant="body2">{postDetail.nickname}</Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, minWidth: '100px' }}>
                      제목
                    </Typography>
                    <Typography variant="body2">{postDetail.title}</Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, minWidth: '100px' }}>
                      내용
                    </Typography>
                    <TextField multiline rows={8} value={postDetail.content} fullWidth InputProps={{ readOnly: true }} />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, minWidth: '100px' }}>
                      좋아요 수
                    </Typography>
                    <Typography variant="body2">{postDetail.likeCount}</Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, minWidth: '100px' }}>
                      댓글 수
                    </Typography>
                    <Typography variant="body2">{postDetail.commentCount}</Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, minWidth: '100px' }}>
                      조회 수
                    </Typography>
                    <Typography variant="body2">{postDetail.viewCount}</Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, minWidth: '100px' }}>
                      블라인드 유무
                    </Typography>
                    {getBlindChip(postDetail.isBlind)}
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, minWidth: '100px' }}>
                      등록일
                    </Typography>
                    <Typography variant="body2">{postDetail.registrationDate}</Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
                <Button
                  variant="outlined"
                  sx={{
                    borderColor: '#6B7280',
                    color: '#6B7280',
                    borderRadius: '20px',
                    px: 4,
                    '&:hover': {
                      borderColor: '#4B5563',
                      bgcolor: 'rgba(107, 114, 128, 0.04)'
                    }
                  }}
                >
                  취소
                </Button>
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: '#10B981',
                    borderRadius: '20px',
                    px: 4,
                    '&:hover': { bgcolor: '#059669' }
                  }}
                >
                  확인
                </Button>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 3 }}>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: '#F9FAFB' }}>
                  <TableRow>
                    <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                      No
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                      아이디
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                      회원명
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                      닉네임
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                      계약유무
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                      신고유형
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                      신고내용
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                      신고일시
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" sx={{ color: '#6B7280' }}>
                          신고 내역이 없습니다.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    reports.map((report, index) => (
                      <TableRow key={report.id} hover>
                        <TableCell align="center">{index + 1}</TableCell>
                        <TableCell align="center">{report.userId}</TableCell>
                        <TableCell align="center">{report.memberName}</TableCell>
                        <TableCell align="center">{report.nickname}</TableCell>
                        <TableCell align="center">{getContractChip(report.hasContract)}</TableCell>
                        <TableCell align="center">{report.reportType}</TableCell>
                        <TableCell align="center">{report.reportContent}</TableCell>
                        <TableCell align="center">{report.reportDate}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 3 }}>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: '#F9FAFB' }}>
                  <TableRow>
                    <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                      No
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                      아이디
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                      회원명
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                      닉네임
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                      계약유무
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                      댓글내용
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                      작성일시
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {comments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" sx={{ color: '#6B7280' }}>
                          댓글이 없습니다.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    comments.map((comment, index) => (
                      <TableRow key={comment.id} hover>
                        <TableCell align="center">{index + 1}</TableCell>
                        <TableCell align="center">{comment.userId}</TableCell>
                        <TableCell align="center">{comment.memberName}</TableCell>
                        <TableCell align="center">{comment.nickname}</TableCell>
                        <TableCell align="center">{getContractChip(comment.hasContract)}</TableCell>
                        <TableCell align="center">{comment.content}</TableCell>
                        <TableCell align="center">{comment.registrationDate}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  );
}

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';
import { Edit } from 'iconsax-react';
import { useMpNotImplementedDialog } from 'hooks/medipanda/useMpNotImplementedDialog';
import { useMpErrorDialog } from 'hooks/medipanda/useMpErrorDialog';
import {
  mpFetchPharmaceuticalCompanyFeeRanges,
  mpFetchPharmaceuticalCompanyIssues,
  MpPharmaceuticalCompanyFeeRange,
  MpPharmaceuticalCompanyIssue
} from 'api-definitions/MpPharmaceuticalCompanyDetail';

export default function MpAdminPharmaceuticalCompanyDetail() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState(0);
  const [issueForm, setIssueForm] = useState({
    title: '',
    content: '',
    exposureStatus: '노출'
  });
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [issueSearchStatus, setIssueSearchStatus] = useState('상태');
  const [feeRanges, setFeeRanges] = useState<MpPharmaceuticalCompanyFeeRange[]>([]);
  const [issues, setIssues] = useState<MpPharmaceuticalCompanyIssue[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { open: openNotImplementedDialog } = useMpNotImplementedDialog();
  const { showError } = useMpErrorDialog();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleIssueFormSubmit = () => {
    console.log('Issue form submitted:', issueForm);
    setShowIssueForm(false);
    setIssueForm({ title: '', content: '', exposureStatus: '노출' });
  };

  const handleIssueFormCancel = () => {
    setShowIssueForm(false);
    setIssueForm({ title: '', content: '', exposureStatus: '노출' });
  };

  const handleNewIssue = () => {
    setShowIssueForm(true);
  };

  const handleEditIssue = (issueId: number) => {
    const issue = issues.find((i: MpPharmaceuticalCompanyIssue) => i.id === issueId);
    if (issue) {
      setIssueForm({
        title: issue.companyName,
        content: '',
        exposureStatus: issue.status
      });
      setShowIssueForm(true);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [feeRangesData, issuesData] = await Promise.all([
          mpFetchPharmaceuticalCompanyFeeRanges({ companyId: id ? parseInt(id) : undefined }),
          mpFetchPharmaceuticalCompanyIssues({ companyId: id ? parseInt(id) : undefined })
        ]);
        setFeeRanges(feeRangesData);
        setIssues(issuesData);
      } catch (error) {
        console.error('제약사 상세 조회 오류:', error);
        showError('제약사 상세 정보를 조회하는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, showError]);

  const companyData = {
    companyName: '진일바이오팜',
    businessRegistrationNo: '110-10202',
    totalQuantity: 30,
    settlementDay: '매달 15일',
    contractManager: '홍길동',
    phoneNumber: '010-xxxx-xxxx',
    contractDate: '2025-04-09'
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontSize: '24px', fontWeight: 600, mb: 3 }}>
        제약사 상세
      </Typography>

      <Paper sx={{ p: 3, mb: 3, borderRadius: '20px', border: '2px solid #10B981' }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <Typography variant="body2" sx={{ color: '#6B7280', mb: 1 }}>
              제약사명 : {companyData.companyName}
            </Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="body2" sx={{ color: '#6B7280', mb: 1 }}>
              사업자등록번호: {companyData.businessRegistrationNo}
            </Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="body2" sx={{ color: '#6B7280', mb: 1 }}>
              등록제품 수 : {companyData.totalQuantity}개
            </Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<Edit />}
                onClick={() => openNotImplementedDialog('수정')}
                sx={{
                  bgcolor: '#10B981',
                  borderRadius: '20px',
                  '&:hover': { bgcolor: '#059669' }
                }}
              >
                수정
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ color: '#6B7280', mb: 1 }}>
              정산일: {companyData.settlementDay}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ color: '#6B7280', mb: 1 }}>
              계약담당자: {companyData.contractManager}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ color: '#6B7280', mb: 1 }}>
              전화번호: {companyData.phoneNumber}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ color: '#6B7280', mb: 1 }}>
              계약일: {companyData.contractDate}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="구간수수료" />
          <Tab label="이슈사항" />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Button
              variant="contained"
              onClick={() => openNotImplementedDialog('+ 행추가')}
              sx={{
                bgcolor: '#10B981',
                borderRadius: '6px',
                '&:hover': { bgcolor: '#059669' }
              }}
            >
              + 행추가
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: '#F9FAFB' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>금액구간</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>수수료율</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>상계</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>수정</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {feeRanges.map((range: MpPharmaceuticalCompanyFeeRange) => (
                  <TableRow key={range.id}>
                    <TableCell>{range.range}</TableCell>
                    <TableCell>{range.feeRate}</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => openNotImplementedDialog('상계')}
                        sx={{
                          bgcolor: '#10B981',
                          borderRadius: '6px',
                          '&:hover': { bgcolor: '#059669' }
                        }}
                      >
                        {range.collection}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => openNotImplementedDialog('수정')}
                        sx={{
                          bgcolor: '#10B981',
                          borderRadius: '6px',
                          '&:hover': { bgcolor: '#059669' }
                        }}
                      >
                        {range.approval}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {activeTab === 1 && (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl size="small">
                <Select
                  value={issueSearchStatus}
                  onChange={(e) => setIssueSearchStatus(e.target.value)}
                  sx={{
                    borderRadius: '20px',
                    minWidth: 120,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#10B981'
                    }
                  }}
                >
                  <MenuItem value="상태">상태</MenuItem>
                  <MenuItem value="노출">노출</MenuItem>
                  <MenuItem value="미노출">미노출</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="contained"
                onClick={() => openNotImplementedDialog('검색')}
                sx={{
                  bgcolor: '#6B7280',
                  borderRadius: '20px',
                  '&:hover': { bgcolor: '#4B5563' }
                }}
              >
                검색
              </Button>
            </Box>
            <Button
              variant="contained"
              onClick={handleNewIssue}
              sx={{
                bgcolor: '#10B981',
                borderRadius: '6px',
                '&:hover': { bgcolor: '#059669' }
              }}
            >
              + 신규
            </Button>
          </Box>

          {showIssueForm && (
            <Paper sx={{ p: 3, mb: 3, border: '1px solid #E5E7EB' }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="제목"
                    value={issueForm.title}
                    onChange={(e) => setIssueForm((prev) => ({ ...prev, title: e.target.value }))}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '20px'
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="내용"
                    value={issueForm.content}
                    onChange={(e) => setIssueForm((prev) => ({ ...prev, content: e.target.value }))}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '20px'
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={issueForm.exposureStatus === '노출'}
                        onChange={(e) => setIssueForm((prev) => ({ ...prev, exposureStatus: e.target.checked ? '노출' : '미노출' }))}
                        sx={{
                          color: '#10B981',
                          '&.Mui-checked': { color: '#10B981' }
                        }}
                      />
                    }
                    label="노출"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                    <Button
                      variant="outlined"
                      onClick={handleIssueFormCancel}
                      sx={{
                        borderColor: '#6B7280',
                        color: '#6B7280',
                        borderRadius: '20px',
                        px: 3
                      }}
                    >
                      취소
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleIssueFormSubmit}
                      sx={{
                        bgcolor: '#10B981',
                        borderRadius: '20px',
                        px: 3,
                        '&:hover': { bgcolor: '#059669' }
                      }}
                    >
                      저장
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          )}

          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: '#F9FAFB' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>No</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>작성자</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>제목</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>상태</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>판매량</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>생성일</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>수정일</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>관리</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {issues.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                      <Typography variant="body2" sx={{ color: '#6B7280' }}>
                        이슈사항이 없습니다.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  issues.map((issue: MpPharmaceuticalCompanyIssue, index: number) => (
                    <TableRow key={issue.id} hover>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{issue.author}</TableCell>
                      <TableCell>{issue.companyName}</TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            bgcolor: issue.status === '노출' ? '#DCFCE7' : '#FEF3C7',
                            color: issue.status === '노출' ? '#059669' : '#D97706',
                            px: 2,
                            py: 0.5,
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 600,
                            textAlign: 'center',
                            display: 'inline-block'
                          }}
                        >
                          {issue.status}
                        </Box>
                      </TableCell>
                      <TableCell>{issue.soldQuantity.toLocaleString()}</TableCell>
                      <TableCell>{issue.createDate}</TableCell>
                      <TableCell>{issue.updateDate}</TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleEditIssue(issue.id)}
                          sx={{
                            bgcolor: '#10B981',
                            borderRadius: '6px',
                            '&:hover': { bgcolor: '#059669' }
                          }}
                        >
                          수정
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
}

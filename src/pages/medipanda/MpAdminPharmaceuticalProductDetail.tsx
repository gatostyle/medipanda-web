import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import CircularProgress from '@mui/material/CircularProgress';
import { ExportSquare } from 'iconsax-react';
import { useMpNotImplementedDialog } from 'hooks/medipanda/useMpNotImplementedDialog';
import { useMpErrorDialog } from 'hooks/medipanda/useMpErrorDialog';
import { mpFetchPharmaceuticalProductApplicants, MpPharmaceuticalProductApplicant } from 'api-definitions/MpPharmaceuticalProductApplicant';

export default function MpAdminPharmaceuticalProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedApplicants, setSelectedApplicants] = useState<number[]>([]);
  const [applicants, setApplicants] = useState<MpPharmaceuticalProductApplicant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { open: openNotImplementedDialog } = useMpNotImplementedDialog();
  const { showError } = useMpErrorDialog();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // TODO: API로부터 제품 정보를 가져오도록 수정
  const productData = {
    company: '진일바이오팜',
    productName: '실플린다, 성폭린아호'
  };

  useEffect(() => {
    if (activeTab === 1 && id) {
      const fetchApplicants = async () => {
        setIsLoading(true);
        try {
          const applicantsData = await mpFetchPharmaceuticalProductApplicants();
          setApplicants(applicantsData);
        } catch (error) {
          console.error('신청자 목록 조회 오류:', error);
          showError('신청자 목록을 조회하는 중 오류가 발생했습니다.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchApplicants();
    }
  }, [activeTab, id, showError]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontSize: '24px', fontWeight: 600, mb: 3 }}>
        영업대행상품등록 상세
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="기본정보" />
          <Tab label="신청자" />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <Paper sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: '#6B7280', mb: 1 }}>
                위탁사명: {productData.company}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: '#6B7280', mb: 1 }}>
                상품명: {productData.productName}
              </Typography>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body1">
              검색결과: <strong>10000</strong> 건
            </Typography>
            <Button
              variant="contained"
              startIcon={<ExportSquare />}
              onClick={() => openNotImplementedDialog('Excel 다운로드')}
              sx={{
                bgcolor: '#10B981',
                borderRadius: '6px',
                px: 3,
                '&:hover': { bgcolor: '#059669' }
              }}
            >
              Excel
            </Button>
          </Box>
        </Paper>
      )}

      {activeTab === 1 && (
        <Paper sx={{ p: 3 }}>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: '#6B7280', mb: 1 }}>
                위탁사명: {productData.company}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: '#6B7280', mb: 1 }}>
                상품명: {productData.productName}
              </Typography>
            </Grid>
          </Grid>

          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body1">
              검색결과: <strong>{isLoading ? '...' : applicants.length}</strong> 건
            </Typography>
            <Button
              variant="contained"
              startIcon={<ExportSquare />}
              onClick={() => openNotImplementedDialog('Excel 다운로드')}
              sx={{
                bgcolor: '#10B981',
                borderRadius: '6px',
                px: 3,
                '&:hover': { bgcolor: '#059669' }
              }}
            >
              Excel
            </Button>
          </Box>

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: '#F9FAFB' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>
                      <Checkbox
                        checked={selectedApplicants.length === applicants.length && applicants.length > 0}
                        indeterminate={selectedApplicants.length > 0 && selectedApplicants.length < applicants.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedApplicants(applicants.map((item) => item.id));
                          } else {
                            setSelectedApplicants([]);
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>No</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>회원번호</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>아이디</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>회원명</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>휴대폰번호</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>신청일</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>파트너사 계약여부</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>판매수량</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {applicants.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                        <Typography variant="body2" sx={{ color: '#6B7280' }}>
                          신청자 데이터가 없습니다.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    applicants.map((applicant, index) => (
                      <TableRow key={applicant.id} hover>
                        <TableCell>
                          <Checkbox
                            checked={selectedApplicants.includes(applicant.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedApplicants((prev) => [...prev, applicant.id]);
                              } else {
                                setSelectedApplicants((prev) => prev.filter((id) => id !== applicant.id));
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{applicant.memberNumber}</TableCell>
                        <TableCell>{applicant.userId}</TableCell>
                        <TableCell>{applicant.memberName}</TableCell>
                        <TableCell>{applicant.phoneNumber}</TableCell>
                        <TableCell>{applicant.applicationDate}</TableCell>
                        <TableCell>{applicant.partnerContract}</TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              border: '1px solid #D1D5DB',
                              borderRadius: '4px',
                              px: 1,
                              py: 0.5,
                              display: 'inline-block',
                              minWidth: 60,
                              textAlign: 'center'
                            }}
                          >
                            {applicant.salesQuantity}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}
    </Box>
  );
}

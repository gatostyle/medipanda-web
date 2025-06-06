import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
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
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { SearchNormal1 } from 'iconsax-react';
import { useMpNotImplementedDialog } from 'hooks/medipanda/useMpNotImplementedDialog';
import { MpDealer, MpDealerSearchRequest, mpFetchDealers } from 'api-definitions/MpDealer';

interface DealerSearchDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (dealer: MpDealer) => void;
}

function DealerSearchDialog({ open, onClose, onSelect }: DealerSearchDialogProps) {
  const [searchType, setSearchType] = useState('딜러번호');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filteredDealers, setFilteredDealers] = useState<MpDealer[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const searchRequest: MpDealerSearchRequest = {
        searchType,
        searchKeyword
      };
      const dealers = await mpFetchDealers(searchRequest);
      setFilteredDealers(dealers);
    } catch (error) {
      console.error('딜러 조회 오류:', error);
      setFilteredDealers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const dealers = await mpFetchDealers({});
      setFilteredDealers(dealers);
    } catch (error) {
      console.error('딜러 목록 조회 오류:', error);
      setFilteredDealers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadInitialData();
    }
  }, [open]);

  const handleSelect = (dealer: MpDealer) => {
    onSelect(dealer);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ fontWeight: 600, fontSize: '18px' }}>딜러조회</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={2}>
              <FormControl fullWidth size="small">
                <Select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  sx={{
                    borderRadius: '20px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#10B981'
                    }
                  }}
                >
                  <MenuItem value="딜러번호">딜러번호</MenuItem>
                  <MenuItem value="딜러명">딜러명</MenuItem>
                  <MenuItem value="아이디">아이디</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={7}>
              <TextField
                fullWidth
                size="small"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="검색어를 입력하세요"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '20px',
                    '& fieldset': {
                      borderColor: '#10B981'
                    }
                  }
                }}
              />
            </Grid>
            <Grid item xs={3}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleSearch}
                disabled={isLoading}
                sx={{
                  bgcolor: '#6B7280',
                  borderRadius: '6px',
                  '&:hover': { bgcolor: '#4B5563' }
                }}
              >
                {isLoading ? '검색 중...' : '검색'}
              </Button>
            </Grid>
          </Grid>
        </Box>

        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#F9FAFB' }}>
              <TableRow>
                <TableCell align="center" sx={{ fontWeight: 600 }}>
                  딜러번호
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>
                  딜러명
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>
                  아이디
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>
                  회원명
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>
                  담당명
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>
                  선택
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" sx={{ color: '#6B7280' }}>
                      데이터를 불러오는 중...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : filteredDealers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" sx={{ color: '#6B7280' }}>
                      검색 결과가 없습니다.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredDealers.map((dealer) => (
                  <TableRow key={dealer.id} hover>
                    <TableCell align="center">{dealer.dealerNumber}</TableCell>
                    <TableCell align="center">{dealer.dealerName}</TableCell>
                    <TableCell align="center">{dealer.userId}</TableCell>
                    <TableCell align="center">{dealer.userName}</TableCell>
                    <TableCell align="center">{dealer.managerName}</TableCell>
                    <TableCell align="center">
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleSelect(dealer)}
                        sx={{
                          bgcolor: '#10B981',
                          borderRadius: '6px',
                          '&:hover': { bgcolor: '#059669' }
                        }}
                      >
                        선택
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ color: '#6B7280' }}>
          취소
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function MpAdminPrescriptionFormRegister() {
  const navigate = useNavigate();
  const location = useLocation();
  const [dealerDialogOpen, setDealerDialogOpen] = useState(false);
  const { open: openNotImplementedDialog } = useMpNotImplementedDialog();

  const isEditMode = location.state?.editMode || false;
  const editData = location.state?.formData || null;

  const [formData, setFormData] = useState({
    dealerNumber: '',
    userId: '',
    userName: '',
    managerName: '',
    prescriptionCode: '',
    businessName: '',
    businessNumber: '',
    prescriptionDate: '',
    settlementDate: '',
    prescriptionAmount: ''
  });

  useEffect(() => {
    if (isEditMode && editData) {
      setFormData({
        dealerNumber: editData.dealerNumber || '',
        userId: editData.userId || '',
        userName: editData.userName || '',
        managerName: editData.managerCode || '',
        prescriptionCode: editData.managerCode || '',
        businessName: editData.businessName || '',
        businessNumber: editData.businessNumber || '',
        prescriptionDate: editData.prescriptionDate || '',
        settlementDate: editData.settlementDate || '',
        prescriptionAmount: editData.prescriptionAmount?.toString() || ''
      });
    }
  }, [isEditMode, editData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDealerSelect = (dealer: MpDealer) => {
    setFormData((prev) => ({
      ...prev,
      dealerNumber: dealer.dealerNumber,
      userId: dealer.userId,
      userName: dealer.userName,
      managerName: dealer.managerName
    }));
  };

  const handleCancel = () => {
    navigate('/admin/prescription/forms');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontSize: '24px', fontWeight: 600, mb: 3 }}>
        {isEditMode ? '처방수정' : '처방등록'}
      </Typography>

      <Paper sx={{ p: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography sx={{ fontWeight: 600, minWidth: 120 }}>
                딜러번호{' '}
                <Box component="span" sx={{ color: 'red' }}>
                  *
                </Box>
              </Typography>
              <TextField
                value={formData.dealerNumber}
                InputProps={{
                  readOnly: true,
                  endAdornment: <SearchNormal1 size={20} color="#9CA3AF" />
                }}
                sx={{
                  flex: 1,
                  bgcolor: '#F3F4F6',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '20px',
                    '& fieldset': {
                      borderColor: '#10B981'
                    }
                  }
                }}
                onClick={() => setDealerDialogOpen(true)}
                placeholder="딜러를 검색하여 선택하세요"
              />
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography sx={{ minWidth: 120 }}>아이디</Typography>
              <TextField
                value={formData.userId}
                InputProps={{ readOnly: true }}
                sx={{
                  flex: 1,
                  bgcolor: '#F3F4F6',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '20px',
                    '& fieldset': {
                      borderColor: '#D1D5DB'
                    }
                  }
                }}
              />
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography sx={{ minWidth: 120 }}>회원명</Typography>
              <TextField
                value={formData.userName}
                InputProps={{ readOnly: true }}
                sx={{
                  flex: 1,
                  bgcolor: '#F3F4F6',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '20px',
                    '& fieldset': {
                      borderColor: '#D1D5DB'
                    }
                  }
                }}
              />
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography sx={{ minWidth: 120 }}>담당명</Typography>
              <TextField
                value={formData.managerName}
                InputProps={{ readOnly: true }}
                sx={{
                  flex: 1,
                  bgcolor: '#F3F4F6',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '20px',
                    '& fieldset': {
                      borderColor: '#D1D5DB'
                    }
                  }
                }}
              />
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography sx={{ fontWeight: 600, minWidth: 120 }}>
                처방처코드{' '}
                <Box component="span" sx={{ color: 'red' }}>
                  *
                </Box>
              </Typography>
              <TextField
                value={formData.prescriptionCode}
                onChange={(e) => handleInputChange('prescriptionCode', e.target.value)}
                sx={{
                  flex: 1,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '20px',
                    '& fieldset': {
                      borderColor: '#10B981'
                    }
                  }
                }}
              />
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography sx={{ fontWeight: 600, minWidth: 120 }}>
                거래처명{' '}
                <Box component="span" sx={{ color: 'red' }}>
                  *
                </Box>
              </Typography>
              <TextField
                value={formData.businessName}
                onChange={(e) => handleInputChange('businessName', e.target.value)}
                sx={{
                  flex: 1,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '20px',
                    '& fieldset': {
                      borderColor: '#10B981'
                    }
                  }
                }}
              />
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography sx={{ minWidth: 120 }}>사업자등록번호</Typography>
              <TextField
                value={formData.businessNumber}
                onChange={(e) => handleInputChange('businessNumber', e.target.value)}
                sx={{
                  flex: 1,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '20px',
                    '& fieldset': {
                      borderColor: '#D1D5DB'
                    }
                  }
                }}
              />
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography sx={{ minWidth: 120 }}>처방일</Typography>
              <TextField
                type="date"
                value={formData.prescriptionDate}
                onChange={(e) => handleInputChange('prescriptionDate', e.target.value)}
                sx={{
                  flex: 1,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '20px',
                    '& fieldset': {
                      borderColor: '#D1D5DB'
                    }
                  }
                }}
              />
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography sx={{ minWidth: 120 }}>정산일</Typography>
              <TextField
                type="date"
                value={formData.settlementDate}
                onChange={(e) => handleInputChange('settlementDate', e.target.value)}
                sx={{
                  flex: 1,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '20px',
                    '& fieldset': {
                      borderColor: '#D1D5DB'
                    }
                  }
                }}
              />
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography sx={{ minWidth: 120 }}>처방금액</Typography>
              <TextField
                value={formData.prescriptionAmount}
                onChange={(e) => handleInputChange('prescriptionAmount', e.target.value)}
                sx={{
                  flex: 1,
                  bgcolor: '#F3F4F6',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '20px',
                    '& fieldset': {
                      borderColor: '#D1D5DB'
                    }
                  }
                }}
                InputProps={{ readOnly: true }}
              />
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
          <Button
            variant="contained"
            onClick={handleCancel}
            sx={{
              bgcolor: '#9CA3AF',
              borderRadius: '20px',
              px: 4,
              '&:hover': { bgcolor: '#6B7280' }
            }}
          >
            취소
          </Button>
          <Button
            variant="contained"
            onClick={() => openNotImplementedDialog('저장')}
            sx={{
              bgcolor: '#10B981',
              borderRadius: '20px',
              px: 4,
              '&:hover': { bgcolor: '#059669' }
            }}
          >
            저장
          </Button>
        </Box>
      </Paper>

      <DealerSearchDialog open={dealerDialogOpen} onClose={() => setDealerDialogOpen(false)} onSelect={handleDealerSelect} />
    </Box>
  );
}

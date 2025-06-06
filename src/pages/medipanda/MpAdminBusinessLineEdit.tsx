import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import CircularProgress from '@mui/material/CircularProgress';
import { SearchNormal1, AttachSquare } from 'iconsax-react';
import { useMpErrorDialog } from 'hooks/medipanda/useMpErrorDialog';
import { MpBusinessLineMember, MpBusinessLineMemberSearchRequest, mpFetchBusinessLineMembers } from 'api-definitions/MpBusinessLineMember';
import { MpDealer, MpDealerSearchRequest, mpFetchDealers } from 'api-definitions/MpDealer';

interface MemberSearchDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (member: MpBusinessLineMember) => void;
}

function MemberSearchDialog({ open, onClose, onSelect }: MemberSearchDialogProps) {
  const [searchType, setSearchType] = useState('회원명');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filteredMembers, setFilteredMembers] = useState<MpBusinessLineMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { showError } = useMpErrorDialog();

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const searchRequest: MpBusinessLineMemberSearchRequest = {
        searchType,
        searchKeyword
      };
      const members = await mpFetchBusinessLineMembers(searchRequest);
      setFilteredMembers(members);
    } catch (error) {
      console.error('회원 조회 오류:', error);
      showError('회원 조회 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const members = await mpFetchBusinessLineMembers({});
      setFilteredMembers(members);
    } catch (error) {
      console.error('회원 목록 조회 오류:', error);
      showError('회원 목록 조회 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadInitialData();
    }
  }, [open]);

  const handleSelect = (member: MpBusinessLineMember) => {
    onSelect(member);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ fontWeight: 600, fontSize: '18px' }}>회원조회</DialogTitle>
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
                  <MenuItem value="회원명">회원명</MenuItem>
                  <MenuItem value="회원번호">회원번호</MenuItem>
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

        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box
              sx={{
                flex: 1,
                p: 2,
                border: '2px solid #10B981',
                borderRadius: '20px',
                bgcolor: '#F0FDF4'
              }}
            >
              <Typography variant="body2" sx={{ color: '#6B7280' }}>
                회원번호
              </Typography>
            </Box>
            <Box
              sx={{
                flex: 1,
                p: 2,
                border: '2px solid #10B981',
                borderRadius: '20px',
                bgcolor: '#F0FDF4'
              }}
            >
              <Typography variant="body2" sx={{ color: '#6B7280' }}>
                아이디
              </Typography>
            </Box>
          </Box>
        </Box>

        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#F9FAFB' }}>
              <TableRow>
                <TableCell align="center" sx={{ fontWeight: 600 }}>
                  회원명
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>
                  회원번호
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>
                  아이디
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>
                  관리
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredMembers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" sx={{ color: '#6B7280' }}>
                      검색 결과가 없습니다.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredMembers.map((member) => (
                  <TableRow key={member.id} hover>
                    <TableCell align="center">{member.memberName}</TableCell>
                    <TableCell align="center">{member.memberNo}</TableCell>
                    <TableCell align="center">{member.userId}</TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleSelect(member)}
                        sx={{
                          bgcolor: '#10B981',
                          borderRadius: '6px',
                          px: 2,
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

interface DealerSearchDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (dealer: MpDealer) => void;
}

function DealerSearchDialog({ open, onClose, onSelect }: DealerSearchDialogProps) {
  const [searchType, setSearchType] = useState('딜러명');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filteredDealers, setFilteredDealers] = useState<MpDealer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { showError } = useMpErrorDialog();

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
      showError('딜러 조회 중 오류가 발생했습니다.');
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
      showError('딜러 목록 조회 중 오류가 발생했습니다.');
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
                  <MenuItem value="딜러명">딜러명</MenuItem>
                  <MenuItem value="딜러번호">딜러번호</MenuItem>
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
                  딜러명
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>
                  딜러번호
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>
                  관리
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredDealers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" sx={{ color: '#6B7280' }}>
                      검색 결과가 없습니다.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredDealers.map((dealer) => (
                  <TableRow key={dealer.id} hover>
                    <TableCell align="center">{dealer.dealerName}</TableCell>
                    <TableCell align="center">{dealer.dealerNumber}</TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleSelect(dealer)}
                        sx={{
                          bgcolor: '#10B981',
                          borderRadius: '6px',
                          px: 2,
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

export default function MpAdminBusinessLineEdit() {
  const navigate = useNavigate();
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [dealerDialogOpen, setDealerDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    memberName: '',
    memberNo: '',
    userId: '',
    dealerName: '',
    dealerNo: '',
    businessName: '',
    businessType: '',
    businessNumber: '',
    phoneNumber: '',
    address: '',
    registrationDate: '',
    contractDate: '',
    attachments: []
  });

  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleMemberSelect = (member: MpBusinessLineMember) => {
    setFormData((prev) => ({
      ...prev,
      memberName: member.memberName,
      memberNo: member.memberNo,
      userId: member.userId
    }));
  };

  const handleDealerSelect = (dealer: MpDealer) => {
    setFormData((prev) => ({
      ...prev,
      dealerName: dealer.dealerName,
      dealerNo: dealer.dealerNumber
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      console.log('Files uploaded:', files);
    }
  };

  const handleCancel = () => {
    navigate('/admin/business-lines');
  };

  const handleSave = () => {
    console.log('Save form data:', formData);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontSize: '24px', fontWeight: 600, mb: 3 }}>
        거래선 편집
      </Typography>

      <Paper sx={{ p: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography sx={{ fontWeight: 600, minWidth: 120 }}>
                회원명{' '}
                <Box component="span" sx={{ color: 'red' }}>
                  *
                </Box>
              </Typography>
              <TextField
                value={formData.memberName}
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
                onClick={() => setMemberDialogOpen(true)}
                placeholder="회원을 검색하여 선택하세요"
              />
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography sx={{ minWidth: 120 }}>회원번호</Typography>
              <TextField
                value={formData.memberNo}
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
              <Typography sx={{ fontWeight: 600, minWidth: 120 }}>
                딜러명{' '}
                <Box component="span" sx={{ color: 'red' }}>
                  *
                </Box>
              </Typography>
              <TextField
                value={formData.dealerName}
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
              <Typography sx={{ minWidth: 120 }}>딜러번호</Typography>
              <TextField
                value={formData.dealerNo}
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
                거래처명{' '}
                <Box component="span" sx={{ color: 'red' }}>
                  *
                </Box>
              </Typography>
              <TextField
                value={formData.businessName}
                onChange={(e) => handleFieldChange('businessName', e.target.value)}
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
              <Typography sx={{ minWidth: 120 }}>거래처 유형</Typography>
              <FormControl sx={{ flex: 1 }}>
                <Select
                  value={formData.businessType}
                  onChange={(e) => handleFieldChange('businessType', e.target.value)}
                  displayEmpty
                  sx={{
                    borderRadius: '20px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#D1D5DB'
                    }
                  }}
                >
                  <MenuItem value="">선택하세요</MenuItem>
                  <MenuItem value="병원">병원</MenuItem>
                  <MenuItem value="약국">약국</MenuItem>
                  <MenuItem value="기타">기타</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography sx={{ minWidth: 120 }}>사업자등록번호</Typography>
              <TextField
                value={formData.businessNumber}
                onChange={(e) => handleFieldChange('businessNumber', e.target.value)}
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
              <Typography sx={{ minWidth: 120 }}>전화번호</Typography>
              <TextField
                value={formData.phoneNumber}
                onChange={(e) => handleFieldChange('phoneNumber', e.target.value)}
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
              <Typography sx={{ minWidth: 120 }}>주소</Typography>
              <TextField
                value={formData.address}
                onChange={(e) => handleFieldChange('address', e.target.value)}
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
              <Typography sx={{ minWidth: 120 }}>등록일</Typography>
              <TextField
                type="date"
                value={formData.registrationDate}
                onChange={(e) => handleFieldChange('registrationDate', e.target.value)}
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
              <Typography sx={{ minWidth: 120 }}>계약일</Typography>
              <TextField
                type="date"
                value={formData.contractDate}
                onChange={(e) => handleFieldChange('contractDate', e.target.value)}
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
              <Typography sx={{ minWidth: 120 }}>첨부파일</Typography>
              <Button
                variant="outlined"
                component="label"
                startIcon={<AttachSquare />}
                sx={{
                  flex: 1,
                  borderColor: '#D1D5DB',
                  color: '#6B7280',
                  borderRadius: '20px',
                  py: 1.5,
                  textTransform: 'none'
                }}
              >
                파일 첨부하기
                <input type="file" hidden multiple onChange={handleFileUpload} />
              </Button>
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
            onClick={handleSave}
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

      <MemberSearchDialog open={memberDialogOpen} onClose={() => setMemberDialogOpen(false)} onSelect={handleMemberSelect} />

      <DealerSearchDialog open={dealerDialogOpen} onClose={() => setDealerDialogOpen(false)} onSelect={handleDealerSelect} />
    </Box>
  );
}

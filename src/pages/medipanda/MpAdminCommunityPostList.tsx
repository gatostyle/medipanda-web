import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  FormControl,
  Grid,
  Link,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Pagination
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ko } from 'date-fns/locale';
import { MpCommunityPost, MpCommunityPostSearchRequest, mpFetchCommunityPostList } from 'api-definitions/MpCommunity';
import { useMpNotImplementedDialog } from 'hooks/medipanda/useMpNotImplementedDialog';
import { useMpErrorDialog } from 'hooks/medipanda/useMpErrorDialog';

export default function MpAdminCommunityPostList() {
  const navigate = useNavigate();
  const [data, setData] = useState<MpCommunityPost[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const { open: openNotImplementedDialog } = useMpNotImplementedDialog();
  const { showError } = useMpErrorDialog();

  const formik = useFormik({
    initialValues: {
      page: 0,
      size: 10,
      accountType: '전체',
      searchType: '제목',
      searchKeyword: '',
      startDate: null as Date | null,
      endDate: null as Date | null
    },
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        const searchRequest: MpCommunityPostSearchRequest = {
          page: values.page,
          size: values.size,
          accountType: values.accountType !== '전체' ? values.accountType : undefined,
          searchType: values.searchType,
          searchKeyword: values.searchKeyword || undefined,
          startDate: values.startDate ? values.startDate.toISOString().split('T')[0] : undefined,
          endDate: values.endDate ? values.endDate.toISOString().split('T')[0] : undefined
        };
        const response = await mpFetchCommunityPostList(searchRequest);
        setData(response.content);
        setTotalElements(response.totalElements);
      } catch (error) {
        console.error('Failed to fetch community post list:', error);
        showError('커뮤니티 게시글 목록을 조회하는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    }
  });

  useEffect(() => {
    formik.submitForm();
  }, [formik.values.page]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(data.map((item) => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedItems((prev) => [...prev, id]);
    } else {
      setSelectedItems((prev) => prev.filter((item) => item !== id));
    }
  };

  const handlePostClick = (postId: number) => {
    navigate(`/admin/community/posts/${postId}`);
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

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ fontSize: '24px', fontWeight: 600, mb: 3 }}>
          포스트 관리
        </Typography>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={2}>
              <Typography variant="body2" sx={{ mb: 1, fontSize: '12px', color: '#6B7280' }}>
                계정명유형
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  name="accountType"
                  value={formik.values.accountType}
                  onChange={formik.handleChange}
                  sx={{
                    borderRadius: '20px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#D1D5DB'
                    }
                  }}
                >
                  <MenuItem value="전체">전체</MenuItem>
                  <MenuItem value="업무기사대면">업무기사대면</MenuItem>
                  <MenuItem value="MR-CSO 매칭">MR-CSO 매칭</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={1.5}>
              <DatePicker
                value={formik.values.startDate}
                onChange={(date) => formik.setFieldValue('startDate', date)}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    sx: {
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '20px',
                        '& fieldset': {
                          borderColor: '#D1D5DB'
                        }
                      }
                    }
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={1.5}>
              <DatePicker
                value={formik.values.endDate}
                onChange={(date) => formik.setFieldValue('endDate', date)}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    sx: {
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '20px',
                        '& fieldset': {
                          borderColor: '#D1D5DB'
                        }
                      }
                    }
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={1.5}>
              <Typography variant="body2" sx={{ mb: 1, fontSize: '12px', color: '#6B7280' }}>
                제목
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  name="searchType"
                  value={formik.values.searchType}
                  onChange={formik.handleChange}
                  sx={{
                    borderRadius: '20px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#D1D5DB'
                    }
                  }}
                >
                  <MenuItem value="아이디">아이디</MenuItem>
                  <MenuItem value="회원명">회원명</MenuItem>
                  <MenuItem value="닉네임">닉네임</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                size="small"
                name="searchKeyword"
                value={formik.values.searchKeyword}
                onChange={formik.handleChange}
                placeholder=""
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '20px',
                    '& fieldset': {
                      borderColor: '#D1D5DB'
                    }
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={2}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => formik.submitForm()}
                sx={{
                  bgcolor: '#6B7280',
                  borderRadius: '20px',
                  height: '40px',
                  '&:hover': { bgcolor: '#4B5563' }
                }}
              >
                검색
              </Button>
            </Grid>
          </Grid>
        </Paper>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="body1">
            검색결과 <strong>{totalElements.toLocaleString()}</strong> 건
          </Typography>
          <Button
            variant="contained"
            onClick={() => openNotImplementedDialog('블라인드 처리')}
            disabled={selectedItems.length === 0}
            sx={{
              bgcolor: '#10B981',
              borderRadius: '20px',
              '&:hover': { bgcolor: '#059669' }
            }}
          >
            블라인드
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ bgcolor: '#F9FAFB' }}>
              <TableRow>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                  <Checkbox
                    checked={selectedItems.length === data.length && data.length > 0}
                    indeterminate={selectedItems.length > 0 && selectedItems.length < data.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                  No
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                  계정명유형
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
                  제목
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                  좋아요 수
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                  댓글 수
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                  조회 수
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                  블라인드 여부
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                  등록일
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={13} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" sx={{ color: '#6B7280' }}>
                      데이터를 불러오는 중...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={13} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" sx={{ color: '#6B7280' }}>
                      데이터가 없습니다.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item, index) => (
                  <TableRow key={item.id} hover>
                    <TableCell align="center">
                      <Checkbox checked={selectedItems.includes(item.id)} onChange={(e) => handleSelectItem(item.id, e.target.checked)} />
                    </TableCell>
                    <TableCell align="center">{totalElements - formik.values.page * formik.values.size - index}</TableCell>
                    <TableCell align="center">{item.accountType}</TableCell>
                    <TableCell align="center">{item.userId}</TableCell>
                    <TableCell align="center">{item.memberName}</TableCell>
                    <TableCell align="center">{item.nickname}</TableCell>
                    <TableCell align="center">{getContractChip(item.hasContract)}</TableCell>
                    <TableCell align="center">
                      <Link
                        component="button"
                        variant="body2"
                        onClick={() => handlePostClick(item.id)}
                        sx={{ color: '#3B82F6', textDecoration: 'none', cursor: 'pointer' }}
                      >
                        {item.title}
                      </Link>
                    </TableCell>
                    <TableCell align="center">{item.likeCount}</TableCell>
                    <TableCell align="center">{item.commentCount}</TableCell>
                    <TableCell align="center">{item.viewCount}</TableCell>
                    <TableCell align="center">{getBlindChip(item.isBlind)}</TableCell>
                    <TableCell align="center">{item.registrationDate}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={Math.ceil(totalElements / formik.values.size)}
            page={formik.values.page + 1}
            onChange={(_, page) => formik.setFieldValue('page', page - 1)}
            disabled={isLoading}
            color="primary"
            sx={{
              '& .MuiPaginationItem-root': {
                borderRadius: '4px'
              },
              '& .Mui-selected': {
                bgcolor: '#6366F1 !important',
                color: 'white'
              }
            }}
          />
        </Box>
      </Box>
    </LocalizationProvider>
  );
}

import { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import {
  Box,
  Chip,
  FormControl,
  Grid,
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
  Pagination,
  Button
} from '@mui/material';
import { MpCommunityUser, MpCommunityUserSearchRequest, mpFetchCommunityUserList } from 'api-definitions/MpCommunity';
import { useMpErrorDialog } from 'hooks/medipanda/useMpErrorDialog';

export default function MpAdminCommunityUserList() {
  const [data, setData] = useState<MpCommunityUser[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { showError } = useMpErrorDialog();

  const formik = useFormik({
    initialValues: {
      page: 0,
      size: 10,
      contractStatus: '전체',
      searchType: '회원명',
      searchKeyword: ''
    },
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        const searchRequest: MpCommunityUserSearchRequest = {
          page: values.page,
          size: values.size,
          contractStatus: values.contractStatus === '전체' ? undefined : values.contractStatus,
          searchType: values.searchType,
          searchKeyword: values.searchKeyword || undefined
        };
        const response = await mpFetchCommunityUserList(searchRequest);
        setData(response.content);
        setTotalElements(response.totalElements);
      } catch (error) {
        console.error('Failed to fetch community user list:', error);
        showError('커뮤니티 사용자 목록을 조회하는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    }
  });

  useEffect(() => {
    formik.submitForm();
  }, [formik.values.page]);

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

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontSize: '24px', fontWeight: 600, mb: 3 }}>
        이용자 관리
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={2}>
            <Typography variant="body2" sx={{ mb: 1, fontSize: '12px', color: '#6B7280' }}>
              계약유무
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                name="contractStatus"
                value={formik.values.contractStatus}
                onChange={formik.handleChange}
                sx={{
                  borderRadius: '20px',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#D1D5DB'
                  }
                }}
              >
                <MenuItem value="전체">전체</MenuItem>
                <MenuItem value="계약">계약</MenuItem>
                <MenuItem value="미계약">미계약</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={2}>
            <Typography variant="body2" sx={{ mb: 1, fontSize: '12px', color: '#6B7280' }}>
              회원명
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
                <MenuItem value="전체">전체</MenuItem>
                <MenuItem value="회원명">회원명</MenuItem>
                <MenuItem value="아이디">아이디</MenuItem>
                <MenuItem value="닉네임">닉네임</MenuItem>
                <MenuItem value="휴대폰번호">휴대폰번호</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
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

      <Box sx={{ mb: 2 }}>
        <Typography variant="body1">
          검색결과 <strong>{totalElements.toLocaleString()}</strong> 건
        </Typography>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: '#F9FAFB' }}>
            <TableRow>
              <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                No
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                회원번호
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
                휴대폰번호
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                이메일
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                계약유무
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                작성글 수
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                댓글 수
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                좋아요 수
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                블라인드 글 수
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={12} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" sx={{ color: '#6B7280' }}>
                    데이터를 불러오는 중...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" sx={{ color: '#6B7280' }}>
                    데이터가 없습니다.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, index) => (
                <TableRow key={item.id} hover>
                  <TableCell align="center">{totalElements - formik.values.page * formik.values.size - index}</TableCell>
                  <TableCell align="center">{item.memberNumber}</TableCell>
                  <TableCell align="center">{item.userId}</TableCell>
                  <TableCell align="center">{item.memberName}</TableCell>
                  <TableCell align="center">{item.nickname}</TableCell>
                  <TableCell align="center">{item.phoneNumber}</TableCell>
                  <TableCell align="center">{item.email}</TableCell>
                  <TableCell align="center">{getContractChip(item.hasContract)}</TableCell>
                  <TableCell align="center">{item.postCount}</TableCell>
                  <TableCell align="center">{item.commentCount}</TableCell>
                  <TableCell align="center">{item.likeCount}</TableCell>
                  <TableCell align="center">{item.blindPostCount}</TableCell>
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
  );
}

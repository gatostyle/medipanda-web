import { Box, Button, CircularProgress, Grid, Stack, TextField, Typography } from '@mui/material';
import MainCard from 'components/MainCard';
import { useFormik } from 'formik';
import { mpCreateInquiryResponse, mpUpdateInquiryResponse } from '@/medipanda/api-definitions/MpInquiry';
import { NotImplementedError } from '@/medipanda/api-definitions/NotImplementedError';
import { BoardDetailsResponse, getBoardDetails } from '@/backend';
import { useMpErrorDialog } from '@/medipanda/hooks/useMpErrorDialog';
import { useMpInfoDialog } from '@/medipanda/hooks/useMpInfoDialog';
import { useMpNotImplementedDialog } from '@/medipanda/hooks/useMpNotImplementedDialog';
import { formatYyyyMmDdHhMm } from '@/medipanda/utils/dateFormat';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

interface BoardDetailsResponseWithMockData extends BoardDetailsResponse {
  member: {
    id: number;
    userId: string;
    name: string;
    drugCompany?: string;
    phoneNumber: string;
  };
  responseContent: string;
  responseCreatedAt: string | null;
  notes: string;
}

function withMock<T extends BoardDetailsResponse>(data: T): T & BoardDetailsResponseWithMockData {
  return {
    ...data,
    member: {
      id: -1,
      userId: '아이디',
      name: '사용자명',
      drugCompany: '제약사명',
      phoneNumber: '010-1234-5678',
    },
    responseContent: '답변 내용',
    responseCreatedAt: '2025-05-01',
    notes: '비고 내용',
  };
}

export default function MpAdminInquiryEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [inquiry, setInquiry] = useState<BoardDetailsResponseWithMockData | null>(null);
  const [loading, setLoading] = useState(false);
  const notImplementedDialog = useMpNotImplementedDialog();
  const errorDialog = useMpErrorDialog();
  const infoDialog = useMpInfoDialog();

  const formik = useFormik({
    initialValues: {
      responseContent: '',
      notes: '',
    },
    onSubmit: async values => {
      if (id === undefined) return;

      if (!values.responseContent.trim()) {
        infoDialog.showInfo('답변 내용을 입력해주세요.');
        return;
      }

      try {
        if (inquiry?.responseContent) {
          await mpUpdateInquiryResponse(parseInt(id), {
            responseContent: values.responseContent,
            notes: values.notes,
          });
        } else {
          await mpCreateInquiryResponse(parseInt(id), {
            responseContent: values.responseContent,
            notes: values.notes,
          });
        }
        infoDialog.showInfo('답변이 저장되었습니다.');
        navigate('/admin/inquiries');
      } catch (error) {
        if (error instanceof NotImplementedError) {
          notImplementedDialog.open(error.message);
        } else {
          console.error('Failed to save response:', error);
          errorDialog.showError('답변 저장 중 오류가 발생했습니다.');
        }
      }
    },
  });

  useEffect(() => {
    const fetchInquiryDetail = async () => {
      if (id === undefined) return;

      setLoading(true);
      try {
        const data = withMock(await getBoardDetails(parseInt(id)));

        setInquiry(data);

        formik.setFieldValue('responseContent', data.responseContent);
        formik.setFieldValue('notes', data.notes);
      } catch (error) {
        console.error('Failed to fetch inquiry detail:', error);
        enqueueSnackbar('문의 정보를 불러오는데 실패했습니다.', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchInquiryDetail();
  }, [id]);

  const handleCancel = () => {
    navigate('/admin/inquiries');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!inquiry) {
    return null;
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant='h4' gutterBottom>
          1:1 문의 수정
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <MainCard>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Box>
                    <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                      회원정보
                    </Typography>
                    <TextField
                      fullWidth
                      size='small'
                      value={`${inquiry.nickname}(${inquiry.member.id} / ${inquiry.member.userId})`}
                      InputProps={{ readOnly: true }}
                      sx={{ '& .MuiInputBase-input': { backgroundColor: '#f5f5f5' } }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box>
                    <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                      회사정보
                    </Typography>
                    <TextField
                      fullWidth
                      size='small'
                      value={
                        inquiry.member.drugCompany
                          ? `${inquiry.member.drugCompany}${inquiry.member.drugCompany.includes('법인') ? '' : '(법인)'}`
                          : '-'
                      }
                      InputProps={{ readOnly: true }}
                      sx={{ '& .MuiInputBase-input': { backgroundColor: '#f5f5f5' } }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box>
                    <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                      휴대폰번호
                    </Typography>
                    <TextField
                      fullWidth
                      size='small'
                      value={inquiry.member.phoneNumber}
                      InputProps={{ readOnly: true }}
                      sx={{ '& .MuiInputBase-input': { backgroundColor: '#f5f5f5' } }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Box>
                <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                  제목
                </Typography>
                <TextField
                  fullWidth
                  size='small'
                  value={inquiry.title}
                  InputProps={{ readOnly: true }}
                  sx={{ '& .MuiInputBase-input': { backgroundColor: '#f5f5f5' } }}
                />
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Box>
                <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                  내용
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  value={inquiry.content}
                  InputProps={{ readOnly: true }}
                  sx={{
                    '& .MuiInputBase-root': {
                      backgroundColor: '#f5f5f5',
                      '& textarea': { cursor: 'default' },
                    },
                  }}
                />
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Typography variant='subtitle2' color='text.secondary' gutterBottom></Typography>
            </Grid>

            <Grid item xs={12}>
              <Box>
                <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                  문의시간
                </Typography>
                <TextField
                  fullWidth
                  size='small'
                  value={formatYyyyMmDdHhMm(inquiry.createdAt)}
                  InputProps={{ readOnly: true }}
                  sx={{ '& .MuiInputBase-input': { backgroundColor: '#f5f5f5' } }}
                />
              </Box>
            </Grid>

            {formik.values.responseContent && (
              <Grid item xs={12}>
                <Box>
                  <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                    답변내용
                  </Typography>
                  <TextField
                    name='responseContent'
                    multiline
                    rows={6}
                    fullWidth
                    placeholder=''
                    value={formik.values.responseContent}
                    onChange={formik.handleChange}
                  />
                </Box>
              </Grid>
            )}

            {inquiry.responseCreatedAt !== null && (
              <Grid item xs={12}>
                <Box>
                  <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                    답변시간
                  </Typography>
                  <TextField
                    fullWidth
                    size='small'
                    value={formatYyyyMmDdHhMm(inquiry.responseCreatedAt)}
                    InputProps={{ readOnly: true }}
                    sx={{ '& .MuiInputBase-input': { backgroundColor: '#f5f5f5' } }}
                  />
                </Box>
              </Grid>
            )}

            <Grid item xs={12}>
              <Box>
                <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                  비고
                </Typography>
                <TextField name='notes' multiline rows={4} fullWidth value={formik.values.notes} onChange={formik.handleChange} />
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Stack direction='row' spacing={2} justifyContent='center'>
                <Button variant='outlined' size='large' onClick={handleCancel}>
                  취소
                </Button>
                <Button variant='contained' size='large' color='success' onClick={() => formik.handleSubmit()}>
                  답변하기
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </MainCard>
      </Grid>
    </Grid>
  );
}

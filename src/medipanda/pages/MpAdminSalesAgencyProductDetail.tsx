import { setUrlParams } from '@/lib/url';
import { useSearchParamsOrDefault } from '@/lib/useSearchParamsOrDefault';
import { MpSalesAgencyProductApplicantsTab } from '@/medipanda/components/MpSalesAgencyProductApplicantsTab';
import { useMedipandaEditor } from '@/medipanda/components/useMedipandaEditor';
import { useMpModal } from '@/medipanda/hooks/useMpModal';
import { Box, Button, Card, Chip, CircularProgress, Grid, Stack, Tab, Tabs, Typography } from '@mui/material';
import { EditorContent } from '@tiptap/react';
import { BoardExposureRangeLabel, getSalesAgencyProductDetails, PostAttachmentType, SalesAgencyProductDetailsResponse } from '@/backend';
import { formatYyyyMmDd } from '@/medipanda/utils/dateFormat';
import { useSnackbar } from 'notistack';
import { SyntheticEvent, useEffect, useState } from 'react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';

export default function MpAdminSalesAgencyProductDetail() {
  const navigate = useNavigate();
  const { salesAgencyProductId: paramSalesAgencyProductId } = useParams();
  const salesAgencyProductId = Number(paramSalesAgencyProductId);

  const initialSearchParams = { tab: 'info' };
  const { tab } = useSearchParamsOrDefault(initialSearchParams);

  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const { alertError } = useMpModal();

  const [detail, setDetail] = useState<SalesAgencyProductDetailsResponse | null>(null);

  const fetchDetail = async (salesAgencyProductId: number) => {
    if (Number.isNaN(salesAgencyProductId)) {
      await alertError('잘못된 접근입니다.');
      return navigate('/admin/sales-agency-products');
    }

    setLoading(true);

    try {
      const detail = await getSalesAgencyProductDetails(salesAgencyProductId);
      setDetail(detail);
    } catch (error) {
      console.error('Failed to fetch product detail:', error);
      enqueueSnackbar('상품 정보를 불러오는데 실패했습니다.', { variant: 'error' });
      return window.history.back();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail(salesAgencyProductId);
  }, [salesAgencyProductId]);

  const handleTabChange = (_: SyntheticEvent, value: string) => {
    const url = setUrlParams({ tab: value }, initialSearchParams);

    navigate(url);
  };

  if (loading || detail === null) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant='h4' gutterBottom sx={{ mb: 3 }}>
        영업대행상품 상세
      </Typography>

      <Card>
        <Tabs value={tab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab value='info' label='기본정보' />
          <Tab value='applicants' label='신청자' />
        </Tabs>

        {tab === 'info' && <InfoTab detail={detail} />}

        {tab === 'applicants' && <MpSalesAgencyProductApplicantsTab detail={detail} />}
      </Card>
    </Box>
  );
}

function InfoTab({ detail }: { detail: SalesAgencyProductDetailsResponse }) {
  const { editor, setAttachments: setEditorAttachments } = useMedipandaEditor();

  useEffect(() => {
    editor.setEditable(false);
    editor.commands.setContent(detail.boardPostDetail.content);
    setEditorAttachments(detail.boardPostDetail.attachments.filter(a => a.type === PostAttachmentType.EDITOR));
  }, [detail]);

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Stack spacing={3}>
            <Box>
              <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                위탁사명
              </Typography>
              <Typography variant='body1'>{detail.clientName}</Typography>
            </Box>

            <Box>
              <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                상품명
              </Typography>
              <Typography variant='body1'>{detail.productName}</Typography>
            </Box>

            <Box>
              <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                노출상태
              </Typography>
              <Typography variant='body1'>{detail.boardPostDetail!.isExposed ? '노출' : '미노출'}</Typography>
            </Box>

            <Box>
              <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                노출범위
              </Typography>
              <Typography variant='body1'>{BoardExposureRangeLabel[detail.boardPostDetail!.exposureRange]}</Typography>
            </Box>

            <Box>
              <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                진행상태
              </Typography>
              <Chip label={detail.boardPostDetail!.isExposed ? '진행중' : '미노출'} color='success' size='small' />
            </Box>

            <Box>
              <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                내용
              </Typography>
              <Box sx={{ mt: 1 }}>
                <EditorContent editor={editor} />
              </Box>
            </Box>

            <Box>
              <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                영상url
              </Typography>
              <Typography variant='body1'>{detail.videoUrl}</Typography>
            </Box>

            <Box>
              <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                계약일
              </Typography>
              <Typography variant='body1'>{detail ? formatYyyyMmDd(detail.contractDate) : '-'}</Typography>
            </Box>

            <Box>
              <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                비고
              </Typography>
              <Typography variant='body1'>{detail.note}</Typography>
            </Box>

            <Stack direction='row' spacing={4}>
              <Box>
                <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                  게시기간
                </Typography>
                <Typography variant='body1'>{`${formatYyyyMmDd(detail.startDate)} ~ ${formatYyyyMmDd(detail.endDate)}`}</Typography>
              </Box>
              <Box>
                <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                  조회수
                </Typography>
                <Typography variant='body1'>{detail.boardPostDetail!.viewsCount?.toLocaleString()}</Typography>
              </Box>
            </Stack>
          </Stack>
        </Grid>

        <Grid item xs={12} md={4}>
          <Box
            component='img'
            src={detail.thumbnailUrl}
            alt='Product'
            sx={{
              width: '100%',
              height: 'auto',
              maxHeight: 400,
              objectFit: 'contain',
              backgroundColor: 'grey.100',
              borderRadius: 1,
            }}
            onError={(e: any) => {
              e.target.src =
                'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2Y1ZjVmNSIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5OTkiPkltYWdlIE5vdCBBdmFpbGFibGU8L3RleHQ+Cjwvc3ZnPg==';
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <Stack direction='row' spacing={2} justifyContent='center'>
            <Button variant='outlined' component={RouterLink} to={'/admin/sales-agency-products'} sx={{ minWidth: 120 }}>
              목록
            </Button>
            <Button
              variant='contained'
              component={RouterLink}
              to={`/admin/sales-agency-products/${detail.productId}/edit`}
              sx={{ minWidth: 120 }}
            >
              수정
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

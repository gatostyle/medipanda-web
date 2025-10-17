import { setUrlParams } from '@/lib/utils/url';
import { useSearchParamsOrDefault } from '@/lib/hooks/useSearchParamsOrDefault';
import { MpSalesAgencyProductApplicantsTab } from '@/components/MpSalesAgencyProductApplicantsTab';
import { useMedipandaEditor } from '@/hooks/useMedipandaEditor';
import { useMpModal } from '@/hooks/useMpModal';
import { Box, Button, Card, Chip, CircularProgress, Stack, Tab, Tabs, Typography } from '@mui/material';
import { EditorContent } from '@tiptap/react';
import {
  BoardExposureRangeLabel,
  getSalesAgencyProductDetails,
  PostAttachmentType,
  type SalesAgencyProductDetailsResponse,
} from '@/backend';
import { DATEFORMAT_YYYY_MM_DD, DateUtils } from '@/lib/utils/dateFormat';
import { useSnackbar } from 'notistack';
import { type SyntheticEvent, useEffect, useState } from 'react';
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
    <Stack sx={{ gap: 3 }}>
      <Typography variant='h4'>영업대행상품 상세</Typography>

      <Card>
        <Tabs value={tab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab value='info' label='기본정보' />
          <Tab value='applicants' label='신청자' />
        </Tabs>

        {tab === 'info' && <InfoTab detail={detail} />}

        {tab === 'applicants' && <MpSalesAgencyProductApplicantsTab detail={detail} />}
      </Card>
    </Stack>
  );
}

function InfoTab({ detail }: { detail: SalesAgencyProductDetailsResponse }) {
  const { editor, setAttachments: setEditorAttachments } = useMedipandaEditor();

  useEffect(() => {
    editor.setEditable(false);
    editor.commands.setContent(detail.boardPostDetail.content);
    setEditorAttachments(detail.boardPostDetail.attachments.filter(a => a.type === PostAttachmentType.EDITOR));
  }, [detail, editor]);

  return (
    <Box sx={{ p: 3 }}>
      <Stack sx={{ gap: 3 }}>
        <Stack direction='row' sx={{ gap: 3 }}>
          <Stack sx={{ flex: '2 0', overflow: 'hidden' }}>
            <Stack spacing={3}>
              <Stack sx={{ gap: 1 }}>
                <Typography variant='subtitle2' color='text.secondary'>
                  위탁사명
                </Typography>
                <Typography variant='body1'>{detail.clientName}</Typography>
              </Stack>

              <Stack sx={{ gap: 1 }}>
                <Typography variant='subtitle2' color='text.secondary'>
                  상품명
                </Typography>
                <Typography variant='body1'>{detail.productName}</Typography>
              </Stack>

              <Stack sx={{ gap: 1 }}>
                <Typography variant='subtitle2' color='text.secondary'>
                  노출상태
                </Typography>
                <Typography variant='body1'>{detail.boardPostDetail!.isExposed ? '노출' : '미노출'}</Typography>
              </Stack>

              <Stack sx={{ gap: 1 }}>
                <Typography variant='subtitle2' color='text.secondary'>
                  노출범위
                </Typography>
                <Typography variant='body1'>{BoardExposureRangeLabel[detail.boardPostDetail!.exposureRange]}</Typography>
              </Stack>

              <Stack sx={{ gap: 1 }}>
                <Typography variant='subtitle2' color='text.secondary'>
                  진행상태
                </Typography>
                <Box>
                  <Chip label={detail.boardPostDetail!.isExposed ? '진행중' : '미노출'} color='success' size='small' />
                </Box>
              </Stack>

              <Stack sx={{ gap: 1 }}>
                <Typography variant='subtitle2' color='text.secondary'>
                  내용
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <EditorContent editor={editor} />
                </Box>
              </Stack>

              <Stack sx={{ gap: 1 }}>
                <Typography variant='subtitle2' color='text.secondary'>
                  영상url
                </Typography>
                <Typography variant='body1'>{detail.videoUrl}</Typography>
              </Stack>

              <Stack sx={{ gap: 1 }}>
                <Typography variant='subtitle2' color='text.secondary'>
                  계약일
                </Typography>
                <Typography variant='body1'>
                  {detail ? DateUtils.parseUtcAndFormatKst(detail.contractDate, DATEFORMAT_YYYY_MM_DD) : '-'}
                </Typography>
              </Stack>

              <Stack sx={{ gap: 1 }}>
                <Typography variant='subtitle2' color='text.secondary'>
                  비고
                </Typography>
                <Typography variant='body1'>{detail.note}</Typography>
              </Stack>

              <Stack direction='row' spacing={4}>
                <Stack sx={{ gap: 1 }}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    게시기간
                  </Typography>
                  <Typography variant='body1'>{`${DateUtils.parseUtcAndFormatKst(detail.startDate, DATEFORMAT_YYYY_MM_DD)} ~ ${DateUtils.parseUtcAndFormatKst(detail.endDate, DATEFORMAT_YYYY_MM_DD)}`}</Typography>
                </Stack>
                <Stack sx={{ gap: 1 }}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    조회수
                  </Typography>
                  <Typography variant='body1'>{detail.boardPostDetail!.viewsCount?.toLocaleString()}</Typography>
                </Stack>
              </Stack>
            </Stack>
          </Stack>

          <Stack sx={{ flex: '1 0' }}>
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
              onError={e => {
                (e.target as HTMLImageElement).src =
                  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2Y1ZjVmNSIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5OTkiPkltYWdlIE5vdCBBdmFpbGFibGU8L3RleHQ+Cjwvc3ZnPg==';
              }}
            />
          </Stack>
        </Stack>

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
      </Stack>
    </Box>
  );
}

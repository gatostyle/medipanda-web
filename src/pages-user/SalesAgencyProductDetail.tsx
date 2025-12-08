import { applyProduct, getSalesAgencyProductDetails, type SalesAgencyProductDetailsResponse } from '@/backend';
import { MedipandaEditorContent } from '@/components/MedipandaTiptapContainer';
import { MedipandaButton } from '@/custom/components/MedipandaButton';
import { useMedipandaEditor } from '@/hooks/useMedipandaEditor';
import { FixedLinearProgress } from '@/lib/components/FixedLinearProgress';
import { colors } from '@/themes';
import { DateUtils, DATEFORMAT_YYYY_MM_DD } from '@/lib/utils/dateFormat';
import { Box, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function SalesAgencyProductDetail() {
  const { id: paramId } = useParams();
  const salesAgencyProductId = Number(paramId);

  const navigate = useNavigate();
  const [detail, setDetail] = useState<SalesAgencyProductDetailsResponse | null>(null);

  useEffect(() => {
    if (Number.isNaN(salesAgencyProductId)) {
      alert('잘못된 접근입니다.');
      navigate('/sales-agency-products', { replace: true });
      return;
    }

    fetchDetail(salesAgencyProductId);
  }, [salesAgencyProductId, navigate]);

  const fetchDetail = async (id: number) => {
    const response = await getSalesAgencyProductDetails(id);

    setDetail(response);
  };

  const { editor } = useMedipandaEditor();

  useEffect(() => {
    if (detail === null) {
      return;
    }

    editor.setEditable(false);
    editor.commands.setContent(detail.boardPostDetail.content);
  }, [detail, editor]);

  const handleApply = async () => {
    try {
      await applyProduct(salesAgencyProductId);
      alert('영업대행 신청이 완료되었습니다.');
      await fetchDetail(salesAgencyProductId);
    } catch (e) {
      console.error(e);
      alert('영업대행 신청 중 오류가 발생했습니다. 다시 시도해 주세요.');
    }
  };

  if (!detail) {
    return <FixedLinearProgress />;
  }

  return (
    <>
      <Typography variant='headingPc3M' sx={{ color: colors.gray80 }}>
        영업대행상품
      </Typography>

      <Stack
        gap='5px'
        sx={{
          width: '100%',
          padding: '20px',
          marginTop: '30px',
          borderTop: `1px solid ${colors.gray50}`,
          boxSizing: 'border-box',
        }}
      >
        <Typography variant='normalPcB' sx={{ color: colors.gray80 }}>
          {detail.clientName}
        </Typography>
        <Typography variant='headingPc4B' sx={{ color: colors.gray80 }}>
          {detail.productName}
        </Typography>
        <Typography variant='smallPcR' sx={{ color: colors.gray50 }}>
          {DateUtils.parseUtcAndFormatKst(detail.startDate, DATEFORMAT_YYYY_MM_DD)} ~{' '}
          {DateUtils.parseUtcAndFormatKst(detail.endDate, DATEFORMAT_YYYY_MM_DD)} | 조회수{' '}
          {detail.boardPostDetail.viewsCount.toLocaleString()}
        </Typography>
      </Stack>

      <MedipandaEditorContent editor={editor} />

      <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
        <MedipandaButton
          onClick={handleApply}
          disabled={detail.applied || DateUtils.isExpired(DateUtils.utcToKst(new Date(detail.endDate)))}
          variant='contained'
          size='large'
          sx={{
            width: '287px',
          }}
        >
          {detail.applied
            ? '영업대행 신청완료'
            : DateUtils.isExpired(DateUtils.utcToKst(new Date(detail.endDate)))
              ? '종료된 상품입니다'
              : '영업대행 신청하기'}
        </MedipandaButton>
      </Box>
    </>
  );
}

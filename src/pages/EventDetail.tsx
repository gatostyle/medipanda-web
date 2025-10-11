import { type EventBoardDetailsResponse, getEventBoardDetails } from '@/backend';
import { MedipandaEditorContent } from '@/components/MedipandaTiptapContainer';
import { useMedipandaEditor } from '@/hooks/useMedipandaEditor';
import { FixedLinearProgress } from '@/lib/components/FixedLinearProgress';
import { colors } from '@/themes';
import { DateUtils, DATEFORMAT_YYYY_MM_DD } from '@/lib/utils/dateFormat';
import { Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function EventDetail() {
  const { id: paramId } = useParams();
  const eventId = Number(paramId);

  const navigate = useNavigate();
  const [detail, setDetail] = useState<EventBoardDetailsResponse | null>(null);

  useEffect(() => {
    if (Number.isNaN(eventId)) {
      alert('잘못된 접근입니다.');
      navigate('/events', { replace: true });
      return;
    }

    fetchDetail(eventId);
  }, [eventId, navigate]);

  const fetchDetail = async (id: number) => {
    const response = await getEventBoardDetails(id);

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

  if (!detail) {
    return <FixedLinearProgress />;
  }

  return (
    <>
      <Typography variant='headingPc3M' sx={{ color: colors.gray80 }}>
        이벤트
      </Typography>

      <Stack
        gap='5px'
        sx={{
          width: '100%',
          padding: '20px',
          marginTop: '30px',
          borderTop: `1px solid ${colors.gray50}`,
        }}
      >
        <Typography variant='headingPc4B' sx={{ color: colors.gray80 }}>
          {detail.boardPostDetail.title}
        </Typography>
        <Typography variant='normalPcR' sx={{ color: colors.gray80 }}>
          {detail.description}
        </Typography>
        <Typography variant='smallPcR' sx={{ color: colors.gray50 }}>
          {DateUtils.parseUtcAndFormatKst(detail.eventStartDate, DATEFORMAT_YYYY_MM_DD)} ~{' '}
          {DateUtils.parseUtcAndFormatKst(detail.eventEndDate, DATEFORMAT_YYYY_MM_DD)} | 조회수{' '}
          {detail.boardPostDetail.viewsCount.toLocaleString()}
        </Typography>
      </Stack>

      <MedipandaEditorContent editor={editor} />
    </>
  );
}

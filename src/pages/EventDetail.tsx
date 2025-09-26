import { type EventBoardDetailsResponse, getEventBoardDetails } from '@/backend';
import { useMedipandaEditor } from '@/hooks/useMedipandaEditor';
import { FixedLinearProgress } from '@/lib/components/FixedLinearProgress';
import { colors } from '@/themes';
import { formatYyyyMmDd } from '@/lib/utils/dateFormat';
import { Stack, Typography } from '@mui/material';
import { EditorContent } from '@tiptap/react';
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
      <Typography variant='heading3M' sx={{ color: colors.gray80 }}>
        이벤트
      </Typography>

      <Stack
        gap='5px'
        sx={{
          width: '912px',
          padding: '20px',
          marginTop: '30px',
          borderTop: `1px solid ${colors.gray50}`,
        }}
      >
        <Typography variant='heading4B' sx={{ color: colors.gray80 }}>
          {detail.boardPostDetail.title}
        </Typography>
        <Typography variant='normalTextR' sx={{ color: colors.gray80 }}>
          {detail.description}
        </Typography>
        <Typography variant='smallTextR' sx={{ color: colors.gray50 }}>
          {formatYyyyMmDd(detail.eventStartDate)} ~ {formatYyyyMmDd(detail.eventEndDate)} | 조회수{' '}
          {detail.boardPostDetail.viewsCount.toLocaleString()}
        </Typography>
      </Stack>

      <EditorContent
        editor={editor}
        style={{
          padding: '50px 20px',
        }}
      />
    </>
  );
}

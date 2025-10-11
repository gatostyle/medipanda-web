import { type BoardDetailsResponse, getBoardDetails } from '@/backend';
import { MedipandaEditorContent } from '@/components/MedipandaTiptapContainer';
import { useMedipandaEditor } from '@/hooks/useMedipandaEditor';
import { FixedLinearProgress } from '@/lib/components/FixedLinearProgress';
import { colors } from '@/themes';
import { DateUtils, DATEFORMAT_YYYY_MM_DD } from '@/lib/utils/dateFormat';
import { Button, Link, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';

export default function NoticeDetail() {
  const { id: paramId } = useParams();
  const noticeId = Number(paramId);

  const navigate = useNavigate();
  const [detail, setDetail] = useState<BoardDetailsResponse | null>(null);

  useEffect(() => {
    if (Number.isNaN(noticeId)) {
      alert('잘못된 접근입니다.');
      navigate('/customer-service/notice', { replace: true });
      return;
    }

    fetchDetail(noticeId);
  }, [noticeId, navigate]);

  const fetchDetail = async (id: number) => {
    const response = await getBoardDetails(id);

    setDetail(response);
  };

  const { editor } = useMedipandaEditor();

  useEffect(() => {
    if (detail === null) {
      return;
    }

    editor.setEditable(false);
    editor.commands.setContent(detail.content ?? '');
  }, [editor, detail]);

  if (!detail) {
    return <FixedLinearProgress />;
  }

  return (
    <>
      <Typography variant='headingPc3M' sx={{ alignSelf: 'flex-start', color: colors.gray80 }}>
        공지사항
      </Typography>

      <Typography
        variant='mediumTextB'
        sx={{
          alignSelf: 'flex-end',
          color: colors.gray50,
          marginTop: '30px',
        }}
      >
        {detail.noticeProperties!.drugCompany || '메디판다'} 공지
      </Typography>

      <Stack
        gap='5px'
        sx={{
          padding: '20px',
          marginTop: '20px',
          borderTop: `1px solid ${colors.gray50}`,
          boxSizing: 'border-box',
        }}
      >
        <Typography variant='normalPcB' sx={{ color: colors.gray80 }}>
          {detail.noticeProperties!.drugCompany || '메디판다'}
        </Typography>
        <Typography variant='headingPc4B' sx={{ color: colors.gray80 }}>
          {detail.title}
        </Typography>
        <Typography variant='smallPcR' sx={{ color: colors.gray50 }}>
          {DateUtils.parseUtcAndFormatKst(detail.createdAt, DATEFORMAT_YYYY_MM_DD)} | 조회수 {detail.viewsCount.toLocaleString()}
        </Typography>
      </Stack>

      {detail.attachments && detail.attachments.length > 0 && (
        <Stack
          sx={{
            padding: '15px 20px',
            backgroundColor: colors.gray30,
            boxSizing: 'border-box',
          }}
        >
          {detail.attachments.map(file => (
            <Link
              key={file.s3fileId}
              underline='hover'
              component={RouterLink}
              to={file.fileUrl}
              target='_blank'
              sx={{
                color: colors.gray80,
                '&:hover': {
                  color: colors.vividViolet,
                },
              }}
            >
              <Typography variant='largeTextR'>{file.originalFileName}</Typography>
            </Link>
          ))}
        </Stack>
      )}

      <MedipandaEditorContent
        editor={editor}
        sx={{
          '.tiptap': {
            padding: '50px 20px',
          },
        }}
      />

      <Button
        variant='outlined'
        component={RouterLink}
        to='/customer-service/notice'
        sx={{
          alignSelf: 'center',
          width: '160px',
          height: '50px',
          borderColor: colors.navy,
          color: colors.navy,
        }}
      >
        목록
      </Button>
    </>
  );
}

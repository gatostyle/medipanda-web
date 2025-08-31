import { type AttachmentResponse, type BoardDetailsResponse, getBoardDetails } from '@/backend';
import { InquiryStatusChip } from '@/components/InquiryStatusChip';
import { MedipandaTab, MedipandaTabElse, MedipandaTabs } from '@/custom/components/MedipandaTab';
import { useMedipandaEditor } from '@/hooks/useMedipandaEditor';
import { FixedLinearLoader } from '@/lib/react/FixedLinearLoader';
import { colors } from '@/themes';
import { formatYyyyMmDdHhMm } from '@/lib/dateFormat';
import { Box, Button, Stack, Typography } from '@mui/material';
import { EditorContent } from '@tiptap/react';
import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router';

export default function InquiryDetail() {
  const { id: paramId } = useParams();
  const inquiryId = Number(paramId);

  const navigate = useNavigate();
  const [detail, setDetail] = useState<BoardDetailsResponse | null>(null);
  const answer = detail?.children?.[0] ?? null;

  useEffect(() => {
    if (Number.isNaN(inquiryId)) {
      alert('잘못된 접근입니다.');
      navigate('/customer-service/inquiry', { replace: true });
      return;
    }

    fetchDetail(inquiryId);
  }, [inquiryId, navigate]);

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
    editor.commands.setContent(detail.content);
  }, [detail, editor]);

  const { editor: childEditor } = useMedipandaEditor();

  useEffect(() => {
    if (answer === null) {
      return;
    }

    childEditor.setEditable(false);
    childEditor.commands.setContent(answer.content);
  }, [answer, childEditor]);

  const handleFileDownload = (attachment: AttachmentResponse) => {
    const link = document.createElement('a');
    link.href = attachment.fileUrl;
    link.download = attachment.originalFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!detail) {
    return <FixedLinearLoader />;
  }

  return (
    <>
      <Typography variant='heading3M' sx={{ color: colors.gray80 }}>
        1:1 문의내역
      </Typography>

      <MedipandaTabs value={0} sx={{ marginTop: '30px' }}>
        <MedipandaTab label='문의내역' />
        <MedipandaTabElse />
      </MedipandaTabs>

      <Stack
        direction='row'
        alignItems='center'
        gap='10px'
        sx={{
          padding: '20px',
          marginTop: '40px',
          borderBottom: `1px solid ${colors.gray30}`,
          boxSizing: 'border-box',
        }}
      >
        <Typography variant='heading4B' sx={{ color: colors.gray80 }}>
          {detail.title}
        </Typography>
        <InquiryStatusChip status={detail.children.length > 0} />
        <Typography variant='smallTextR' sx={{ color: colors.gray50, marginLeft: 'auto' }}>
          {formatYyyyMmDdHhMm(detail.createdAt)}
        </Typography>
      </Stack>

      <EditorContent
        editor={editor}
        style={{
          padding: '50px 20px',
          borderBottom: `1px solid ${colors.gray30}`,
        }}
      />

      {answer !== null && (
        <Stack
          gap='20px'
          sx={{
            padding: '30px 40px',
            borderBottom: `1px solid ${colors.gray30}`,
            boxSizing: 'border-box',
          }}
        >
          <Stack direction='row' alignItems='center'>
            <Typography variant='heading2B' sx={{ color: colors.gray80 }}>
              문의하신 내용의 답변이 완료되었습니다.
            </Typography>
            <Typography variant='heading5B' sx={{ color: colors.gray80, marginLeft: 'auto' }}>
              관리자
            </Typography>
            <Typography variant='smallTextR' sx={{ color: colors.gray50, marginLeft: '10px' }}>
              {formatYyyyMmDdHhMm(answer.createdAt)}
            </Typography>
          </Stack>
          <Box
            sx={{
              padding: '15px 20px',
              backgroundColor: colors.gray10,
            }}
          >
            {answer.content}
          </Box>
          {answer.attachments.length > 0 && (
            <Box>
              <Button
                variant='contained'
                onClick={() => answer.attachments.forEach(it => handleFileDownload(it))}
                sx={{
                  width: '160px',
                  height: '50px',
                  backgroundColor: colors.navy,
                  color: colors.white,
                }}
              >
                파일 다운로드
              </Button>
            </Box>
          )}
        </Stack>
      )}

      <Stack
        direction='row'
        justifyContent='center'
        gap='10px'
        sx={{
          marginTop: '40px',
        }}
      >
        <Button
          fullWidth
          component={RouterLink}
          to='/customer-service/inquiry'
          variant='outlined'
          sx={{
            width: '160px',
            height: '50px',
            borderColor: colors.navy,
            color: colors.navy,
          }}
        >
          목록
        </Button>
      </Stack>
    </>
  );
}

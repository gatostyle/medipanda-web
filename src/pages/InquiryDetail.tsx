import { type AttachmentResponse, type BoardDetailsResponse, deleteBoardPost, getBoardDetails } from '@/backend';
import { InquiryStatusChip } from '@/components/InquiryStatusChip';
import { MedipandaEditorContent } from '@/components/MedipandaTiptapContainer';
import { MedipandaButton } from '@/custom/components/MedipandaButton';
import { MedipandaTab, MedipandaTabElse, MedipandaTabs } from '@/custom/components/MedipandaTab';
import { useMedipandaEditor } from '@/hooks/useMedipandaEditor';
import { FixedLinearProgress } from '@/lib/components/FixedLinearProgress';
import { colors } from '@/themes';
import { DateUtils, DATEFORMAT_YYYY_MM_DD_HH_MM } from '@/lib/utils/dateFormat';
import { Box, Button, Link, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';

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

  const handleDelete = async () => {
    if (!confirm('정말로 삭제하시겠습니까?')) {
      return;
    }

    try {
      await deleteBoardPost(inquiryId);
      alert('1:1 문의내역이 삭제되었습니다.');
      navigate('/customer-service/inquiry');
    } catch (error) {
      console.error('Failed to delete inquiry:', error);
      alert('1:1 문의내역 삭제 중 오류가 발생했습니다.');
    }
  };

  if (!detail) {
    return <FixedLinearProgress />;
  }

  return (
    <>
      <Typography variant='headingPc3M' sx={{ color: colors.gray80 }}>
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
        <Typography variant='headingPc4B' sx={{ color: colors.gray80 }}>
          {detail.title}
        </Typography>
        <InquiryStatusChip status={detail.children.length > 0} />
        <Typography variant='smallPcR' sx={{ color: colors.gray50, marginLeft: 'auto' }}>
          {DateUtils.parseUtcAndFormatKst(detail.createdAt, DATEFORMAT_YYYY_MM_DD_HH_MM)}
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
          borderBottom: `1px solid ${colors.gray30}`,

          '.tiptap': {
            padding: '50px 20px',
          },
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
            <Typography variant='normalTextR' sx={{ color: colors.gray50, marginLeft: '10px' }}>
              {DateUtils.parseUtcAndFormatKst(answer.createdAt, DATEFORMAT_YYYY_MM_DD_HH_MM)}
            </Typography>
          </Stack>
          <MedipandaEditorContent
            editor={childEditor}
            sx={{
              backgroundColor: colors.gray10,
            }}
          />
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
        {detail.children.length === 0 ? (
          <>
            <MedipandaButton
              fullWidth
              variant='contained'
              color='primary'
              onClick={handleDelete}
              sx={{
                width: '160px',
                height: '50px',
              }}
            >
              삭제
            </MedipandaButton>
            <MedipandaButton
              fullWidth
              component={RouterLink}
              to={`/customer-service/inquiry/${inquiryId}/edit`}
              variant='outlined'
              color='primary'
              sx={{
                width: '160px',
                height: '50px',
              }}
            >
              수정
            </MedipandaButton>
          </>
        ) : (
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
        )}
      </Stack>
    </>
  );
}

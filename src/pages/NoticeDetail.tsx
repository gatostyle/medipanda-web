import { type BoardDetailsResponse, getBoardDetails } from '@/backend';
import { useMedipandaEditor } from '@/hooks/useMedipandaEditor';
import { FixedLinearLoader } from '@/lib/react/FixedLinearLoader';
import { TiptapMenuBar } from '@/lib/react/Tiptap';
import { colors } from '@/themes';
import { formatYyyyMmDd } from '@/lib/dateFormat';
import { Button, Link, Stack, Typography } from '@mui/material';
import { EditorContent, useEditorState } from '@tiptap/react';
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
  const editorState = useEditorState({
    editor,
    selector: context => ({
      isEditable: context.editor.isEditable,
    }),
  });

  useEffect(() => {
    if (detail === null) {
      return;
    }

    editor.setEditable(false);
    editor.commands.setContent(detail.content ?? '');
  }, [editor, detail]);

  if (!detail) {
    return <FixedLinearLoader />;
  }

  return (
    <>
      <Typography variant='heading3M' sx={{ alignSelf: 'flex-start', color: colors.gray80 }}>
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
        {detail.noticeProperties?.noticeType} 공지
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
        <Typography variant='normalTextB' sx={{ color: colors.gray80 }}>
          {detail.noticeProperties?.noticeType}
        </Typography>
        <Typography variant='heading4B' sx={{ color: colors.gray80 }}>
          {detail.title}
        </Typography>
        <Typography variant='smallTextR' sx={{ color: colors.gray50 }}>
          {formatYyyyMmDd(detail.createdAt)} | 조회수 {detail.viewsCount.toLocaleString()}
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

      <Stack
        gap='10px'
        sx={{
          padding: '50px 20px',
          boxSizing: 'border-box',
          '.tiptap[contenteditable=true]': {
            border: `1px solid #cccccc`,
            padding: '12px 15px',
          },
        }}
      >
        {editorState.isEditable && <TiptapMenuBar editor={editor} />}
        <EditorContent editor={editor} />
      </Stack>

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

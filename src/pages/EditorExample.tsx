import { type AttachmentResponse, createBoardPost, getBoardDetails, updateBoardPost } from '@/backend';
import { MedipandaSwitch } from '@/custom/components/MedipandaSwitch';
import { useMedipandaEditor } from '@/hooks/useMedipandaEditor';
import { useSession } from '@/hooks/useSession';
import { Tiptap } from '@/lib/react/Tiptap';
import { Box, Button, FormControlLabel, Stack, Typography } from '@mui/material';
import { useState } from 'react';

export function EditorExample() {
  const boardPostId = 516;
  const boardType = 'ANONYMOUS';
  const title = '에디터 테스트';

  const [loaded, setLoaded] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachmentResponse[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const { editor, attachments: editorAttachments, setAttachments: setEditorAttachments } = useMedipandaEditor();
  const [editable, setEditable] = useState(true);

  const { session } = useSession();

  const handleFileUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = async () => {
      setSelectedFiles(prev => [...prev, ...Array.from(input.files ?? [])]);
    };
    input.click();
  };

  const handleLoad = async () => {
    try {
      const boardDetails = await getBoardDetails(boardPostId);
      setSelectedFiles([]);
      setEditorAttachments(boardDetails.attachments.filter(a => a.type === 'EDITOR'));
      setAttachedFiles(boardDetails.attachments.filter(a => a.type === 'ATTACHMENT'));
      editor.commands.setContent(boardDetails.content);
      setLoaded(true);
    } catch (e) {
      console.error('Error loading board details:', e);
      alert('게시판 정보를 불러오는 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const handleSave = async () => {
    try {
      if (loaded) {
        await updateBoardPost(boardPostId, {
          updateRequest: {
            title,
            content: editor.getHTML(),
            isBlind: null,
            isExposed: null,
            exposureRange: null,
            keepFileIds: [...attachedFiles, ...editorAttachments].map(file => file.s3fileId),
            editorFileIds: editorAttachments.map(attachment => attachment.s3fileId),
            noticeProperties: null,
          },
          newFiles: selectedFiles,
        });
        handleReset();
      } else {
        await createBoardPost({
          request: {
            boardType,
            userId: session!.userId,
            nickname: '익명',
            hiddenNickname: session!.nicknameHidden,
            title,
            content: editor.getHTML(),
            parentId: null,
            isExposed: true,
            editorFileIds: editorAttachments.map(image => image.s3fileId),
            exposureRange: 'ALL',
            noticeProperties: null,
          },
          files: selectedFiles,
        });
      }
    } catch (e) {
      console.error('Error saving post:', e);
      alert('글 작성 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const handleReset = () => {
    editor.commands.setContent('');
    setSelectedFiles([]);
    setAttachedFiles([]);
    setLoaded(false);
  };

  return (
    <Box>
      <FormControlLabel
        control={
          <MedipandaSwitch
            checked={editable}
            onChange={(_, checked) => {
              editor.setEditable(checked);
              setEditable(checked);
            }}
          />
        }
        label='Editable'
      />
      <Button onClick={handleLoad}>{boardPostId} 로드</Button>
      <Button onClick={handleSave}>{loaded ? '수정' : '생성'}</Button>
      <Button onClick={handleFileUpload}>파일 추가</Button>
      <Button onClick={handleReset}>리셋</Button>
      <Stack>
        {attachedFiles.map(attachment => (
          <Box key={attachment.s3fileId} sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Typography variant='body1'>{attachment.fileName}</Typography>
            <Button
              variant='outlined'
              size='small'
              onClick={() => {
                setAttachedFiles(prev => prev.filter(it => it.s3fileId !== attachment.s3fileId));
              }}
            >
              삭제
            </Button>
          </Box>
        ))}
        {selectedFiles.map(file => (
          <Box key={file.webkitRelativePath} sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Typography variant='body1'>{file.name}</Typography>
            <Button
              variant='outlined'
              size='small'
              onClick={() => {
                setSelectedFiles(prev => prev.filter(it => it.webkitRelativePath !== file.webkitRelativePath));
              }}
            >
              삭제
            </Button>
          </Box>
        ))}
      </Stack>
      <Tiptap editor={editor} />
    </Box>
  );
}

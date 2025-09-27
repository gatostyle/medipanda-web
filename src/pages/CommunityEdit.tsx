import { type AttachmentResponse, type BoardDetailsResponse, createBoardPost, getBoardDetails, updateBoardPost } from '@/backend';
import { MedipandaButton } from '@/custom/components/MedipandaButton';
import { MedipandaCheckbox } from '@/custom/components/MedipandaCheckbox';
import { MedipandaOutlinedInput } from '@/custom/components/MedipandaOutlinedInput';
import { useMedipandaEditor } from '@/hooks/useMedipandaEditor';
import { useSession } from '@/hooks/useSession';
import { TiptapMenuBar } from '@/lib/Tiptap';
import { colors } from '@/themes';
import { CheckCircle, CheckCircleOutline } from '@mui/icons-material';
import { FormControlLabel, Stack, Typography } from '@mui/material';
import { EditorContent } from '@tiptap/react';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';

export default function CommunityEdit() {
  const { session } = useSession();

  const { communityType: paramCommunityType, id: paramId } = useParams();
  const communityType = (() => {
    if (paramCommunityType === 'anonymous') {
      return 'ANONYMOUS';
    } else if (paramCommunityType === 'mr-cso-matching') {
      return 'MR_CSO_MATCHING';
    } else {
      throw new Error('Invalid community type');
    }
  })();
  const isNew = paramId === undefined;
  const boardPostId = Number(paramId);

  const navigate = useNavigate();
  const [detail, setDetail] = useState<BoardDetailsResponse | null>(null);

  useEffect(() => {
    if (isNew) {
      return;
    }

    if (Number.isNaN(boardPostId)) {
      alert('잘못된 접근입니다.');
      navigate(`/community/${paramCommunityType}`, { replace: true });
      return;
    }

    fetchDetail(boardPostId);
  }, [isNew, boardPostId, paramCommunityType, navigate]);

  const fetchDetail = async (id: number) => {
    const response = await getBoardDetails(id);

    setDetail(response);
  };

  const {
    editor,
    attachments: editorAttachments,
    setAttachments: setEditorAttachments,
  } = useMedipandaEditor({
    placeholder: '내용을 입력해주세요',
  });
  const [attachedFiles, setAttachedFiles] = useState<AttachmentResponse[]>([]);
  const [newFiles] = useState<File[]>([]);

  useEffect(() => {
    if (detail === null) {
      return;
    }

    formik.setValues({
      title: detail.title,
      hiddenNickname: session!.nicknameHidden,
    });
    editor.commands.setContent(detail.content);
    setEditorAttachments(detail.attachments.filter(a => a.type === 'EDITOR'));
    setAttachedFiles(detail.attachments.filter(a => a.type === 'ATTACHMENT'));
  }, [detail, editor, setEditorAttachments]);

  const formik = useFormik({
    initialValues: {
      title: '',
      hiddenNickname: true,
    },
    onSubmit: async values => {
      const editorContent = editor
        .getHTML()
        .replace(/^<p><\/p>$/, '')
        .trim();

      if (values.title === '') {
        alert('제목을 입력해주세요.');
        return;
      }

      if (editorContent === '') {
        alert('내용을 입력해주세요.');
        return;
      }

      try {
        if (!isNew) {
          await updateBoardPost(boardPostId, {
            updateRequest: {
              title: values.title,
              content: editorContent,
              hiddenNickname: values.hiddenNickname,
              isBlind: null,
              isExposed: null,
              exposureRange: null,
              keepFileIds: [...attachedFiles, ...editorAttachments].map(file => file.s3fileId),
              editorFileIds: editorAttachments.map(attachment => attachment.s3fileId),
              noticeProperties: null,
            },
            newFiles: newFiles,
          });
          alert('글이 수정되었습니다.');
          navigate(-1);
        } else {
          await createBoardPost({
            request: {
              boardType: communityType,
              userId: session!.userId,
              nickname: '익명',
              hiddenNickname: values.hiddenNickname,
              title: values.title,
              content: editorContent,
              parentId: null,
              isExposed: true,
              editorFileIds: editorAttachments.map(image => image.s3fileId),
              exposureRange: 'ALL',
              noticeProperties: null,
            },
            files: newFiles,
          });
          alert('글이 작성되었습니다.');
          navigate(`/community/${paramCommunityType}`);
        }
      } catch (e) {
        console.error('Error saving post:', e);
        alert('글 작성 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    },
  });

  return (
    <>
      <Stack
        sx={{
          alignSelf: 'center',
          padding: '40px 100px',
          border: `1px solid ${colors.gray30}`,
          boxSizing: 'border-box',
        }}
      >
        <Stack
          gap='20px'
          sx={{
            width: '600px',
          }}
        >
          <Stack direction='row' gap='10px'>
            <Typography variant='largeTextM' sx={{ width: '100px', color: colors.gray80, lineHeight: '50px' }}>
              익명
            </Typography>
            <FormControlLabel
              control={<MedipandaCheckbox defaultChecked icon={<CheckCircleOutline />} checkedIcon={<CheckCircle />} />}
              label='닉네임 숨기기'
              checked={formik.values.hiddenNickname}
              onChange={(_, checked) => formik.setFieldValue('hiddenNickname', checked)}
            />
          </Stack>
          <Stack direction='row' gap='10px'>
            <Typography variant='largeTextM' sx={{ width: '100px', color: colors.gray80, lineHeight: '50px' }}>
              제목 *
            </Typography>
            <MedipandaOutlinedInput
              name='title'
              value={formik.values.title}
              onChange={formik.handleChange}
              placeholder='제목을 입력해주세요'
              sx={{
                flexGrow: 1,
                height: '50px',
              }}
            />
          </Stack>
          <Stack direction='row' gap='10px'>
            <Typography variant='largeTextM' sx={{ width: '100px', color: colors.gray80, lineHeight: '50px' }}>
              문의내용 *
            </Typography>
            <Stack
              sx={{
                flexGrow: 1,
                '.tiptap': {
                  minHeight: '300px',
                  padding: '12px 15px',
                  border: `1px solid ${colors.gray30}`,
                },
              }}
            >
              <EditorContent editor={editor} />
              <TiptapMenuBar editor={editor} />
            </Stack>
          </Stack>
        </Stack>
      </Stack>
      <Stack
        direction='row'
        gap='10px'
        sx={{
          alignSelf: 'center',
          marginTop: '40px',
        }}
      >
        <MedipandaButton
          component={RouterLink}
          to={`/community/${paramCommunityType}`}
          variant='outlined'
          size='large'
          color='secondary'
          sx={{
            width: '160px',
          }}
        >
          취소
        </MedipandaButton>
        <MedipandaButton
          onClick={formik.submitForm}
          // disabled={!title.trim() || !content.trim() || loading}
          variant='contained'
          size='large'
          sx={{
            width: '160px',
          }}
        >
          {/*{loading ? <CircularProgress size={20} color='inherit' sx={{ mr: 1 }} /> : null}*/}
          문의하기
        </MedipandaButton>
      </Stack>
    </>
  );
}

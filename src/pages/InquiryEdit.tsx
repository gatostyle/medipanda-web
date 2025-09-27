import { type AttachmentResponse, createBoardPost, getBoardDetails, updateBoardPost } from '@/backend';
import { MedipandaButton } from '@/custom/components/MedipandaButton';
import { MedipandaFileUploadButton } from '@/custom/components/MedipandaFileUploadButton';
import { MedipandaTab, MedipandaTabElse, MedipandaTabs } from '@/custom/components/MedipandaTab';
import { useMedipandaEditor } from '@/hooks/useMedipandaEditor';
import { useSession } from '@/hooks/useSession';
import { colors } from '@/themes';
import { Stack, TextField, Typography } from '@mui/material';
import { EditorContent } from '@tiptap/react';
import { useFormik } from 'formik';
import { useEffect } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';

export default function InquiryEdit() {
  const { id: paramId } = useParams();
  const isNew = paramId === undefined;
  const inquiryId = Number(paramId);

  const { session } = useSession();
  const navigate = useNavigate();

  const { editor, attachments: editorAttachments, setAttachments: setEditorAttachments } = useMedipandaEditor();

  const formik = useFormik({
    initialValues: {
      title: '',
      attachedFiles: [] as AttachmentResponse[],
      newFiles: [] as File[],
    },
    onSubmit: async values => {
      const title = values.title.trim();
      const editorContent = editor
        .getHTML()
        .replace(/^(<p>\s*<\/p>)*/, '')
        .replace(/(<p>\s*<\/p>)*$/, '')
        .trim();

      if (title === '') {
        alert('제목을 입력해주세요.');
        return;
      }

      try {
        if (!isNew) {
          await updateBoardPost(inquiryId, {
            updateRequest: {
              title: title,
              content: editorContent,
              hiddenNickname: false,
              isBlind: null,
              isExposed: null,
              exposureRange: null,
              keepFileIds: [...values.attachedFiles, ...editorAttachments].map(file => file.s3fileId),
              editorFileIds: editorAttachments.map(attachment => attachment.s3fileId),
              noticeProperties: null,
            },
            newFiles: values.newFiles,
          });

          navigate(`/customer-service/inquiry/${inquiryId}`);
        } else {
          await createBoardPost({
            request: {
              boardType: 'INQUIRY',
              userId: session!.userId,
              nickname: session!.userId,
              hiddenNickname: session!.nicknameHidden,
              title: title,
              content: editorContent,
              parentId: null,
              isExposed: true,
              editorFileIds: editorAttachments.map(image => image.s3fileId),
              exposureRange: 'ALL',
              noticeProperties: null,
            },
            files: values.newFiles,
          });

          navigate('/customer-service/inquiry');
        }
      } catch (e) {
        console.error('Error saving post:', e);
        alert('글 작성 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    },
  });

  const fetchDetail = async (id: number) => {
    const response = await getBoardDetails(id);

    formik.setValues({
      title: response.title,
      attachedFiles: response.attachments.filter(a => a.type === 'ATTACHMENT'),
      newFiles: [],
    });
    editor.commands.setContent(response.content);
    setEditorAttachments(response.attachments.filter(a => a.type === 'EDITOR'));
  };

  useEffect(() => {
    if (isNew) {
      return;
    }

    fetchDetail(inquiryId);
  }, [inquiryId, editor, setEditorAttachments]);

  return (
    <>
      <Typography variant='heading3M' sx={{ color: colors.gray80 }}>
        1:1 문의내역
      </Typography>

      <MedipandaTabs value={0} sx={{ marginTop: '30px' }}>
        <MedipandaTab label='문의하기' />
        <MedipandaTabElse />
      </MedipandaTabs>

      <Stack
        gap='20px'
        component='form'
        onSubmit={formik.handleSubmit}
        sx={{
          alignSelf: 'center',
          width: '600px',
          marginTop: '40px',
        }}
      >
        <Stack direction='row' alignItems='flex-start'>
          <Typography variant='largeTextM' sx={{ color: colors.gray80, lineHeight: '56px' }}>
            제목*
          </Typography>
          <TextField
            fullWidth
            name='title'
            value={formik.values.title}
            onChange={formik.handleChange}
            placeholder='제목을 입력해주세요'
            sx={{
              width: '500px',
              marginLeft: 'auto',
            }}
          />
        </Stack>

        <Stack
          direction='row'
          alignItems='flex-start'
          sx={{
            '& .tiptap': {
              padding: '20px',
            },
          }}
        >
          <Typography variant='largeTextM' sx={{ color: colors.gray80, lineHeight: '56px' }}>
            문의내용*
          </Typography>

          <EditorContent
            editor={editor}
            style={{
              width: '500px',
              marginLeft: 'auto',
              border: `1px solid ${colors.gray30}`,
              boxSizing: 'border-box',
            }}
          />
        </Stack>

        <Stack direction='row' alignItems='flex-start'>
          <Typography variant='largeTextM' sx={{ color: colors.gray80, lineHeight: '56px' }}>
            파일 첨부
          </Typography>
          <Stack
            gap='5px'
            sx={{
              width: '500px',
              marginLeft: 'auto',
            }}
          >
            <MedipandaFileUploadButton
              onChange={files => {
                formik.setFieldValue('newFiles', [...formik.values.newFiles, ...files]);
              }}
            />
            {[...formik.values.attachedFiles, ...formik.values.newFiles].length > 0 &&
              `${[...formik.values.attachedFiles, ...formik.values.newFiles].length}개 파일 선택됨`}
          </Stack>
        </Stack>
      </Stack>

      <Stack
        direction='row'
        gap='10px'
        component='form'
        onSubmit={formik.handleSubmit}
        sx={{
          alignSelf: 'center',
          marginTop: '60px',
        }}
      >
        <MedipandaButton
          component={RouterLink}
          to='/customer-service/inquiry'
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
          type='submit'
          variant='contained'
          size='large'
          sx={{
            width: '160px',
          }}
        >
          문의하기
        </MedipandaButton>
      </Stack>
    </>
  );
}

import {
  type AttachmentResponse,
  BoardExposureRange,
  BoardType,
  createBoardPost,
  getBoardDetails,
  PostAttachmentType,
  updateBoardPost,
} from '@/backend';
import { MedipandaEditorContent } from '@/components/MedipandaTiptapContainer';
import { MedipandaButton } from '@/custom/components/MedipandaButton';
import { MedipandaFileUploadButton } from '@/custom/components/MedipandaFileUploadButton';
import { MedipandaTab, MedipandaTabElse, MedipandaTabs } from '@/custom/components/MedipandaTab';
import { useMedipandaEditor } from '@/hooks/useMedipandaEditor';
import { useSession } from '@/hooks/useSession';
import { trimTiptapContent } from '@/lib/Tiptap';
import { colors } from '@/themes';
import { Stack, TextField, Typography } from '@mui/material';
import { useEffect } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import type { RequiredDeep } from 'type-fest';

export default function InquiryEdit() {
  const { id: paramId } = useParams();
  const isNew = paramId === undefined;
  const inquiryId = Number(paramId);

  const { session } = useSession();
  const navigate = useNavigate();

  const { editor, attachments: editorAttachments, setAttachments: setEditorAttachments } = useMedipandaEditor();

  const form = useForm({
    defaultValues: {
      title: '',
      attachedFiles: [] as AttachmentResponse[],
      newFiles: [] as File[],
    },
  });
  const formAttachedFiles = form.watch('attachedFiles');
  const formNewFiles = form.watch('newFiles');

  const submitHandler: SubmitHandler<RequiredDeep<(typeof form)['control']['_defaultValues']>> = async values => {
    const title = values.title.trim();
    const editorContent = trimTiptapContent(editor.getHTML());

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
            boardType: BoardType.INQUIRY,
            userId: session!.userId,
            nickname: session!.userId,
            hiddenNickname: session!.nicknameHidden,
            title: title,
            content: editorContent,
            parentId: null,
            isExposed: true,
            editorFileIds: editorAttachments.map(image => image.s3fileId),
            exposureRange: BoardExposureRange.ALL,
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
  };

  const fetchDetail = async (id: number) => {
    const response = await getBoardDetails(id);

    form.setValue('title', response.title);
    form.setValue(
      'attachedFiles',
      response.attachments.filter(a => a.type === PostAttachmentType.ATTACHMENT),
    );
    form.setValue('newFiles', []);
    editor.commands.setContent(response.content);
    setEditorAttachments(response.attachments.filter(a => a.type === PostAttachmentType.EDITOR));
  };

  useEffect(() => {
    if (isNew) {
      return;
    }

    fetchDetail(inquiryId);
  }, [inquiryId, editor, setEditorAttachments]);

  return (
    <>
      <Typography variant='headingPc3M' sx={{ color: colors.gray80 }}>
        1:1 문의내역
      </Typography>

      <MedipandaTabs value={0} sx={{ marginTop: '30px' }}>
        <MedipandaTab label='문의하기' />
        <MedipandaTabElse />
      </MedipandaTabs>

      <Stack
        gap='20px'
        component='form'
        onSubmit={form.handleSubmit(submitHandler)}
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
          <Controller
            control={form.control}
            name={'title'}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                placeholder='제목을 입력해주세요'
                sx={{
                  width: '500px',
                  marginLeft: 'auto',
                }}
              />
            )}
          />
        </Stack>

        <Stack direction='row' alignItems='flex-start'>
          <Typography variant='largeTextM' sx={{ color: colors.gray80, lineHeight: '56px' }}>
            문의내용*
          </Typography>

          <MedipandaEditorContent
            editor={editor}
            sx={{
              width: '500px',
              marginLeft: 'auto',
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
            <Controller
              control={form.control}
              name={'newFiles'}
              render={({ field }) => <MedipandaFileUploadButton onChange={files => field.onChange([...field.value, ...files])} />}
            />
            {[...formAttachedFiles, ...formNewFiles].length > 0 && `${[...formAttachedFiles, ...formNewFiles].length}개 파일 선택됨`}
          </Stack>
        </Stack>
      </Stack>

      <Stack
        direction='row'
        gap='10px'
        component='form'
        onSubmit={form.handleSubmit(submitHandler)}
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

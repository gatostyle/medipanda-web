import {
  type AttachmentResponse,
  type BoardDetailsResponse,
  BoardExposureRange,
  BoardType,
  createBoardPost,
  getBoardDetails,
  PostAttachmentType,
  updateBoardPost,
} from '@/backend';
import { MedipandaEditorContent } from '@/components/MedipandaTiptapContainer';
import { MedipandaButton } from '@/custom/components/MedipandaButton';
import { MedipandaCheckbox } from '@/custom/components/MedipandaCheckbox';
import { MedipandaOutlinedInput } from '@/custom/components/MedipandaOutlinedInput';
import { useMedipandaEditor } from '@/hooks/useMedipandaEditor';
import { useSession } from '@/hooks/useSession';
import { TiptapMenuBar, trimTiptapContent } from '@/lib/Tiptap';
import { colors } from '@/themes';
import { CheckCircle, CheckCircleOutline } from '@mui/icons-material';
import { FormControlLabel, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import type { RequiredDeep } from 'type-fest';

export default function CommunityEdit({ boardType }: { boardType: keyof typeof BoardType }) {
  const { session } = useSession();

  const { id: paramId } = useParams();
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
      navigate(`/community/${boardType.toLowerCase().replace(/_/g, '-')}`, { replace: true });
      return;
    }

    fetchDetail(boardPostId);
  }, [isNew, boardType, boardPostId, navigate]);

  const fetchDetail = async (id: number) => {
    const response = await getBoardDetails(id, { filterBlind: true, filterDeleted: true });

    setDetail(response);
  };

  const {
    editor,
    attachments: editorAttachments,
    setAttachments: setEditorAttachments,
  } = useMedipandaEditor({
    placeholder:
      '※ 작성 시 주의사항 ※\n' +
      '1. 익명성 유지를 위해 신상 관련 정보 공유 X\n' +
      '2. 거래 당사자나 물품을 특정할 수 있는 자세한 정보 X\n' +
      '3. 지역 특정이나 개인 식별이 가능한 단어 언급 X\n' +
      '4. 모든 게시글에 대한 책임은 작성자에게 있습니다\n',
  });

  const form = useForm({
    defaultValues: {
      title: '',
      hiddenNickname: false,
      attachedFiles: [] as AttachmentResponse[],
      newFiles: [] as File[],
    },
  });
  const submitHandler: SubmitHandler<RequiredDeep<(typeof form)['control']['_defaultValues']>> = async values => {
    const title = values.title.trim();
    const editorContent = trimTiptapContent(editor.getHTML());

    if (title === '') {
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
            title: title,
            content: editorContent,
            hiddenNickname: values.hiddenNickname,
            isBlind: null,
            isExposed: null,
            exposureRange: null,
            keepFileIds: [...values.attachedFiles, ...editorAttachments].map(file => file.s3fileId),
            editorFileIds: editorAttachments.map(attachment => attachment.s3fileId),
            noticeProperties: null,
          },
          newFiles: values.newFiles,
        });
        alert('글이 수정되었습니다.');
        navigate(-1);
      } else {
        await createBoardPost({
          request: {
            boardType: boardType,
            userId: session!.userId,
            nickname: session!.nickname,
            hiddenNickname: values.hiddenNickname,
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
        alert('글이 작성되었습니다.');
        navigate(`/community/${boardType.toLowerCase().replace(/_/g, '-')}`);
      }
    } catch (e) {
      console.error('Error saving post:', e);
      alert('글 작성 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  useEffect(() => {
    if (detail === null) {
      return;
    }

    form.setValue('title', detail.title);
    form.setValue(
      'attachedFiles',
      detail.attachments.filter(a => a.type === PostAttachmentType.ATTACHMENT),
    );
    form.setValue('newFiles', []);
    editor.commands.setContent(detail.content);
    setEditorAttachments(detail.attachments.filter(a => a.type === PostAttachmentType.EDITOR));
  }, [detail, editor, setEditorAttachments]);

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
            <Typography variant='largeTextM' sx={{ flex: '0 0 100px', color: colors.gray80, lineHeight: '50px' }}>
              익명
            </Typography>
            <Controller
              control={form.control}
              name={'hiddenNickname'}
              render={({ field }) => (
                <FormControlLabel
                  {...field}
                  control={<MedipandaCheckbox defaultChecked icon={<CheckCircleOutline />} checkedIcon={<CheckCircle />} />}
                  label='닉네임 숨기기'
                  checked={field.value}
                  sx={{
                    flex: '0 0 490px',
                  }}
                />
              )}
            />
          </Stack>
          <Stack direction='row' gap='10px'>
            <Typography variant='largeTextM' sx={{ flex: '0 0 100px', color: colors.gray80, lineHeight: '50px' }}>
              제목 *
            </Typography>
            <Controller
              control={form.control}
              name={'title'}
              render={({ field }) => (
                <MedipandaOutlinedInput
                  {...field}
                  placeholder='제목을 입력해주세요'
                  sx={{
                    flex: '0 0 490px',
                    height: '50px',
                  }}
                />
              )}
            />
          </Stack>
          <Stack direction='row' gap='10px'>
            <Typography variant='largeTextM' sx={{ flex: '0 0 100px', color: colors.gray80, lineHeight: '50px' }}>
              작성내용 *
            </Typography>
            <Stack
              sx={{
                flex: '0 0 490px',
                overflowX: 'hidden',
              }}
            >
              <MedipandaEditorContent editor={editor} />
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
          to={`/community/${boardType.toLowerCase().replace(/_/g, '-')}`}
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
          onClick={form.handleSubmit(submitHandler)}
          // disabled={!title.trim() || !content.trim() || loading}
          variant='contained'
          size='large'
          sx={{
            width: '160px',
          }}
        >
          {/*{loading ? <CircularProgress size={20} color='inherit' sx={{ mr: 1 }} /> : null}*/}
          작성하기
        </MedipandaButton>
      </Stack>
    </>
  );
}

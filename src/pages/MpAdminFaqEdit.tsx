import { useMedipandaEditor } from '@/hooks/useMedipandaEditor';
import { useMpModal } from '@/hooks/useMpModal';
import { MainToolbarContent, MobileToolbarContent } from '@/lib/Tiptap/components/tiptap-templates/simple/simple-editor';
import { Toolbar } from '@/lib/Tiptap/components/tiptap-ui-primitive/toolbar';
import { Close } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CircularProgress,
  FormControl,
  FormControlLabel,
  IconButton,
  Link,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { EditorContent, EditorContext } from '@tiptap/react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
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
import { useSession } from '@/hooks/useSession';
import { useSnackbar } from 'notistack';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import type { RequiredDeep } from 'type-fest';

export default function MpAdminFaqEdit() {
  const navigate = useNavigate();
  const { boardId: paramBoardId } = useParams();
  const isNew = paramBoardId === undefined;
  const boardId = Number(paramBoardId);

  const { alert, alertError } = useMpModal();
  const { enqueueSnackbar } = useSnackbar();
  const { session } = useSession();
  const [detail, setDetail] = useState<BoardDetailsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const { editor, attachments: editorAttachments, setAttachments: setEditorAttachments } = useMedipandaEditor();
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [mobileView, setMobileView] = useState<'main' | 'highlighter' | 'link' | 'youtube'>('main');

  const form = useForm({
    defaultValues: {
      title: '',
      isExposed: true,
      attachedFiles: [] as AttachmentResponse[],
      newFiles: [] as File[],
    },
  });
  const formAttachedFiles = form.watch('attachedFiles');
  const formNewFiles = form.watch('newFiles');

  const submitHandler: SubmitHandler<RequiredDeep<(typeof form)['control']['_defaultValues']>> = async values => {
    const editorContent = editor
      .getHTML()
      .replace(/^<p><\/p>$/, '')
      .trim();

    if (values.title === '') {
      await alert('제목을 입력하세요.');
      return;
    }

    if (editorContent === '') {
      await alert('내용을 입력하세요.');
      return;
    }

    try {
      if (isNew) {
        await createBoardPost({
          request: {
            boardType: BoardType.FAQ,
            title: values.title,
            content: editorContent,
            userId: session!.userId,
            nickname: session!.name,
            hiddenNickname: false,
            parentId: null,
            isExposed: values.isExposed,
            editorFileIds: editorAttachments.map(image => image.s3fileId),
            exposureRange: BoardExposureRange.ALL,
            noticeProperties: null,
          },
          files: values.newFiles && values.newFiles.length > 0 ? values.newFiles : undefined,
        });
        await alert('FAQ가 성공적으로 등록되었습니다.');
        navigate('/admin/faqs');
      } else {
        await updateBoardPost(boardId, {
          updateRequest: {
            title: values.title,
            content: editorContent,
            hiddenNickname: null,
            isBlind: null,
            isExposed: values.isExposed,
            exposureRange: BoardExposureRange.ALL,
            keepFileIds: [...values.attachedFiles, ...editorAttachments].map(file => file.s3fileId),
            editorFileIds: editorAttachments.map(attachment => attachment.s3fileId),
            noticeProperties: null,
          },
          newFiles: values.newFiles ? values.newFiles : undefined,
        });
        await alert('FAQ가 성공적으로 수정되었습니다.');
        navigate(`/admin/faqs/${boardId}`);
      }
    } catch (error) {
      console.error('Failed to submit form:', error);
      await alertError(isNew ? 'FAQ 등록에 실패했습니다.' : 'FAQ 수정에 실패했습니다.');
    }
  };

  useEffect(() => {
    if (!isNew) {
      fetchDetail(boardId);
    }
  }, [isNew, boardId]);

  useEffect(() => {
    if (detail !== null) {
      editor.commands.setContent(detail.content);
      setEditorAttachments(detail.attachments.filter(a => a.type === PostAttachmentType.EDITOR));
    }
  }, [detail, editor]);

  const fetchDetail = async (boardId: number) => {
    if (Number.isNaN(boardId)) {
      await alertError('잘못된 접근입니다.');
      return navigate('/admin/faqs');
    }

    setLoading(true);
    try {
      const detail = await getBoardDetails(boardId, { filterDeleted: true });
      setDetail(detail);

      form.reset({
        title: detail.title,
        isExposed: detail.isExposed,
        attachedFiles: detail.attachments.filter(a => a.type === PostAttachmentType.ATTACHMENT),
        newFiles: [],
      });
    } catch (error) {
      console.error('Failed to fetch FAQ detail:', error);
      enqueueSnackbar('데이터를 불러오는데 실패했습니다.', { variant: 'error' });
      return window.history.back();
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = async () => {
      if (form.getValues('newFiles').length + (input.files ?? []).length > 3) {
        await alert('첨부파일은 최대 3개까지 업로드할 수 있습니다.');
        return;
      }

      form.setValue('newFiles', [...form.getValues('newFiles'), ...(Array.from(input.files ?? []) as File[])]);
    };
    input.click();
  };

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack sx={{ gap: 3 }}>
      <Typography variant='h4'>FAQ 등록</Typography>

      <Card component={Stack} sx={{ padding: 3, gap: 3 }}>
        <Stack>
          <Typography variant='body2' color='text.secondary'>
            제목 *
          </Typography>
          <Controller control={form.control} name={'title'} render={({ field }) => <TextField {...field} fullWidth placeholder='' />} />
        </Stack>

        <Stack>
          <Typography variant='body2' color='text.secondary'>
            내용 *
          </Typography>
          <Stack
            sx={{
              '& .tiptap': {
                minHeight: '300px',
                padding: '10px',
                border: `1px solid #CCCCCC`,
              },
            }}
          >
            <EditorContext.Provider value={{ editor }}>
              <Toolbar ref={toolbarRef}>
                {mobileView === 'main' ? (
                  <MainToolbarContent
                    onHighlighterClick={() => setMobileView('highlighter')}
                    onLinkClick={() => setMobileView('link')}
                    onYoutubeClick={() => setMobileView('youtube')}
                    isMobile={false}
                  />
                ) : (
                  <MobileToolbarContent type={mobileView === 'highlighter' ? 'highlighter' : 'link'} onBack={() => setMobileView('main')} />
                )}
              </Toolbar>

              <EditorContent editor={editor} />
            </EditorContext.Provider>
          </Stack>
        </Stack>

        <Stack>
          <Typography variant='body2' color='text.secondary'>
            첨부파일
          </Typography>
          <Box>
            <Button
              onClick={handleFileUpload}
              disabled={formAttachedFiles.length + formNewFiles.length >= 3}
              variant='contained'
              component='label'
            >
              파일첨부
            </Button>
          </Box>

          {(formAttachedFiles.length > 0 || formNewFiles.length > 0) && (
            <Stack sx={{ mt: 2 }}>
              {formAttachedFiles.map(file => (
                <Stack key={file.s3fileId} direction='row' alignItems='center'>
                  <Link component={RouterLink} to={file.fileUrl} target='_blank'>
                    {file.originalFileName}
                  </Link>
                  <IconButton
                    size='small'
                    onClick={() => {
                      form.setValue(
                        'attachedFiles',
                        formAttachedFiles.filter(a => a.s3fileId !== file.s3fileId),
                      );
                    }}
                    sx={{
                      marginLeft: '10px',
                    }}
                  >
                    <Close />
                  </IconButton>
                </Stack>
              ))}
              {formNewFiles.map((file, index) => (
                <Stack key={`${index}:${file.name}`} direction='row' alignItems='center'>
                  <Link underline='none'>{file.name}</Link>
                  <IconButton
                    size='small'
                    onClick={() => {
                      form.setValue(
                        'newFiles',
                        formNewFiles.filter((_, i) => i !== index),
                      );
                    }}
                    sx={{
                      marginLeft: '10px',
                    }}
                  >
                    <Close />
                  </IconButton>
                </Stack>
              ))}
            </Stack>
          )}
        </Stack>

        <Stack>
          <Typography variant='body2' color='text.secondary'>
            노출상태
          </Typography>
          <FormControl component='fieldset'>
            <Controller
              control={form.control}
              name={'isExposed'}
              render={({ field }) => (
                <RadioGroup
                  {...field}
                  row
                  value={String(field.value)}
                  onChange={e => form.setValue('isExposed', e.target.value === 'true')}
                >
                  <FormControlLabel value='true' control={<Radio />} label='노출' />
                  <FormControlLabel value='false' control={<Radio />} label='미노출' />
                </RadioGroup>
              )}
            />
          </FormControl>
        </Stack>

        <Stack direction='row' sx={{ justifyContent: 'center', gap: 2 }}>
          <Button
            variant='outlined'
            component={RouterLink}
            to={isNew ? '/admin/faqs' : `/admin/faqs/${boardId}`}
            sx={{
              minWidth: 120,
            }}
          >
            취소
          </Button>
          <Button
            variant='contained'
            onClick={form.handleSubmit(submitHandler)}
            sx={{
              minWidth: 120,
            }}
          >
            저장
          </Button>
        </Stack>
      </Card>
    </Stack>
  );
}

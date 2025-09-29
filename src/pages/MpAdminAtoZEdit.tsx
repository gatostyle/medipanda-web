import { useMpModal } from '@/hooks/useMpModal';
import { Close } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  Link,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { EditorContent } from '@tiptap/react';
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
import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import type { RequiredDeep } from 'type-fest';
import { useMedipandaEditor } from '@/hooks/useMedipandaEditor';

export default function MpAdminAtoZEdit() {
  const navigate = useNavigate();
  const { boardId: paramBoardId } = useParams();
  const isNew = paramBoardId === undefined;
  const boardId = Number(paramBoardId);

  const { enqueueSnackbar } = useSnackbar();
  const { session } = useSession();
  const [detail, setDetail] = useState<BoardDetailsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const { alert, alertError } = useMpModal();

  const form = useForm({
    defaultValues: {
      title: '',
      attachedFiles: [] as AttachmentResponse[],
      newFiles: [] as File[],
      isExposed: true,
      exposureRange: BoardExposureRange.ALL as keyof typeof BoardExposureRange,
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
            boardType: BoardType.CSO_A_TO_Z,
            title: values.title,
            content: editorContent,
            userId: session!.userId,
            nickname: session!.name,
            hiddenNickname: false,
            parentId: null,
            isExposed: values.isExposed,
            editorFileIds: editorAttachments.map(image => image.s3fileId),
            exposureRange: values.exposureRange,
            noticeProperties: null,
          },
          files: values.newFiles,
        });
        enqueueSnackbar('CSO A to Z가 성공적으로 등록되었습니다.', { variant: 'success' });
      } else {
        await updateBoardPost(boardId, {
          updateRequest: {
            title: values.title,
            content: editorContent,
            hiddenNickname: null,
            isBlind: null,
            isExposed: values.isExposed,
            exposureRange: values.exposureRange,
            keepFileIds: [...values.attachedFiles, ...editorAttachments].map(file => file.s3fileId),
            editorFileIds: editorAttachments.map(image => image.s3fileId),
            noticeProperties: null,
          },
          newFiles: values.newFiles,
        });
        enqueueSnackbar('CSO A to Z가 성공적으로 수정되었습니다.', { variant: 'success' });
      }
      navigate('/admin/atoz');
    } catch (error) {
      console.error('Failed to submit form:', error);
      await alertError(isNew ? 'CSO A to Z 등록에 실패했습니다.' : 'CSO A to Z 수정에 실패했습니다.');
    }
  };

  const { editor, attachments: editorAttachments, setAttachments: setEditorAttachments } = useMedipandaEditor();

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

  const fetchDetail = async (itemId: number) => {
    setLoading(true);
    try {
      const detail = await getBoardDetails(itemId);
      setDetail(detail);

      form.reset({
        title: detail.title,
        isExposed: detail.isExposed,
        attachedFiles: detail.attachments.filter(a => a.type === PostAttachmentType.ATTACHMENT),
        newFiles: [],
      });
    } catch (error) {
      console.error('Failed to fetch CSO A to Z detail:', error);
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
      <Typography variant='h4'>CSO A TO Z {isNew ? '등록' : '상세'}</Typography>

      <Card component={Stack} sx={{ padding: 3, gap: 3 }}>
        <Controller
          control={form.control}
          name={'title'}
          render={({ field }) => <TextField {...field} fullWidth label='제목' required />}
        />

        <Stack>
          <Typography variant='body2' sx={{ mb: 1 }}>
            내용 <span style={{ color: 'red' }}>*</span>
          </Typography>
          <Box
            component={EditorContent}
            editor={editor}
            sx={{
              border: `1px solid #CCCCCC`,
              '& .tiptap': {
                minHeight: '300px',
                padding: '10px',
              },
            }}
          />
        </Stack>

        <Stack>
          <Typography variant='body2' sx={{ mb: 1 }}>
            첨부파일
          </Typography>
          <Box>
            <Button onClick={handleFileUpload} variant='contained' component='label' size='small'>
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
          <FormControl component='fieldset'>
            <FormLabel component='legend'>노출상태</FormLabel>
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

        <Stack>
          <FormControl component='fieldset'>
            <FormLabel component='legend'>노출범위</FormLabel>
            <Controller
              control={form.control}
              name={'exposureRange'}
              render={({ field }) => (
                <RadioGroup
                  {...field}
                  row
                  value={String(field.value)}
                  onChange={e => form.setValue('isExposed', e.target.value === 'true')}
                >
                  <FormControlLabel value={BoardExposureRange.ALL} control={<Radio />} label='전체' />
                  <FormControlLabel value={BoardExposureRange.CONTRACTED} control={<Radio />} label='계약' />
                  <FormControlLabel value={BoardExposureRange.UNCONTRACTED} control={<Radio />} label='미계약' />
                </RadioGroup>
              )}
            />
          </FormControl>
        </Stack>

        <Stack direction='row' sx={{ justifyContent: 'center', gap: 2 }}>
          <Button variant='outlined' component={RouterLink} to={isNew ? '/admin/atoz' : `/admin/atoz/${boardId}`} sx={{ minWidth: 120 }}>
            취소
          </Button>
          <Button variant='contained' onClick={form.handleSubmit(submitHandler)} sx={{ minWidth: 120 }}>
            저장
          </Button>
        </Stack>
      </Card>
    </Stack>
  );
}

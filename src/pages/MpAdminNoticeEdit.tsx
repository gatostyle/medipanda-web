import { MpDrugCompanySelectModal } from '@/components/MpDrugCompanySelectModal';
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
  InputAdornment,
  InputLabel,
  Link,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
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
  BoardExposureRangeLabel,
  BoardType,
  createBoardPost,
  type DrugCompanyResponse,
  getBoardDetails,
  isDrugCompanyNoticeType,
  isTopFixedNoticeType,
  NoticeType,
  NoticeTypeLabel,
  PostAttachmentType,
  updateBoardPost,
} from '@/backend';
import { useSession } from '@/hooks/useSession';
import { SearchNormal1 } from 'iconsax-reactjs';
import { useSnackbar } from 'notistack';
import { useEffect, useRef, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import type { RequiredDeep } from 'type-fest';

export default function MpAdminNoticeEdit() {
  const navigate = useNavigate();
  const { boardId: paramBoardId } = useParams();
  const isNew = paramBoardId === undefined;
  const boardId = Number(paramBoardId);

  const { enqueueSnackbar } = useSnackbar();
  const { session } = useSession();
  const [detail, setDetail] = useState<BoardDetailsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const { alert, alertError } = useMpModal();

  const [drugCompanySelectModalOpen, setDrugCompanySelectModalOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      noticeType: NoticeType.GENERAL as keyof typeof NoticeType,
      drugCompany: '',
      isExposed: true,
      exposureRange: BoardExposureRange.ALL as keyof typeof BoardExposureRange,
      title: '',
      attachedFiles: [] as AttachmentResponse[],
      newFiles: [] as File[],
    },
  });
  const formNoticeType = form.watch('noticeType');
  const formAttachedFiles = form.watch('attachedFiles');
  const formNewFiles = form.watch('newFiles');

  const submitHandler: SubmitHandler<RequiredDeep<(typeof form)['control']['_defaultValues']>> = async values => {
    const editorContent = editor
      .getHTML()
      .replace(/^<p><\/p>$/, '')
      .trim();

    if (isDrugCompanyNoticeType(values.noticeType) && values.drugCompany === '') {
      await alert('제약사명을 선택하세요.');
      return;
    }

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
            boardType: BoardType.NOTICE,
            title: values.title,
            content: editorContent,
            userId: session!.userId,
            nickname: session!.name || session!.userId,
            hiddenNickname: false,
            parentId: null,
            isExposed: values.isExposed,
            editorFileIds: editorAttachments.map(image => image.s3fileId),
            exposureRange: values.exposureRange,
            noticeProperties: {
              noticeType: values.noticeType,
              drugCompany: isDrugCompanyNoticeType(values.noticeType) ? values.drugCompany : '',
              fixedTop: isTopFixedNoticeType(values.noticeType),
            },
          },
          files: values.newFiles,
        });
        await alert('공지사항이 성공적으로 등록되었습니다.');
        navigate('/admin/notices');
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
            editorFileIds: editorAttachments.map(attachment => attachment.s3fileId),
            noticeProperties: {
              noticeType: values.noticeType,
              drugCompany: isDrugCompanyNoticeType(values.noticeType) ? values.drugCompany : '',
              fixedTop: isTopFixedNoticeType(values.noticeType),
            },
          },
          newFiles: values.newFiles,
        });
        await alert('공지사항이 성공적으로 수정되었습니다.');
        navigate(`/admin/notices/${paramBoardId}`);
      }
    } catch (error) {
      console.error('Failed to submit form:', error);
      await alertError(isNew ? '공지사항 등록에 실패했습니다.' : '공지사항 수정에 실패했습니다.');
    }
  };

  const { editor, attachments: editorAttachments, setAttachments: setEditorAttachments } = useMedipandaEditor();
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [mobileView, setMobileView] = useState<'main' | 'highlighter' | 'link' | 'youtube'>('main');

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
      return navigate('/admin/notices');
    }

    setLoading(true);
    try {
      const detail = await getBoardDetails(boardId, { filterDeleted: true });
      setDetail(detail);

      form.reset({
        noticeType: detail.noticeProperties!.noticeType,
        drugCompany: detail.noticeProperties!.drugCompany ?? '',
        isExposed: detail.isExposed,
        exposureRange: detail.exposureRange,
        title: detail.title,
        attachedFiles: detail.attachments.filter(a => a.type === PostAttachmentType.ATTACHMENT),
        newFiles: [],
      });
    } catch (error) {
      console.error('Failed to fetch notice detail:', error);
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

  const handleDrugCompanySelect = (drugCompany: DrugCompanyResponse) => {
    form.setValue('drugCompany', drugCompany.name);
    setDrugCompanySelectModalOpen(false);
  };

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Stack sx={{ gap: 3 }}>
        <Typography variant='h4'>공지사항 {isNew ? '등록' : '수정'}</Typography>

        <Card component={Stack} sx={{ padding: 3, gap: 3 }}>
          <Stack direction='row' sx={{ gap: 3 }}>
            <FormControl fullWidth sx={{ flex: '1 0' }}>
              <InputLabel>공지분류 *</InputLabel>
              <Controller
                control={form.control}
                name={'noticeType'}
                render={({ field }) => (
                  <Select {...field}>
                    {Object.keys(NoticeType).map(noticeType => (
                      <MenuItem key={noticeType} value={noticeType}>
                        {NoticeTypeLabel[noticeType]}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </FormControl>

            {isDrugCompanyNoticeType(formNoticeType) ? (
              <Controller
                control={form.control}
                name={'drugCompany'}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='제약사명'
                    InputProps={{
                      readOnly: true,
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton edge='end' onClick={() => setDrugCompanySelectModalOpen(true)}>
                            <SearchNormal1 />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{ flex: '1 0' }}
                  />
                )}
              />
            ) : (
              <Box sx={{ flex: '1 0' }} />
            )}
          </Stack>

          <Stack direction='row'>
            <Stack sx={{ flex: '1 0' }}>
              <Typography variant='body2' sx={{ mb: 1 }}>
                노출상태 <span style={{ color: 'red' }}>*</span>
              </Typography>
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
            </Stack>

            <Stack sx={{ flex: '1 0' }}>
              <Typography variant='body2' sx={{ mb: 1 }}>
                노출범위 <span style={{ color: 'red' }}>*</span>
              </Typography>
              <Controller
                control={form.control}
                name={'exposureRange'}
                render={({ field }) => (
                  <RadioGroup {...field} row>
                    {Object.keys(BoardExposureRange).map(exposureRange => (
                      <FormControlLabel
                        key={exposureRange}
                        value={exposureRange}
                        control={<Radio />}
                        label={BoardExposureRangeLabel[exposureRange]}
                      />
                    ))}
                  </RadioGroup>
                )}
              />
            </Stack>
          </Stack>

          <Controller
            control={form.control}
            name={'title'}
            render={({ field }) => (
              <TextField {...field} fullWidth label='제목' placeholder='제목을 입력하세요' required inputProps={{ maxLength: 100 }} />
            )}
          />

          <Stack>
            <Typography variant='body2' sx={{ mb: 1 }}>
              내용 <span style={{ color: 'red' }}>*</span>
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
                    <MobileToolbarContent
                      type={mobileView === 'highlighter' ? 'highlighter' : 'link'}
                      onBack={() => setMobileView('main')}
                    />
                  )}
                </Toolbar>

                <EditorContent editor={editor} />
              </EditorContext.Provider>
            </Stack>
          </Stack>

          <Stack>
            <Typography variant='body2' sx={{ mb: 1 }}>
              첨부파일
            </Typography>
            <Box>
              <Button onClick={handleFileUpload} variant='contained' component='label'>
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

          <Stack direction='row' sx={{ justifyContent: 'center', gap: 2 }}>
            <Button
              variant='outlined'
              component={RouterLink}
              to={isNew ? '/admin/notices' : `/admin/notices/${boardId}`}
              sx={{ minWidth: 120 }}
            >
              취소
            </Button>
            <Button variant='contained' onClick={form.handleSubmit(submitHandler)} sx={{ minWidth: 120 }}>
              저장
            </Button>
          </Stack>
        </Card>
      </Stack>

      <MpDrugCompanySelectModal
        open={drugCompanySelectModalOpen}
        onClose={() => setDrugCompanySelectModalOpen(false)}
        onSelect={handleDrugCompanySelect}
      />
    </>
  );
}

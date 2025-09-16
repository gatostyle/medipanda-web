import { MpDrugCompanySelectModal } from '@/medipanda/components/MpDrugCompanySelectModal';
import { useMedipandaEditor } from '@/medipanda/components/useMedipandaEditor';
import { useMpModal } from '@/medipanda/hooks/useMpModal';
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
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { EditorContent } from '@tiptap/react';
import { useFormik } from 'formik';
import {
  AttachmentResponse,
  BoardExposureRange,
  BoardExposureRangeLabel,
  BoardType,
  createBoardPost,
  DrugCompanyResponse,
  getBoardDetails,
  isDrugCompanyNoticeType,
  NoticeType,
  NoticeTypeLabel,
  PostAttachmentType,
  updateBoardPost,
} from '@/backend';
import { useSession } from '@/medipanda/hooks/useSession';
import { SearchNormal1 } from 'iconsax-react';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';

export default function MpAdminNoticeEdit() {
  const navigate = useNavigate();
  const { boardId: paramBoardId } = useParams();
  const isNew = paramBoardId === undefined;
  const boardId = Number(paramBoardId);

  const { enqueueSnackbar } = useSnackbar();
  const { session } = useSession();
  const [loading, setLoading] = useState(false);

  const { alert, alertError } = useMpModal();

  const [drugCompanySelectModalOpen, setDrugCompanySelectModalOpen] = useState(false);

  const formik = useFormik({
    initialValues: {
      noticeType: NoticeType.GENERAL as keyof typeof NoticeType,
      drugCompany: '',
      isExposed: true,
      exposureRange: BoardExposureRange.ALL as keyof typeof BoardExposureRange,
      isTopFixed: false,
      title: '',
      attachedFiles: [] as AttachmentResponse[],
      newFiles: [] as File[],
    },
    onSubmit: async (values, { setSubmitting }) => {
      if (isDrugCompanyNoticeType(values.noticeType) && values.drugCompany === '') {
        await alert('제약사명을 선택하세요.');
        return;
      }

      if (values.title === '') {
        await alert('제목을 입력하세요.');
        return;
      }

      try {
        if (isNew) {
          await createBoardPost({
            request: {
              boardType: BoardType.NOTICE,
              title: values.title,
              content: editor.getHTML(),
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
                fixedTop: values.isTopFixed,
              },
            },
            files: values.newFiles,
          });
          enqueueSnackbar('공지사항이 성공적으로 등록되었습니다.', { variant: 'success' });
          navigate('/admin/notices');
        } else {
          await updateBoardPost(boardId, {
            updateRequest: {
              title: values.title,
              content: editor.getHTML(),
              hiddenNickname: null,
              isBlind: null,
              isExposed: values.isExposed,
              exposureRange: values.exposureRange,
              keepFileIds: [...values.attachedFiles, ...editorAttachments].map(file => file.s3fileId),
              editorFileIds: editorAttachments.map(attachment => attachment.s3fileId),
              noticeProperties: {
                noticeType: values.noticeType,
                drugCompany: isDrugCompanyNoticeType(values.noticeType) ? values.drugCompany : '',
                fixedTop: values.isTopFixed,
              },
            },
            newFiles: values.newFiles,
          });
          enqueueSnackbar('공지사항이 성공적으로 수정되었습니다.', { variant: 'success' });
          navigate(`/admin/notices/${paramBoardId}`);
        }
      } catch (error) {
        console.error('Failed to submit form:', error);
        await alertError(isNew ? '공지사항 등록에 실패했습니다.' : '공지사항 수정에 실패했습니다.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const { editor, attachments: editorAttachments, setAttachments: setEditorAttachments } = useMedipandaEditor();

  useEffect(() => {
    if (!isNew) {
      fetchDetail(boardId);
    }
  }, [isNew, boardId]);

  const fetchDetail = async (boardId: number) => {
    if (Number.isNaN(boardId)) {
      await alertError('잘못된 접근입니다.');
      return navigate('/admin/notices');
    }

    setLoading(true);
    try {
      const detail = await getBoardDetails(boardId);

      editor.commands.setContent(detail.content);
      setEditorAttachments(detail.attachments.filter(a => a.type === PostAttachmentType.EDITOR));

      formik.setValues({
        noticeType: detail.noticeProperties!.noticeType,
        drugCompany: detail.noticeProperties!.drugCompany ?? '',
        isExposed: detail.isExposed,
        exposureRange: detail.exposureRange,
        isTopFixed: detail.noticeProperties?.fixedTop || false,
        title: detail.title,
        attachedFiles: detail.attachments,
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

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const MAX_FILE_SIZE = 1 * 1024 * 1024;

    const validFiles: File[] = [];
    const oversizedFiles: string[] = [];

    files.forEach(file => {
      if (file.size > MAX_FILE_SIZE) {
        oversizedFiles.push(file.name);
      } else {
        validFiles.push(file);
      }
    });

    if (oversizedFiles.length > 0) {
      await alert(`다음 파일이 1MB를 초과합니다: ${oversizedFiles.join(', ')}`);
      return;
    }

    if (validFiles.length > 0) {
      formik.setFieldValue('newFiles', [...formik.values.newFiles, ...validFiles]);
    }
  };

  const handleDrugCompanySelect = (drugCompany: DrugCompanyResponse) => {
    formik.setFieldValue('drugCompany', drugCompany.name);
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
      <Stack component='form' onSubmit={formik.handleSubmit} sx={{ gap: 3 }}>
        <Typography variant='h4'>공지사항 {isNew ? '등록' : '수정'}</Typography>

        <Card component={Stack} sx={{ padding: 3, gap: 3 }}>
          <Stack direction='row' sx={{ gap: 3 }}>
            <FormControl fullWidth sx={{ flex: '1 0' }}>
              <InputLabel>공지분류 *</InputLabel>
              <Select name='noticeType' value={formik.values.noticeType} onChange={formik.handleChange}>
                {Object.keys(NoticeType).map(noticeType => (
                  <MenuItem key={noticeType} value={noticeType}>
                    {NoticeTypeLabel[noticeType]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {isDrugCompanyNoticeType(formik.values.noticeType) ? (
              <TextField
                fullWidth
                label='제약사명'
                value={formik.values.drugCompany}
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
            ) : (
              <Box sx={{ flex: '1 0' }} />
            )}
          </Stack>

          <Stack direction='row'>
            <Stack sx={{ flex: '1 0' }}>
              <Typography variant='body2' sx={{ mb: 1 }}>
                노출상태 <span style={{ color: 'red' }}>*</span>
              </Typography>
              <RadioGroup
                row
                name='isExposed'
                value={formik.values.isExposed ? 'true' : 'false'}
                onChange={e => formik.setFieldValue('isExposed', e.target.value === 'true')}
              >
                <FormControlLabel value='true' control={<Radio />} label='노출' />
                <FormControlLabel value='false' control={<Radio />} label='미노출' />
              </RadioGroup>
            </Stack>

            <Stack sx={{ flex: '1 0' }}>
              <Typography variant='body2' sx={{ mb: 1 }}>
                노출범위 <span style={{ color: 'red' }}>*</span>
              </Typography>
              <RadioGroup row name='exposureRange' value={formik.values.exposureRange} onChange={formik.handleChange}>
                {Object.keys(BoardExposureRange).map(exposureRange => (
                  <FormControlLabel
                    key={exposureRange}
                    value={exposureRange}
                    control={<Radio />}
                    label={BoardExposureRangeLabel[exposureRange]}
                  />
                ))}
              </RadioGroup>
            </Stack>
          </Stack>

          <FormControlLabel
            control={
              <Switch
                checked={formik.values.isTopFixed}
                onChange={e => formik.setFieldValue('isTopFixed', e.target.checked)}
                name='isTopFixed'
              />
            }
            label='상단고정'
          />

          <TextField
            fullWidth
            name='title'
            label='제목'
            placeholder='제목을 입력하세요'
            required
            value={formik.values.title}
            onChange={formik.handleChange}
            inputProps={{ maxLength: 100 }}
          />

          <Stack>
            <Typography variant='body2' sx={{ mb: 1 }}>
              내용 <span style={{ color: 'red' }}>*</span>
            </Typography>
            <Stack
              sx={{
                '.tiptap': {
                  border: `1px solid #cccccc`,
                  padding: '20px 10px',
                },
              }}
            >
              <EditorContent editor={editor} placeholder='내용을 입력하세요' />
            </Stack>
          </Stack>

          <Stack>
            <Typography variant='body2' sx={{ mb: 1 }}>
              첨부파일
            </Typography>
            <Box>
              <Button variant='contained' component='label'>
                파일첨부
                <input type='file' hidden multiple onChange={handleFileChange} accept='*' />
              </Button>
            </Box>

            {(formik.values.attachedFiles.length > 0 || formik.values.newFiles.length > 0) && (
              <Stack sx={{ mt: 2 }}>
                {formik.values.attachedFiles.map(file => (
                  <Stack key={file.s3fileId} direction='row' alignItems='center'>
                    <Link component={RouterLink} to={file.fileUrl} target='_blank'>
                      {file.originalFileName}
                    </Link>
                    <IconButton
                      size='small'
                      onClick={() => {
                        formik.setFieldValue(
                          'attachedFiles',
                          formik.values.attachedFiles.filter(a => a.s3fileId !== file.s3fileId),
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
                {formik.values.newFiles.map((file, index) => (
                  <Stack key={`${index}:${file.name}`} direction='row' alignItems='center'>
                    <Link underline='none'>{file.name}</Link>
                    <IconButton
                      size='small'
                      onClick={() => {
                        formik.setFieldValue(
                          'newFiles',
                          formik.values.newFiles.filter((_, i) => i !== index),
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
              disabled={formik.isSubmitting}
            >
              취소
            </Button>
            <Button
              variant='contained'
              type='submit'
              sx={{ minWidth: 120 }}
              disabled={formik.isSubmitting}
              startIcon={formik.isSubmitting ? <CircularProgress size={20} /> : null}
            >
              {formik.isSubmitting ? '저장 중...' : '저장'}
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

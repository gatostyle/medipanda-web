import { MpSearchFilterBar, SearchFilterActions, SearchFilterItem } from '@/components/MpSearchFilterBar';
import { useMpDeleteDialog } from '@/hooks/useMpDeleteDialog';
import { MainToolbarContent, MobileToolbarContent } from '@/lib/Tiptap/components/tiptap-templates/simple/simple-editor';
import { Toolbar } from '@/lib/Tiptap/components/tiptap-ui-primitive/toolbar';
import { setUrlParams } from '@/lib/utils/url';
import { useSearchParamsOrDefault } from '@/lib/hooks/useSearchParamsOrDefault';
import { useMedipandaEditor } from '@/hooks/useMedipandaEditor';
import { useMpModal } from '@/hooks/useMpModal';
import { type Sequenced, withSequence } from '@/lib/utils/withSequence';
import {
  Box,
  Button,
  Card,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  Pagination,
  PaginationItem,
  Radio,
  RadioGroup,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { EditorContent, EditorContext } from '@tiptap/react';
import { format } from 'date-fns';
import { DocumentDownload } from 'iconsax-reactjs';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import {
  type AttachmentResponse,
  BoardExposureRange,
  BoardExposureRangeLabel,
  BoardType,
  ContractStatus,
  createSalesAgencyProductBoard,
  deleteSalesAgencyProductApplicant,
  getDownloadProductApplicantsExcel,
  getProductApplicants,
  getSalesAgencyProductDetails,
  PostAttachmentType,
  type SalesAgencyProductApplicantResponse,
  type SalesAgencyProductDetailsResponse,
  updateApplicantNotes,
  updateSalesAgencyProductBoard,
} from '@/backend';
import { useSession } from '@/hooks/useSession';
import { useSnackbar } from 'notistack';
import { type SyntheticEvent, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import type { RequiredDeep } from 'type-fest';
import { DATEFORMAT_YYYY_MM_DD, DateUtils } from '@/lib/utils/dateFormat';

export default function MpAdminSalesAgencyProductEdit() {
  const navigate = useNavigate();
  const { salesAgencyProductId: paramSalesAgencyProductId } = useParams();
  const isNew = paramSalesAgencyProductId === undefined;
  const salesAgencyProductId = Number(paramSalesAgencyProductId);

  const initialSearchParams = { tab: 'info' };
  const { tab } = useSearchParamsOrDefault(initialSearchParams);

  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<SalesAgencyProductDetailsResponse | null>(null);

  const { alertError } = useMpModal();

  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (!isNew) {
      loadProductDetail(salesAgencyProductId);
    }
  }, [isNew, salesAgencyProductId]);

  const loadProductDetail = async (salesAgencyProductId: number) => {
    if (Number.isNaN(salesAgencyProductId)) {
      await alertError('잘못된 접근입니다.');
      return navigate('/admin/sales-agency-products');
    }

    setLoading(true);
    try {
      const detail = await getSalesAgencyProductDetails(salesAgencyProductId);
      setDetail(detail);
    } catch (error) {
      console.error('Failed to load product detail:', error);
      enqueueSnackbar('영업대행상품 정보를 불러오는데 실패했습니다.', { variant: 'error' });
      return window.history.back();
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_: SyntheticEvent, value: string) => {
    const url = setUrlParams({ tab: value, searchKeyword: undefined }, initialSearchParams);

    navigate(url);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack sx={{ gap: 3 }}>
      <Typography variant='h4'>영업대행상품 {isNew ? '등록' : '상세'}</Typography>

      <Card>
        <Tabs value={tab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab value='info' label='기본정보' />
          <Tab value='applicants' label='신청자' />
        </Tabs>

        {tab === 'info' && <InfoTab detail={detail} />}

        {!isNew && tab === 'applicants' && <ApplicantsTab detail={detail!} />}
      </Card>
    </Stack>
  );
}

function InfoTab({ detail }: { detail: SalesAgencyProductDetailsResponse | null }) {
  const isNew = detail === null;

  const { session } = useSession();

  const navigate = useNavigate();

  const { alert, alertError } = useMpModal();

  const form = useForm({
    defaultValues: {
      clientName: '',
      productName: '',
      isExposed: true,
      exposureRange: '' as keyof typeof BoardExposureRange | '',
      thumbnail: null as File | null,
      thumbnailUrl: '',
      videoUrl: '',
      contractDate: null as Date | null,
      note: '',
      startDate: null as Date | null,
      endDate: null as Date | null,
      attachedFiles: [] as AttachmentResponse[],
      newFiles: [] as File[],
    },
  });
  const formThumbnailUrl = form.watch('thumbnailUrl');
  const formStartDate = form.watch('startDate');
  const formEndDate = form.watch('endDate');

  const submitHandler: SubmitHandler<RequiredDeep<(typeof form)['control']['_defaultValues']>> = async values => {
    const editorContent = editor
      .getHTML()
      .replace(/^<p><\/p>$/, '')
      .trim();

    if (values.clientName === '') {
      await alert('위탁사명은 필수입니다');
      return;
    }
    if (values.productName === '') {
      await alert('상품명은 필수입니다');
      return;
    }
    if (values.exposureRange === '') {
      await alert('노출범위는 필수입니다');
      return;
    }
    if (values.thumbnailUrl === '') {
      await alert('썸네일은 필수입니다');
      return;
    }
    if (values.contractDate === null) {
      await alert('계약일은 필수입니다');
      return;
    }
    if (values.startDate === null) {
      await alert('게시 시작일은 필수입니다');
      return;
    }
    if (values.endDate === null) {
      await alert('게시 종료일은 필수입니다');
      return;
    }
    if (values.endDate < values.startDate) {
      await alert('종료일은 시작일 이후여야 합니다');
      return;
    }

    if (editorContent === '') {
      await alert('내용을 입력하세요.');
      return;
    }

    try {
      if (isNew) {
        await createSalesAgencyProductBoard({
          boardPostCreateRequest: {
            boardType: BoardType.SALES_AGENCY,
            userId: session!.userId,
            nickname: session!.name,
            hiddenNickname: false,
            title: values.productName,
            content: editorContent,
            parentId: null,
            isExposed: values.isExposed,
            exposureRange: values.exposureRange,
            editorFileIds: editorAttachments.map(image => image.s3fileId),
            noticeProperties: null,
          },
          salesAgencyProductCreateRequest: {
            clientName: values.clientName,
            productName: values.productName,
            contractDate: format(values.contractDate, DATEFORMAT_YYYY_MM_DD),
            videoUrl: values.videoUrl,
            note: values.note,
            startAt: format(values.startDate, DATEFORMAT_YYYY_MM_DD),
            endAt: format(values.endDate, DATEFORMAT_YYYY_MM_DD),
            quantity: 1,
          },
          thumbnail: values.thumbnail!,
          files: [],
        });
        await alert('영업대행상품이 등록되었습니다.');
        navigate('/admin/sales-agency-products');
      } else {
        await updateSalesAgencyProductBoard(detail!.productId, {
          boardPostUpdateRequest: {
            title: values.productName,
            content: editorContent,
            hiddenNickname: null,
            isBlind: null,
            isExposed: values.isExposed,
            exposureRange: values.exposureRange,
            keepFileIds: [...values.attachedFiles, ...editorAttachments].map(file => file.s3fileId),
            editorFileIds: editorAttachments.map(attachment => attachment.s3fileId),
            noticeProperties: null,
          },
          salesAgencyProductUpdateRequest: {
            clientName: values.clientName,
            productName: values.productName,
            contractDate: format(values.contractDate, DATEFORMAT_YYYY_MM_DD),
            videoUrl: values.videoUrl,
            note: values.note,
            startAt: format(values.startDate, DATEFORMAT_YYYY_MM_DD),
            endAt: format(values.endDate, DATEFORMAT_YYYY_MM_DD),
            quantity: null,
          },
          thumbnail: values.thumbnail ?? undefined,
        });
        await alert('영업대행상품이 수정되었습니다.');
        navigate(`/admin/sales-agency-products`);
      }
    } catch (error) {
      console.error('Failed to save sales agency product:', error);
    }
  };

  const { editor, attachments: editorAttachments, setAttachments: setEditorAttachments } = useMedipandaEditor();
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [mobileView, setMobileView] = useState<'main' | 'highlighter' | 'link' | 'youtube'>('main');

  useEffect(() => {
    if (detail !== null) {
      editor.commands.setContent(detail.boardPostDetail.content);
      setEditorAttachments(detail.boardPostDetail.attachments.filter(a => a.type === PostAttachmentType.EDITOR));
    }
  }, [detail, editor]);

  useEffect(() => {
    if (detail !== null) {
      form.reset({
        clientName: detail.clientName,
        productName: detail.productName,
        isExposed: detail.boardPostDetail.isExposed,
        exposureRange: detail.boardPostDetail.exposureRange,
        thumbnail: null,
        thumbnailUrl: detail.thumbnailUrl,
        videoUrl: detail.videoUrl ?? '',
        contractDate: DateUtils.utcToKst(new Date(detail.contractDate)),
        note: detail.note ?? '',
        startDate: DateUtils.utcToKst(new Date(detail.startDate)),
        endDate: DateUtils.utcToKst(new Date(detail.endDate)),
        attachedFiles: detail.boardPostDetail.attachments.filter(a => a.type === PostAttachmentType.ATTACHMENT),
        newFiles: [],
      });
    }
  }, [detail]);

  const handleFileUpload = async () => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async e => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) {
          return;
        }

        if (file.type.indexOf('image/') !== 0) {
          await alertError('이미지 파일만 업로드할 수 있습니다.');
          return;
        }

        const fileReader = new FileReader();
        fileReader.onload = async () => {
          if (!fileReader.result) {
            await alertError('파일을 읽는 데 실패했습니다.');
            return;
          }

          form.setValue('thumbnail', file);
          form.setValue('thumbnailUrl', fileReader.result as string);
        };
        fileReader.readAsDataURL(file);
      };
      input.click();
    } catch (error) {
      console.error('Failed to upload file:', error);
      await alertError('파일 업로드 중 오류가 발생했습니다.');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack sx={{ gap: 3 }}>
        <Controller
          control={form.control}
          name={'clientName'}
          render={({ field }) => <TextField {...field} fullWidth label='위탁사명' required />}
        />

        <Controller
          control={form.control}
          name={'productName'}
          render={({ field }) => <TextField {...field} fullWidth label='상품명' required />}
        />

        <Stack sx={{ gap: 1.5 }}>
          <Typography variant='subtitle2'>노출상태</Typography>
          <FormControl>
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

        <Stack sx={{ gap: 1.5 }}>
          <Typography variant='subtitle2'>
            노출범위 <span style={{ color: 'red' }}>*</span>
          </Typography>
          <FormControl>
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
          </FormControl>
        </Stack>

        <Stack sx={{ gap: 1.5 }}>
          <Typography variant='subtitle2'>
            썸네일 <span style={{ color: 'red' }}>*</span>
          </Typography>
          <Box>
            <Button variant='contained' onClick={handleFileUpload}>
              첨부파일
            </Button>
          </Box>
          {formThumbnailUrl && (
            <Box>
              <img src={formThumbnailUrl} alt='썸네일 미리보기' style={{ maxWidth: 200, maxHeight: 200 }} />
            </Box>
          )}
        </Stack>

        <Stack sx={{ gap: 1.5 }}>
          <Typography variant='subtitle2'>
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
                  <MobileToolbarContent type={mobileView === 'highlighter' ? 'highlighter' : 'link'} onBack={() => setMobileView('main')} />
                )}
              </Toolbar>

              <EditorContent editor={editor} />
            </EditorContext.Provider>
          </Stack>
        </Stack>

        <Controller control={form.control} name={'videoUrl'} render={({ field }) => <TextField {...field} fullWidth label='영상url' />} />

        <Box>
          <Controller
            control={form.control}
            name={'contractDate'}
            render={({ field }) => (
              <DatePicker
                {...field}
                format={DATEFORMAT_YYYY_MM_DD}
                views={['year', 'month', 'day']}
                label='계약일 *'
                slotProps={{
                  textField: {
                    size: 'small',
                  },
                }}
              />
            )}
          />
        </Box>

        <Controller
          control={form.control}
          name={'note'}
          render={({ field }) => <TextField {...field} fullWidth label='비고' multiline rows={3} />}
        />

        <Stack direction='row'>
          <Box sx={{ width: '100%' }}>
            <Controller
              control={form.control}
              name={'startDate'}
              render={({ field }) => (
                <DatePicker
                  {...field}
                  format={DATEFORMAT_YYYY_MM_DD}
                  views={['year', 'month', 'day']}
                  maxDate={formEndDate ?? undefined}
                  label='게시 시작일 *'
                  slotProps={{
                    textField: {
                      size: 'small',
                    },
                  }}
                />
              )}
            />
          </Box>

          <Box sx={{ width: '100%' }}>
            <Controller
              control={form.control}
              name={'endDate'}
              render={({ field }) => (
                <DatePicker
                  {...field}
                  format={DATEFORMAT_YYYY_MM_DD}
                  views={['year', 'month', 'day']}
                  minDate={formStartDate ?? undefined}
                  label='게시 종료일 *'
                  slotProps={{
                    textField: {
                      size: 'small',
                    },
                  }}
                />
              )}
            />
          </Box>
        </Stack>
        {detail !== null && (
          <Stack>
            <Typography variant='subtitle2'>조회수</Typography>
            <Typography variant='body1'>{detail.boardPostDetail.viewsCount.toLocaleString()}</Typography>
          </Stack>
        )}
      </Stack>

      <Stack direction='row' spacing={2} justifyContent='center' sx={{ mt: 4 }}>
        <Button variant='outlined' size='large' component={RouterLink} to='/admin/sales-agency-products' sx={{ minWidth: 120 }}>
          취소
        </Button>
        <Button variant='contained' size='large' sx={{ minWidth: 120 }} onClick={form.handleSubmit(submitHandler)}>
          저장
        </Button>
      </Stack>
    </Box>
  );
}

function ApplicantsTab({ detail }: { detail: SalesAgencyProductDetailsResponse }) {
  const navigate = useNavigate();

  const initialSearchParams = {
    searchKeyword: '',
    page: '1',
  };

  const { searchKeyword, page: paramPage, ...searchParams } = useSearchParamsOrDefault(initialSearchParams);
  const page = Number(paramPage);
  const pageSize = 20;

  const [loading, setLoading] = useState(false);
  const [contents, setContents] = useState<Sequenced<SalesAgencyProductApplicantResponse>[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const deleteDialog = useMpDeleteDialog();
  const { alertError } = useMpModal();

  const form = useForm({
    defaultValues: {
      ...initialSearchParams,
    },
  });

  const submitHandler: SubmitHandler<RequiredDeep<(typeof form)['control']['_defaultValues']>> = async values => {
    const url = setUrlParams(
      {
        ...searchParams,
        ...values,
        page: 1,
      },
      initialSearchParams,
    );

    navigate(url);
  };

  const noteForm = useForm({
    defaultValues: {
      notes: [] as string[],
    },
  });

  const handleReset = () => {
    navigate('');
    form.reset();
  };

  const [notes, setNotes] = useState<string[]>(Array.from({ length: pageSize }, () => ''));

  const fetchContents = async () => {
    setLoading(true);

    try {
      const response = await getProductApplicants(detail.productId, {
        name: searchKeyword,
        page: page - 1,
        size: pageSize,
      });

      setContents(withSequence(response).content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);

      setNotes(notes.map((_, index) => response.content[index]?.note ?? ''));
      noteForm.reset({
        notes: response.content.map(item => item.note ?? ''),
      });
    } catch (error) {
      console.error('Failed to fetch applicants:', error);
      await alertError('신청자 목록을 불러오는데 실패했습니다.');
      setContents([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    form.setValue('searchKeyword', searchKeyword);
    fetchContents();
  }, [searchKeyword, page]);

  const handleDelete = () => {
    const count = selectedIds.length;
    const message =
      count === 1
        ? `신청자 ${contents.find(item => item.userId === selectedIds[0])?.memberName}를 삭제하시겠습니까?`
        : `${count}건이 선택되었습니다. 삭제하시겠습니까?`;

    deleteDialog.open({
      message,
      onConfirm: async () => {
        try {
          await Promise.all(
            selectedIds.map(id =>
              deleteSalesAgencyProductApplicant(id, {
                productBoardId: detail.productId,
              }),
            ),
          );
          setSelectedIds([]);
          fetchContents();
        } catch (error) {
          console.error('Failed to delete applicants:', error);
          await alertError('신청자 삭제 중 오류가 발생했습니다.');
        }
      },
    });
  };

  const handleNoteUpdate = async (userId: string, note: string) => {
    try {
      await updateApplicantNotes({
        productId: detail.productId,
        updates: [
          {
            userId,
            note,
          },
        ],
      });
      fetchContents();
    } catch (error) {
      console.error('Failed to update notes:', error);
      await alertError('비고 수정 중 오류가 발생했습니다.');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={2}>
        <Stack direction='row' alignItems='center' spacing={2} sx={{ mb: 2 }}>
          <Typography variant='body2' color='text.secondary'>
            위탁사명: {detail.clientName}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            상품명: {detail.productName}
          </Typography>
        </Stack>

        <Box component='form' onSubmit={form.handleSubmit(submitHandler)}>
          <MpSearchFilterBar>
            <SearchFilterItem flexGrow={1} minWidth={200}>
              <Controller
                control={form.control}
                name='searchKeyword'
                render={({ field }) => <TextField {...field} size='small' label='검색어' fullWidth />}
              />
            </SearchFilterItem>
            <SearchFilterActions>
              <Button variant='contained' size='small' type='submit'>
                검색
              </Button>
              <Button variant='outlined' size='small' onClick={handleReset}>
                초기화
              </Button>
            </SearchFilterActions>
          </MpSearchFilterBar>
        </Box>

        <Stack direction='row' justifyContent='space-between' alignItems='center' mb={2}>
          <Stack direction='row' spacing={2}>
            <Typography variant='subtitle1'>검색결과: {totalElements.toLocaleString()} 건</Typography>
          </Stack>
          <Stack direction='row' spacing={1}>
            <Button
              variant='contained'
              color='success'
              size='small'
              href={getDownloadProductApplicantsExcel(detail.productId, {
                userId: searchKeyword,
                size: 2 ** 31 - 1,
              })}
              target='_blank'
              startIcon={<DocumentDownload size={16} />}
            >
              Excel
            </Button>
            <Button variant='contained' color='error' size='small' disabled={selectedIds.length === 0} onClick={handleDelete}>
              삭제
            </Button>
          </Stack>
        </Stack>

        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table size='small'>
            <TableHead>
              <TableRow>
                <TableCell width={50}>
                  <Checkbox
                    checked={selectedIds.length === contents.length && contents.length > 0}
                    onChange={e => {
                      if (e.target.checked) {
                        setSelectedIds(contents.map(item => item.userId));
                      } else {
                        setSelectedIds([]);
                      }
                    }}
                  />
                </TableCell>
                <TableCell width={60}>No</TableCell>
                <TableCell width={100}>회원번호</TableCell>
                <TableCell width={120}>아이디</TableCell>
                <TableCell width={100}>회원명</TableCell>
                <TableCell width={140}>핸드폰번호</TableCell>
                <TableCell width={120}>신청일</TableCell>
                <TableCell width={140}>파트너사 계약여부</TableCell>
                <TableCell width={100}>비고</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align='center' sx={{ py: 3 }}>
                    <Typography variant='body2' color='text.secondary'>
                      데이터를 로드하는 중입니다.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : contents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align='center' sx={{ py: 3 }}>
                    <Typography variant='body2' color='text.secondary'>
                      검색 결과가 없습니다.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                contents.map((item, i) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(item.userId)}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedIds(prev => [...prev, item.userId]);
                          } else {
                            setSelectedIds(prev => prev.filter(id => id !== item.userId));
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>{item.sequence}</TableCell>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{item.userId}</TableCell>
                    <TableCell>{item.memberName}</TableCell>
                    <TableCell>{item.phoneNumber}</TableCell>
                    <TableCell>{DateUtils.parseUtcAndFormatKst(item.appliedDate, DATEFORMAT_YYYY_MM_DD)}</TableCell>
                    <TableCell>{item.contractStatus === ContractStatus.CONTRACT ? 'Y' : 'N'}</TableCell>
                    <TableCell>
                      <Controller
                        control={noteForm.control}
                        name={'notes'}
                        render={({ field }) => (
                          <TextField
                            fullWidth
                            size='small'
                            placeholder='비고를 입력하세요'
                            value={field.value[i]}
                            onChange={e => {
                              field.onChange(field.value.map((note, index) => (index === i ? e.target.value : note)));
                            }}
                            onBlur={e => handleNoteUpdate(item.userId, e.target.value)}
                          />
                        )}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Stack direction='row' justifyContent='center' sx={{ mt: 2 }}>
          <Pagination
            count={totalPages}
            page={page}
            renderItem={item => (
              <PaginationItem
                {...item}
                color='primary'
                variant='outlined'
                component={RouterLink}
                to={setUrlParams({ page: item.page }, initialSearchParams)}
              />
            )}
            color='primary'
            variant='outlined'
            showFirstButton
            showLastButton
          />
        </Stack>
      </Stack>
    </Box>
  );
}

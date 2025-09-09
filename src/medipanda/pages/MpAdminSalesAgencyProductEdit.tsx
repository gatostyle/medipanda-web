import { useMedipandaEditor } from '@/medipanda/components/useMedipandaEditor';
import { Download as ExcelIcon } from '@mui/icons-material';
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  Pagination,
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
import { EditorContent } from '@tiptap/react';
import MainCard from 'components/MainCard';
import { useFormik } from 'formik';
import {
  AttachmentResponse,
  createSalesAgencyProductBoard,
  getProductApplicants,
  getSalesAgencyProductDetails,
  SalesAgencyProductApplicantResponse,
  SalesAgencyProductDetailsResponse,
  updateApplicantNotes,
  updateSalesAgencyProductBoard,
} from '@/backend';
import MpFormikDatePicker from '@/medipanda/components/MpFormikDatePicker';
import { TiptapEditor } from '@/medipanda/components/TiptapEditor';
import { useMpErrorDialog } from '@/medipanda/hooks/useMpErrorDialog';
import { useSession } from '@/medipanda/hooks/useSession';
import { EXPOSURE_RANGE_LABELS } from '@/medipanda/ui-labels';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as Yup from 'yup';
import { DateFix, formatYyyyMmDd } from '../utils/dateFormat';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div role='tabpanel' hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function MpAdminSalesAgencyProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const errorDialog = useMpErrorDialog();
  const { enqueueSnackbar } = useSnackbar();
  const { session } = useSession();
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [productDetail, setProductDetail] = useState<SalesAgencyProductDetailsResponse | null>(null);
  const [applicants, setApplicants] = useState<SalesAgencyProductApplicantResponse[]>([]);
  const [selectedApplicants, setSelectedApplicants] = useState<number[]>([]);
  const [applicantPage, setApplicantPage] = useState(1);
  const [applicantSearch, setApplicantSearch] = useState('');

  const isNew = id === undefined;

  const { editor, attachments: editorAttachments, setAttachments: setEditorAttachments } = useMedipandaEditor();

  const formik = useFormik({
    initialValues: {
      clientName: '',
      productName: '',
      isExposed: true,
      exposureRange: 'ALL' as 'ALL' | 'CONTRACTED' | 'UNCONTRACTED',
      thumbnail: null as File | null,
      thumbnailUrl: '',
      videoUrl: '',
      contractDate: null as Date | null,
      note: '',
      startDate: null as Date | null,
      endDate: null as Date | null,
      viewCount: 0,
      attachedFiles: [] as AttachmentResponse[],
      newFiles: [] as File[],
    },
    validationSchema: Yup.object({
      clientName: Yup.string().required('위탁사명은 필수입니다'),
      productName: Yup.string().required('상품명은 필수입니다'),
      exposureRange: Yup.string().oneOf(['ALL', 'CONTRACTED', 'UNCONTRACTED']).required('노출범위는 필수입니다'),
      thumbnailUrl: Yup.string().required('썸네일은 필수입니다'),
      content: Yup.string().required('내용은 필수입니다'),
      contractDate: Yup.date().required('계약일은 필수입니다'),
      startDate: Yup.date().required('게시 시작일은 필수입니다'),
      endDate: Yup.date().required('게시 종료일은 필수입니다').min(Yup.ref('startDate'), '종료일은 시작일 이후여야 합니다'),
    }),
    onSubmit: async values => {
      try {
        if (!isNew) {
          await updateSalesAgencyProductBoard(parseInt(id!), {
            boardPostUpdateRequest: {
              title: values.productName,
              content: editor.getHTML(),
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
              contractDate: formatYyyyMmDd(values.contractDate!),
              videoUrl: values.videoUrl,
              note: values.note,
              startAt: formatYyyyMmDd(values.startDate!),
              endAt: formatYyyyMmDd(values.endDate!),
              quantity: null,
            },
            thumbnail: values.thumbnail ?? undefined,
          });
          navigate(`/admin/sales-agency-products/${id}`);
        } else {
          await createSalesAgencyProductBoard({
            boardPostCreateRequest: {
              boardType: 'SALES_AGENCY',
              userId: session!.userId,
              nickname: session!.name,
              hiddenNickname: false,
              title: values.productName,
              content: editor.getHTML(),
              parentId: null,
              isExposed: values.isExposed,
              exposureRange: values.exposureRange,
              editorFileIds: editorAttachments.map(image => image.s3fileId),
              noticeProperties: null,
            },
            salesAgencyProductCreateRequest: {
              clientName: values.clientName,
              productName: values.productName,
              contractDate: formatYyyyMmDd(values.contractDate!),
              videoUrl: values.videoUrl,
              note: values.note,
              startAt: formatYyyyMmDd(values.startDate!),
              endAt: formatYyyyMmDd(values.endDate!),
              quantity: 1,
            },
            thumbnail: values.thumbnail!,
            files: [],
          });
          navigate('/admin/sales-agency-products');
        }
      } catch (error) {
        console.error('Failed to save sales agency product:', error);
      }
    },
  });

  useEffect(() => {
    if (!isNew) {
      loadProductDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isNew]);

  const loadProductDetail = async () => {
    setLoading(true);
    try {
      const [detail, applicantsResponse] = await Promise.all([
        getSalesAgencyProductDetails(parseInt(id!)),
        getProductApplicants(parseInt(id!)),
      ]);
      setProductDetail(detail);

      const mappedApplicants = applicantsResponse.content.map(applicant => ({
        ...applicant,
        appliedDate: applicant.appliedDate,
      }));
      setApplicants(mappedApplicants);

      formik.setValues({
        clientName: detail.clientName,
        productName: detail.productName,
        isExposed: detail.boardPostDetail.isExposed,
        exposureRange: detail.boardPostDetail.exposureRange,
        thumbnail: null,
        thumbnailUrl: detail.thumbnailUrl,
        videoUrl: detail.videoUrl ?? '',
        contractDate: DateFix(detail.contractDate),
        note: detail.note ?? '',
        startDate: DateFix(detail.startDate),
        endDate: DateFix(detail.endDate),
        viewCount: detail.boardPostDetail.viewsCount,
        attachedFiles: detail.boardPostDetail.attachments.filter(a => a.type === 'ATTACHMENT'),
        newFiles: [],
      });
      editor.commands.setContent(detail.boardPostDetail.content);
      setEditorAttachments(detail.boardPostDetail.attachments.filter(a => a.type === 'EDITOR'));
    } catch (error) {
      console.error('Failed to load product detail:', error);
      enqueueSnackbar('영업대행상품 정보를 불러오는데 실패했습니다.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCancel = () => {
    navigate('/admin/sales-agency-products');
  };

  const handleFileUpload = async () => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async e => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const fileReader = new FileReader();
          fileReader.onload = () => {
            if (!fileReader.result) {
              errorDialog.showError('파일을 읽는 데 실패했습니다.');
              return;
            }

            formik.setFieldValue('thumbnail', file);
            formik.setFieldValue('thumbnailUrl', fileReader.result as string);
          };

          fileReader.readAsDataURL(file);
        }
      };
      input.click();
    } catch (error) {
      console.error('Failed to upload file:', error);
      errorDialog.showError('파일 업로드 중 오류가 발생했습니다.');
    }
  };

  const handleExcelDownload = async () => {
    errorDialog.showError('Excel 다운로드 기능은 준비 중입니다.');
  };

  const handleApplicantNotesUpdate = async (applicantId: number, notes: string) => {
    if (isNew) return;

    try {
      const applicant = applicants.find(a => a.id === applicantId);
      if (applicant) {
        await updateApplicantNotes({
          productId: parseInt(id!),
          updates: [{ userId: applicant.userId, note: notes }],
        });
        setApplicants(prev => prev.map(a => (a.id === applicantId ? { ...a, notes } : a)));
      }
    } catch (error) {
      console.error('Failed to update applicant notes:', error);
    }
  };

  const filteredApplicants = applicants.filter(
    applicant =>
      applicant.memberName.includes(applicantSearch) ||
      applicant.userId.includes(applicantSearch) ||
      applicant.id.toString().includes(applicantSearch),
  );

  const paginatedApplicants = filteredApplicants.slice((applicantPage - 1) * 20, applicantPage * 20);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant='h4' gutterBottom sx={{ mb: 3 }}>
        영업대행상품 {isNew ? '등록' : '상세'}
      </Typography>

      <form onSubmit={formik.handleSubmit}>
        <MainCard>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label='basic tabs'>
              <Tab label='기본정보' />
              {!isNew && <Tab label='신청자' />}
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='위탁사명'
                  name='clientName'
                  value={formik.values.clientName}
                  onChange={formik.handleChange}
                  error={formik.touched.clientName && Boolean(formik.errors.clientName)}
                  helperText={formik.touched.clientName && formik.errors.clientName}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='상품명'
                  name='productName'
                  value={formik.values.productName}
                  onChange={formik.handleChange}
                  error={formik.touched.productName && Boolean(formik.errors.productName)}
                  helperText={formik.touched.productName && formik.errors.productName}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant='subtitle2' gutterBottom>
                  노출상태
                </Typography>
                <FormControl>
                  <RadioGroup
                    row
                    name='isExposed'
                    value={formik.values.isExposed ? 'true' : 'false'}
                    onChange={e => formik.setFieldValue('isExposed', e.target.value === 'true')}
                  >
                    <FormControlLabel value={'true'} control={<Radio />} label={'노출'} />
                    <FormControlLabel value={'false'} control={<Radio />} label={'미노출'} />
                  </RadioGroup>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Typography variant='subtitle2' gutterBottom>
                  노출범위 <span style={{ color: 'red' }}>*</span>
                </Typography>
                <FormControl>
                  <RadioGroup row name='exposureRange' value={formik.values.exposureRange} onChange={formik.handleChange}>
                    <FormControlLabel value={'ALL'} control={<Radio />} label={EXPOSURE_RANGE_LABELS['ALL']} />
                    <FormControlLabel value={'CONTRACT'} control={<Radio />} label={EXPOSURE_RANGE_LABELS['CONTRACTED']} />
                    <FormControlLabel value={'NON_CONTRACT'} control={<Radio />} label={EXPOSURE_RANGE_LABELS['UNCONTRACTED']} />
                  </RadioGroup>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Typography variant='subtitle2' gutterBottom>
                  썸네일 <span style={{ color: 'red' }}>*</span>
                </Typography>
                <Button variant='contained' color='success' onClick={handleFileUpload}>
                  첨부파일
                </Button>
                {formik.values.thumbnailUrl && (
                  <Box sx={{ mt: 2 }}>
                    <img src={formik.values.thumbnailUrl} alt='썸네일 미리보기' style={{ maxWidth: 200, maxHeight: 200 }} />
                  </Box>
                )}
                {formik.touched.thumbnailUrl && formik.errors.thumbnailUrl && (
                  <Box>
                    <Typography variant='caption' color='error' sx={{ mt: 1 }}>
                      {formik.errors.thumbnailUrl}
                    </Typography>
                  </Box>
                )}
              </Grid>

              <Grid item xs={12}>
                <Typography variant='subtitle2' gutterBottom>
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
              </Grid>

              <Grid item xs={12}>
                <TextField fullWidth label='영상url' name='videoUrl' value={formik.values.videoUrl} onChange={formik.handleChange} />
              </Grid>

              <Grid item xs={12} md={6}>
                <MpFormikDatePicker name='contractDate' label='계약일 *' formik={formik} />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='비고'
                  name='notes'
                  value={formik.values.note}
                  onChange={formik.handleChange}
                  multiline
                  rows={3}
                  placeholder='비고'
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <MpFormikDatePicker name='startDate' label='게시기간 - 시작일 *' formik={formik} />
              </Grid>

              <Grid item xs={12} md={6}>
                <MpFormikDatePicker name='endDate' label='게시기간 - 종료일 *' formik={formik} />
              </Grid>

              <Grid item xs={12}>
                <Typography variant='subtitle2' gutterBottom>
                  조회수
                </Typography>
                <Typography variant='body1'>{formik.values.viewCount.toLocaleString()}</Typography>
              </Grid>
            </Grid>

            <Stack direction='row' spacing={2} justifyContent='center' sx={{ mt: 4 }}>
              <Button variant='outlined' size='large' onClick={handleCancel} sx={{ minWidth: 120 }}>
                취소
              </Button>
              <Button variant='contained' color='success' size='large' sx={{ minWidth: 120 }} onClick={formik.submitForm}>
                저장
              </Button>
            </Stack>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            {!isNew && productDetail && (
              <>
                <Box sx={{ mb: 3 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant='body2' color='text.secondary'>
                        위탁사명: {productDetail.clientName}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant='body2' color='text.secondary'>
                        상품명: {productDetail.productName}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Stack direction='row' spacing={2} alignItems='center'>
                    <TextField
                      size='small'
                      placeholder='검색어를 입력하세요'
                      value={applicantSearch}
                      onChange={e => setApplicantSearch(e.target.value)}
                      sx={{ width: 300 }}
                    />
                    <Button variant='contained' size='small'>
                      검색
                    </Button>
                    <Box sx={{ flexGrow: 1 }} />
                    <IconButton
                      size='small'
                      color='success'
                      onClick={handleExcelDownload}
                      sx={{
                        backgroundColor: 'success.main',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'success.dark',
                        },
                      }}
                    >
                      <ExcelIcon fontSize='small' />
                    </IconButton>
                  </Stack>
                </Box>

                <TableContainer>
                  <Table size='small'>
                    <TableHead>
                      <TableRow>
                        <TableCell padding='checkbox'>
                          <Checkbox
                            checked={selectedApplicants.length === paginatedApplicants.length && paginatedApplicants.length > 0}
                            onChange={e => {
                              if (e.target.checked) {
                                setSelectedApplicants(paginatedApplicants.map(a => a.id));
                              } else {
                                setSelectedApplicants([]);
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>No</TableCell>
                        <TableCell>회원번호</TableCell>
                        <TableCell>아이디</TableCell>
                        <TableCell>회원명</TableCell>
                        <TableCell>현대폰번호</TableCell>
                        <TableCell>신청일</TableCell>
                        <TableCell>파트너시 계약여부</TableCell>
                        <TableCell>비고</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedApplicants.map((applicant, index) => (
                        <TableRow key={applicant.id}>
                          <TableCell padding='checkbox'>
                            <Checkbox
                              checked={selectedApplicants.includes(applicant.id)}
                              onChange={e => {
                                if (e.target.checked) {
                                  setSelectedApplicants(prev => [...prev, applicant.id]);
                                } else {
                                  setSelectedApplicants(prev => prev.filter(id => id !== applicant.id));
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell>{(applicantPage - 1) * 20 + index + 1}</TableCell>
                          <TableCell>{applicant.id}</TableCell>
                          <TableCell>{applicant.userId}</TableCell>
                          <TableCell>{applicant.memberName}</TableCell>
                          <TableCell>{applicant.phoneNumber}</TableCell>
                          <TableCell>{formatYyyyMmDd(applicant.appliedDate)}</TableCell>
                          <TableCell>{applicant.contractStatus === 'CONTRACT' ? 'Y' : 'N'}</TableCell>
                          <TableCell>
                            <TextField
                              size='small'
                              value={applicant.note ?? ''}
                              onChange={e => handleApplicantNotesUpdate(applicant.id, e.target.value)}
                              sx={{ width: 100 }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Stack direction='row' justifyContent='center' sx={{ mt: 3 }}>
                  <Pagination
                    count={Math.ceil(filteredApplicants.length / 20)}
                    page={applicantPage}
                    onChange={(event, value) => setApplicantPage(value)}
                    color='primary'
                    variant='outlined'
                    showFirstButton
                    showLastButton
                  />
                </Stack>
              </>
            )}
          </TabPanel>
        </MainCard>
      </form>
    </Box>
  );
}

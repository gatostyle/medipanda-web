import { setUrlParams } from '@/lib/url';
import { useSearchParamsOrDefault } from '@/lib/useSearchParamsOrDefault';
import { UploadFile } from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Pagination,
  PaginationItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import { useFormik } from 'formik';
import {
  confirmPrescription,
  DateString,
  DateTimeString,
  getUserMembers,
  MemberResponse,
  PrescriptionResponse,
  searchPrescriptions,
  uploadEdiZip,
} from '@/backend';
import MpDatePicker from '@/medipanda/components/MpDatePicker';
import MpFormikDatePicker from '@/medipanda/components/MpFormikDatePicker';
import { SearchFilterActions, SearchFilterBar, SearchFilterItem } from '@/medipanda/components/SearchFilterBar';
import { useMpErrorDialog } from '@/medipanda/hooks/useMpErrorDialog';
import { useMpInfoDialog } from '@/medipanda/hooks/useMpInfoDialog';
import { formatYyyyMm, formatYyyyMmDd, SafeDate } from '@/medipanda/utils/dateFormat';
import { Sequenced, withSequence } from '@/medipanda/utils/withSequence';
import { SearchNormal1 } from 'iconsax-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';

export default function MpAdminPrescriptionReceptionList() {
  const navigate = useNavigate();

  const initialSearchParams = {
    searchType: '' as 'companyName' | 'userId' | 'dealerName' | 'dealerId' | '',
    searchKeyword: '',
    startAt: '',
    endAt: '',
    status: '' as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | '',
    page: '1',
  };

  const {
    searchType,
    searchKeyword,
    startAt: paramStartAt,
    endAt: paramEndAt,
    status,
    page: paramPage,
  } = useSearchParamsOrDefault(initialSearchParams);
  const startAt = useMemo(() => SafeDate(paramStartAt) ?? null, [paramStartAt]);
  const endAt = useMemo(() => SafeDate(paramEndAt) ?? null, [paramEndAt]);
  const page = Number(paramPage);
  const pageSize = 20;

  const [loading, setLoading] = useState(false);
  const [contents, setContents] = useState<Sequenced<PrescriptionResponse>[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const infoDialog = useMpInfoDialog();
  const errorDialog = useMpErrorDialog();

  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [memberSearchDialogOpen, setMemberSearchDialogOpen] = useState(false);
  const [memberSearchDialogResult, setMemberSearchDialogResult] = useState<MemberResponse[]>([]);

  const formik = useFormik({
    initialValues: {
      ...initialSearchParams,
      startAt: null as Date | null,
      endAt: null as Date | null,
      page: null,
    },
    onSubmit: values => {
      const url = setUrlParams(
        {
          ...values,
          startAt: values.startAt !== null ? formatYyyyMmDd(values.startAt) : undefined,
          endAt: values.endAt !== null ? formatYyyyMmDd(values.endAt) : undefined,
          page: 1,
        },
        initialSearchParams,
      );

      navigate(url);
    },
    onReset: () => {
      navigate('');
    },
  });

  const fetchContents = async () => {
    if (searchType === '' && searchKeyword !== '') {
      alert('검색유형을 선택해주세요.');
      return;
    }

    if (searchType === 'dealerId' && searchKeyword !== '' && Number.isNaN(Number(searchKeyword))) {
      alert('딜러번호는 숫자만 입력할 수 있습니다.');
      return;
    }

    setLoading(true);
    try {
      const response = await searchPrescriptions({
        status: status !== '' ? status : undefined,
        companyName: searchType === 'companyName' && searchKeyword !== '' ? searchKeyword : undefined,
        userId: searchType === 'userId' && searchKeyword !== '' ? searchKeyword : undefined,
        dealerName: searchType === 'dealerName' && searchKeyword !== '' ? searchKeyword : undefined,
        dealerId: searchType === 'dealerId' && searchKeyword !== '' ? Number(searchKeyword) : undefined,
        startAt: startAt ? new DateTimeString(startAt) : undefined,
        endAt: endAt ? new DateTimeString(endAt) : undefined,
        page: page - 1,
        size: pageSize,
      });

      setContents(withSequence(response).content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch prescription reception list:', error);
      errorDialog.showError('처방접수 목록을 불러오는 중 오류가 발생했습니다.');
      setContents([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContents();
  }, [searchType, searchKeyword, startAt, endAt, status, page]);

  const table = useReactTable({
    data: contents,
    columns: [
      {
        header: 'No',
        cell: ({ row }) => row.original.sequence,
        size: 60,
      },
      {
        header: '딜러번호',
        cell: ({ row }) => row.original.dealerId,
        size: 100,
      },
      {
        header: '아이디',
        cell: ({ row }) => row.original.userId,
        size: 120,
      },
      {
        header: '회사명',
        cell: ({ row }) => row.original.companyName,
        size: 150,
      },
      {
        header: '딜러명',
        cell: ({ row }) => row.original.dealerName,
        size: 100,
      },
      {
        header: '처방월',
        cell: ({ row }) => formatYyyyMm(row.original.prescriptionMonth),
        size: 100,
      },
      {
        header: '정산월',
        cell: ({ row }) => formatYyyyMm(row.original.settlementMonth),
        size: 100,
      },
      {
        header: '접수신청일',
        cell: ({ row }) => formatYyyyMmDd(row.original.submittedAt),
        size: 120,
      },
      {
        header: '접수파일',
        cell: ({ row }) => (
          <Button
            variant='contained'
            color='success'
            size='small'
            href={`/v1/prescriptions/partners/${row.original.id}/edi-files/download`}
            target='_blank'
          >
            다운로드
          </Button>
        ),
        size: 120,
      },
      {
        header: '접수상태',
        cell: ({ row }) => {
          const status = row.original.status;

          const labels = {
            PENDING: '접수대기',
            IN_PROGRESS: '처리중',
            COMPLETED: '입력완료',
          };

          return <Chip label={labels[status]} size='small' sx={{ backgroundColor: '#4caf50', color: 'white' }} />;
        },
        size: 100,
      },
      {
        header: '관리자확인',
        cell: ({ row }) =>
          row.original.status === 'PENDING' ? (
            <Button variant='contained' color='success' size='small' onClick={() => handleConfirm(row.original.id)}>
              접수확인
            </Button>
          ) : (
            <Typography variant='body2'>{row.original.checkedAt ? formatYyyyMmDd(row.original.checkedAt) : '-'}</Typography>
          ),
        size: 120,
      },
    ],
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handleConfirm = async (id: number) => {
    try {
      await confirmPrescription(id);
      infoDialog.showInfo('접수 확인되었습니다.');
      fetchContents();
    } catch (error) {
      console.error('Failed to confirm reception:', error);
      errorDialog.showError('접수 확인 중 오류가 발생했습니다.');
    }
  };

  const handleEdiRegister = async () => {
    ediFormik.resetForm();
    setRegisterDialogOpen(true);
  };

  const ediFormik = useFormik({
    initialValues: {
      prescriptionMonth: null as Date | null,
      settlementMonth: null as Date | null,
      partnerUser: null as MemberResponse | null,
      file: null as File | null,
    },
    onSubmit: async values => {
      if (values.prescriptionMonth === null) {
        alert('처방월을 선택해주세요.');
        return;
      }

      if (values.settlementMonth === null) {
        alert('정산월을 선택해주세요.');
        return;
      }

      if (values.partnerUser === null) {
        alert('사용자를 선택해주세요.');
        return;
      }

      if (values.file === null) {
        alert('파일을 선택해주세요.');
        return;
      }

      try {
        const response = await uploadEdiZip({
          prescriptionMonth: new DateString(values.prescriptionMonth).toString(),
          settlementMonth: new DateString(values.settlementMonth).toString(),
          partnerUserId: values.partnerUser.userId,
          file: values.file,
        });

        if (response.errors && response.errors.length > 0) {
          const error = response.errors[0];

          switch (error.error) {
            case 'INVALID_EXTENSION':
              alert('첨부하신 파일중에 jpg, jpeg, png, pdf파일이 아닌 형식이 있어요. 확인해주세요.');
              break;
            case 'INVALID_FILENAME_FORMAT':
              alert('첨부하신 파일중에 딜러명_거래처명_처방월 (홍길동_메디판다_202504)으로 입력하지 않은 파일명이 있어요. 확인해주세요.');
              break;
            case 'DEALER_NOT_FOUND':
            case 'PARTNER_NOT_FOUND':
            case 'DRUG_COMPANY_NOT_FOUND':
              alert(`파일중 거래선으로 등록되지 않은 거래처이오니 운영자에 필터링 문의해주세요.`);
              break;
            case 'INVALID_MONTH_FORMAT':
              alert(`EDI 등록 중 오류가 발생했습니다.\n${error.error}(${error.fileName}): ${error.message}\n`);
              break;
            case 'DUPLICATE_DEALER_PARTNER_DRUG_COMPANY':
              alert(`EDI 등록 중 오류가 발생했습니다.\n${error.error}(${error.fileName}): ${error.message}\n`);
              break;
            case 'DRUG_COMPANY_MISMATCH':
              alert(`EDI 등록 중 오류가 발생했습니다.\n${error.error}(${error.fileName}): ${error.message}\n`);
              break;
          }

          return;
        }

        infoDialog.showInfo('EDI를 업로드했습니다.');
        setRegisterDialogOpen(false);
        await formik.submitForm();
      } catch (error) {
        console.error('Failed to upload rate table:', error);
        errorDialog.showError('EDI 업로드 중 오류가 발생했습니다.');
      }
    },
  });

  const memberSearchFormik = useFormik({
    initialValues: {
      searchKeyword: '',
      pageIndex: 0,
    },
    onSubmit: async values => {
      const response = await getUserMembers({
        name: values.searchKeyword !== '' ? values.searchKeyword : undefined,
        page: values.pageIndex,
        contractStatus: 'CONTRACT',
      });
      setMemberSearchDialogResult(response.content);
    },
  });

  const handleMemberSearch = async () => {
    await memberSearchFormik.setFieldValue('searchKeyword', '');
    await memberSearchFormik.submitForm();
    setMemberSearchDialogOpen(true);
  };

  const handleMemberSelect = (member: MemberResponse) => {
    ediFormik.setFieldValue('partnerUser', member);

    setMemberSearchDialogOpen(false);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: useCallback((acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        if (!acceptedFiles[0].name.endsWith('.zip')) {
          alert('.zip 파일만 업로드할 수 있습니다.');
          return;
        }

        ediFormik.setFieldValue('file', acceptedFiles[0]);
      }
    }, []),
  });

  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant='h4' gutterBottom>
            처방접수
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <MainCard content={false}>
            <Box sx={{ p: 3 }}>
              <form onSubmit={formik.handleSubmit}>
                <SearchFilterBar>
                  <SearchFilterItem minWidth={140}>
                    <FormControl fullWidth size='small'>
                      <InputLabel>접수상태</InputLabel>
                      <Select name='status' value={formik.values.status} onChange={formik.handleChange}>
                        <MenuItem value={'PENDING'}>접수대기</MenuItem>
                        <MenuItem value={'IN_PROGRESS'}>처리중</MenuItem>
                        <MenuItem value={'COMPLETED'}>입력완료</MenuItem>
                      </Select>
                    </FormControl>
                  </SearchFilterItem>
                  <SearchFilterItem minWidth={140}>
                    <FormControl fullWidth size='small'>
                      <InputLabel>검색유형</InputLabel>
                      <Select name='searchType' value={formik.values.searchType} onChange={formik.handleChange}>
                        <MenuItem value={'companyName'}>회사명</MenuItem>
                        <MenuItem value={'userId'}>아이디</MenuItem>
                        <MenuItem value={'dealerName'}>딜러명</MenuItem>
                        <MenuItem value={'dealerId'}>딜러번호</MenuItem>
                      </Select>
                    </FormControl>
                  </SearchFilterItem>
                  <SearchFilterItem minWidth={140}>
                    <MpFormikDatePicker name='startAt' label='시작일' formik={formik} />
                  </SearchFilterItem>
                  <SearchFilterItem minWidth={140}>
                    <MpFormikDatePicker name='endAt' label='종료일' formik={formik} />
                  </SearchFilterItem>
                  <SearchFilterItem flexGrow={1} minWidth={200}>
                    <TextField
                      name='searchKeyword'
                      size='small'
                      placeholder='검색어를 입력하세요'
                      fullWidth
                      value={formik.values.searchKeyword}
                      onChange={formik.handleChange}
                    />
                  </SearchFilterItem>
                  <SearchFilterActions>
                    <Button variant='contained' size='small' type='submit'>
                      검색
                    </Button>
                    <Button variant='outlined' size='small' onClick={() => formik.resetForm()}>
                      초기화
                    </Button>
                  </SearchFilterActions>
                </SearchFilterBar>
              </form>
            </Box>
          </MainCard>
        </Grid>

        <Grid item xs={12}>
          <MainCard content={false}>
            <Box sx={{ p: 2 }}>
              <Stack direction='row' justifyContent='space-between' alignItems='center' mb={2}>
                <Stack direction='row' spacing={2}>
                  <Typography variant='subtitle1'>검색결과: {totalElements.toLocaleString()} 건</Typography>
                </Stack>
                <Stack direction='row' spacing={1}>
                  <Button variant='contained' color='success' size='small' onClick={handleEdiRegister}>
                    EDI 등록
                  </Button>
                </Stack>
              </Stack>

              <ScrollX>
                <TableContainer>
                  <Table size='small'>
                    <TableHead>
                      {table.getHeaderGroups().map(headerGroup => (
                        <TableRow key={headerGroup.id}>
                          {headerGroup.headers.map(header => (
                            <TableCell key={header.id} style={{ width: header.getSize() }}>
                              {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableHead>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={table.getAllColumns().length} align='center' sx={{ py: 3 }}>
                            <Typography variant='body2' color='text.secondary'>
                              데이터를 로드하는 중입니다.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : table.getRowModel().rows.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={table.getAllColumns().length} align='center' sx={{ py: 3 }}>
                            <Typography variant='body2' color='text.secondary'>
                              검색 결과가 없습니다.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        table.getRowModel().rows.map(row => (
                          <TableRow key={row.id}>
                            {row.getVisibleCells().map(cell => (
                              <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                            ))}
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </ScrollX>

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
            </Box>
          </MainCard>
        </Grid>
      </Grid>

      <Dialog open={registerDialogOpen} onClose={() => setRegisterDialogOpen(false)} maxWidth='md' fullWidth>
        <DialogTitle sx={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>EDI 등록</DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 3 }}>
          <Stack direction='row' spacing={2} justifyContent='center' alignItems='center' sx={{ mb: 3 }}>
            <Typography variant='body1'>처방월 선택</Typography>
            <Box>
              <MpDatePicker
                value={ediFormik.values.prescriptionMonth}
                onChange={value => ediFormik.setFieldValue('prescriptionMonth', value)}
                placeholder='월 선택'
                format='yyyy-MM'
                views={['year', 'month']}
              />
            </Box>
            <Typography variant='body1'>정산월 선택</Typography>
            <Box>
              <MpDatePicker
                value={ediFormik.values.settlementMonth}
                onChange={value => ediFormik.setFieldValue('settlementMonth', value)}
                placeholder='월 선택'
                format='yyyy-MM'
                views={['year', 'month']}
              />
            </Box>
            <Box>
              <TextField
                placeholder='사용자명'
                value={ediFormik.values.partnerUser?.name ?? ''}
                required
                disabled
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton onClick={handleMemberSearch} edge='end'>
                        <SearchNormal1 size={20} />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Stack>
          <Box
            {...getRootProps()}
            sx={{
              border: '2px dashed #e0e0e0',
              borderRadius: 1,
              p: 4,
              textAlign: 'center',
              cursor: 'pointer',
              bgcolor: isDragActive ? 'action.hover' : 'transparent',
              '&:hover': {
                borderColor: 'primary.main',
              },
            }}
          >
            <input {...getInputProps()} />
            <UploadFile sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant='h6' color='text.secondary'>
              여기에 파일을 드래그하거나 클릭하여 업로드하세요.
            </Typography>
            {ediFormik.values.file && (
              <Typography variant='body2' sx={{ mt: 1 }}>
                선택된 파일: {ediFormik.values.file.name}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            variant='outlined'
            onClick={() => {
              setRegisterDialogOpen(false);
              ediFormik.setFieldValue('file', null);
            }}
            sx={{ minWidth: 100 }}
          >
            취소
          </Button>
          <Button
            variant='contained'
            color='success'
            onClick={ediFormik.submitForm}
            disabled={
              ediFormik.values.prescriptionMonth === null ||
              ediFormik.values.settlementMonth === null ||
              ediFormik.values.file === null ||
              ediFormik.isSubmitting
            }
            sx={{ minWidth: 100 }}
          >
            업로드
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={memberSearchDialogOpen} onClose={() => setMemberSearchDialogOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>사용자명 조회</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Stack direction='row' spacing={1} component='form' noValidate onSubmit={memberSearchFormik.handleSubmit}>
              <TextField
                fullWidth
                size='small'
                placeholder='검색어를 입력하세요'
                name='searchKeyword'
                onChange={memberSearchFormik.handleChange}
              />
              <Button variant='contained' size='small' type='submit'>
                검색
              </Button>
            </Stack>

            <TableContainer>
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell>사용자명</TableCell>
                    <TableCell>회사명</TableCell>
                    <TableCell align='center' width={100}>
                      선택
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {memberSearchDialogResult.map(member => (
                    <TableRow key={member.id}>
                      <TableCell>{member.name}</TableCell>
                      <TableCell>{member.companyName}</TableCell>
                      <TableCell align='center'>
                        <Button variant='contained' size='small' onClick={() => handleMemberSelect(member)}>
                          선택
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Stack direction='row' justifyContent='center'>
              <Button onClick={() => setMemberSearchDialogOpen(false)}>취소</Button>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}

import { setUrlParams } from '@/lib/url';
import { useSearchParamsOrDefault } from '@/lib/useSearchParamsOrDefault';
import { MpMemberSearchDialog } from '@/medipanda/components/MpMemberSearchDialog';
import { AttachFile as AttachFileIcon, UploadFile } from '@mui/icons-material';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  Link,
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
import { deletePartner, getPartners, MemberResponse, PartnerResponse, uploadPartnersExcel } from '@/backend';
import { SearchFilterActions, SearchFilterBar, SearchFilterItem } from '@/medipanda/components/SearchFilterBar';
import { useMpDeleteDialog } from '@/medipanda/hooks/useMpDeleteDialog';
import { useMpErrorDialog } from '@/medipanda/hooks/useMpErrorDialog';
import { useMpInfoDialog } from '@/medipanda/hooks/useMpInfoDialog';
import { Sequenced, withSequence } from '@/medipanda/utils/withSequence';
import { SearchNormal1 } from 'iconsax-react';
import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';

export default function MpAdminPartnerList() {
  const navigate = useNavigate();

  const initialSearchParams = {
    searchType: '' as 'companyName' | 'institutionName' | 'institutionCode' | '',
    searchKeyword: '',
    contractType: '' as 'CONTRACT' | 'NON_CONTRACT' | '',
    page: '1',
  };

  const { searchType, searchKeyword, contractType, page: paramPage } = useSearchParamsOrDefault(initialSearchParams);
  const page = Number(paramPage);
  const pageSize = 20;

  const [contents, setContents] = useState<Sequenced<PartnerResponse>[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadMember, setUploadMember] = useState<MemberResponse | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const infoDialog = useMpInfoDialog();
  const errorDialog = useMpErrorDialog();
  const deleteDialog = useMpDeleteDialog();

  const formik = useFormik({
    initialValues: {
      ...initialSearchParams,
      page: null,
    },
    onSubmit: values => {
      const url = setUrlParams(
        {
          ...values,
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
    setLoading(true);
    if (searchType === '' && searchKeyword !== '') {
      alert('검색유형을 선택해주세요.');
      return;
    }

    try {
      const response = await getPartners({
        companyName: searchType === 'companyName' && searchKeyword !== '' ? searchKeyword : undefined,
        institutionName: searchType === 'institutionName' && searchKeyword !== '' ? searchKeyword : undefined,
        institutionCode: searchType === 'institutionCode' && searchKeyword !== '' ? searchKeyword : undefined,
        contractType: contractType !== '' ? contractType : undefined,
        page: page - 1,
        size: pageSize,
      });

      setContents(withSequence(response).content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch business partner list:', error);
      errorDialog.showError('거래선 목록을 불러오는 중 오류가 발생했습니다.');
      setContents([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    formik.setValues({
      searchType,
      searchKeyword,
      contractType,
      page: null,
    });
    fetchContents();
  }, [searchType, searchKeyword, contractType, page]);

  const table = useReactTable({
    data: contents,
    columns: [
      {
        id: 'select',
        header: () => (
          <Checkbox
            checked={selectedIds.length === contents.length && contents.length > 0}
            onChange={e => {
              if (e.target.checked) {
                setSelectedIds(contents.map(item => item.id));
              } else {
                setSelectedIds([]);
              }
            }}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={selectedIds.includes(row.original.id)}
            onChange={e => {
              if (e.target.checked) {
                setSelectedIds(prev => [...prev, row.original.id]);
              } else {
                setSelectedIds(prev => prev.filter(id => id !== row.original.id));
              }
            }}
          />
        ),
        size: 50,
      },
      {
        header: 'No',
        cell: ({ row }) => row.original.sequence,
        size: 60,
      },
      {
        header: '제약사명',
        cell: ({ row }) => row.original.drugCompanyName,
        size: 150,
      },
      {
        header: '회사명',
        cell: ({ row }) => row.original.companyName,
        size: 120,
      },
      {
        header: '계약유형',
        cell: ({ row }) => (row.original.contractType === 'CONTRACT' ? '계약' : '미계약'),
        size: 80,
      },
      {
        header: '거래처코드',
        cell: ({ row }) => row.original.institutionCode,
        size: 100,
      },
      {
        header: '거래처명',
        cell: ({ row }) => (
          <Link component={RouterLink} to={`/admin/partners/${row.original.id}/edit`} style={{ textDecoration: 'none', color: '#1976d2' }}>
            {row.original.institutionName}
          </Link>
        ),
        size: 150,
      },
      {
        header: '사업자등록번호',
        cell: ({ row }) => row.original.businessNumber,
        size: 130,
      },
      {
        header: '진료과',
        cell: ({ row }) => row.original.medicalDepartment ?? '-',
        size: 100,
      },
      {
        header: '문전약국',
        cell: ({ row }) => (row.original.hasPharmacy ? 'Y' : 'N'),
        size: 80,
      },
    ],
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: useCallback((acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        setUploadFile(acceptedFiles[0]);
      }
    }, []),
    accept: { 'application/vnd.ms-excel': ['.xls', '.xlsx'] },
  });

  const handleDelete = () => {
    if (selectedIds.length === 0) {
      infoDialog.showInfo('삭제할 거래선을 선택해주세요.');
      return;
    }

    const count = selectedIds.length;
    const message = count === 1 ? `선택한 거래선을 삭제하시겠습니까?` : `${count}건이 선택되었습니다. 삭제하시겠습니까?`;

    deleteDialog.open({
      message,
      onConfirm: async () => {
        try {
          await Promise.all(selectedIds.map(id => deletePartner(id)));
          infoDialog.showInfo('삭제가 완료되었습니다.');
          setSelectedIds([]);
          fetchContents();
        } catch (error) {
          console.error('Failed to delete business partners:', error);
          errorDialog.showError('거래선 삭제 중 오류가 발생했습니다.');
        }
      },
    });
  };

  const handleFileUpload = async () => {
    if (uploadMember === null) {
      alert('사용자명을 선택해주세요.');
      return;
    }

    if (uploadFile === null) {
      infoDialog.showInfo('업로드할 파일을 선택해주세요.');
      return;
    }

    try {
      await uploadPartnersExcel(uploadMember.userId, { file: uploadFile });
      infoDialog.showInfo('파일 업로드가 완료되었습니다.');
      setUploadDialogOpen(false);
      setUploadFile(null);
      fetchContents();
    } catch (error) {
      console.error('Failed to upload file:', error);
      errorDialog.showError('파일 업로드 중 오류가 발생했습니다.');
    }
  };

  const [memberSearchDialogOpen, setMemberSearchDialogOpen] = useState(false);

  const handleMemberSelect = (member: MemberResponse) => {
    setUploadMember(member);
    setMemberSearchDialogOpen(false);
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant='h4' gutterBottom>
          거래선관리
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <MainCard content={false}>
          <Box sx={{ p: 3 }}>
            <form onSubmit={formik.handleSubmit}>
              <SearchFilterBar>
                <SearchFilterItem minWidth={140}>
                  <FormControl fullWidth size='small'>
                    <InputLabel>계약유형</InputLabel>
                    <Select name='contractType' value={formik.values.contractType} onChange={formik.handleChange}>
                      <MenuItem value={'CONTRACT'}>법인</MenuItem>
                      <MenuItem value={'NON_CONTRACT'}>개인</MenuItem>
                    </Select>
                  </FormControl>
                </SearchFilterItem>
                <SearchFilterItem minWidth={140}>
                  <FormControl fullWidth size='small'>
                    <InputLabel>검색유형</InputLabel>
                    <Select name='searchType' value={formik.values.searchType} onChange={formik.handleChange}>
                      <MenuItem value={'companyName'}>회사명</MenuItem>
                      <MenuItem value={'institutionName'}>거래처명</MenuItem>
                      <MenuItem value={'institutionCode'}>거래처코드</MenuItem>
                    </Select>
                  </FormControl>
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
                <Button variant='contained' color='primary' size='small' onClick={() => setUploadDialogOpen(true)}>
                  파일 업로드
                </Button>
                <Button variant='contained' color='error' size='small' disabled={selectedIds.length === 0} onClick={handleDelete}>
                  삭제
                </Button>
                <Button variant='contained' color='success' size='small' component={RouterLink} to='/admin/partners/new'>
                  등록
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

      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontSize: '1.25rem', fontWeight: 600 }}>거래선 업로드</DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 3 }}>
          <Stack direction='row' alignItems='center' sx={{ mb: 3 }}>
            <Box>
              <TextField
                placeholder='사용자명'
                value={uploadMember?.name ?? ''}
                required
                disabled
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton onClick={() => setMemberSearchDialogOpen(true)} edge='end'>
                        <SearchNormal1 size={20} />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Button
              href={import.meta.env.VITE_APP_URL_FILE_BUSINESS_PARTNER}
              target='_blank'
              variant='contained'
              color='success'
              size='small'
              startIcon={<AttachFileIcon />}
              sx={{
                marginLeft: 'auto',
              }}
            >
              양식 다운로드
            </Button>
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
            {uploadFile && (
              <Typography variant='body2' sx={{ mt: 1 }}>
                선택된 파일: {uploadFile.name}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            variant='outlined'
            onClick={() => {
              setUploadDialogOpen(false);
              setUploadFile(null);
            }}
            sx={{ minWidth: 100 }}
          >
            취소
          </Button>
          <Button variant='contained' color='success' onClick={handleFileUpload} disabled={!uploadFile} sx={{ minWidth: 100 }}>
            업데이트
          </Button>
        </DialogActions>
      </Dialog>

      <MpMemberSearchDialog
        open={memberSearchDialogOpen}
        onClose={() => setMemberSearchDialogOpen(false)}
        onMemberSelect={handleMemberSelect}
      />
    </Grid>
  );
}

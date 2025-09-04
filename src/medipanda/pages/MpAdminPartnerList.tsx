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
  InputLabel,
  MenuItem,
  Pagination,
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
import { NotImplementedError } from '@/medipanda/api-definitions/NotImplementedError';
import { deletePartner, getPartners, PartnerResponse, uploadPartnersExcel } from '@/medipanda/backend';
import { SearchFilterActions, SearchFilterBar, SearchFilterItem } from '@/medipanda/components/SearchFilterBar';
import { useMpDeleteDialog } from '@/medipanda/hooks/useMpDeleteDialog';
import { useMpErrorDialog } from '@/medipanda/hooks/useMpErrorDialog';
import { useMpInfoDialog } from '@/medipanda/hooks/useMpInfoDialog';
import { useMpNotImplementedDialog } from '@/medipanda/hooks/useMpNotImplementedDialog';
import { mockString } from '@/medipanda/mockup';
import { backendNotImplemented } from '@/medipanda/utils/backendNotImplemented';
import { Sequenced, withSequence } from '@/medipanda/utils/withSequence';
import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Link } from 'react-router-dom';

export default function MpAdminPartnerList() {
  const [data, setData] = useState<Sequenced<PartnerResponse>[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const deleteDialog = useMpDeleteDialog();
  const notImplementedDialog = useMpNotImplementedDialog();
  const errorDialog = useMpErrorDialog();
  const infoDialog = useMpInfoDialog();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setUploadFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/vnd.ms-excel': ['.xls', '.xlsx'] } });

  const formik = useFormik({
    initialValues: {
      searchType: 'company' as 'company' | 'partner' | 'pharmaceutical' | 'member',
      searchKeyword: '',
      contractType: '' as 'CONTRACT' | 'NON_CONTRACT' | '',
      pageIndex: 0,
      pageSize: 20,
    },
    onSubmit: async () => {
      if (formik.values.pageIndex !== 0) {
        await formik.setFieldValue('pageIndex', 0);
      } else {
        await fetchData();
      }
    },
  });

  const table = useReactTable({
    data,
    columns: [
      {
        id: 'select',
        header: () => (
          <Checkbox
            checked={selectedItems.length === data.length && data.length > 0}
            onChange={e => {
              if (e.target.checked) {
                setSelectedItems(data.map(item => item.id));
              } else {
                setSelectedItems([]);
              }
            }}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={selectedItems.includes(row.original.id)}
            onChange={e => {
              if (e.target.checked) {
                setSelectedItems(prev => [...prev, row.original.id]);
              } else {
                setSelectedItems(prev => prev.filter(id => id !== row.original.id));
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
          <Link to={`/admin/partners/${row.original.id}/edit`} style={{ textDecoration: 'none', color: '#1976d2' }}>
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
    state: {
      pagination: {
        pageIndex: formik.values.pageIndex,
        pageSize: formik.values.pageSize,
      },
    },
    pageCount: totalPages,
    manualPagination: true,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      backendNotImplemented();
      const response = await getPartners({
        page: formik.values.pageIndex,
        size: formik.values.pageSize,
        contractType: formik.values.contractType !== '' ? formik.values.contractType : undefined,
        companyName: formik.values.searchType === 'company' ? formik.values.searchKeyword : undefined,
        // partnerName: formik.values.searchType === 'partner' ? formik.values.searchKeyword : undefined,
        // drugCompany: formik.values.searchType === 'pharmaceutical' ? formik.values.searchKeyword : undefined,
        // memberName: formik.values.searchType === 'member' ? formik.values.searchKeyword : undefined
      });

      setData(withSequence(response).content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch business partner list:', error);
      errorDialog.showError('거래선 목록을 불러오는 중 오류가 발생했습니다.');
      setData([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [formik.values.pageIndex, formik.values.pageSize]);

  const handleReset = () => {
    formik.resetForm();
  };

  const handleDelete = () => {
    if (selectedItems.length === 0) {
      infoDialog.showInfo('삭제할 거래선을 선택해주세요.');
      return;
    }

    const count = selectedItems.length;
    const message = count === 1 ? `선택한 거래선을 삭제하시겠습니까?` : `${count}건이 선택되었습니다. 삭제하시겠습니까?`;

    deleteDialog.open({
      message,
      onConfirm: async () => {
        try {
          await Promise.all(selectedItems.map(id => deletePartner(id)));
          infoDialog.showInfo('삭제가 완료되었습니다.');
          setSelectedItems([]);
          fetchData();
        } catch (error) {
          if (error instanceof NotImplementedError) {
            notImplementedDialog.open(error.message);
          } else {
            console.error('Failed to delete business partners:', error);
            errorDialog.showError('거래선 삭제 중 오류가 발생했습니다.');
          }
        }
      },
    });
  };

  const handleFileUpload = async () => {
    if (!uploadFile) {
      infoDialog.showInfo('업로드할 파일을 선택해주세요.');
      return;
    }

    try {
      await uploadPartnersExcel(mockString(), { file: uploadFile });
      infoDialog.showInfo('파일 업로드가 완료되었습니다.');
      setUploadDialogOpen(false);
      setUploadFile(null);
      fetchData();
    } catch (error) {
      if (error instanceof NotImplementedError) {
        notImplementedDialog.open(error.message);
      } else {
        console.error('Failed to upload file:', error);
        errorDialog.showError('파일 업로드 중 오류가 발생했습니다.');
      }
    }
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
                      <MenuItem value={'company'}>회사명</MenuItem>
                      <MenuItem value={'partner'}>거래처명</MenuItem>
                      <MenuItem value={'pharmaceutical'}>제약사명</MenuItem>
                      <MenuItem value={'member'}>회원명</MenuItem>
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
                  <Button variant='outlined' size='small' onClick={handleReset}>
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
                <Button variant='contained' color='error' size='small' disabled={selectedItems.length === 0} onClick={handleDelete}>
                  삭제
                </Button>
                <Button variant='contained' color='success' size='small' component={Link} to='/admin/partners/new'>
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
                page={formik.values.pageIndex + 1}
                onChange={(_, value) => formik.setFieldValue('pageIndex', value - 1)}
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
          <Box sx={{ textAlign: 'right', mb: 2 }}>
            <Button
              href={import.meta.env.VITE_APP_URL_FILE_BUSINESS_PARTNER}
              target='_blank'
              variant='contained'
              color='success'
              size='small'
              startIcon={<AttachFileIcon />}
            >
              양식 다운로드
            </Button>
          </Box>
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
    </Grid>
  );
}

import { normalizeBusinessNumber } from '@/lib/form';
import { setUrlParams } from '@/lib/url';
import { useSearchParamsOrDefault } from '@/lib/useSearchParamsOrDefault';
import { MpPartnerUploadModal } from '@/medipanda/components/MpPartnerUploadModal';
import { useMpModal } from '@/medipanda/hooks/useMpModal';
import {
  Button,
  Card,
  Checkbox,
  FormControl,
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
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useFormik } from 'formik';
import { ContractStatus, ContractStatusLabel, deletePartner, getPartners, type PartnerResponse } from '@/backend';
import { SearchFilterActions, SearchFilterBar, SearchFilterItem } from '@/medipanda/components/SearchFilterBar';
import { useMpDeleteDialog } from '@/medipanda/hooks/useMpDeleteDialog';
import { type Sequenced, withSequence } from '@/medipanda/utils/withSequence';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';

export default function MpAdminPartnerList() {
  const navigate = useNavigate();

  const initialSearchParams = {
    searchType: '' as 'companyName' | 'institutionName' | 'institutionCode' | '',
    searchKeyword: '',
    contractType: '' as keyof typeof ContractStatus | '',
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

  const [partnerUploadModalOpen, setPartnerUploadModalOpen] = useState(false);

  const deleteDialog = useMpDeleteDialog();
  const { alert, alertError } = useMpModal();
  const { enqueueSnackbar } = useSnackbar();

  const formik = useFormik({
    initialValues: {
      ...initialSearchParams,
      page: null,
    },
    onSubmit: async values => {
      if (values.searchType === '' && values.searchKeyword !== '') {
        await alert('검색유형을 선택하세요.');
        return;
      }

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
      await alertError('거래선 목록을 불러오는 중 오류가 발생했습니다.');
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
        cell: ({ row }) => ContractStatusLabel[row.original.contractType],
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
          <Link component={RouterLink} to={`/admin/partners/${row.original.id}/edit`}>
            {row.original.institutionName}
          </Link>
        ),
        size: 150,
      },
      {
        header: '사업자등록번호',
        cell: ({ row }) => normalizeBusinessNumber(row.original.businessNumber),
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
  });

  const handleDelete = async () => {
    if (selectedIds.length === 0) {
      await alert('삭제할 거래선을 선택하세요.');
      return;
    }

    const count = selectedIds.length;
    const message = count === 1 ? `선택한 거래선을 삭제하시겠습니까?` : `${count}건이 선택되었습니다. 삭제하시겠습니까?`;

    deleteDialog.open({
      message,
      onConfirm: async () => {
        try {
          await Promise.all(selectedIds.map(id => deletePartner(id)));
          enqueueSnackbar('삭제가 완료되었습니다.', { variant: 'success' });
          setSelectedIds([]);
          fetchContents();
        } catch (error) {
          console.error('Failed to delete business partners:', error);
          await alertError('거래선 삭제 중 오류가 발생했습니다.');
        }
      },
    });
  };

  const handlePartnerUploadSuccess = () => {
    setPartnerUploadModalOpen(false);
    fetchContents();
  };

  return (
    <Stack sx={{ gap: 3 }}>
      <Typography variant='h4'>거래선관리</Typography>

      <Card sx={{ padding: 3 }}>
        <SearchFilterBar component='form' onSubmit={formik.handleSubmit}>
          <SearchFilterItem minWidth={140}>
            <FormControl fullWidth size='small'>
              <InputLabel>계약유형</InputLabel>
              <Select name='contractType' value={formik.values.contractType} onChange={formik.handleChange}>
                {Object.keys(ContractStatus).map(contractStatus => (
                  <MenuItem key={contractStatus} value={contractStatus}>
                    {ContractStatusLabel[contractStatus]}
                  </MenuItem>
                ))}
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
      </Card>

      <Card sx={{ padding: 3 }}>
        <Stack direction='row' justifyContent='space-between' alignItems='center' mb={2}>
          <Stack direction='row' spacing={2}>
            <Typography variant='subtitle1'>검색결과: {totalElements.toLocaleString()} 건</Typography>
          </Stack>
          <Stack direction='row' spacing={1}>
            <Button variant='contained' color='success' size='small' onClick={() => setPartnerUploadModalOpen(true)}>
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

        <TableContainer sx={{ overflowX: 'auto' }}>
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
      </Card>

      <MpPartnerUploadModal
        open={partnerUploadModalOpen}
        onClose={() => setPartnerUploadModalOpen(false)}
        onSuccess={handlePartnerUploadSuccess}
      />
    </Stack>
  );
}

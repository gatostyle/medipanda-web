import { normalizeBusinessNumber } from '@/lib/utils/form';
import { setUrlParams } from '@/lib/utils/url';
import { useSearchParamsOrDefault } from '@/lib/hooks/useSearchParamsOrDefault';
import { MpPartnerUploadModal } from '@/components/MpPartnerUploadModal';
import { useMpModal } from '@/hooks/useMpModal';
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
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { deletePartner, getPartners, MemberType, MemberTypeLabel, type PartnerResponse } from '@/backend';
import { SearchFilterActions, MpSearchFilterBar, SearchFilterItem } from '@/components/MpSearchFilterBar';
import { useMpDeleteDialog } from '@/hooks/useMpDeleteDialog';
import { type Sequenced, withSequence } from '@/lib/utils/withSequence';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';
import type { RequiredDeep } from 'type-fest';

export default function MpAdminPartnerList() {
  const navigate = useNavigate();

  const initialSearchParams = {
    searchType: 'companyName' as 'companyName' | 'institutionName' | 'institutionCode' | 'drugCompanyName' | 'memberName' | '',
    searchKeyword: '',
    memberType: '' as keyof typeof MemberType | '',
    page: '1',
  };

  const { searchType, searchKeyword, memberType, page: paramPage } = useSearchParamsOrDefault(initialSearchParams);
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

  const form = useForm({
    defaultValues: {
      ...initialSearchParams,
    },
  });

  const submitHandler: SubmitHandler<RequiredDeep<(typeof form)['control']['_defaultValues']>> = async values => {
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
  };

  const handleReset = () => {
    navigate('');
    form.reset();
  };

  const fetchContents = async () => {
    setLoading(true);

    try {
      const response = await getPartners({
        companyName: searchType === 'companyName' && searchKeyword !== '' ? searchKeyword : undefined,
        institutionName: searchType === 'institutionName' && searchKeyword !== '' ? searchKeyword : undefined,
        institutionCode: searchType === 'institutionCode' && searchKeyword !== '' ? searchKeyword : undefined,
        drugCompanyName: searchType === 'drugCompanyName' && searchKeyword !== '' ? searchKeyword : undefined,
        memberName: searchType === 'memberName' && searchKeyword !== '' ? searchKeyword : undefined,
        memberType: memberType !== '' ? memberType : undefined,
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
    form.setValue('searchType', searchType);
    form.setValue('searchKeyword', searchKeyword);
    form.setValue('memberType', memberType);
    fetchContents();
  }, [searchType, searchKeyword, memberType, page]);

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
        <MpSearchFilterBar component='form' onSubmit={form.handleSubmit(submitHandler)}>
          <SearchFilterItem minWidth={140}>
            <FormControl fullWidth size='small'>
              <InputLabel>계약유형</InputLabel>
              <Controller
                control={form.control}
                name={'memberType'}
                render={({ field }) => (
                  <Select {...field}>
                    {[MemberType.INDIVIDUAL, MemberType.ORGANIZATION].map(memberType => (
                      <MenuItem key={memberType} value={memberType}>
                        {MemberTypeLabel[memberType]}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </FormControl>
          </SearchFilterItem>
          <SearchFilterItem minWidth={140}>
            <FormControl fullWidth size='small'>
              <InputLabel>검색유형</InputLabel>
              <Controller
                control={form.control}
                name='searchType'
                render={({ field }) => (
                  <Select {...field}>
                    <MenuItem value={'companyName'}>회사명</MenuItem>
                    <MenuItem value={'institutionName'}>거래처명</MenuItem>
                    <MenuItem value={'institutionCode'}>거래처코드</MenuItem>
                    <MenuItem value={'drugCompanyName'}>제약사명</MenuItem>
                    <MenuItem value={'memberName'}>회원명</MenuItem>
                  </Select>
                )}
              />
            </FormControl>
          </SearchFilterItem>
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
              <TableRow>
                <TableCell width={50}>
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
                </TableCell>
                <TableCell width={60}>No</TableCell>
                <TableCell width={150}>제약사명</TableCell>
                <TableCell width={120}>회사명</TableCell>
                <TableCell width={80}>계약유형</TableCell>
                <TableCell width={100}>거래처코드</TableCell>
                <TableCell width={150}>거래처명</TableCell>
                <TableCell width={130}>사업자등록번호</TableCell>
                <TableCell width={100}>진료과</TableCell>
                <TableCell width={80}>문전약국</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} align='center' sx={{ py: 3 }}>
                    <Typography variant='body2' color='text.secondary'>
                      데이터를 로드하는 중입니다.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : contents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align='center' sx={{ py: 3 }}>
                    <Typography variant='body2' color='text.secondary'>
                      검색 결과가 없습니다.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                contents.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(item.id)}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedIds(prev => [...prev, item.id]);
                          } else {
                            setSelectedIds(prev => prev.filter(id => id !== item.id));
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>{item.sequence}</TableCell>
                    <TableCell>{item.drugCompanyName}</TableCell>
                    <TableCell>{item.companyName}</TableCell>
                    <TableCell>{MemberTypeLabel[item.memberType]}</TableCell>
                    <TableCell>{item.institutionCode}</TableCell>
                    <TableCell>
                      <Link component={RouterLink} to={`/admin/partners/${item.id}/edit`}>
                        {item.institutionName}
                      </Link>
                    </TableCell>
                    <TableCell>{normalizeBusinessNumber(item.businessNumber)}</TableCell>
                    <TableCell>{item.medicalDepartment ?? '-'}</TableCell>
                    <TableCell>{item.hasPharmacy ? 'Y' : 'N'}</TableCell>
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

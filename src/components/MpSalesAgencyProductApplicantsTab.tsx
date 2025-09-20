import {
  ContractStatus,
  deleteSalesAgencyProductApplicant,
  getDownloadProductApplicantsExcel,
  getProductApplicants,
  type SalesAgencyProductApplicantResponse,
  type SalesAgencyProductDetailsResponse,
  updateApplicantNotes,
} from '@/backend';
import { setUrlParams } from '@/lib/utils/url';
import { useSearchParamsOrDefault } from '@/lib/hooks/useSearchParamsOrDefault';
import { useMpDeleteDialog } from '@/hooks/useMpDeleteDialog';
import { useMpModal } from '@/hooks/useMpModal';
import { formatYyyyMmDd } from '@/lib/utils/dateFormat';
import { type Sequenced, withSequence } from '@/lib/utils/withSequence';
import {
  Box,
  Button,
  Checkbox,
  Pagination,
  PaginationItem,
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
import { DocumentDownload } from 'iconsax-reactjs';
import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import type { RequiredDeep } from 'type-fest';
import { SearchFilterActions, MpSearchFilterBar, SearchFilterItem } from './MpSearchFilterBar';

export function MpSalesAgencyProductApplicantsTab({ detail }: { detail: SalesAgencyProductDetailsResponse }) {
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
                contents.map(item => (
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
                    <TableCell>{formatYyyyMmDd(item.appliedDate)}</TableCell>
                    <TableCell>{item.contractStatus === ContractStatus.CONTRACT ? 'Y' : 'N'}</TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        size='small'
                        placeholder='비고를 입력하세요'
                        value={item.note}
                        onChange={e => {
                          setContents(prev => prev.map(item => (item.userId === item.userId ? { ...item, note: e.target.value } : item)));
                        }}
                        onBlur={e => handleNoteUpdate(item.userId, e.target.value)}
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

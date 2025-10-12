import { type BoardPostResponse, BoardType, getBoards } from '@/backend';
import { InquiryStatusChip } from '@/components/InquiryStatusChip';
import { MedipandaPagination } from '@/custom/components/MedipandaPagination';
import { MedipandaTab, MedipandaTabElse, MedipandaTabs } from '@/custom/components/MedipandaTab';
import { MedipandaTableCell, MedipandaTableRow } from '@/custom/components/MedipandaTable';
import { useSession } from '@/hooks/useSession';
import { useSearchParamsOrDefault } from '@/lib/hooks/useSearchParamsOrDefault';
import { setUrlParams } from '@/lib/utils/url';
import { colors } from '@/themes';
import { DateUtils, DATEFORMAT_YYYY_MM_DD_HH_MM } from '@/lib/utils/dateFormat';
import { type Sequenced, withSequence } from '@/lib/utils/withSequence';
import { Search } from '@mui/icons-material';
import {
  Fab,
  IconButton,
  InputAdornment,
  Link,
  PaginationItem,
  Stack,
  Table,
  TableBody,
  TableHead,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import type { RequiredDeep } from 'type-fest';

export default function InquiryList() {
  const { session } = useSession();

  const navigate = useNavigate();

  const [contents, setContents] = useState<Sequenced<BoardPostResponse>[]>([]);
  const [totalPages, setTotalPages] = useState(0);

  const initialSearchParams = {
    searchType: 'boardTitle' as 'userId' | 'name' | 'nickname' | 'boardTitle' | 'drugCompany' | 'myUserId',
    searchKeyword: '',
    page: '1',
  };

  const { searchType, searchKeyword, page: paramPage } = useSearchParamsOrDefault(initialSearchParams);
  const page = Number(paramPage);
  const pageSize = 10;

  const form = useForm({
    defaultValues: {
      ...initialSearchParams,
    },
  });

  const submitHandler: SubmitHandler<RequiredDeep<(typeof form)['control']['_defaultValues']>> = async values => {
    console.log({ values });
    const url = setUrlParams(
      {
        ...values,
        page: 1,
      },
      initialSearchParams,
    );

    navigate(url);
  };

  const fetchContents = async () => {
    try {
      const response = await getBoards({
        boardType: BoardType.INQUIRY,
        [searchType]: searchKeyword !== '' ? searchKeyword : undefined,
        myUserId: session!.userId,
        filterDeleted: true,
        page: page - 1,
        size: pageSize,
      });

      setContents(withSequence(response).content);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch inquiry list:', error);
      alert('1:1 문의내역 목록을 불러오는 중 오류가 발생했습니다.');
      setContents([]);
      setTotalPages(0);
    }
  };

  useEffect(() => {
    form.setValue('searchType', searchType);
    form.setValue('searchKeyword', searchKeyword);
    fetchContents();
  }, [searchType, searchKeyword, page]);

  return (
    <>
      <Typography variant='headingPc3M' sx={{ color: colors.gray80 }}>
        1:1 문의내역
      </Typography>

      <MedipandaTabs value={0} sx={{ marginTop: '30px' }}>
        <MedipandaTab label='문의내역' />
        <MedipandaTabElse />
      </MedipandaTabs>

      <Stack direction='row' component='form' onSubmit={form.handleSubmit(submitHandler)} sx={{ marginTop: '40px' }}>
        <Controller
          control={form.control}
          name={'searchKeyword'}
          render={({ field }) => (
            <TextField
              {...field}
              size='small'
              placeholder='문의 내역을 검색해 보세요'
              sx={{ width: '350px', marginLeft: 'auto' }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton edge='end' type='submit'>
                      <Search />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          )}
        />
      </Stack>

      <Table sx={{ marginTop: '10px' }}>
        <TableHead>
          <MedipandaTableRow>
            <MedipandaTableCell sx={{ width: '80px' }}>No</MedipandaTableCell>
            <MedipandaTableCell sx={{ width: '472px' }}>제목</MedipandaTableCell>
            <MedipandaTableCell sx={{ width: '130px' }}>문의일</MedipandaTableCell>
            <MedipandaTableCell sx={{ width: '100px' }}>답변상태</MedipandaTableCell>
          </MedipandaTableRow>
        </TableHead>
        <TableBody>
          {contents.length === 0 ? (
            <MedipandaTableRow>
              <MedipandaTableCell colSpan={4} align='center' sx={{ py: 3 }}>
                <Typography variant='body2' color='text.secondary'>
                  검색 결과가 없습니다.
                </Typography>
              </MedipandaTableCell>
            </MedipandaTableRow>
          ) : (
            contents.map(inquiry => (
              <MedipandaTableRow key={inquiry.id}>
                <MedipandaTableCell>{`${inquiry.sequence}`}</MedipandaTableCell>
                <MedipandaTableCell sx={{ textAlign: 'left' }}>
                  <Link
                    underline='hover'
                    component={RouterLink}
                    to={`/customer-service/inquiry/${inquiry.id}`}
                    sx={{
                      color: colors.gray80,
                      '&:hover': {
                        color: colors.vividViolet,
                      },
                    }}
                  >
                    {inquiry.title}
                  </Link>
                </MedipandaTableCell>
                <MedipandaTableCell>{DateUtils.parseUtcAndFormatKst(inquiry.createdAt, DATEFORMAT_YYYY_MM_DD_HH_MM)}</MedipandaTableCell>
                <MedipandaTableCell>
                  <InquiryStatusChip status={inquiry.hasChildren} />
                </MedipandaTableCell>
              </MedipandaTableRow>
            ))
          )}
        </TableBody>
      </Table>

      <MedipandaPagination
        count={totalPages}
        page={page}
        showFirstButton
        showLastButton
        renderItem={item => <PaginationItem {...item} component={RouterLink} to={setUrlParams({ page: item.page }, initialSearchParams)} />}
        sx={{
          alignSelf: 'center',
          marginTop: '40px',
        }}
      />

      <Fab
        component={RouterLink}
        to='/customer-service/inquiry/new'
        sx={{
          position: 'fixed',
          right: '40px',
          bottom: '160px',
          width: '90px',
          height: '90px',
          backgroundColor: colors.navy,
          '&:hover': {
            backgroundColor: colors.vividViolet,
          },
        }}
      >
        <img src='/assets/icons/icon-inquiry-new.svg' style={{ width: '54px', height: '54px' }} />
      </Fab>

      <Fab
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        sx={{
          position: 'fixed',
          right: '40px',
          bottom: '60px',
          width: '90px',
          height: '90px',
          border: `1px solid ${colors.navy}`,
          backgroundColor: colors.white,
        }}
      >
        <img src='/assets/icons/icon-top.svg' style={{ width: '54px', height: '54px' }} />
      </Fab>
    </>
  );
}

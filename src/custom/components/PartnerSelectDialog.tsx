import { getPartners, type PartnerResponse } from '@/backend';
import { formatYyyyMm } from '@/lib/utils/dateFormat';
import { setUrlParams } from '@/lib/utils/url';
import { withSequence } from '@/lib/utils/withSequence';
import { Search } from '@mui/icons-material';
import { InputAdornment, PaginationItem, Stack, TextField } from '@mui/material';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { Link as RouterLink } from 'react-router-dom';
import type { RequiredDeep } from 'type-fest';
import { MedipandaButton } from './MedipandaButton';
import { MedipandaDialog, MedipandaDialogContent, MedipandaDialogTitle } from './MedipandaDialog';
import { MedipandaPagination } from './MedipandaPagination';
import { MedipandaTable } from './MedipandaTable';

export function PartnerSelectDialog({
  open,
  onClose,
  onSelect,
}: {
  open?: boolean;
  onClose?: () => void;
  onSelect?: (partner: PartnerResponse) => void;
}) {
  const [contents, setContents] = useState<PartnerResponse[]>([]);
  const [totalPages, setTotalPages] = useState(0);

  const [submitFormValues, setSubmitFormValues] = useState({
    searchType: 'institutionName' as 'companyName' | 'institutionName' | 'drugCompanyName' | 'memberName' | 'institutionCode',
    searchKeyword: '',
    page: 1,
  });
  const pageSize = 10;

  const form = useForm({
    defaultValues: {
      ...submitFormValues,
    },
  });

  const submitHandler: SubmitHandler<RequiredDeep<(typeof form)['control']['_defaultValues']>> = async values => {
    setSubmitFormValues({
      ...values,
      page: 1,
    });
  };

  const fetchContents = async () => {
    try {
      const response = await getPartners({
        [submitFormValues.searchType]: submitFormValues.searchKeyword,
        page: submitFormValues.page - 1,
        size: pageSize,
      });

      setContents(withSequence(response).content);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch settlement list:', error);
      alert('정산내역 목록을 불러오는 중 오류가 발생했습니다.');
      setContents([]);
      setTotalPages(0);
    }
  };

  useEffect(() => {
    form.setValue('searchKeyword', submitFormValues.searchKeyword);
    fetchContents();
  }, [submitFormValues.searchKeyword, submitFormValues.page]);

  const initialSearchParams = {
    searchType: 'companyName' as 'dealerName' | 'dealerId' | 'drugCompanyName' | 'companyName',
    searchKeyword: '',
    settlementMonth: formatYyyyMm(new Date()),
    page: '1',
  };

  useEffect(() => {
    if (open) {
      form.setValue('searchKeyword', '');
      form.handleSubmit(submitHandler)();
    }
  }, [open]);

  const table = useReactTable({
    data: contents,
    columns: [
      {
        header: '거래처명',
        cell: ({ row }) => row.original.institutionName,
      },
      {
        header: '입력',
        cell: ({ row }) => {
          return (
            <MedipandaButton
              onClick={() => {
                onSelect?.(row.original);
              }}
              size='small'
              variant='contained'
              rounded
              color='secondary'
            >
              선택
            </MedipandaButton>
          );
        },
      },
    ],
    getCoreRowModel: getCoreRowModel(),
  });

  if (!open) {
    return null;
  }

  return (
    <MedipandaDialog open onClose={onClose}>
      <MedipandaDialogTitle title='거래처 선택' onClose={onClose} />
      <MedipandaDialogContent>
        <form onSubmit={form.handleSubmit(submitHandler)}>
          <Controller
            control={form.control}
            name={'searchKeyword'}
            render={({ field }) => (
              <TextField
                {...field}
                placeholder='거래처명을 입력해주세요.'
                fullWidth
                size='small'
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <Search />
                    </InputAdornment>
                  ),
                }}
                sx={{}}
              />
            )}
          />
        </form>

        <MedipandaTable table={table} />

        <Stack alignItems='center'>
          <MedipandaPagination
            count={totalPages}
            // page={page}
            showFirstButton
            showLastButton
            renderItem={item => (
              <PaginationItem {...item} component={RouterLink} to={setUrlParams({ page: item.page }, initialSearchParams)} />
            )}
            sx={{ marginTop: '40px' }}
          />
        </Stack>
      </MedipandaDialogContent>
    </MedipandaDialog>
  );
}

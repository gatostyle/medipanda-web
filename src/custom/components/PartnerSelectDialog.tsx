import { getPartners, type PartnerResponse } from '@/backend';
import { usePageFetchFormik } from '@/lib/react/usePageFetchFormik';
import { Search } from '@mui/icons-material';
import { InputAdornment, Stack, TextField } from '@mui/material';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useEffect } from 'react';
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
  const {
    content: page,
    pageCount: totalPages,
    formik: pageFormik,
  } = usePageFetchFormik({
    initialFormValues: {
      searchKeyword: '',
    },
    fetcher: values => {
      return getPartners({
        institutionName: values.searchKeyword === '' ? undefined : values.searchKeyword,
        page: values.pageIndex,
        size: values.pageSize,
      });
    },
    contentSelector: response => response.content,
    pageCountSelector: response => response.totalPages,
    initialContent: [],
  });

  useEffect(() => {
    if (open) {
      (async () => {
        await pageFormik.setFieldValue('searchKeyword', '');
        await pageFormik.submitForm();
      })();
    }
  }, [open, pageFormik]);

  const table = useReactTable({
    data: page,
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
        <form onSubmit={pageFormik.handleSubmit}>
          <TextField
            name='searchKeyword'
            value={pageFormik.values.searchKeyword}
            onChange={pageFormik.handleChange}
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
        </form>

        <MedipandaTable table={table} />

        <Stack alignItems='center'>
          <MedipandaPagination
            count={totalPages}
            page={pageFormik.values.pageIndex + 1}
            showFirstButton
            showLastButton
            onChange={(_, page) => {
              pageFormik.setFieldValue('pageIndex', page - 1);
            }}
            sx={{ marginTop: '40px' }}
          />
        </Stack>
      </MedipandaDialogContent>
    </MedipandaDialog>
  );
}

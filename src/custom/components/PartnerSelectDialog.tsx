import { InputAdornment, Stack, TextField } from '@mui/material';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { getPartners, type PartnerResponse } from '../../backend';
import { MedipandaButton } from './MedipandaButton.tsx';
import { MedipandaDialog, MedipandaDialogContent, MedipandaDialogTitle } from './MedipandaDialog.tsx';
import { Search } from '@mui/icons-material';
import { MedipandaPagination } from './MedipandaPagination.tsx';
import { MedipandaTable } from './MedipandaTable.tsx';

export function PartnerSelectDialog({
  open,
  onClose,
  onSelect,
}: {
  open?: boolean;
  onClose?: () => void;
  onSelect?: (partner: PartnerResponse) => void;
}) {
  const [page, setPage] = useState<PartnerResponse[]>([]);
  const [totalPages, setTotalPages] = useState(0);

  const pageFormik = useFormik({
    initialValues: {
      searchKeyword: '',
      pageIndex: 0,
      pageSize: 10,
      totalPages: 1,
    },
    onSubmit: async () => {
      if (pageFormik.values.pageIndex !== 0) {
        await pageFormik.setFieldValue('pageIndex', 0);
      } else {
        await fetchPage();
      }
    },
  });

  const fetchPage = async () => {
    const response = await getPartners({
      institutionName: pageFormik.values.searchKeyword === '' ? undefined : pageFormik.values.searchKeyword,
      page: pageFormik.values.pageIndex,
      size: pageFormik.values.pageSize,
    });

    setPage(response.content);
    setTotalPages(response.totalPages);
  };

  useEffect(() => {
    pageFormik.submitForm();
  }, [open, pageFormik.values.pageIndex, pageFormik.values.pageSize]);

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

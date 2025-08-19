import { Stack } from '@mui/material';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { type DrugCompanyResponse, getDrugCompanies } from '../../backend';
import { MedipandaButton } from './MedipandaButton.tsx';
import { MedipandaDialog, MedipandaDialogContent, MedipandaDialogTitle } from './MedipandaDialog.tsx';
import { MedipandaTable } from './MedipandaTable.tsx';

export function DrugCompanySelectDialog({
  open,
  onClose,
  onSelect,
  excludedIds,
}: {
  open?: boolean;
  onClose?: () => void;
  onSelect?: (drugCompany: DrugCompanyResponse) => void;
  excludedIds?: number[];
}) {
  const [page, setPage] = useState<DrugCompanyResponse[]>([]);

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
    const data = await getDrugCompanies();

    setPage(data.filter(drugCompany => !(excludedIds ?? []).includes(drugCompany.id)));
  };

  useEffect(() => {
    pageFormik.submitForm();
  }, [open, pageFormik.values.pageIndex, pageFormik.values.pageSize]);

  const table = useReactTable({
    data: page,
    columns: [
      {
        header: '제약사명',
        cell: ({ row }) => row.original.name,
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
      <MedipandaDialogTitle title='거래제약사 추가' onClose={onClose} />
      <MedipandaDialogContent>
        <Stack>
          <MedipandaTable table={table} />
        </Stack>
      </MedipandaDialogContent>
    </MedipandaDialog>
  );
}

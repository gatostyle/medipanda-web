import { type DrugCompanyResponse, getDrugCompanies } from '@/backend';
import { usePageFetchFormik } from '@/lib/components/usePageFetchFormik';
import { Stack } from '@mui/material';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useEffect } from 'react';
import { MedipandaButton } from './MedipandaButton';
import { MedipandaDialog, MedipandaDialogContent, MedipandaDialogTitle } from './MedipandaDialog';
import { MedipandaTable } from './MedipandaTable';

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
  const { content, formik: pageFormik } = usePageFetchFormik({
    fetcher: async () => {
      return (await getDrugCompanies()).filter(drugCompany => !(excludedIds ?? []).includes(drugCompany.id));
    },
    initialContent: [],
  });

  useEffect(() => {
    if (open) {
      (async () => {
        await pageFormik.setFieldValue('searchKeyword', '');
        await pageFormik.submitForm();
      })();
    }
  }, [open]);

  const table = useReactTable({
    data: content,
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

import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router';
import { type DealerResponse, listDealers } from '../../backend';
import { MedipandaButton } from './MedipandaButton.tsx';
import { MedipandaDialog, MedipandaDialogContent, MedipandaDialogTitle } from './MedipandaDialog.tsx';
import { MedipandaTable } from './MedipandaTable.tsx';

export function DealerSelectDialog({
  open,
  onClose,
  onSelect,
}: {
  open?: boolean;
  onClose?: () => void;
  onSelect?: (dealer: DealerResponse) => void;
}) {
  const [page, setPage] = useState<DealerResponse[]>([]);

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
    const data = await listDealers();

    setPage(data);
  };

  useEffect(() => {
    pageFormik.submitForm();
  }, [open, pageFormik.values.pageIndex, pageFormik.values.pageSize]);

  const table = useReactTable({
    data: page,
    columns: [
      {
        header: '딜러명',
        cell: ({ row }) => row.original.dealerName,
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
    <MedipandaDialog open onClose={onClose} width='400px'>
      <MedipandaDialogTitle title={'딜러 선택'} onClose={onClose} />
      <MedipandaDialogContent>
        <MedipandaTable table={table} />
        <MedipandaButton
          variant='contained'
          size='large'
          color='secondary'
          component={RouterLink}
          to={'/dealers'}
          sx={{ marginTop: '20px' }}
        >
          신규 딜러 추가
        </MedipandaButton>
      </MedipandaDialogContent>
    </MedipandaDialog>
  );
}

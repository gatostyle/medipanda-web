import { type DealerResponse, listDealers } from '@/backend';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { MedipandaButton } from './MedipandaButton';
import { MedipandaDialog, MedipandaDialogContent, MedipandaDialogTitle } from './MedipandaDialog';
import { MedipandaTable } from './MedipandaTable';

export function DealerSelectDialog({
  open,
  onClose,
  onSelect,
}: {
  open?: boolean;
  onClose?: () => void;
  onSelect?: (dealer: DealerResponse) => void;
}) {
  const [contents, setContents] = useState<DealerResponse[]>([]);

  const fetchContents = async () => {
    const response = await listDealers();

    setContents(response);
  };

  useEffect(() => {
    fetchContents();
  }, []);

  const table = useReactTable({
    data: contents,
    columns: [
      {
        header: '딜러명',
        cell: ({ row }) => row.original.displayName,
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

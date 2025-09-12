import { DrugCompanyResponse, getAllDrugCompanies } from '@/backend';
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useEffect, useState } from 'react';

export interface MpDrugCompanySelectModalProps {
  open: boolean;
  onClose?: () => void;
  onSelect?: (drugCompany: DrugCompanyResponse) => void;
}

function MpDrugCompanySelectModalInternal({ open, onClose, onSelect }: MpDrugCompanySelectModalProps) {
  const [contents, setContents] = useState<DrugCompanyResponse[]>([]);

  const fetchContents = async () => {
    const response = await getAllDrugCompanies();
    setContents(response);
  };

  useEffect(() => {
    if (open) {
      fetchContents();
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>제약사 조회</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <TableContainer>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell>제약사명</TableCell>
                  <TableCell align='center' width={100}>
                    선택
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {contents.map(drugCompany => (
                  <TableRow key={drugCompany.id}>
                    <TableCell>{drugCompany.name}</TableCell>
                    <TableCell align='center'>
                      <Button variant='contained' size='small' onClick={() => onSelect?.(drugCompany)}>
                        선택
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Stack direction='row' justifyContent='center'>
            <Button onClick={onClose}>취소</Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

export function MpDrugCompanySelectModal(props: MpDrugCompanySelectModalProps) {
  if (!props.open) {
    return null;
  }

  return <MpDrugCompanySelectModalInternal {...props} />;
}

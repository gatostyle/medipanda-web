import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Pagination,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';

interface ChangeHistory {
  id: number;
  settlementMonth: string;
  beforeProductName: string;
  beforeQuantity: number;
  afterProductName: string;
  afterQuantity: number;
}

export interface MpChangeHistoryModalProps {
  open: boolean;
  onClose: () => void;
  prescriptionFormId?: number;
}

function MpChangeHistoryModalInternal({ open, onClose, prescriptionFormId }: MpChangeHistoryModalProps) {
  const [data, setData] = useState<ChangeHistory[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (open && prescriptionFormId) {
      setData([]);
      setTotalPages(1);
    }
  }, [open, prescriptionFormId]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle>
        <Box display='flex' justifyContent='space-between' alignItems='center'>
          <Typography variant='h6'>변경내역</Typography>
          <IconButton onClick={onClose} size='small'>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <TableContainer>
          <Table size='small'>
            <TableHead>
              <TableRow>
                <TableCell align='center'>No</TableCell>
                <TableCell align='center'>정산월</TableCell>
                <TableCell align='center'>OCR 수정 전(제품명 / 수량)</TableCell>
                <TableCell align='center'>OCR 수정 후(제품명 / 수량)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((history, index) => (
                <TableRow key={history.id}>
                  <TableCell align='center'>{(page - 1) * 10 + index + 1}</TableCell>
                  <TableCell align='center'>{history.settlementMonth}</TableCell>
                  <TableCell align='center'>
                    {history.beforeProductName} / {history.beforeQuantity}
                  </TableCell>
                  <TableCell align='center'>
                    {history.afterProductName} / {history.afterQuantity}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {totalPages > 1 && (
          <Stack direction='row' justifyContent='center' sx={{ mt: 3 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color='primary'
              variant='outlined'
              showFirstButton
              showLastButton
            />
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color='inherit'>
          취소
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function MpChangeHistoryModal(props: MpChangeHistoryModalProps) {
  if (!props.open) {
    return null;
  }

  return <MpChangeHistoryModalInternal {...props} />;
}

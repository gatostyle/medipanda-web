import { getUserMembers, MemberResponse } from '@/backend';
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
  TextField,
} from '@mui/material';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';

export interface MpMemberSelectModalProps {
  open: boolean;
  onClose?: () => void;
  onSelect?: (member: MemberResponse) => void;
}

function MpMemberSelectModalInternal({ open, onClose, onSelect }: MpMemberSelectModalProps) {
  const [contents, setContents] = useState<MemberResponse[]>([]);

  const formik = useFormik({
    initialValues: {
      searchKeyword: '',
      pageIndex: 0,
    },
    onSubmit: () => {
      fetchPage();
    },
  });

  const fetchPage = async () => {
    const response = await getUserMembers({
      name: formik.values.searchKeyword !== '' ? formik.values.searchKeyword : undefined,
      page: formik.values.pageIndex,
    });
    setContents(response.content);
  };

  useEffect(() => {
    if (open) {
      fetchPage();
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>사용자명 조회</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Stack direction='row' spacing={1} component='form' noValidate onSubmit={formik.handleSubmit}>
            <TextField fullWidth size='small' placeholder='검색어를 입력하세요' name='searchKeyword' onChange={formik.handleChange} />
            <Button variant='contained' size='small' type='submit'>
              검색
            </Button>
          </Stack>

          <TableContainer>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell>사용자명</TableCell>
                  <TableCell>회사명</TableCell>
                  <TableCell align='center' width={100}>
                    선택
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {contents.map(member => (
                  <TableRow key={member.id}>
                    <TableCell>{member.name}</TableCell>
                    <TableCell>{member.companyName}</TableCell>
                    <TableCell align='center'>
                      <Button variant='contained' size='small' onClick={() => onSelect?.(member)}>
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

export function MpMemberSelectModal(props: MpMemberSelectModalProps) {
  if (!props.open) {
    return null;
  }

  return <MpMemberSelectModalInternal {...props} />;
}

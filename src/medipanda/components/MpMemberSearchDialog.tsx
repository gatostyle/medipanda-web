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

export interface MpMemberSearchDialogProps {
  open: boolean;
  onClose?: () => void;
  onMemberSelect?: (member: MemberResponse) => void;
}

export function MpMemberSearchDialog({ open, onClose, onMemberSelect }: MpMemberSearchDialogProps) {
  const [memberSearchDialogResult, setMemberSearchDialogResult] = useState<MemberResponse[]>([]);

  const memberSearchFormik = useFormik({
    initialValues: {
      searchKeyword: '',
      pageIndex: 0,
    },
    onSubmit: async values => {
      const response = await getUserMembers({
        name: values.searchKeyword !== '' ? values.searchKeyword : undefined,
        page: values.pageIndex,
      });
      setMemberSearchDialogResult(response.content);
    },
  });

  const fetchContents = async () => {
    await memberSearchFormik.setFieldValue('searchKeyword', '');
    await memberSearchFormik.submitForm();
  };

  useEffect(() => {
    if (open) {
      fetchContents();
    }
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>사용자명 조회</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Stack direction='row' spacing={1} component='form' noValidate onSubmit={memberSearchFormik.handleSubmit}>
            <TextField
              fullWidth
              size='small'
              placeholder='검색어를 입력하세요'
              name='searchKeyword'
              onChange={memberSearchFormik.handleChange}
            />
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
                {memberSearchDialogResult.map(member => (
                  <TableRow key={member.id}>
                    <TableCell>{member.name}</TableCell>
                    <TableCell>{member.companyName}</TableCell>
                    <TableCell align='center'>
                      <Button variant='contained' size='small' onClick={() => onMemberSelect?.(member)}>
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

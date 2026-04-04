import { getUserMembers, type MemberResponse } from '@/backend';
import { useMpModal } from '@/hooks/useMpModal';
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { SearchNormal1 } from 'iconsax-reactjs';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import type { RequiredDeep } from 'type-fest';

export interface MpMemberSelectModalProps {
  open: boolean;
  onClose?: () => void;
  onSelect?: (member: MemberResponse) => void;
  additionalFilter?: Partial<Parameters<typeof getUserMembers>[0]>;
}

function MpMemberSelectModalInternal({ open, onClose, onSelect, additionalFilter }: MpMemberSelectModalProps) {
  const [contents, setContents] = useState<MemberResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const { alertError } = useMpModal();

  const form = useForm({
    defaultValues: {
      searchKeyword: '',
      pageIndex: 0,
    },
  });

  const submitHandler: SubmitHandler<RequiredDeep<(typeof form)['control']['_defaultValues']>> = async () => {
    fetchContents();
  };

  const fetchContents = async () => {
    try {
      setLoading(true);
      const response = await getUserMembers({
        ...(additionalFilter ?? {}),
        name: form.getValues('searchKeyword') !== '' ? form.getValues('searchKeyword') : undefined,
        page: form.getValues('pageIndex'),
        size: 99999,
      });
      setContents(response.content);
    } catch (error) {
      console.error('Failed to fetch members:', error);
      await alertError('사용자 조회 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchContents();
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>사용자명 조회</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Stack direction='row' spacing={1} component='form' noValidate onSubmit={form.handleSubmit(submitHandler)}>
            <Controller
              control={form.control}
              name={'searchKeyword'}
              render={({ field }) => (
                <TextField
                  {...field}
                  size='small'
                  fullWidth
                  label='검색어'
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton edge='end' size='small' onClick={form.handleSubmit(submitHandler)} disabled={loading}>
                          <SearchNormal1 size={16} />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
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
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align='center' sx={{ py: 3 }}>
                      <Typography variant='body2' color='text.secondary'>
                        데이터를 로드하는 중입니다.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : contents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align='center' sx={{ py: 3 }}>
                      <Typography variant='body1' color='text.secondary'>
                        검색 결과가 없습니다.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  contents.map(member => (
                    <TableRow key={member.id}>
                      <TableCell>{member.name}</TableCell>
                      <TableCell>{member.companyName}</TableCell>
                      <TableCell align='center'>
                        <Button variant='contained' size='small' onClick={() => onSelect?.(member)}>
                          선택
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
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

import { Dialog, DialogContent, DialogTitle, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { createDealer, type DealerResponse, getDrugCompanies, listDealers } from '../backend';
import { MedipandaButton } from '../custom/components/MedipandaButton.tsx';
import { MedipandaTable } from '../custom/components/MedipandaTable.tsx';
import { colors } from '../custom/globalStyles.ts';
import { formatYyyyMmDd } from '../utils/dateFormat.ts';
import { Search } from '@mui/icons-material';
import { type Sequenced, withSequence } from '../utils/withSequence.ts';

export default function DealerList() {
  const [page, setPage] = useState<Sequenced<DealerResponse>[]>([]);

  const pageFormik = useFormik({
    initialValues: {
      searchType: 'companyName' as 'companyName' | 'dealerName',
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
    const response = await listDealers();

    setPage(withSequence(response));
  };

  useEffect(() => {
    pageFormik.submitForm();
  }, [pageFormik.values.pageIndex, pageFormik.values.pageSize]);

  const table = useReactTable({
    data: page,
    columns: [
      {
        header: 'No',
        accessorKey: 'sequence',
      },
      {
        header: '딜러번호',
        accessorKey: 'id',
      },
      {
        header: '딜러명',
        accessorKey: 'dealerName',
      },
      {
        header: '거래제약사',
        accessorKey: '-',
      },
      {
        header: '등록일',
        accessorKey: 'createdAt',
        cell: ({ row }) => formatYyyyMmDd(row.original.createdAt),
      },
    ],
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <Stack
        alignItems='center'
        sx={{
          width: '100%',
        }}
      >
        <Stack direction='row' alignItems='flex-start' gap='24px' sx={{ width: '100%', marginTop: '10px' }}>
          <Stack alignItems='center' sx={{ width: '600px' }}>
            <MedipandaTable table={table} />
          </Stack>
          <DealerCreateForm />
        </Stack>
      </Stack>
    </>
  );
}

function DealerCreateForm() {
  const [drugCompanySearchDialogOpen, setDrugCompanySearchDialogOpen] = useState(false);

  const formik = useFormik({
    initialValues: {
      dealerName: '',
      drugCompanies: [] as string[],
    },
    onSubmit: async values => {
      createDealer({
        dealerName: values.dealerName,
      });
    },
  });

  return (
    <>
      <Stack
        component='form'
        onSubmit={formik.handleSubmit}
        gap='10px'
        sx={{
          width: '600px',
          padding: '40px 75px',
          border: `1px solid ${colors.gray30}`,
          boxSizing: 'border-box',
        }}
      >
        <Stack direction='row' alignItems='center'>
          <Typography variant='largeTextM' sx={{ color: colors.gray80, width: '120px' }}>
            딜러명
          </Typography>
          <TextField
            name='dealerName'
            value={formik.values.dealerName}
            onChange={formik.handleChange}
            size='small'
            sx={{
              flexGrow: 1,
              '& .MuiInputBase-input': {
                height: '50px',
                boxSizing: 'border-box',
              },
            }}
          />
        </Stack>
        {formik.values.drugCompanies.concat(['']).map((company, index) => (
          <Stack key={index} direction='row' alignItems='center'>
            <Typography variant='largeTextM' sx={{ color: colors.gray80, width: '120px' }}>
              {index === 0 ? '거래제약사' : ''}
            </Typography>
            <TextField
              placeholder='+ 거래제약사 추가'
              value={company ?? ''}
              disabled={formik.values.drugCompanies.length > index}
              onClick={() => setDrugCompanySearchDialogOpen(true)}
              size='small'
              sx={{
                flexGrow: 1,
                '& .MuiInputBase-input': {
                  height: '50px',
                  boxSizing: 'border-box',
                },
              }}
            />
          </Stack>
        ))}

        <Stack
          direction='row'
          justifyContent='center'
          gap='10px'
          sx={{
            width: '100%',
            marginTop: '20px',
          }}
        >
          <MedipandaButton
            onClick={() => formik.resetForm()}
            disabled={formik.values.dealerName === '' && formik.values.drugCompanies.length === 0}
            variant='outlined'
            size='large'
            color='secondary'
            sx={{
              width: '160px',
            }}
          >
            취소
          </MedipandaButton>
          <MedipandaButton
            type='submit'
            disabled={formik.isSubmitting}
            variant='contained'
            size='large'
            color='secondary'
            sx={{
              width: '160px',
            }}
          >
            등록
          </MedipandaButton>
        </Stack>
      </Stack>

      <DrugCompanySearchDialog
        open={drugCompanySearchDialogOpen}
        onClose={() => setDrugCompanySearchDialogOpen(false)}
        onChange={drugCompany => {
          formik.setFieldValue('drugCompanies', [...formik.values.drugCompanies, drugCompany.drugCompany]);
          setDrugCompanySearchDialogOpen(false);
        }}
      />
    </>
  );
}

interface DrugCompany {
  drugCompany: string;
}

function DrugCompanySearchDialog({
  open,
  onClose,
  onChange,
}: {
  open?: boolean;
  onClose?: () => void;
  onChange?: (drugCompany: DrugCompany) => void;
}) {
  const [page, setPage] = useState<DrugCompany[]>([]);

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

    setPage(data.map(drugCompany => ({ drugCompany: drugCompany })));
  };

  useEffect(() => {
    pageFormik.submitForm();
  }, [pageFormik.values.pageIndex, pageFormik.values.pageSize]);

  const table = useReactTable({
    data: page,
    columns: [
      {
        header: '제약사명',
        accessorKey: 'drugCompany',
      },
      {
        header: '입력',
        cell: ({ row }) => {
          return (
            <MedipandaButton
              onClick={() => {
                onChange?.(row.original);
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
    <Dialog open onClose={onClose}>
      <DialogTitle>거래제약사 추가</DialogTitle>
      <DialogContent>
        <Stack>
          <TextField
            name='searchKeyword'
            value={pageFormik.values.searchKeyword}
            onChange={pageFormik.handleChange}
            placeholder='제목을 입력해주세요.'
            fullWidth
            size='small'
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{
              width: '480px',
            }}
          />

          <MedipandaTable table={table} />
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

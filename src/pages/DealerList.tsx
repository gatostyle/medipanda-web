import { createDealer, type DrugCompanyResponse, listDealers } from '@/backend';
import { DrugCompanySelectDialog } from '@/custom/components/DrugCompanySelectDialog';
import { MedipandaButton } from '@/custom/components/MedipandaButton';
import { MedipandaOutlinedInput } from '@/custom/components/MedipandaOutlinedInput';
import { MedipandaTable } from '@/custom/components/MedipandaTable';
import { usePageFetchFormik } from '@/lib/components/usePageFetchFormik';
import { colors } from '@/themes';
import { formatYyyyMmDd } from '@/lib/utils/dateFormat';
import { withSequence } from '@/lib/utils/withSequence';
import { Stack, TextField, Typography } from '@mui/material';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useFormik } from 'formik';
import { useState } from 'react';

export default function DealerList() {
  const { content: page } = usePageFetchFormik({
    fetcher: async () => {
      const response = await listDealers();

      return withSequence(response);
    },
    initialContent: [],
  });

  const table = useReactTable({
    data: page,
    columns: [
      {
        header: 'No',
        cell: ({ row }) => row.original.sequence,
      },
      {
        header: '딜러번호',
        cell: ({ row }) => row.original.id,
      },
      {
        header: '딜러명',
        cell: ({ row }) => row.original.dealerName,
      },
      {
        header: '거래제약사',
        cell: () => '-',
      },
      {
        header: '등록일',
        cell: ({ row }) => formatYyyyMmDd(row.original.createdAt),
      },
    ],
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <Stack direction='row' alignItems='flex-start' gap='24px' sx={{ marginTop: '10px' }}>
        <Stack alignItems='center' sx={{ width: '600px' }}>
          <MedipandaTable table={table} />
        </Stack>
        <Stack
          gap='10px'
          sx={{
            width: '600px',
            padding: '40px 75px',
            border: `1px solid ${colors.gray30}`,
            boxSizing: 'border-box',
          }}
        >
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
      drugCompanies: [] as DrugCompanyResponse[],
    },
    onSubmit: async values => {
      try {
        await createDealer({
          dealerName: values.dealerName,
          bankName: null,
          accountNumber: null,
          drugCompanyIds: values.drugCompanies.map(company => company.id),
        });
      } catch (error) {
        console.error('Error creating dealer:', error);
        alert('딜러를 등록하는 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    },
  });

  return (
    <>
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
      {(formik.values.drugCompanies as (DrugCompanyResponse | null)[]).concat(null).map((drugCompany, index) => (
        <Stack key={drugCompany?.id ?? ''} direction='row' alignItems='center'>
          <Typography variant='largeTextM' sx={{ color: colors.gray80, width: '120px' }}>
            {index === 0 ? '거래제약사' : ''}
          </Typography>
          <Stack direction='row' alignItems='center' gap='10px' sx={{ width: '330px' }}>
            <MedipandaOutlinedInput
              value={drugCompany !== null ? drugCompany.name : ''}
              disabled
              sx={{
                flexGrow: 1,
                height: '50px',
                backgroundColor: colors.gray10,
              }}
            />
            {drugCompany === null && (
              <MedipandaButton onClick={() => setDrugCompanySearchDialogOpen(true)} variant='contained' size='large' color='secondary'>
                거래제약사 추가
              </MedipandaButton>
            )}
          </Stack>
        </Stack>
      ))}

      <Stack
        direction='row'
        justifyContent='center'
        gap='10px'
        sx={{
          marginTop: '10px',
        }}
      >
        <MedipandaButton
          onClick={() => formik.resetForm()}
          disabled={formik.isSubmitting}
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
          onClick={() => formik.submitForm()}
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

      <DrugCompanySelectDialog
        open={drugCompanySearchDialogOpen}
        onClose={() => setDrugCompanySearchDialogOpen(false)}
        onSelect={drugCompany => {
          formik.setFieldValue('drugCompanies', [...formik.values.drugCompanies, drugCompany]);
          setDrugCompanySearchDialogOpen(false);
        }}
        excludedIds={formik.values.drugCompanies.map(company => company.id)}
      />
    </>
  );
}

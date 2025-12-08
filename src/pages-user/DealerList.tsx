import { createDealer, type DealerResponse, type DrugCompanyResponse, listDealers } from '@/backend';
import { DrugCompanySelectDialog } from '@/custom/components/DrugCompanySelectDialog';
import { MedipandaButton } from '@/custom/components/MedipandaButton';
import { MedipandaOutlinedInput } from '@/custom/components/MedipandaOutlinedInput';
import { MedipandaTable } from '@/custom/components/MedipandaTable';
import { colors } from '@/themes';
import { DateUtils, DATEFORMAT_YYYY_MM_DD } from '@/lib/utils/dateFormat';
import { type Sequenced, withSequence } from '@/lib/utils/withSequence';
import { Stack, TextField, Typography } from '@mui/material';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import type { RequiredDeep } from 'type-fest';

export default function DealerList() {
  const [contents, setContents] = useState<Sequenced<DealerResponse>[]>([]);

  const fetchContents = async () => {
    const response = await listDealers();

    setContents(withSequence(response));
  };

  useEffect(() => {
    fetchContents();
  }, []);

  const table = useReactTable({
    data: contents,
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
        cell: ({ row }) => row.original.displayName,
      },
      {
        header: '등록일',
        cell: ({ row }) => DateUtils.parseUtcAndFormatKst(row.original.createdAt, DATEFORMAT_YYYY_MM_DD),
      },
    ],
    getCoreRowModel: getCoreRowModel(),
  });

  const handleDealerUpdate = () => {
    fetchContents();
  };

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
          <DealerCreateForm onUpdate={handleDealerUpdate} />
        </Stack>
      </Stack>
    </>
  );
}

function DealerCreateForm({ onUpdate }: { onUpdate?: () => void }) {
  const [drugCompanySearchDialogOpen, setDrugCompanySearchDialogOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      dealerName: '',
      drugCompanies: [] as DrugCompanyResponse[],
    },
  });
  const formDrugCompanies = form.watch('drugCompanies');

  const submitHandler: SubmitHandler<RequiredDeep<(typeof form)['control']['_defaultValues']>> = async values => {
    try {
      await createDealer({
        dealerName: values.dealerName,
        bankName: null,
        accountNumber: null,
        drugCompanyIds: values.drugCompanies.map(company => company.id),
      });
      alert('딜러가 성공적으로 등록되었습니다.');
      form.reset();
      onUpdate?.();
    } catch (error) {
      console.error('Error creating dealer:', error);
      alert('딜러를 등록하는 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <>
      <Stack direction='row' alignItems='center'>
        <Typography variant='largeTextM' sx={{ color: colors.gray80, width: '120px' }}>
          딜러명
        </Typography>
        <Controller
          control={form.control}
          name={'dealerName'}
          render={({ field }) => (
            <TextField
              {...field}
              size='small'
              sx={{
                flexGrow: 1,
                '& .MuiInputBase-input': {
                  height: '50px',
                  boxSizing: 'border-box',
                },
              }}
            />
          )}
        />
      </Stack>
      {(formDrugCompanies as (DrugCompanyResponse | null)[]).concat(null).map((drugCompany, index) => (
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
          onClick={() => form.reset()}
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
          onClick={form.handleSubmit(submitHandler)}
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

      <Controller
        control={form.control}
        name={'drugCompanies'}
        render={({ field }) => (
          <DrugCompanySelectDialog
            open={drugCompanySearchDialogOpen}
            onClose={() => setDrugCompanySearchDialogOpen(false)}
            onSelect={drugCompany => {
              field.onChange([...field.value, drugCompany]);
              setDrugCompanySearchDialogOpen(false);
            }}
            excludedIds={field.value.map(company => company.id)}
          />
        )}
      />
    </>
  );
}

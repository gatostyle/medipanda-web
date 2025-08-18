import { Add, Search } from '@mui/icons-material';
import { Button, FormControl, InputAdornment, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { type PrescriptionResponse, searchPrescriptions } from '../backend';
import { MedipandaPagination } from '../custom/components/MedipandaPagination.tsx';
import MpDatePicker from '../components/MpDatePicker.tsx';
import { MedipandaButton } from '../custom/components/MedipandaButton.tsx';
import { MedipandaOutlinedInput } from '../custom/components/MedipandaOutlinedInput.tsx';
import { MedipandaTable } from '../custom/components/MedipandaTable.tsx';
import { colors } from '../custom/globalStyles.ts';
import { formatYyyyMmDd, formatYyyy년Mm월 } from '../utils/dateFormat.ts';

export default function PrescriptionList() {
  const [individualUpload, setIndividualUpload] = useState(true);

  const [page, setPage] = useState<PrescriptionResponse[]>([]);
  const [totalPages, setTotalPages] = useState(0);

  const pageFormik = useFormik({
    initialValues: {
      searchType: 'companyName' as 'companyName' | 'dealerName',
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
    const response = await searchPrescriptions({
      companyName: pageFormik.values.searchType === 'companyName' ? pageFormik.values.searchKeyword : undefined,
      dealerName: pageFormik.values.searchType === 'dealerName' ? pageFormik.values.searchKeyword : undefined,
      page: pageFormik.values.pageIndex,
      size: pageFormik.values.pageSize,
    });

    setPage(response.content);
    setTotalPages(response.totalPages);
  };

  useEffect(() => {
    pageFormik.submitForm();
  }, [pageFormik.values.pageIndex, pageFormik.values.pageSize]);

  const table = useReactTable({
    data: page,
    columns: [
      {
        header: '구분',
        accessorKey: 'type',
      },
      {
        header: '딜러명',
        accessorKey: 'dealerName',
      },
      {
        header: '거래처명',
        accessorKey: 'companyName',
      },
      {
        header: '처방월',
        accessorKey: 'prescriptionMonth',
        cell: info => formatYyyyMmDd(info.getValue()),
      },
      {
        header: '등록처리',
        accessorKey: 'status',
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
        <Typography variant='heading4B' sx={{ color: colors.gray80 }}>
          {formatYyyy년Mm월(new Date())}
        </Typography>
        <Stack
          direction='row'
          alignItems='center'
          gap='10px'
          component='form'
          onSubmit={pageFormik.handleSubmit}
          sx={{
            marginTop: '40px',
          }}
        >
          <FormControl sx={{ width: '320px' }}>
            <Select value={pageFormik.values.searchType} onChange={pageFormik.handleChange}>
              <MenuItem value='companyName'>거래처명</MenuItem>
              <MenuItem value='dealerName'>딜러명</MenuItem>
            </Select>
          </FormControl>
          <TextField
            name='searchKeyword'
            value={pageFormik.values.searchKeyword}
            onChange={pageFormik.handleChange}
            placeholder='거래처명을 검색하세요.'
            sx={{
              width: '478px',
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <button type='submit' hidden />
        </Stack>
        <Stack direction='row' alignItems='center' gap='10px' sx={{ width: '100%', marginTop: '40px' }}>
          <MedipandaButton
            variant={individualUpload ? 'contained' : 'outlined'}
            rounded
            onClick={() => setIndividualUpload(true)}
            sx={{
              width: '140px',
              marginLeft: 'auto',
            }}
          >
            거래처별 업로드
          </MedipandaButton>
          <MedipandaButton
            variant={!individualUpload ? 'contained' : 'outlined'}
            rounded
            onClick={() => setIndividualUpload(false)}
            sx={{
              width: '140px',
            }}
          >
            한번에 업로드
          </MedipandaButton>
        </Stack>
        <Stack direction='row' alignItems='flex-start' gap='24px' sx={{ width: '100%', marginTop: '10px' }}>
          <Stack alignItems='center' sx={{ width: '600px' }}>
            <MedipandaTable table={table} />
            <MedipandaPagination
              count={totalPages}
              page={pageFormik.values.pageIndex + 1}
              showFirstButton
              showLastButton
              onChange={(_, page) => {
                pageFormik.setFieldValue('pageIndex', page - 1);
              }}
              sx={{ marginTop: '40px' }}
            />
          </Stack>
          <Stack
            alignItems='center'
            gap='10px'
            sx={{
              width: '600px',
              padding: '40px 75px',
              border: `1px solid ${colors.gray30}`,
              boxSizing: 'border-box',
            }}
          >
            {individualUpload ? <EdiIndividualUploadForm /> : <EdiBatchUploadForm />}

            <Stack
              direction='row'
              justifyContent='center'
              gap='10px'
              sx={{
                width: '100%',
                marginTop: '10px',
              }}
            >
              <MedipandaButton
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
                // onClick={handleSubmit}
                // disabled={!title.trim() || !content.trim() || loading}
                variant='contained'
                size='large'
                color='secondary'
                sx={{
                  width: '160px',
                }}
              >
                {/*{loading ? <CircularProgress size={20} color='inherit' sx={{ mr: 1 }} /> : null}*/}
                등록
              </MedipandaButton>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </>
  );
}

function EdiIndividualUploadForm() {
  return (
    <>
      <Typography variant='heading2B' sx={{ color: colors.gray80 }}>
        실적(EDI) 입력
      </Typography>
      <Stack direction='row' alignItems='center' sx={{ marginTop: '20px', width: '100%' }}>
        <Typography variant='largeTextM' sx={{ color: colors.gray80, width: '120px' }}>
          딜러명
        </Typography>
        <Stack direction='row' alignItems='center' gap='10px'>
          <MedipandaOutlinedInput
            value={'홍길동'}
            sx={{
              width: '212px',
              height: '40px',
              backgroundColor: colors.gray10,
            }}
          />
          <MedipandaButton variant='contained' color='secondary' startIcon={<Add />}>
            딜러추가
          </MedipandaButton>
        </Stack>
      </Stack>
      <Stack direction='row' alignItems='center' sx={{ width: '100%', height: '40px' }}>
        <Typography variant='largeTextM' sx={{ color: colors.gray80, width: '120px' }}>
          정산월
        </Typography>
        <Typography variant='largeTextM' sx={{ color: colors.gray80, width: '330px' }}>
          2025-02
        </Typography>
      </Stack>
      <Stack direction='row' alignItems='center'>
        <Typography variant='largeTextM' sx={{ color: colors.gray80, width: '120px' }}>
          처방월
        </Typography>
        <MpDatePicker
          sx={{
            width: '330px',
            backgroundColor: colors.gray10,
          }}
        />
      </Stack>
      <Stack direction='row' alignItems='center' sx={{ width: '100%' }}>
        <Typography variant='largeTextM' sx={{ color: colors.gray80, width: '120px' }}>
          거래처명
        </Typography>
        <MedipandaOutlinedInput
          value={'명수병원'}
          sx={{
            width: '330px',
            height: '40px',
            backgroundColor: colors.gray10,
          }}
        />
      </Stack>
      <Stack direction='row' alignItems='center'>
        <Typography variant='largeTextM' sx={{ color: colors.gray80, width: '120px' }}>
          파일업로드
        </Typography>
        <Button
          variant='outlined'
          startIcon={<img src='/assets/icons/icon-file-upload.svg' />}
          onClick={() => handleFileUpload()}
          sx={{
            width: '330px',
            height: '40px',
            marginLeft: 'auto',
            borderColor: colors.gray40,
            color: colors.gray50,
          }}
        >
          파일 올리기
        </Button>
      </Stack>
      <Typography variant='smallTextR' sx={{ color: 'red', whiteSpace: 'pre-wrap' }}>
        파일 업로드시 주의사항
        <br />
        1. png, jpg, jpeg, png, pdf파일만 업로드 가능해요.
        <br />
        2. 파일은 최대 5개까지 가능하니, 5개가 초과할 경우에는 '한번에 업로드' 기능을 이용해주세요.
        <br />
        3. 파일명의 처방월이 선택한 처방월과 일치하게 해주세요.
      </Typography>
    </>
  );
}

function EdiBatchUploadForm() {
  return (
    <>
      <Typography variant='heading2B' sx={{ color: colors.gray80 }}>
        실적(EDI) 입력
      </Typography>
      <Stack direction='row' alignItems='center' sx={{ marginTop: '20px' }}>
        <Typography variant='largeTextM' sx={{ color: colors.gray80, width: '120px' }}>
          정산월
        </Typography>
        <MpDatePicker
          sx={{
            width: '330px',
            backgroundColor: colors.gray10,
          }}
        />
      </Stack>
      <Stack direction='row' alignItems='center'>
        <Typography variant='largeTextM' sx={{ color: colors.gray80, width: '120px' }}>
          처방월
        </Typography>
        <MpDatePicker
          sx={{
            width: '330px',
            backgroundColor: colors.gray10,
          }}
        />
      </Stack>
      <Stack direction='row' alignItems='center'>
        <Typography variant='largeTextM' sx={{ color: colors.gray80, width: '120px' }}>
          파일업로드
        </Typography>
        <Button
          variant='outlined'
          startIcon={<img src='/assets/icons/icon-file-upload.svg' />}
          onClick={() => handleFileUpload()}
          sx={{
            width: '330px',
            height: '40px',
            marginLeft: 'auto',
            borderColor: colors.gray40,
            color: colors.gray50,
          }}
        >
          파일 올리기
        </Button>
      </Stack>
      <Typography variant='smallTextR' sx={{ color: 'red', whiteSpace: 'pre-wrap' }}>
        파일 업로드시 주의사항
        <br />
        1. 한번에 업로드시 zip파일로 업로드 해주세요
        <br />
        2. zip 파일 내 각 파일명: 딜러명_거래처명_처방월 (ex. 홍길동_메디판다_202504)으로 저장해주세요
        <br />
        3. png, jpg, jpeg, png, pdf파일만 업로드 가능해요
        <br />
        4. 파일명내에 처방월이 선택한 처방월과 일치하게 해주세요
        <br />
      </Typography>
    </>
  );
}

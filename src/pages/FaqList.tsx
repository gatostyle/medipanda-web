import { Add, Remove, Search } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, Box, InputAdornment, Link, Stack, TextField, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router';
import { type BoardDetailsResponse, type BoardPostResponse, getBoardDetails, getBoards } from '../backend';
import { MedipandaPagination } from '../components/MedipandaPagination.tsx';
import { colors, typography } from '../globalStyles.ts';
import { formatYyyyMmDdHhMm } from '../utils/dateFormat.ts';

export default function FaqList() {
  const [data, setData] = useState<BoardPostResponse[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [expandedDetail, setExpandedDetail] = useState<BoardDetailsResponse | null>(null);

  const formik = useFormik({
    initialValues: {
      searchKeyword: '',
      pageIndex: 0,
      pageSize: 10,
      totalPages: 1,
      expandedId: -1,
    },
    onSubmit: async () => {
      await formik.setFieldValue('expandedId', -1);

      if (formik.values.pageIndex !== 0) {
        await formik.setFieldValue('pageIndex', 0);
      } else {
        await fetchData();
      }
    },
  });

  const fetchData = async () => {
    const response = await getBoards({
      boardType: 'FAQ',
      boardTitle: formik.values.searchKeyword !== '' ? formik.values.searchKeyword : undefined,
      page: formik.values.pageIndex,
      size: formik.values.pageSize,
    });

    setData(response.content);
    setTotalPages(response.totalPages);
  };

  const fetchDetail = async (id: number) => {
    setExpandedDetail(await getBoardDetails(id));
  };

  useEffect(() => {
    fetchData();
  }, [formik.values.pageIndex, formik.values.pageSize]);

  useEffect(() => {
    setExpandedDetail(null);

    if (formik.values.expandedId === -1) {
      return;
    }

    fetchDetail(formik.values.expandedId);
  }, [formik.values.expandedId]);

  return (
    <Stack alignItems='center'>
      <Box sx={{ width: '100%' }}>
        <Typography
          sx={{
            ...typography.heading3M,
            color: colors.gray80,
            mb: '30px',
          }}
        >
          FAQ
        </Typography>
      </Box>
      <Stack
        direction='row'
        component='form'
        onSubmit={formik.handleSubmit}
        sx={{
          width: '100%',
          marginTop: '30px',
        }}
      >
        <TextField
          size='small'
          name='searchKeyword'
          value={formik.values.searchKeyword}
          onChange={formik.handleChange}
          placeholder='궁금한 점을 검색해 보세요.'
          InputProps={{
            endAdornment: (
              <InputAdornment position='end'>
                <Search sx={{ color: colors.gray500 }} />
              </InputAdornment>
            ),
          }}
          sx={{ width: '300px', marginLeft: 'auto' }}
        />
      </Stack>
      <Box sx={{ width: '100%', marginTop: '10px', borderTop: `1px solid ${colors.gray50}` }}>
        {data.map(faq => (
          <Accordion
            key={faq.id}
            expanded={formik.values.expandedId === faq.id && expandedDetail !== null}
            onChange={() => formik.setFieldValue('expandedId', faq.id)}
            sx={{
              boxShadow: 'none',
              '&:before': {
                display: 'none',
              },
            }}
          >
            <AccordionSummary
              sx={{
                '&.Mui-expanded': {
                  minHeight: 'unset',
                },
                '& .MuiAccordionSummary-content.Mui-expanded': {
                  margin: '12px 0',
                },
                borderBottom: `1px solid ${colors.gray30}`,
              }}
            >
              <Stack direction='row' alignItems='center'>
                <Typography sx={{ ...typography.heading4B, color: colors.gray50 }}>Q</Typography>
                <Typography sx={{ ...typography.largeTextB, color: colors.gray80, width: '629px', marginLeft: '20px' }}>
                  {faq.title}
                </Typography>
                <Typography sx={{ ...typography.largeTextR, color: colors.gray50, marginLeft: '20px', marginRight: '20px' }}>
                  {formatYyyyMmDdHhMm(faq.createdAt)}
                </Typography>
                {formik.values.expandedId === faq.id ? <Remove /> : <Add />}
              </Stack>
            </AccordionSummary>
            <AccordionDetails sx={{ marginX: '50px', backgroundColor: colors.gray10 }}>
              {expandedDetail?.attachments && expandedDetail.attachments.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  {expandedDetail.attachments.map((file, index) => (
                    <Link
                      key={index}
                      component={RouterLink}
                      to={file.fileUrl}
                      target='_blank'
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.5,
                        color: colors.primary,
                        textDecoration: 'underline',
                        fontSize: '14px',
                        mb: 1,
                      }}
                    >
                      {new URL(file.fileUrl).pathname.split('/').pop()}
                    </Link>
                  ))}
                </Box>
              )}
              <Typography
                variant='body1'
                sx={{
                  lineHeight: 1.8,
                  color: colors.gray700,
                  whiteSpace: 'pre-line',
                }}
              >
                {expandedDetail?.content}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
      <MedipandaPagination
        count={totalPages}
        page={formik.values.pageIndex + 1}
        showFirstButton
        showLastButton
        onChange={(_, page) => {
          formik.setFieldValue('pageIndex', page - 1);
        }}
        sx={{ marginTop: '40px' }}
      />
    </Stack>
  );
}

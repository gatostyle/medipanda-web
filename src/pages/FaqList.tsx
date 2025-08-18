import { Add, Remove, Search } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, Box, InputAdornment, Link, Stack, TextField, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router';
import { type BoardDetailsResponse, type BoardPostResponse, getBoardDetails, getBoards } from '../backend';
import { MedipandaPagination } from '../custom/components/MedipandaPagination.tsx';
import { colors } from '../custom/globalStyles.ts';
import { formatYyyyMmDdHhMm } from '../utils/dateFormat.ts';

export default function FaqList() {
  const [page, setPage] = useState<BoardPostResponse[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [expandedDetail, setExpandedDetail] = useState<BoardDetailsResponse | null>(null);

  const pageFormik = useFormik({
    initialValues: {
      searchKeyword: '',
      pageIndex: 0,
      pageSize: 10,
      totalPages: 1,
      expandedId: -1,
    },
    onSubmit: async () => {
      await pageFormik.setFieldValue('expandedId', -1);

      if (pageFormik.values.pageIndex !== 0) {
        await pageFormik.setFieldValue('pageIndex', 0);
      } else {
        await fetchPage();
      }
    },
  });

  const fetchPage = async () => {
    const response = await getBoards({
      boardType: 'FAQ',
      boardTitle: pageFormik.values.searchKeyword !== '' ? pageFormik.values.searchKeyword : undefined,
      page: pageFormik.values.pageIndex,
      size: pageFormik.values.pageSize,
    });

    setPage(response.content);
    setTotalPages(response.totalPages);
  };

  const fetchDetail = async (id: number) => {
    setExpandedDetail(await getBoardDetails(id));
  };

  useEffect(() => {
    pageFormik.submitForm();
  }, [pageFormik.values.pageIndex, pageFormik.values.pageSize]);

  useEffect(() => {
    setExpandedDetail(null);

    if (pageFormik.values.expandedId === -1) {
      return;
    }

    fetchDetail(pageFormik.values.expandedId);
  }, [pageFormik.values.expandedId]);

  return (
    <Stack alignItems='center'>
      <Box sx={{ width: '100%' }}>
        <Typography variant='heading3M' sx={{ color: colors.gray80, mb: '30px' }}>
          FAQ
        </Typography>
      </Box>
      <Stack
        direction='row'
        component='form'
        onSubmit={pageFormik.handleSubmit}
        sx={{
          width: '100%',
          marginTop: '30px',
        }}
      >
        <TextField
          size='small'
          name='searchKeyword'
          value={pageFormik.values.searchKeyword}
          onChange={pageFormik.handleChange}
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
        {page.map(faq => (
          <Accordion
            key={faq.id}
            expanded={pageFormik.values.expandedId === faq.id && expandedDetail !== null}
            onChange={() => pageFormik.setFieldValue('expandedId', faq.id)}
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
                <Typography variant='heading4B' sx={{ color: colors.gray50 }}>
                  Q
                </Typography>
                <Typography variant='largeTextB' sx={{ color: colors.gray80, width: '629px', marginLeft: '20px' }}>
                  {faq.title}
                </Typography>
                <Typography variant='largeTextR' sx={{ color: colors.gray50, marginLeft: '20px', marginRight: '20px' }}>
                  {formatYyyyMmDdHhMm(faq.createdAt)}
                </Typography>
                {pageFormik.values.expandedId === faq.id ? <Remove /> : <Add />}
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
        page={pageFormik.values.pageIndex + 1}
        showFirstButton
        showLastButton
        onChange={(_, page) => {
          pageFormik.setFieldValue('pageIndex', page - 1);
        }}
        sx={{ marginTop: '40px' }}
      />
    </Stack>
  );
}

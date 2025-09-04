import { type BoardDetailsResponse, getBoardDetails, getBoards } from '@/backend';
import { MedipandaPagination } from '@/custom/components/MedipandaPagination';
import { useMedipandaEditor } from '@/hooks/useMedipandaEditor';
import { usePageFetchFormik } from '@/lib/react/usePageFetchFormik';
import { colors } from '@/themes';
import { formatYyyyMmDdHhMm } from '@/lib/dateFormat';
import { Add, Remove, Search } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, Box, InputAdornment, Link, Stack, TextField, Typography } from '@mui/material';
import { EditorContent } from '@tiptap/react';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

export default function FaqList() {
  const {
    content: page,
    pageCount: totalPages,
    formik: pageFormik,
  } = usePageFetchFormik({
    initialFormValues: {
      searchKeyword: '',
    },
    fetcher: values => {
      return getBoards({
        boardType: 'FAQ',
        boardTitle: values.searchKeyword !== '' ? values.searchKeyword : undefined,
        page: values.pageIndex,
        size: values.pageSize,
      });
    },
    contentSelector: response => response.content,
    pageCountSelector: response => response.totalPages,
    initialContent: [],
  });

  const [expandedId, setExpandedId] = useState<number>(-1);

  const handleExpand = (id: number | null) => {
    editor.destroy();
    setExpandedId(id ?? -1);
  };

  const [expandedDetail, setExpandedDetail] = useState<BoardDetailsResponse | null>(null);

  useEffect(() => {
    setExpandedDetail(null);

    if (expandedId === -1) {
      return;
    }

    fetchDetail(expandedId);
  }, [expandedId, setExpandedDetail]);

  const fetchDetail = async (id: number) => {
    setExpandedDetail(await getBoardDetails(id));
  };

  const { editor } = useMedipandaEditor();

  useEffect(() => {
    if (expandedDetail === null) {
      return;
    }

    editor.setEditable(false);
    editor.commands.setContent(expandedDetail.content);
  }, [expandedDetail, editor]);

  return (
    <>
      <Box>
        <Typography variant='heading3M' sx={{ color: colors.gray80, marginBottom: '30px' }}>
          FAQ
        </Typography>
      </Box>
      <Stack
        direction='row'
        component='form'
        onSubmit={pageFormik.handleSubmit}
        sx={{
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
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ width: '300px', marginLeft: 'auto' }}
        />
      </Stack>
      <Box sx={{ marginTop: '10px', borderTop: `1px solid ${colors.gray50}` }}>
        {page.map(faq => (
          <Accordion
            key={faq.id}
            expanded={expandedId === faq.id && expandedDetail !== null}
            onChange={(_, expanded) => handleExpand(expanded ? faq.id : null)}
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
                <Typography variant='largeTextR' sx={{ color: colors.gray50, marginLeft: '20px' }}>
                  {formatYyyyMmDdHhMm(faq.createdAt)}
                </Typography>
                {expandedId === faq.id ? <Remove sx={{ marginLeft: '20px' }} /> : <Add sx={{ marginLeft: '20px' }} />}
              </Stack>
            </AccordionSummary>
            <AccordionDetails sx={{ marginX: '50px', backgroundColor: colors.gray10 }}>
              {expandedId === faq.id && expandedDetail !== null && (
                <>
                  {expandedDetail?.attachments && expandedDetail.attachments.length > 0 && (
                    <Box sx={{ marginBottom: 2 }}>
                      {expandedDetail.attachments.map(file => (
                        <Link
                          key={file.s3fileId}
                          underline='hover'
                          component={RouterLink}
                          to={file.fileUrl}
                          target='_blank'
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.5,
                            color: colors.gray80,
                            '&:hover': {
                              color: colors.vividViolet,
                            },
                            fontSize: '14px',
                            marginBottom: 1,
                          }}
                        >
                          {file.originalFileName}
                        </Link>
                      ))}
                    </Box>
                  )}
                  <EditorContent editor={editor} />
                </>
              )}
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
        sx={{
          alignSelf: 'center',
          marginTop: '40px',
        }}
      />
    </>
  );
}

import { type BoardDetailsResponse, type BoardPostResponse, BoardType, getBoardDetails, getBoards } from '@/backend';
import { MedipandaPagination } from '@/custom/components/MedipandaPagination';
import { useMedipandaEditor } from '@/hooks/useMedipandaEditor';
import { useSearchParamsOrDefault } from '@/lib/hooks/useSearchParamsOrDefault';
import { setUrlParams } from '@/lib/utils/url';
import { colors } from '@/themes';
import { DateUtils, DATEFORMAT_YYYY_MM_DD_HH_MM } from '@/lib/utils/dateFormat';
import { Add, Remove, Search } from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  InputAdornment,
  Link,
  PaginationItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { EditorContent } from '@tiptap/react';
import { useEffect, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import type { RequiredDeep } from 'type-fest';

export default function FaqList() {
  const navigate = useNavigate();

  const [contents, setContents] = useState<BoardPostResponse[]>([]);
  const [totalPages, setTotalPages] = useState(0);

  const initialSearchParams = {
    searchType: 'boardTitle' as 'userId' | 'name' | 'nickname' | 'boardTitle' | 'drugCompany' | 'myUserId',
    searchKeyword: '',
    page: '1',
  };

  const { searchType, searchKeyword, page: paramPage } = useSearchParamsOrDefault(initialSearchParams);
  const page = Number(paramPage);
  const pageSize = 10;

  const form = useForm({
    defaultValues: {
      ...initialSearchParams,
    },
  });

  const submitHandler: SubmitHandler<RequiredDeep<(typeof form)['control']['_defaultValues']>> = async values => {
    console.log({ values });
    const url = setUrlParams(
      {
        ...values,
        page: 1,
      },
      initialSearchParams,
    );

    navigate(url);
  };

  const fetchContents = async () => {
    try {
      const response = await getBoards({
        boardType: BoardType.FAQ,
        [searchType]: searchKeyword,
        page: page - 1,
        size: pageSize,
      });

      setContents(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch FAQ list:', error);
      alert('FAQ 목록을 불러오는 중 오류가 발생했습니다.');
      setContents([]);
      setTotalPages(0);
    }
  };

  useEffect(() => {
    form.setValue('searchType', searchType);
    form.setValue('searchKeyword', searchKeyword);
    fetchContents();
  }, [searchType, searchKeyword, page]);

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
        onSubmit={form.handleSubmit(submitHandler)}
        sx={{
          marginTop: '30px',
        }}
      >
        <Controller
          control={form.control}
          name={'searchKeyword'}
          render={({ field }) => (
            <TextField
              {...field}
              size='small'
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
          )}
        />
      </Stack>
      <Box sx={{ marginTop: '10px', borderTop: `1px solid ${colors.gray50}` }}>
        {contents.map(faq => (
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
                  {DateUtils.parseUtcAndFormatKst(faq.createdAt, DATEFORMAT_YYYY_MM_DD_HH_MM)}
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
        page={page}
        showFirstButton
        showLastButton
        renderItem={item => <PaginationItem {...item} component={RouterLink} to={setUrlParams({ page: item.page }, initialSearchParams)} />}
        sx={{
          alignSelf: 'center',
          marginTop: '40px',
        }}
      />
    </>
  );
}

import { Add, Remove, Search } from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  IconButton,
  InputAdornment,
  Link,
  Pagination,
  TextField,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useState } from 'react';

const StyledAccordion = styled(Accordion)({
  boxShadow: 'none',
  border: '1px solid #e0e0e0',
  borderRadius: '8px !important',
  marginBottom: '8px',
  '&:before': {
    display: 'none',
  },
  '&.Mui-expanded': {
    margin: '0 0 8px 0',
  },
});

const StyledAccordionSummary = styled(AccordionSummary)({
  padding: '16px 24px',
  minHeight: '60px',
  '&.Mui-expanded': {
    minHeight: '60px',
  },
  '& .MuiAccordionSummary-content': {
    margin: '12px 0',
    alignItems: 'center',
    '&.Mui-expanded': {
      margin: '12px 0',
    },
  },
});

const StyledAccordionDetails = styled(AccordionDetails)({
  padding: '0 24px 24px 24px',
  borderTop: '1px solid #f0f0f0',
});

const mockFaqs = [
  {
    id: 1,
    question: 'EDI 처방 가이드',
    answer: 'EDI 처방에 대해서 질문내역을 안내드립니다. 다른 문의는 1:1 문의로 요청하십니다.\n감사합니다.',
    createdAt: '2025-05-08 10:36',
    attachments: [
      {
        fileName: '엑셀파일.xls',
        fileUrl: '/mock-excel-file.xls',
      },
    ],
  },
  {
    id: 2,
    question: '정산 가이드',
    answer: '정산 관련 가이드 내용입니다.',
    createdAt: '2025-05-08 10:36',
    attachments: [],
  },
  {
    id: 3,
    question: '커뮤니티 익명 변경 예정',
    answer: '커뮤니티 익명 변경에 대한 안내사항입니다.',
    createdAt: '2025-05-08 10:36',
    attachments: [],
  },
  {
    id: 4,
    question: '정산 가이드',
    answer: '정산 가이드 내용입니다.',
    createdAt: '2025-05-08 10:36',
    attachments: [],
  },
  {
    id: 5,
    question: 'EDI 처방 가이드',
    answer: 'EDI 처방 가이드 내용입니다.',
    createdAt: '2025-05-08 10:36',
    attachments: [],
  },
  {
    id: 6,
    question: 'EDI 처방 가이드',
    answer: 'EDI 처방 가이드 내용입니다.',
    createdAt: '2025-05-08 10:36',
    attachments: [],
  },
  {
    id: 7,
    question: 'EDI 처방 가이드',
    answer: 'EDI 처방 가이드 내용입니다.',
    createdAt: '2025-05-08 10:36',
    attachments: [],
  },
  {
    id: 8,
    question: 'EDI 처방 가이드',
    answer: 'EDI 처방 가이드 내용입니다.',
    createdAt: '2025-05-08 10:36',
    attachments: [],
  },
];

export default function FaqList() {
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleChange = (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant='h5' sx={{ fontWeight: 'bold', color: '#333' }}>
          FAQ
        </Typography>
        <TextField
          placeholder='궁금한 질문 검색어 보세요'
          size='small'
          sx={{ width: '300px' }}
          InputProps={{
            endAdornment: (
              <InputAdornment position='end'>
                <Search sx={{ color: '#999' }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Box sx={{ mb: 4 }}>
        {mockFaqs.map(faq => (
          <StyledAccordion key={faq.id} expanded={expanded === `panel${faq.id}`} onChange={handleChange(`panel${faq.id}`)}>
            <StyledAccordionSummary>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Typography
                  sx={{
                    fontSize: '16px',
                    fontWeight: 500,
                    color: '#333',
                    flexGrow: 1,
                  }}
                >
                  Q {faq.question}
                </Typography>
                <Typography variant='body2' sx={{ color: '#999', mr: 2, fontSize: '13px' }}>
                  {faq.createdAt}
                </Typography>
                <IconButton size='small' sx={{ color: '#666' }}>
                  {expanded === `panel${faq.id}` ? <Remove /> : <Add />}
                </IconButton>
              </Box>
            </StyledAccordionSummary>
            <StyledAccordionDetails>
              {faq.attachments && faq.attachments.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  {faq.attachments.map((file, index) => (
                    <Link
                      key={index}
                      href={file.fileUrl}
                      download
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.5,
                        color: '#6B3AA0',
                        textDecoration: 'underline',
                        fontSize: '14px',
                        mb: 1,
                      }}
                    >
                      {file.fileName}
                    </Link>
                  ))}
                </Box>
              )}
              <Typography
                variant='body1'
                sx={{
                  lineHeight: 1.8,
                  color: '#333',
                  whiteSpace: 'pre-line',
                }}
              >
                {faq.answer}
              </Typography>
            </StyledAccordionDetails>
          </StyledAccordion>
        ))}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Pagination
          count={10}
          page={1}
          showFirstButton
          showLastButton
          sx={{
            '& .MuiPaginationItem-root': {
              fontSize: '14px',
            },
            '& .Mui-selected': {
              backgroundColor: '#6B3AA0 !important',
              color: '#fff',
            },
          }}
        />
      </Box>
    </Box>
  );
}

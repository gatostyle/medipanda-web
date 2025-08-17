import { KeyboardArrowRight } from '@mui/icons-material';
import { Box, Button, Stack, Table, TableBody, TableHead, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router';
import { type BoardPostResponse, getBoards } from '../backend';
import { LazyImage } from '../components/LazyImage.tsx';
import { MedipandaTableCell, MedipandaTableRow } from '../components/MedipandaTable.tsx';
import { colors, typography } from '../globalStyles.ts';
import { formatYyyyMmDd } from '../utils/dateFormat.ts';
import { type Sequenced, withSequence } from '../utils/withSequence.ts';

export default function Home() {
  const [data, setData] = useState<Sequenced<BoardPostResponse>[]>([]);

  const formik = useFormik({
    initialValues: {
      boardType: 'ANONYMOUS' as 'ANONYMOUS' | 'MR_CSO_MATCHING',
      pageIndex: 0,
      pageSize: 10,
      totalPages: 1,
    },
    onSubmit: async () => {
      if (formik.values.pageIndex !== 0) {
        await formik.setFieldValue('pageIndex', 0);
      } else {
        await fetchData();
      }
    },
  });

  const fetchData = async () => {
    const response = await getBoards({
      boardType: formik.values.boardType,
      page: formik.values.pageIndex,
      size: formik.values.pageSize,
    });

    setData(withSequence(response).content);
  };

  useEffect(() => {
    fetchData();
  }, [formik.values.boardType]);

  return (
    <Box>
      <Box sx={{ mb: '32px' }}>
        <LazyImage
          src='/assets/hero.svg'
          alt='Hero Section'
          style={{
            width: '100%',
            height: 'auto',
            borderRadius: '16px',
            display: 'block',
          }}
        />
      </Box>

      <Stack direction='row' alignItems='center' gap='20px' sx={{ mb: 0 }}>
        <Box>
          <RouterLink to='/partnership'>
            <LazyImage
              src='/assets/banner-fixed.svg'
              alt='Banner Fixed'
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'block',
              }}
            />
          </RouterLink>
        </Box>
        <Box>
          <RouterLink to='/sales-agency-products'>
            <LazyImage
              src='/assets/banner-rolling.svg'
              alt='Banner Rolling'
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'block',
              }}
            />
          </RouterLink>
        </Box>
      </Stack>

      <Stack
        direction='row'
        alignItems='center'
        sx={{
          width: '100%',
          marginTop: '40px',
        }}
      >
        <Button
          variant='text'
          onClick={() => formik.setFieldValue('boardType', 'ANONYMOUS')}
          sx={{
            ...typography.heading4B,
            color: formik.values.boardType === 'ANONYMOUS' ? colors.gray80 : colors.gray40,
          }}
        >
          익명게시판
        </Button>
        <Button
          variant='text'
          onClick={() => formik.setFieldValue('boardType', 'MR_CSO_MATCHING')}
          sx={{
            ...typography.heading4B,
            color: formik.values.boardType === 'MR_CSO_MATCHING' ? colors.gray80 : colors.gray40,
            marginLeft: '30px',
          }}
        >
          MR-CSO매칭
        </Button>
        <Button
          variant='contained'
          startIcon={<img src='/assets/icons/icon-pen.svg' />}
          sx={{
            backgroundColor: colors.vividViolet,
            marginLeft: 'auto',
          }}
        >
          글쓰기
        </Button>
        <Button
          variant='outlined'
          endIcon={<KeyboardArrowRight />}
          component={RouterLink}
          to={formik.values.boardType === 'ANONYMOUS' ? '/community/anonymous' : '/community/mr-cso-matching'}
          sx={{
            borderColor: colors.vividViolet,
            color: colors.vividViolet,
            marginLeft: '10px',
          }}
        >
          더보기
        </Button>
      </Stack>

      <Table sx={{ marginTop: '15px' }}>
        <TableHead>
          <MedipandaTableRow>
            <MedipandaTableCell sx={{ width: '80px' }}>No</MedipandaTableCell>
            <MedipandaTableCell sx={{ width: 'auto' }}>제목</MedipandaTableCell>
            <MedipandaTableCell sx={{ width: '100px' }}>댓글</MedipandaTableCell>
            <MedipandaTableCell sx={{ width: '100px' }}>추천수</MedipandaTableCell>
            <MedipandaTableCell sx={{ width: '120px' }}>작성자</MedipandaTableCell>
            <MedipandaTableCell sx={{ width: '100px' }}>등록일</MedipandaTableCell>
            <MedipandaTableCell sx={{ width: '100px' }}>조회수</MedipandaTableCell>
          </MedipandaTableRow>
        </TableHead>
        <TableBody>
          {data.map((post, index) => (
            <MedipandaTableRow
              key={post.id}
              sx={{
                '&:last-child td': { borderBottom: 'none' },
              }}
            >
              <MedipandaTableCell>{index + 1}</MedipandaTableCell>
              <MedipandaTableCell sx={{ textAlign: 'left' }}>
                <Typography
                  component={RouterLink}
                  to={`/community/anonymous/${post.id}`}
                  sx={{
                    textDecoration: 'none',
                    color: colors.gray700,
                    fontSize: '14px',
                    '&:hover': { textDecoration: 'underline', color: colors.primary },
                  }}
                >
                  {post.title}
                </Typography>
              </MedipandaTableCell>
              <MedipandaTableCell>{post.commentCount}개</MedipandaTableCell>
              <MedipandaTableCell>{post.likesCount.toLocaleString()}</MedipandaTableCell>
              <MedipandaTableCell>{post.nickname}</MedipandaTableCell>
              <MedipandaTableCell>{formatYyyyMmDd(post.createdAt)}</MedipandaTableCell>
              <MedipandaTableCell>{post.viewsCount.toLocaleString()}</MedipandaTableCell>
            </MedipandaTableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}

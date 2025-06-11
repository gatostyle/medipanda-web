import { useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import RadioGroup from '@mui/material/RadioGroup';
import Radio from '@mui/material/Radio';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import Pagination from '@mui/material/Pagination';
import { MpBoard, MpBoardSearchRequestExtended, mpFetchBoardList, mpDeleteBoard } from 'api-definitions/MpBoard';
import { useMpDeleteDialog } from 'hooks/medipanda/useMpDeleteDialog';
import { MpWithSequence } from 'api-definitions/MpPaged';
import { Link } from 'react-router-dom';

export default function MpAdminCustomerCenterFaqList() {
  const [data, setData] = useState<MpWithSequence<MpBoard>[]>([]);
  const [, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const deleteDialog = useMpDeleteDialog();

  const [visibility, setVisibility] = useState<boolean | undefined>(undefined);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [startAt, setStartAt] = useState<string>('');
  const [endAt, setEndAt] = useState<string>('');

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20
  });

  const columns = useMemo<ColumnDef<MpWithSequence<MpBoard>>[]>(
    () => [
      {
        id: 'select',
        header: () => (
          <input
            type="checkbox"
            checked={selectedItems.length === data.length && data.length > 0}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedItems(data.map((item) => item.id));
              } else {
                setSelectedItems([]);
              }
            }}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={selectedItems.includes(row.original.id)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedItems((prev) => [...prev, row.original.id]);
              } else {
                setSelectedItems((prev) => prev.filter((id) => id !== row.original.id));
              }
            }}
          />
        ),
        size: 50
      },
      {
        header: 'No',
        accessorKey: 'sequence',
        size: 80
      },
      {
        header: '제목',
        accessorKey: 'title',
        cell: ({ getValue, row }) => (
          <Link to={`/admin/customer-center/faq/${row.original.id}`} style={{ textDecoration: 'none', color: 'primary.main' }}>
            {getValue() as string}
          </Link>
        )
      },
      {
        header: '상태',
        accessorKey: 'isBlind',
        cell: ({ getValue }) => {
          const isBlind = getValue() as boolean;
          return <Chip label={isBlind ? '미노출' : '노출'} color={isBlind ? 'default' : 'success'} variant="light" size="small" />;
        },
        size: 100
      },
      {
        header: '조회 수',
        accessorKey: 'viewsCount',
        size: 100
      },
      {
        header: '작성일',
        accessorKey: 'createdAt',
        size: 120
      }
    ],
    [data, selectedItems]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      pagination
    },
    onPaginationChange: setPagination,
    pageCount: totalPages,
    manualPagination: true
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const request: MpBoardSearchRequestExtended = {
        page: pagination.pageIndex,
        size: pagination.pageSize,
        boardType: 'FAQ',
        visibility: visibility,
        searchKeyword: searchKeyword || undefined,
        startAt: startAt || undefined,
        endAt: endAt || undefined
      };

      const response = await mpFetchBoardList(request);
      setData(response.content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch FAQ list:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pagination.pageIndex, pagination.pageSize]);

  const handleSearch = () => {
    setPagination({ ...pagination, pageIndex: 0 });
    fetchData();
  };

  const handleReset = () => {
    setVisibility(undefined);
    setSearchKeyword('');
    setStartAt('');
    setEndAt('');
    setPagination({ ...pagination, pageIndex: 0 });
  };

  const handleDelete = () => {
    const count = selectedItems.length;
    const message =
      count === 1
        ? `FAQ ${data.find((item) => item.id === selectedItems[0])?.title}을 삭제하시겠습니까?`
        : `${count}건이 선택되었습니다. 삭제하시겠습니까?`;

    deleteDialog.open({
      message,
      onConfirm: async () => {
        try {
          await Promise.all(selectedItems.map((id) => mpDeleteBoard(id)));
          setSelectedItems([]);
          fetchData(); // Refresh the list
        } catch (error) {
          console.error('Failed to delete items:', error);
        }
      }
    });
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          FAQ
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <MainCard content={false}>
          <Box sx={{ p: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={3}>
                <FormControl component="fieldset">
                  <RadioGroup
                    row
                    value={visibility === undefined ? '전체' : visibility ? '노출' : '미노출'}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '전체') {
                        setVisibility(undefined);
                      } else if (value === '노출') {
                        setVisibility(true);
                      } else {
                        setVisibility(false);
                      }
                    }}
                  >
                    <FormControlLabel value="전체" control={<Radio size="small" />} label="전체" />
                    <FormControlLabel value="노출" control={<Radio size="small" />} label="노출" />
                    <FormControlLabel value="미노출" control={<Radio size="small" />} label="미노출" />
                  </RadioGroup>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField
                  size="small"
                  type="date"
                  label="시작일"
                  value={startAt}
                  onChange={(e) => setStartAt(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField
                  size="small"
                  type="date"
                  label="종료일"
                  value={endAt}
                  onChange={(e) => setEndAt(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  size="small"
                  placeholder="검색어를 입력하세요"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <Stack direction="row" spacing={1}>
                  <Button variant="contained" size="small" onClick={handleSearch}>
                    검색
                  </Button>
                  <Button variant="outlined" size="small" onClick={handleReset}>
                    초기화
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </MainCard>
      </Grid>

      <Grid item xs={12}>
        <MainCard content={false}>
          <Box sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1">검색결과: {totalElements.toLocaleString()} 건</Typography>
              <Stack direction="row" spacing={1}>
                <Button variant="contained" color="error" size="small" disabled={selectedItems.length === 0} onClick={handleDelete}>
                  삭제
                </Button>
                <Button variant="outlined" size="small" component={Link} to="/admin/customer-center/faq/new">
                  등록하기
                </Button>
              </Stack>
            </Stack>

            <ScrollX>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableCell key={header.id} style={{ width: header.getSize() }}>
                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableHead>
                  <TableBody>
                    {table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </ScrollX>

            <Stack direction="row" justifyContent="center" sx={{ mt: 2 }}>
              <Pagination
                count={totalPages}
                page={pagination.pageIndex + 1}
                onChange={(event, value) => {
                  setPagination({ ...pagination, pageIndex: value - 1 });
                }}
                color="primary"
                variant="outlined"
                showFirstButton
                showLastButton
              />
            </Stack>
          </Box>
        </MainCard>
      </Grid>
    </Grid>
  );
}

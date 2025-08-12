import AttachFileIcon from '@mui/icons-material/AttachFile';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import { ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import { useFormik } from 'formik';
import { NotImplementedError } from 'medipanda/api-definitions/NotImplementedError';
import { DateTimeString, getHospitals, HospitalResponse, softDeleteHospital, uploadHospitalExcel } from 'medipanda/backend';
import MpFormikDatePicker from 'medipanda/components/MpFormikDatePicker';
import { SearchFilterActions, SearchFilterBar, SearchFilterItem } from 'medipanda/components/SearchFilterBar';
import { useMpDeleteDialog } from 'medipanda/hooks/useMpDeleteDialog';
import { useMpErrorDialog } from 'medipanda/hooks/useMpErrorDialog';
import { useMpInfoDialog } from 'medipanda/hooks/useMpInfoDialog';
import { useMpNotImplementedDialog } from 'medipanda/hooks/useMpNotImplementedDialog';
import { formatYyyyMmDd } from 'medipanda/utils/dateFormat';
import { Sequenced, withSequence } from 'medipanda/utils/withSequence';
import { useEffect, useState } from 'react';

export default function MpAdminHospitalList() {
  const [data, setData] = useState<Sequenced<HospitalResponse>[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [excelUploadDialogOpen, setExcelUploadDialogOpen] = useState(false);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const notImplementedDialog = useMpNotImplementedDialog();
  const errorDialog = useMpErrorDialog();
  const infoDialog = useMpInfoDialog();
  const deleteDialog = useMpDeleteDialog();

  const formik = useFormik({
    initialValues: {
      sido: '',
      sigungu: '',
      searchKeyword: '',
      startAt: null as Date | null,
      endAt: null as Date | null,
      pageIndex: 0,
      pageSize: 20
    },
    onSubmit: async () => {
      if (formik.values.pageIndex !== 0) {
        await formik.setFieldValue('pageIndex', 0);
      } else {
        await fetchData();
      }
    }
  });

  const handleReset = () => {
    formik.resetForm();
  };

  const handleExcelUpload = async () => {
    if (!excelFile) {
      infoDialog.showInfo('업로드할 파일을 선택해주세요.');
      return;
    }

    try {
      await uploadHospitalExcel({ file: excelFile });
      infoDialog.showInfo('엑셀 업로드가 완료되었습니다.');
      setExcelUploadDialogOpen(false);
      setExcelFile(null);
      fetchData();
    } catch (error) {
      if (error instanceof NotImplementedError) {
        notImplementedDialog.open(error.message);
      } else {
        console.error('Failed to upload excel:', error);
        errorDialog.showError('엑셀 업로드 중 오류가 발생했습니다.');
      }
    }
  };

  const handleDeleteSelected = () => {
    if (selectedItems.length === 0) {
      infoDialog.showInfo('삭제할 항목을 선택해주세요.');
      return;
    }

    const count = selectedItems.length;
    const message = count === 1 ? '선택한 개원병원을 삭제하시겠습니까?' : `${count}건이 선택되었습니다. 삭제하시겠습니까?`;

    deleteDialog.open({
      message,
      onConfirm: async () => {
        try {
          await Promise.all(selectedItems.map((id) => softDeleteHospital(id)));
          infoDialog.showInfo('삭제가 완료되었습니다.');
          setSelectedItems([]);
          fetchData();
        } catch (error) {
          if (error instanceof NotImplementedError) {
            notImplementedDialog.open(error.message);
          } else {
            console.error('Failed to delete hospitals:', error);
            errorDialog.showError('개원병원 삭제 중 오류가 발생했습니다.');
          }
        }
      }
    });
  };

  const columns: ColumnDef<Sequenced<HospitalResponse>>[] = [
    {
      id: 'select',
      header: () => (
        <Checkbox
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
        <Checkbox
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
      size: 60
    },
    {
      header: 'No',
      accessorKey: 'sequence',
      cell: ({ row }) => row.original.sequence,
      size: 60
    },
    {
      header: '지역',
      accessorKey: 'sido',
      cell: ({ row }) => {
        const value = row.original.sido;
        const sidoMap: Record<string, string> = {
          SEOUL: '서울',
          GYEONGGI: '경기',
          INCHEON: '인천',
          BUSAN: '부산',
          DAEGU: '대구',
          DAEJEON: '대전',
          GWANGJU: '광주',
          ULSAN: '울산',
          SEJONG: '세종',
          GANGWON: '강원',
          CHUNGBUK: '충북',
          CHUNGNAM: '충남',
          JEONBUK: '전북',
          JEONNAM: '전남',
          GYEONGBUK: '경북',
          GYEONGNAM: '경남',
          JEJU: '제주'
        };
        return sidoMap[value] ?? value;
      },
      size: 80
    },
    {
      header: '병의원명',
      accessorKey: 'name',
      cell: ({ row }) => row.original.name,
      size: 200
    },
    {
      header: '주소',
      accessorKey: 'address',
      cell: ({ row }) => row.original.address,
      size: 400
    },
    {
      header: '허가예정일',
      accessorKey: 'scheduledOpenDate',
      cell: ({ row }) => {
        const value = row.original.scheduledOpenDate;

        return value !== null ? formatYyyyMmDd(value) : '-';
      },
      size: 120
    },
    {
      header: '분류',
      accessorKey: 'source',
      cell: ({ row }) => row.original.source,
      size: 120
    }
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      pagination: {
        pageIndex: formik.values.pageIndex,
        pageSize: formik.values.pageSize
      }
    },
    pageCount: totalPages,
    manualPagination: true
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getHospitals({
        page: formik.values.pageIndex,
        size: formik.values.pageSize,
        sido: formik.values.sido !== '' ? formik.values.sido : undefined,
        sigungu: formik.values.sigungu !== '' ? formik.values.sigungu : undefined,
        // searchKeyword: formik.values.searchKeyword !== '' ? formik.values.searchKeyword : undefined,
        startDate: formik.values.startAt ? new DateTimeString(formik.values.startAt) : undefined,
        endDate: formik.values.endAt ? new DateTimeString(formik.values.endAt) : undefined
      });
      setData(withSequence(response).content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch hospital list:', error);
      setData([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [formik.values.pageIndex, formik.values.pageSize]);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          개원병원페이지
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <MainCard content={false}>
          <Box sx={{ p: 3 }}>
            <form onSubmit={formik.handleSubmit}>
              <SearchFilterBar>
                <SearchFilterItem minWidth={140}>
                  <FormControl fullWidth size="small">
                    <InputLabel>시/도</InputLabel>
                    <Select name="sido" label="시/도" value={formik.values.sido} onChange={formik.handleChange}>
                      <MenuItem value="SEOUL">서울</MenuItem>
                      <MenuItem value="GYEONGGI">경기</MenuItem>
                      <MenuItem value="INCHEON">인천</MenuItem>
                      <MenuItem value="BUSAN">부산</MenuItem>
                      <MenuItem value="DAEGU">대구</MenuItem>
                      <MenuItem value="DAEJEON">대전</MenuItem>
                      <MenuItem value="GWANGJU">광주</MenuItem>
                      <MenuItem value="ULSAN">울산</MenuItem>
                      <MenuItem value="SEJONG">세종</MenuItem>
                      <MenuItem value="GANGWON">강원</MenuItem>
                      <MenuItem value="CHUNGBUK">충북</MenuItem>
                      <MenuItem value="CHUNGNAM">충남</MenuItem>
                      <MenuItem value="JEONBUK">전북</MenuItem>
                      <MenuItem value="JEONNAM">전남</MenuItem>
                      <MenuItem value="GYEONGBUK">경북</MenuItem>
                      <MenuItem value="GYEONGNAM">경남</MenuItem>
                      <MenuItem value="JEJU">제주</MenuItem>
                    </Select>
                  </FormControl>
                </SearchFilterItem>
                <SearchFilterItem minWidth={140}>
                  <FormControl fullWidth size="small">
                    <InputLabel>시/군/구</InputLabel>
                    <Select name="sigungu" label="시/군/구" value={formik.values.sigungu} onChange={formik.handleChange}>
                      {formik.values.sido === 'SEOUL' && (
                        <>
                          <MenuItem value="gangnam">강남구</MenuItem>
                          <MenuItem value="gangdong">강동구</MenuItem>
                          <MenuItem value="gangbuk">강북구</MenuItem>
                          <MenuItem value="gangseo">강서구</MenuItem>
                          <MenuItem value="gwanak">관악구</MenuItem>
                          <MenuItem value="gwangjin">광진구</MenuItem>
                          <MenuItem value="guro">구로구</MenuItem>
                          <MenuItem value="geumcheon">금천구</MenuItem>
                          <MenuItem value="nowon">노원구</MenuItem>
                          <MenuItem value="dobong">도봉구</MenuItem>
                          <MenuItem value="dongdaemun">동대문구</MenuItem>
                          <MenuItem value="dongjak">동작구</MenuItem>
                          <MenuItem value="mapo">마포구</MenuItem>
                          <MenuItem value="seodaemun">서대문구</MenuItem>
                          <MenuItem value="seocho">서초구</MenuItem>
                          <MenuItem value="seongdong">성동구</MenuItem>
                          <MenuItem value="seongbuk">성북구</MenuItem>
                          <MenuItem value="songpa">송파구</MenuItem>
                          <MenuItem value="yangcheon">양천구</MenuItem>
                          <MenuItem value="yeongdeungpo">영등포구</MenuItem>
                          <MenuItem value="yongsan">용산구</MenuItem>
                          <MenuItem value="eunpyeong">은평구</MenuItem>
                          <MenuItem value="jongno">종로구</MenuItem>
                          <MenuItem value="jung">중구</MenuItem>
                          <MenuItem value="jungnang">중랑구</MenuItem>
                        </>
                      )}
                      {formik.values.sido === 'GYEONGGI' && (
                        <>
                          <MenuItem value="goyang">고양시</MenuItem>
                          <MenuItem value="suwon">수원시</MenuItem>
                          <MenuItem value="seongnam">성남시</MenuItem>
                          <MenuItem value="yongin">용인시</MenuItem>
                          <MenuItem value="bucheon">부천시</MenuItem>
                          <MenuItem value="ansan">안산시</MenuItem>
                          <MenuItem value="anyang">안양시</MenuItem>
                          <MenuItem value="namyangju">남양주시</MenuItem>
                          <MenuItem value="hwaseong">화성시</MenuItem>
                          <MenuItem value="pyeongtaek">평택시</MenuItem>
                          <MenuItem value="uijeongbu">의정부시</MenuItem>
                          <MenuItem value="siheung">시흥시</MenuItem>
                          <MenuItem value="paju">파주시</MenuItem>
                          <MenuItem value="gimpo">김포시</MenuItem>
                          <MenuItem value="gwangmyeong">광명시</MenuItem>
                          <MenuItem value="gwangju">광주시</MenuItem>
                          <MenuItem value="gunpo">군포시</MenuItem>
                          <MenuItem value="hanam">하남시</MenuItem>
                          <MenuItem value="osan">오산시</MenuItem>
                          <MenuItem value="icheon">이천시</MenuItem>
                          <MenuItem value="anseong">안성시</MenuItem>
                          <MenuItem value="uiwang">의왕시</MenuItem>
                          <MenuItem value="yangju">양주시</MenuItem>
                          <MenuItem value="yeoju">여주시</MenuItem>
                          <MenuItem value="gwacheon">과천시</MenuItem>
                          <MenuItem value="guri">구리시</MenuItem>
                          <MenuItem value="pocheon">포천시</MenuItem>
                          <MenuItem value="dongducheon">동두천시</MenuItem>
                          <MenuItem value="gapyeong">가평군</MenuItem>
                          <MenuItem value="yangpyeong">양평군</MenuItem>
                          <MenuItem value="yeoncheon">연천군</MenuItem>
                        </>
                      )}
                    </Select>
                  </FormControl>
                </SearchFilterItem>
                <SearchFilterItem minWidth={140}>
                  <MpFormikDatePicker name="startAt" label="시작일" formik={formik} />
                </SearchFilterItem>
                <SearchFilterItem minWidth={140}>
                  <MpFormikDatePicker name="endAt" label="종료일" formik={formik} />
                </SearchFilterItem>
                <SearchFilterItem flexGrow={1} minWidth={200}>
                  <TextField
                    name="searchKeyword"
                    size="small"
                    placeholder="검색어를 입력하세요"
                    fullWidth
                    value={formik.values.searchKeyword}
                    onChange={formik.handleChange}
                  />
                </SearchFilterItem>
                <SearchFilterActions>
                  <Button variant="contained" size="small" type="submit">
                    검색
                  </Button>
                  <Button variant="outlined" size="small" onClick={handleReset}>
                    초기화
                  </Button>
                </SearchFilterActions>
              </SearchFilterBar>
            </form>
          </Box>
        </MainCard>
      </Grid>

      <Grid item xs={12}>
        <MainCard content={false}>
          <Box sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Stack direction="row" spacing={2}>
                <Typography variant="subtitle1">검색결과: {totalElements.toLocaleString()} 건</Typography>
              </Stack>
              <Stack direction="row" spacing={1}>
                <Button variant="contained" color="success" size="small" onClick={() => setExcelUploadDialogOpen(true)}>
                  엑셀업로드
                </Button>
                <Button variant="contained" color="error" size="small" onClick={handleDeleteSelected} disabled={selectedItems.length === 0}>
                  삭제
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
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={columns.length} align="center" sx={{ py: 3 }}>
                          <Typography variant="body2" color="text.secondary">
                            데이터를 로드하는 중입니다.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : table.getRowModel().rows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={columns.length} align="center" sx={{ py: 3 }}>
                          <Typography variant="body2" color="text.secondary">
                            검색 결과가 없습니다.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      table.getRowModel().rows.map((row) => (
                        <TableRow key={row.id}>
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                          ))}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </ScrollX>

            <Stack direction="row" justifyContent="center" sx={{ mt: 2 }}>
              <Pagination
                count={totalPages}
                page={formik.values.pageIndex + 1}
                onChange={(_, value) => formik.setFieldValue('pageIndex', value - 1)}
                color="primary"
                variant="outlined"
                showFirstButton
                showLastButton
              />
            </Stack>
          </Box>
        </MainCard>
      </Grid>

      <Dialog open={excelUploadDialogOpen} onClose={() => setExcelUploadDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>개원병원정보 업로드</DialogTitle>
        <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
          <Button
            href={import.meta.env.VITE_APP_URL_FILE_HOSPITAL}
            target="_blank"
            variant="contained"
            color="success"
            size="small"
            startIcon={<AttachFileIcon />}
            sx={{ position: 'relative' }}
          >
            양식 다운로드
          </Button>
        </Box>
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          <Button variant="contained" color="success" component="label" startIcon={<AttachFileIcon />} sx={{ px: 4, py: 2 }}>
            파일
            <input
              type="file"
              hidden
              accept=".xlsx,.xls"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setExcelFile(file);
                }
              }}
            />
          </Button>
          {excelFile && (
            <Typography variant="body2" sx={{ mt: 2 }}>
              선택된 파일: {excelFile.name}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            variant="contained"
            color="inherit"
            onClick={() => {
              setExcelUploadDialogOpen(false);
              setExcelFile(null);
            }}
            sx={{ px: 4 }}
          >
            취소
          </Button>
          <Button variant="contained" color="success" onClick={handleExcelUpload} disabled={!excelFile} sx={{ px: 4 }}>
            업데이트
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}

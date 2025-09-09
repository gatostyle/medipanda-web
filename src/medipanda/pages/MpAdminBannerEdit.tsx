import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  Grid,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import MainCard from 'components/MainCard';
import { useFormik } from 'formik';
import { createBanner, DateTimeString, getBanner, updateBanner } from '@/backend';
import MpFormikDatePicker from '@/medipanda/components/MpFormikDatePicker';
import { useMpErrorDialog } from '@/medipanda/hooks/useMpErrorDialog';
import { useMpInfoDialog } from '@/medipanda/hooks/useMpInfoDialog';
import { DateFix, formatYyyyMmDd } from '@/medipanda/utils/dateFormat';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function MpAdminBannerEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const infoDialog = useMpInfoDialog();
  const errorDialog = useMpErrorDialog();

  const formik = useFormik({
    initialValues: {
      position: 'POPUP',
      status: 'VISIBLE' as 'VISIBLE' | 'HIDDEN',
      scope: 'ENTIRE' as 'ENTIRE' | 'CONTRACT' | 'NON_CONTRACT',
      title: '',
      linkUrl: '',
      startDate: null as Date | null,
      startHour: '0',
      startMinute: '0',
      endDate: null as Date | null,
      endHour: '0',
      endMinute: '0',
      displayOrder: 1,
      note: '',
    },
    onSubmit: async values => {
      try {
        const startDateStr = values.startDate ? formatYyyyMmDd(values.startDate) : '';
        const endDateStr = values.endDate ? formatYyyyMmDd(values.endDate) : '';
        const startAt = `${startDateStr}T${values.startHour.padStart(2, '0')}:${values.startMinute.padStart(2, '0')}:00`;
        const endAt = `${endDateStr}T${values.endHour.padStart(2, '0')}:${values.endMinute.padStart(2, '0')}:00`;

        if (id && id !== 'new') {
          await updateBanner(parseInt(id), {
            request: {
              position: values.position,
              status: values.status,
              scope: values.scope,
              title: values.title,
              linkUrl: values.linkUrl,
              startAt: new DateTimeString(startAt),
              endAt: new DateTimeString(endAt),
              displayOrder: values.displayOrder,
            },
            imageFile: imageFile ?? undefined,
          });
          infoDialog.showInfo('배너가 수정되었습니다');
        } else {
          await createBanner({
            request: {
              title: values.title,
              linkUrl: values.linkUrl,
              status: values.status,
              scope: values.scope,
              position: values.position,
              displayOrder: values.displayOrder,
              startAt: new DateTimeString(startAt),
              endAt: new DateTimeString(endAt),
            },
            imageFile: imageFile!,
          });
          infoDialog.showInfo('배너가 등록되었습니다');
        }
        navigate('/admin/banners');
      } catch (error) {
        console.error('Failed to save banner:', error);
        errorDialog.showError('배너 저장 중 오류가 발생했습니다');
      }
    },
  });

  useEffect(() => {
    const fetchBannerDetail = async () => {
      if (id === undefined) return;

      setLoading(true);
      try {
        const data = await getBanner(parseInt(id));

        const startDate = DateFix(data.startAt);
        const endDate = DateFix(data.endAt);

        formik.setValues({
          position: data.position,
          status: data.status,
          scope: data.scope,
          title: data.title,
          linkUrl: data.linkUrl,
          startDate: startDate,
          startHour: startDate.getHours().toString(),
          startMinute: startDate.getMinutes().toString(),
          endDate: endDate,
          endHour: endDate.getHours().toString(),
          endMinute: endDate.getMinutes().toString(),
          displayOrder: data.displayOrder,
          note: data.note ?? '',
        });

        if (data.imageUrl) {
          setImagePreview(data.imageUrl);
        }
      } catch (error) {
        console.error('Failed to fetch banner detail:', error);
        errorDialog.showError('배너 정보를 불러오는데 실패했습니다');
      } finally {
        setLoading(false);
      }
    };

    if (id && id !== 'new') {
      fetchBannerDetail();
    }
  }, [id]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCancel = () => {
    navigate('/admin/banners');
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant='h4'>배너등록</Typography>
      </Grid>

      <Grid item xs={12}>
        <MainCard>
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={2.5}>
              <Grid item xs={12}>
                <Stack spacing={0.5}>
                  <Typography variant='body2' component='label'>
                    배너위치 <span style={{ color: 'red' }}>*</span>
                  </Typography>
                  <FormControl fullWidth size='small'>
                    <Select name='position' value={formik.values.position} onChange={formik.handleChange} displayEmpty>
                      <MenuItem value='POPUP'>팝업배너</MenuItem>
                      <MenuItem value='PC_MAIN'>PC 메인</MenuItem>
                      <MenuItem value='PC_COMMUNITY'>PC 커뮤니티</MenuItem>
                      <MenuItem value='MOB_MAIN'>Mob 메인</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
              </Grid>

              <Grid item xs={12}>
                <Stack spacing={0.5}>
                  <Typography variant='body2' component='label'>
                    노출순서 <span style={{ color: 'red' }}>*</span>
                  </Typography>
                  <FormControl fullWidth size='small'>
                    <Select name='displayOrder' value={formik.values.displayOrder} onChange={formik.handleChange} displayEmpty>
                      {[1, 2, 3, 4, 5].map(num => (
                        <MenuItem key={num} value={num}>
                          {num}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
              </Grid>

              <Grid item xs={12}>
                <Stack spacing={0.5}>
                  <Typography variant='body2' component='label'>
                    노출상태 <span style={{ color: 'red' }}>*</span>
                  </Typography>
                  <RadioGroup row name='status' value={formik.values.status} onChange={formik.handleChange}>
                    <FormControlLabel value={'VISIBLE'} control={<Radio size='small' />} label='노출' />
                    <FormControlLabel value={'HIDDEN'} control={<Radio size='small' />} label='미노출' />
                  </RadioGroup>
                </Stack>
              </Grid>

              <Grid item xs={12}>
                <Stack spacing={0.5}>
                  <Typography variant='body2' component='label'>
                    노출범위 <span style={{ color: 'red' }}>*</span>
                  </Typography>
                  <RadioGroup row name='scope' value={formik.values.scope} onChange={formik.handleChange}>
                    <FormControlLabel value={'ENTIRE'} control={<Radio size='small' />} label='전체' />
                    <FormControlLabel value={'CONTRACT'} control={<Radio size='small' />} label='계약' />
                    <FormControlLabel value={'NON_CONTRACT'} control={<Radio size='small' />} label='미계약' />
                  </RadioGroup>
                </Stack>
              </Grid>

              <Grid item xs={12}>
                <Stack spacing={0.5}>
                  <Typography variant='body2' component='label'>
                    배너제목 <span style={{ color: 'red' }}>*</span>
                  </Typography>
                  <TextField name='title' fullWidth size='small' value={formik.values.title} onChange={formik.handleChange} />
                </Stack>
              </Grid>

              <Grid item xs={12}>
                <Stack spacing={0.5}>
                  <Typography variant='body2' component='label'>
                    배너이미지 <span style={{ color: 'red' }}>*</span>
                  </Typography>
                  <Stack direction='row' spacing={2} alignItems='center'>
                    <Button
                      variant='contained'
                      component='label'
                      size='small'
                      sx={{ backgroundColor: '#4caf50', '&:hover': { backgroundColor: '#45a049' } }}
                    >
                      파일 선택
                      <input type='file' hidden accept='image/*' onChange={handleImageChange} />
                    </Button>
                  </Stack>
                  {imagePreview && (
                    <Box mt={1}>
                      <img src={imagePreview} alt='Banner preview' style={{ maxWidth: '100%', maxHeight: '200px' }} />
                    </Box>
                  )}
                </Stack>
              </Grid>

              <Grid item xs={12}>
                <Stack spacing={0.5}>
                  <Typography variant='body2' component='label'>
                    배너링크 <span style={{ color: 'red' }}>*</span>
                  </Typography>
                  <TextField name='linkUrl' fullWidth size='small' value={formik.values.linkUrl} onChange={formik.handleChange} />
                </Stack>
              </Grid>

              <Grid item xs={12}>
                <Stack spacing={0.5}>
                  <Typography variant='body2' component='label'>
                    게시기간 <span style={{ color: 'red' }}>*</span>
                  </Typography>
                  <Stack direction='row' spacing={1} alignItems='center' flexWrap='wrap'>
                    <Box sx={{ width: 150 }}>
                      <MpFormikDatePicker name='startDate' label='' formik={formik} />
                    </Box>
                    <FormControl size='small' sx={{ minWidth: 70 }}>
                      <Select name='startHour' value={formik.values.startHour} onChange={formik.handleChange}>
                        {Array.from({ length: 24 }, (_, i) => (
                          <MenuItem key={i} value={i.toString()}>
                            {i}시
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl size='small' sx={{ minWidth: 70 }}>
                      <Select name='startMinute' value={formik.values.startMinute} onChange={formik.handleChange}>
                        {Array.from({ length: 60 }, (_, i) => (
                          <MenuItem key={i} value={i.toString()}>
                            {i}분
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Typography variant='body1' sx={{ mx: 1 }}>
                      ~
                    </Typography>
                    <Box sx={{ width: 150 }}>
                      <MpFormikDatePicker name='endDate' label='' formik={formik} />
                    </Box>
                    <FormControl size='small' sx={{ minWidth: 70 }}>
                      <Select name='endHour' value={formik.values.endHour} onChange={formik.handleChange}>
                        {Array.from({ length: 24 }, (_, i) => (
                          <MenuItem key={i} value={i.toString()}>
                            {i}시
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl size='small' sx={{ minWidth: 70 }}>
                      <Select name='endMinute' value={formik.values.endMinute} onChange={formik.handleChange}>
                        {Array.from({ length: 60 }, (_, i) => (
                          <MenuItem key={i} value={i.toString()}>
                            {i}분
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Stack>
                </Stack>
              </Grid>

              <Grid item xs={12}>
                <Stack spacing={0.5}>
                  <Typography variant='body2' component='label'>
                    비고
                  </Typography>
                  <TextField
                    name='note'
                    fullWidth
                    multiline
                    rows={3}
                    size='small'
                    value={formik.values.note}
                    onChange={formik.handleChange}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12}>
                <Stack direction='row' spacing={2} justifyContent='center' sx={{ mt: 2 }}>
                  <Button
                    variant='outlined'
                    size='medium'
                    onClick={handleCancel}
                    sx={{
                      minWidth: 100,
                      color: '#666',
                      borderColor: '#ddd',
                      backgroundColor: '#f5f5f5',
                      '&:hover': {
                        borderColor: '#999',
                        backgroundColor: '#e0e0e0',
                      },
                    }}
                  >
                    취소
                  </Button>
                  <Button
                    variant='contained'
                    size='medium'
                    type='submit'
                    sx={{
                      minWidth: 100,
                      backgroundColor: '#4caf50',
                      '&:hover': {
                        backgroundColor: '#45a049',
                      },
                    }}
                  >
                    저장
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </form>
        </MainCard>
      </Grid>
    </Grid>
  );
}

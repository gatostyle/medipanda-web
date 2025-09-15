import { useMpModal } from '@/medipanda/hooks/useMpModal';
import {
  Box,
  Button,
  Card,
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
import { DatePicker } from '@mui/x-date-pickers';
import { useFormik } from 'formik';
import {
  BannerScope,
  BannerScopeLabel,
  BannerStatus,
  BannerStatusLabel,
  createBanner,
  DateTimeString,
  getBanner,
  updateBanner,
} from '@/backend';
import { DateFix, formatYyyyMmDd } from '@/medipanda/utils/dateFormat';
import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';

export default function MpAdminBannerEdit() {
  const navigate = useNavigate();
  const { bannerId: paramBannerId } = useParams();
  const isNew = paramBannerId === undefined;
  const bannerId = Number(paramBannerId);

  const [, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const { alert, alertError } = useMpModal();

  const formik = useFormik({
    initialValues: {
      position: 'POPUP',
      status: BannerStatus.VISIBLE,
      scope: BannerScope.ENTIRE,
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

        if (isNew) {
          await updateBanner(bannerId, {
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
          await alert('배너가 수정되었습니다');
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
          await alert('배너가 등록되었습니다');
        }
        navigate('/admin/banners');
      } catch (error) {
        console.error('Failed to save banner:', error);
        await alertError('배너 저장 중 오류가 발생했습니다');
      }
    },
  });

  useEffect(() => {
    if (!isNew) {
      fetchDetail(bannerId);
    }
  }, [isNew, bannerId]);

  const fetchDetail = async (bannerId: number) => {
    if (Number.isNaN(bannerId)) {
      await alertError('잘못된 접근입니다.');
      return navigate('/admin/banners');
    }

    setLoading(true);
    try {
      const detail = await getBanner(bannerId);

      const startDate = DateFix(detail.startAt);
      const endDate = DateFix(detail.endAt);

      formik.setValues({
        position: detail.position,
        status: detail.status as BannerStatus,
        scope: detail.scope as BannerScope,
        title: detail.title,
        linkUrl: detail.linkUrl,
        startDate: startDate,
        startHour: startDate.getHours().toString(),
        startMinute: startDate.getMinutes().toString(),
        endDate: endDate,
        endHour: endDate.getHours().toString(),
        endMinute: endDate.getMinutes().toString(),
        displayOrder: detail.displayOrder,
        note: detail.note ?? '',
      });

      if (detail.imageUrl) {
        setImagePreview(detail.imageUrl);
      }
    } catch (error) {
      console.error('Failed to fetch banner detail:', error);
      await alertError('배너 정보를 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant='h4'>배너등록</Typography>
      </Grid>

      <Grid item xs={12}>
        <Card sx={{ padding: 3 }}>
          <Grid container spacing={2.5} component='form' onSubmit={formik.handleSubmit}>
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
                  {Object.keys(BannerStatus).map(BannerStatus => (
                    <FormControlLabel
                      key={BannerStatus}
                      value={BannerStatus}
                      control={<Radio size='small' />}
                      label={BannerStatusLabel[BannerStatus]}
                    />
                  ))}
                </RadioGroup>
              </Stack>
            </Grid>

            <Grid item xs={12}>
              <Stack spacing={0.5}>
                <Typography variant='body2' component='label'>
                  노출범위 <span style={{ color: 'red' }}>*</span>
                </Typography>
                <RadioGroup row name='scope' value={formik.values.scope} onChange={formik.handleChange}>
                  {Object.keys(BannerScope).map(scope => (
                    <FormControlLabel key={scope} value={scope} control={<Radio size='small' />} label={BannerScopeLabel[scope]} />
                  ))}
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
                  <Button variant='contained' component='label' size='small'>
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
                    <DatePicker
                      value={formik.values.startDate}
                      onChange={value => formik.setFieldValue('startDate', value)}
                      format='yyyy-MM-dd'
                      views={['year', 'month', 'day']}
                      label='시작일'
                      slotProps={{
                        textField: {
                          size: 'small',
                        },
                      }}
                    />
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
                    <DatePicker
                      value={formik.values.endDate}
                      onChange={value => formik.setFieldValue('endDate', value)}
                      format='yyyy-MM-dd'
                      views={['year', 'month', 'day']}
                      label='종료일'
                      slotProps={{
                        textField: {
                          size: 'small',
                        },
                      }}
                    />
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
                  component={RouterLink}
                  to='/admin/banners'
                  sx={{
                    minWidth: 100,
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
                  }}
                >
                  저장
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Card>
      </Grid>
    </Grid>
  );
}

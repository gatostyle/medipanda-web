import { useMpModal } from '@/hooks/useMpModal';
import {
  Box,
  Button,
  Card,
  FormControl,
  FormControlLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
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
import { DATEFORMAT_YYYY_MM_DD, DateUtils } from '@/lib/utils/dateFormat';
import { type ChangeEvent, useEffect, useState } from 'react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import type { RequiredDeep } from 'type-fest';

export default function MpAdminBannerEdit() {
  const navigate = useNavigate();
  const { bannerId: paramBannerId } = useParams();
  const isNew = paramBannerId === undefined;
  const bannerId = Number(paramBannerId);

  const [, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const { alert, alertError } = useMpModal();

  const form = useForm({
    defaultValues: {
      position: 'ALL',
      status: BannerStatus.VISIBLE as keyof typeof BannerStatus,
      scope: BannerScope.ENTIRE as keyof typeof BannerScope,
      title: '',
      linkUrl: '',
      startAt: null as Date | null,
      endAt: null as Date | null,
      displayOrder: 1,
    },
  });
  const formStartAt = form.watch('startAt');
  const formEndAt = form.watch('endAt');

  const submitHandler: SubmitHandler<RequiredDeep<(typeof form)['control']['_defaultValues']>> = async values => {
    if (values.title === '') {
      await alert('배너제목을 입력하세요');
      return;
    }

    if (!imageFile && isNew) {
      await alert('배너이미지를 선택하세요');
      return;
    }

    if (values.linkUrl === '') {
      await alert('배너링크를 입력하세요');
      return;
    }

    if (values.startAt === null) {
      await alert('시작일을 선택하세요');
      return;
    }

    if (values.endAt === null) {
      await alert('종료일을 선택하세요');
      return;
    }

    try {
      if (isNew) {
        await createBanner({
          request: {
            title: values.title,
            linkUrl: values.linkUrl,
            status: values.status,
            scope: values.scope,
            position: values.position,
            displayOrder: values.displayOrder,
            startAt: new DateTimeString(values.startAt),
            endAt: new DateTimeString(values.endAt),
          },
          imageFile: imageFile!,
        });
        await alert('배너가 등록되었습니다');
      } else {
        await updateBanner(bannerId, {
          request: {
            position: values.position,
            status: values.status,
            scope: values.scope,
            title: values.title,
            linkUrl: values.linkUrl,
            startAt: new DateTimeString(values.startAt),
            endAt: new DateTimeString(values.endAt),
            displayOrder: values.displayOrder,
          },
          imageFile: imageFile ?? undefined,
        });
        await alert('배너가 수정되었습니다');
      }
      navigate('/admin/banners');
    } catch (error) {
      console.error('Failed to save banner:', error);
      await alertError('배너 저장 중 오류가 발생했습니다');
    }
  };

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

      form.reset({
        position: detail.position,
        status: detail.status,
        scope: detail.scope,
        title: detail.title,
        linkUrl: detail.linkUrl,
        startAt: DateUtils.utcToKst(new Date(detail.startAt)),
        endAt: DateUtils.utcToKst(new Date(detail.endAt)),
        displayOrder: detail.displayOrder,
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

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
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
    <Stack sx={{ gap: 3 }}>
      <Typography variant='h4'>배너등록</Typography>

      <Card sx={{ padding: 3 }}>
        <Stack sx={{ gap: 2.5 }}>
          <Stack spacing={0.5}>
            <Typography variant='body2' component='label'>
              배너위치 <span style={{ color: 'red' }}>*</span>
            </Typography>
            <FormControl fullWidth size='small'>
              <Controller
                control={form.control}
                name={'position'}
                render={({ field }) => (
                  <Select {...field} displayEmpty>
                    <MenuItem value='ALL'>전체</MenuItem>
                    <MenuItem value='POPUP'>팝업배너</MenuItem>
                    <MenuItem value='PC_MAIN'>PC 메인</MenuItem>
                    <MenuItem value='PC_COMMUNITY'>PC 커뮤니티</MenuItem>
                    <MenuItem value='MOB_MAIN'>모바일 메인</MenuItem>
                  </Select>
                )}
              />
            </FormControl>
          </Stack>

          <Stack spacing={0.5}>
            <Typography variant='body2' component='label'>
              노출순서 <span style={{ color: 'red' }}>*</span>
            </Typography>
            <FormControl fullWidth size='small'>
              <Controller
                control={form.control}
                name={'displayOrder'}
                render={({ field }) => (
                  <Select {...field} displayEmpty>
                    {Array.from({ length: 10 }).map((_, i) => (
                      <MenuItem key={i + 1} value={i + 1}>
                        {i + 1}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </FormControl>
          </Stack>

          <Stack spacing={0.5}>
            <Typography variant='body2' component='label'>
              노출상태 <span style={{ color: 'red' }}>*</span>
            </Typography>
            <Controller
              control={form.control}
              name={'status'}
              render={({ field }) => (
                <RadioGroup {...field} row>
                  {Object.keys(BannerStatus).map(BannerStatus => (
                    <FormControlLabel
                      key={BannerStatus}
                      value={BannerStatus}
                      control={<Radio size='small' />}
                      label={BannerStatusLabel[BannerStatus]}
                    />
                  ))}
                </RadioGroup>
              )}
            />
          </Stack>

          <Stack spacing={0.5}>
            <Typography variant='body2' component='label'>
              노출범위 <span style={{ color: 'red' }}>*</span>
            </Typography>
            <Controller
              control={form.control}
              name={'scope'}
              render={({ field }) => (
                <RadioGroup {...field} row>
                  {Object.keys(BannerScope).map(scope => (
                    <FormControlLabel key={scope} value={scope} control={<Radio size='small' />} label={BannerScopeLabel[scope]} />
                  ))}
                </RadioGroup>
              )}
            />
          </Stack>

          <Stack spacing={0.5}>
            <Typography variant='body2' component='label'>
              배너제목 <span style={{ color: 'red' }}>*</span>
            </Typography>
            <Controller control={form.control} name={'title'} render={({ field }) => <TextField {...field} fullWidth size='small' />} />
          </Stack>

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

          <Stack spacing={0.5}>
            <Typography variant='body2' component='label'>
              배너링크 <span style={{ color: 'red' }}>*</span>
            </Typography>
            <Controller control={form.control} name={'linkUrl'} render={({ field }) => <TextField {...field} fullWidth size='small' />} />
          </Stack>

          <Stack spacing={0.5}>
            <Typography variant='body2' component='label'>
              게시기간 <span style={{ color: 'red' }}>*</span>
            </Typography>
            <Stack direction='row' spacing={1} alignItems='center' flexWrap='wrap'>
              <Box sx={{ width: 200 }}>
                <Controller
                  control={form.control}
                  name={'startAt'}
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      format={DATEFORMAT_YYYY_MM_DD}
                      views={['year', 'month', 'day']}
                      maxDate={formEndAt ?? undefined}
                      label='시작일'
                      slotProps={{
                        textField: {
                          size: 'small',
                        },
                      }}
                    />
                  )}
                />
              </Box>
              <Typography variant='body1' sx={{ mx: 1 }}>
                ~
              </Typography>
              <Box sx={{ width: 200 }}>
                <Controller
                  control={form.control}
                  name={'endAt'}
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      format={DATEFORMAT_YYYY_MM_DD}
                      views={['year', 'month', 'day']}
                      minDate={formStartAt ?? undefined}
                      label='종료일'
                      slotProps={{
                        textField: {
                          size: 'small',
                        },
                      }}
                    />
                  )}
                />
              </Box>
            </Stack>
          </Stack>

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
              onClick={form.handleSubmit(submitHandler)}
              sx={{
                minWidth: 100,
              }}
            >
              저장
            </Button>
          </Stack>
        </Stack>
      </Card>
    </Stack>
  );
}

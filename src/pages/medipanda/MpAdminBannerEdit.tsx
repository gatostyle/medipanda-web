import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { useMpErrorDialog } from 'hooks/medipanda/useMpErrorDialog';
import { mpCreateBanner, mpFetchBanner, mpUpdateBanner } from 'api-definitions/MpBanner';

const StyledTable = styled('table')({
  width: '100%',
  borderCollapse: 'collapse',
  '& th': {
    width: '200px',
    padding: '16px',
    textAlign: 'left',
    backgroundColor: '#f5f5f5',
    borderBottom: '1px solid #e0e0e0'
  },
  '& td': {
    padding: '16px',
    borderBottom: '1px solid #e0e0e0'
  }
});

interface FormValues {
  position: string;
  order: string;
  state: boolean;
  scope: {
    contracted: boolean;
    nonContracted: boolean;
  };
  title: string;
  imageFile: File | null;
  imageUrl: string;
  linkUrl: string;
  startAt: string;
  endAt: string;
}

const validationSchema = Yup.object({
  position: Yup.string().required('배너 위치를 선택해주세요'),
  order: Yup.string().required('노출 순서를 선택해주세요'),
  title: Yup.string().required('배너 제목을 입력해주세요'),
  imageUrl: Yup.string().required('배너 이미지를 업로드해주세요'),
  linkUrl: Yup.string().required('링크 URL을 입력해주세요'),
  startAt: Yup.string().required('시작 일시를 입력해주세요'),
  endAt: Yup.string()
    .required('종료 일시를 입력해주세요')
    .test('is-after-start', '종료 일시는 시작 일시 이후여야 합니다', function (value) {
      const { startAt } = this.parent;
      if (!startAt || !value) return true;
      return new Date(value) >= new Date(startAt);
    })
});

export default function MpAdminBannerEdit() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bannerId = searchParams.get('id');
  const { showError } = useMpErrorDialog();
  const [initialValues, setInitialValues] = useState<FormValues>({
    position: '',
    order: '1',
    state: true,
    scope: {
      contracted: true,
      nonContracted: false
    },
    title: '',
    imageFile: null,
    imageUrl: '',
    linkUrl: '',
    startAt: '',
    endAt: ''
  });

  const formik = useFormik<FormValues>({
    enableReinitialize: true,
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      try {
        const payload = {
          ...values,
          order: Number(values.order)
        };

        if (bannerId) {
          await mpUpdateBanner(Number(bannerId), payload);
        } else {
          await mpCreateBanner({
            ...payload,
            createdAt: new Date().toISOString().split('T')[0],
            impressions: 0,
            views: 0,
            ctr: 0
          });
        }
        navigate('/admin/banners');
      } catch (error) {
        console.error('Failed to save banner:', error);
        showError('배너 저장 중 오류가 발생했습니다.');
      }
    }
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      formik.setFieldValue('imageFile', file);
      formik.setFieldValue('imageUrl', URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    const fetchBanner = async () => {
      if (!bannerId) return;
      try {
        const banner = await mpFetchBanner(Number(bannerId));
        setInitialValues({
          position: banner.position,
          order: String(banner.order),
          state: banner.state,
          scope: banner.scope,
          title: banner.title,
          imageFile: null,
          imageUrl: banner.imageUrl || '',
          linkUrl: banner.linkUrl || '',
          startAt: banner.startAt ? new Date(banner.startAt).toISOString().slice(0, 16) : '',
          endAt: banner.endAt ? new Date(banner.endAt).toISOString().slice(0, 16) : ''
        });
      } catch (error) {
        console.error('Failed to fetch banner:', error);
        showError('배너 정보를 불러오는 중 오류가 발생했습니다.');
        navigate('/admin/banners');
      }
    };

    fetchBanner();
  }, [bannerId, navigate]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 3 }}>
        {bannerId ? '배너 수정' : '배너 등록'}
      </Typography>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={formik.handleSubmit}>
          <StyledTable>
            <tbody>
              <tr>
                <th>배너위치</th>
                <td>
                  <FormControl fullWidth>
                    <Select
                      name="position"
                      value={formik.values.position}
                      onChange={formik.handleChange}
                      error={formik.touched.position && Boolean(formik.errors.position)}
                    >
                      <MenuItem value="메인 상단">메인 상단</MenuItem>
                      <MenuItem value="메인 중단">메인 중단</MenuItem>
                      <MenuItem value="메인 하단">메인 하단</MenuItem>
                      <MenuItem value="리스트 상단">리스트 상단</MenuItem>
                    </Select>
                  </FormControl>
                </td>
              </tr>

              <tr>
                <th>노출순서</th>
                <td>
                  <FormControl fullWidth>
                    <Select
                      name="order"
                      value={formik.values.order}
                      onChange={formik.handleChange}
                      error={formik.touched.order && Boolean(formik.errors.order)}
                    >
                      {[1, 2, 3, 4, 5].map((num) => (
                        <MenuItem key={num} value={String(num)}>
                          {num}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </td>
              </tr>

              <tr>
                <th>노출상태</th>
                <td>
                  <RadioGroup
                    row
                    name="state"
                    value={formik.values.state}
                    onChange={(e) => {
                      formik.setFieldValue('state', e.target.value === 'true');
                    }}
                  >
                    <FormControlLabel value={true} control={<Radio />} label="노출" />
                    <FormControlLabel value={false} control={<Radio />} label="미노출" />
                  </RadioGroup>
                </td>
              </tr>

              <tr>
                <th>노출범위</th>
                <td>
                  <RadioGroup
                    row
                    value={
                      formik.values.scope.contracted && formik.values.scope.nonContracted
                        ? 'all'
                        : formik.values.scope.contracted
                          ? 'contracted'
                          : 'nonContracted'
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      formik.setFieldValue('scope', {
                        contracted: value === 'all' || value === 'contracted',
                        nonContracted: value === 'all' || value === 'nonContracted'
                      });
                    }}
                  >
                    <FormControlLabel value="all" control={<Radio />} label="전체" />
                    <FormControlLabel value="contracted" control={<Radio />} label="계약" />
                    <FormControlLabel value="nonContracted" control={<Radio />} label="미계약" />
                  </RadioGroup>
                </td>
              </tr>

              <tr>
                <th>배너제목</th>
                <td>
                  <TextField
                    fullWidth
                    name="title"
                    value={formik.values.title}
                    onChange={formik.handleChange}
                    error={formik.touched.title && Boolean(formik.errors.title)}
                    helperText={formik.touched.title && formik.errors.title}
                  />
                </td>
              </tr>

              <tr>
                <th>배너이미지</th>
                <td>
                  <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} id="banner-image-upload" />
                  <label htmlFor="banner-image-upload">
                    <Button variant="contained" component="span">
                      이미지 업로드
                    </Button>
                  </label>
                  {formik.values.imageUrl && (
                    <Box sx={{ mt: 2 }}>
                      <img src={formik.values.imageUrl} alt="Banner preview" style={{ maxWidth: '200px' }} />
                    </Box>
                  )}
                  {formik.touched.imageUrl && formik.errors.imageUrl && (
                    <Typography color="error" variant="caption" sx={{ display: 'block', mt: 1 }}>
                      {formik.errors.imageUrl}
                    </Typography>
                  )}
                </td>
              </tr>

              <tr>
                <th>배너링크</th>
                <td>
                  <TextField
                    fullWidth
                    name="linkUrl"
                    value={formik.values.linkUrl}
                    onChange={formik.handleChange}
                    error={formik.touched.linkUrl && Boolean(formik.errors.linkUrl)}
                    helperText={formik.touched.linkUrl && formik.errors.linkUrl}
                  />
                </td>
              </tr>

              <tr>
                <th>게시기간</th>
                <td>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      type="datetime-local"
                      name="startAt"
                      value={formik.values.startAt}
                      onChange={formik.handleChange}
                      error={formik.touched.startAt && Boolean(formik.errors.startAt)}
                      helperText={formik.touched.startAt && formik.errors.startAt}
                      InputLabelProps={{
                        shrink: true
                      }}
                      sx={{ minWidth: '250px' }}
                    />
                    <TextField
                      type="datetime-local"
                      name="endAt"
                      value={formik.values.endAt}
                      onChange={formik.handleChange}
                      error={formik.touched.endAt && Boolean(formik.errors.endAt)}
                      helperText={formik.touched.endAt && formik.errors.endAt}
                      InputLabelProps={{
                        shrink: true
                      }}
                      sx={{ minWidth: '250px' }}
                    />
                  </Box>
                </td>
              </tr>
            </tbody>
          </StyledTable>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
            <Button variant="contained" color="inherit" onClick={() => navigate('/admin/banners')}>
              취소
            </Button>
            <Button type="submit" variant="contained" color="primary">
              {bannerId ? '수정' : '등록'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}

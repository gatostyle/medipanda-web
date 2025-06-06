import { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import Paper from '@mui/material/Paper';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { useMpErrorDialog } from 'hooks/medipanda/useMpErrorDialog';
import {
  mpFetchPermissionCategories,
  mpFetchPermissionFeatures,
  MpPermissionCategory,
  MpPermissionFeature
} from 'api-definitions/MpPermissionCategories';
import { mpFetchMemberPermissions } from 'api-definitions/MpPermission';

export default function MpAdminPermissionMember() {
  const [categories, setCategories] = useState<MpPermissionCategory[]>([]);
  const [features, setFeatures] = useState<MpPermissionFeature[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { showError } = useMpErrorDialog();

  const { values, setFieldValue, handleSubmit, setValues } = useFormik<{
    permission: Record<string, { Contracted: boolean; NonContracted: boolean }>;
  }>({
    initialValues: {
      permission: {} as Record<string, { Contracted: boolean; NonContracted: boolean }>
    },
    onSubmit: async (vals) => {
      console.log('submit', vals);
      // await api call
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [categoriesData, featuresData, permissionsData] = await Promise.all([
          mpFetchPermissionCategories(),
          mpFetchPermissionFeatures(),
          mpFetchMemberPermissions()
        ]);

        setCategories(categoriesData.categories);
        setFeatures(featuresData.features);

        const formatted: Record<string, { Contracted: boolean; NonContracted: boolean }> = {};
        permissionsData.permissions.forEach(({ category, feature, permissions }) => {
          formatted[`${category}-${feature}`] = permissions;
        });
        setValues({ permission: formatted });
      } catch (error) {
        console.error('Failed to fetch permission data:', error);
        showError('권한 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [setValues, showError]);

  const handleChange = (key: string, type: 'Contracted' | 'NonContracted') => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFieldValue(`permission.${key}.${type}`, e.target.checked);
  };

  const handleAllChange = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFieldValue(`permission.${key}.Contracted`, e.target.checked);
    setFieldValue(`permission.${key}.NonContracted`, e.target.checked);
  };

  const isAllChecked = (key: string) => values.permission[key]?.Contracted && values.permission[key]?.NonContracted;

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Grid container>
        <Grid item xs={12}>
          <h2>권한관리/사용자 권한</h2>
        </Grid>
        <Grid item xs={12} container component={Card} sx={{ p: 2.5 }}>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell align="center" sx={{ width: 140 }}>
                    구분
                  </TableCell>
                  <TableCell align="center">기능명</TableCell>
                  <TableCell align="center" colSpan={3}>
                    권한 구분
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categories.map((category) =>
                  features.map((feature, index) => {
                    const key = `${category.name}-${feature.name}`;
                    return (
                      <TableRow key={key}>
                        {index === 0 && (
                          <TableCell rowSpan={features.length} sx={{ backgroundColor: '#f5f5f5' }}>
                            {category.name}
                          </TableCell>
                        )}
                        <TableCell>{feature.name}</TableCell>
                        <TableCell align="center">
                          <Checkbox size="small" checked={!!values.permission[key] && isAllChecked(key)} onChange={handleAllChange(key)} />
                        </TableCell>
                        <TableCell align="center">
                          <Checkbox
                            size="small"
                            checked={!!values.permission[key]?.Contracted}
                            onChange={handleChange(key, 'Contracted')}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Checkbox
                            size="small"
                            checked={!!values.permission[key]?.NonContracted}
                            onChange={handleChange(key, 'NonContracted')}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Box mt={2} display="flex" justifyContent="center" gap={2}>
            <Button variant="contained" color="inherit">
              취소
            </Button>
            <Button type="submit" variant="contained" color="success">
              저장
            </Button>
          </Box>
        </Grid>
      </Grid>
    </form>
  );
}

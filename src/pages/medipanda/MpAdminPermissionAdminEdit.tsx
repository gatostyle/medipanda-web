import { Fragment, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import { useMpErrorDialog } from 'hooks/medipanda/useMpErrorDialog';
import { MpAdminMenuOption, mpFetchAdminMenuOptions } from 'api-definitions/MpAdminMenuOptions';
import { mpFetchAdminByUserId } from 'api-definitions/MpAdmin';

export default function MpAdminPermissionAdminEdit() {
  const [searchParams] = useSearchParams();
  const adminUserId = searchParams.get('userId');
  const [menuOptions, setMenuOptions] = useState<MpAdminMenuOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('활성');
  const [phone, setPhone] = useState({ prefix: '010', mid: '', end: '' });
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [adminName, setAdminName] = useState('');
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const { showError } = useMpErrorDialog();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const menuResponse = await mpFetchAdminMenuOptions();
        setMenuOptions(menuResponse.menuOptions.filter((option) => option.isActive));

        if (adminUserId) {
          const adminResponse = await mpFetchAdminByUserId(adminUserId);
          setAdminName(adminResponse.name);
          setUserId(adminResponse.userId);
          setEmail(adminResponse.email);
          setStatus(adminResponse.state ? '활성' : '비활성');

          if (adminResponse.phone) {
            const phoneParts = adminResponse.phone.split('-');
            if (phoneParts.length === 3) {
              setPhone({
                prefix: phoneParts[0],
                mid: phoneParts[1],
                end: phoneParts[2]
              });
            }
          }
        }
      } catch (error) {
        console.error('데이터 조회 오류:', error);
        showError('데이터를 조회하는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [adminUserId, showError]);

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    if (checked) {
      if (checkedItems.length < 5) {
        setCheckedItems([...checkedItems, name]);
      }
    } else {
      setCheckedItems(checkedItems.filter((item) => item !== name));
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Box p={4}>
        <Grid container>
          <Grid item xs={12}>
            <h2>권한관리/관리자 권한등록</h2>
          </Grid>
          <Grid item xs={12} container spacing={2} component={Card} sx={{ p: 2.5 }}>
            <Grid item xs={12} sm={2}>
              <FormLabel component="legend">상태</FormLabel>
            </Grid>
            <Grid item xs={12} sm={10}>
              <RadioGroup row value={status} onChange={(e) => setStatus(e.target.value)}>
                <FormControlLabel value="활성" control={<Radio />} label="활성" />
                <FormControlLabel value="비활성" control={<Radio />} label="비활성" />
              </RadioGroup>
            </Grid>

            <Grid item xs={12} sm={2}>
              <FormLabel>관리자 명</FormLabel>
            </Grid>
            <Grid item xs={12} sm={10}>
              <TextField fullWidth size="small" variant="outlined" value={adminName} onChange={(e) => setAdminName(e.target.value)} />
            </Grid>

            <Grid item xs={12} sm={2}>
              <FormLabel>아이디</FormLabel>
            </Grid>
            <Grid item xs={12} sm={10}>
              <TextField
                fullWidth
                size="small"
                variant="outlined"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                disabled={!!adminUserId}
              />
            </Grid>

            <Grid item xs={12} sm={2}>
              <FormLabel>패스워드</FormLabel>
            </Grid>
            <Grid item xs={12} sm={10}>
              <TextField
                fullWidth
                size="small"
                variant="outlined"
                type="password"
                placeholder={adminUserId ? '변경하려면 입력하세요' : ''}
              />
            </Grid>

            <Grid item xs={12} sm={2}>
              <FormLabel>패스워드 확인</FormLabel>
            </Grid>
            <Grid item xs={12} sm={10}>
              <TextField
                fullWidth
                size="small"
                variant="outlined"
                type="password"
                placeholder={adminUserId ? '변경하려면 입력하세요' : ''}
              />
            </Grid>

            <Grid item xs={12} sm={2}>
              <FormLabel>이메일</FormLabel>
            </Grid>
            <Grid item xs={12} sm={10}>
              <TextField fullWidth size="small" variant="outlined" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Grid>

            <Grid item xs={12} sm={2}>
              <FormLabel>연락처</FormLabel>
            </Grid>
            <Grid item xs={12} sm={10}>
              <Box display="flex" gap={1}>
                <FormControl size="small">
                  <Select value={phone.prefix} onChange={(e) => setPhone({ ...phone, prefix: e.target.value })}>
                    {['010', '011', '016'].map((opt) => (
                      <MenuItem key={opt} value={opt}>
                        {opt}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  size="small"
                  inputProps={{ maxLength: 4 }}
                  value={phone.mid}
                  onChange={(e) => setPhone({ ...phone, mid: e.target.value })}
                />
                <TextField
                  size="small"
                  inputProps={{ maxLength: 4 }}
                  value={phone.end}
                  onChange={(e) => setPhone({ ...phone, end: e.target.value })}
                />
              </Box>
            </Grid>

            <Grid item xs={12} sm={2}>
              <FormLabel>관리메뉴</FormLabel>
            </Grid>
            <Grid item xs={12} sm={10}>
              {[...Array(Math.ceil(menuOptions.length / 5))].map((_, rowIndex) => (
                <Box key={rowIndex} display="flex">
                  {menuOptions.slice(rowIndex * 5, rowIndex * 5 + 5).map((menu) => (
                    <FormControlLabel
                      key={menu.name}
                      control={
                        <Checkbox
                          name={menu.name}
                          checked={checkedItems.includes(menu.name)}
                          onChange={handleCheckboxChange}
                          disabled={!checkedItems.includes(menu.name) && checkedItems.length >= 5}
                        />
                      }
                      label={menu.name}
                    />
                  ))}
                </Box>
              ))}
            </Grid>

            <Grid item xs={12}>
              <Box mt={3} display="flex" justifyContent="center" gap={2}>
                <Button variant="contained" color="inherit">
                  취소
                </Button>
                <Button variant="contained" color="success">
                  저장
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}

import { Fragment, useState, useEffect } from 'react';
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

export default function MpAdminPermissionAdminEdit() {
  const [menuOptions, setMenuOptions] = useState<MpAdminMenuOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('활성');
  const [phone, setPhone] = useState({ prefix: '010', mid: '', end: '' });
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const { showError } = useMpErrorDialog();

  useEffect(() => {
    const fetchMenuOptions = async () => {
      setIsLoading(true);
      try {
        const response = await mpFetchAdminMenuOptions();
        setMenuOptions(response.menuOptions.filter((option) => option.isActive));
      } catch (error) {
        console.error('관리 메뉴 옵션 조회 오류:', error);
        showError('관리 메뉴 옵션을 조회하는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenuOptions();
  }, [showError]);

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

            {['관리자 명', '아이디', '패스워드', '패스워드 확인', '이메일'].map((label, index) => (
              <Fragment key={label}>
                <Grid item xs={12} sm={2}>
                  <FormLabel>{label}</FormLabel>
                </Grid>
                <Grid item xs={12} sm={10}>
                  <TextField fullWidth size="small" variant="outlined" type={label.includes('패스워드') ? 'password' : 'text'} />
                </Grid>
              </Fragment>
            ))}

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

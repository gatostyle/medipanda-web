import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Edit2 } from 'iconsax-react';
import { mpFetchMember, MpMember, mpUpdateMember, MarketingAgreements } from 'api-definitions/MpMember';
import PasswordChangeDialog from 'components/medipanda/PasswordChangeDialog';
import { useMpNotImplementedDialog } from '../../hooks/medipanda/useMpNotImplementedDialog';
import { useMpErrorDialog } from 'hooks/medipanda/useMpErrorDialog';

interface Section {
  title: string;
  buttons?: React.ReactNode;
  fields: Array<{
    label: string;
    value: React.ReactNode;
    editable?: boolean;
  }>;
}

export default function MpAdminMemberEdit() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');
  const [member, setMember] = useState<MpMember | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState<Partial<MpMember>>({});
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const { open: openNotImplementedDialog } = useMpNotImplementedDialog();
  const { showError } = useMpErrorDialog();

  useEffect(() => {
    if (!userId) {
      alert('잘못된 접근입니다.');
      return;
    }

    (async () => {
      try {
        const data = await mpFetchMember(userId);
        setMember(data);
      } catch (e) {
        console.error(e);
        showError('회원 정보를 불러오는 중 오류가 발생했습니다.');
      }
    })();
  }, [userId, navigate]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditValues({
      state: member?.state,
      memo: member?.memo,
      marketingConsent: member?.marketingConsent
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValues({});
  };

  const handleSave = async () => {
    if (!userId) return;
    try {
      await mpUpdateMember(userId, editValues);
      setIsEditing(false);
      const updatedMember = await mpFetchMember(userId);
      setMember(updatedMember);
      alert('회원 정보가 수정되었습니다.');
    } catch (e) {
      console.error(e);
      showError('회원 정보 수정 중 오류가 발생했습니다.');
    }
  };

  const handleChange = (name: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;

    if (name.includes('.')) {
      const [parentKey, childKey] = name.split('.');
      setEditValues((prev) => ({
        ...prev,
        [parentKey]: {
          ...(prev[parentKey as keyof typeof prev] as any),
          [childKey]: value
        }
      }));
    } else {
      setEditValues((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handlePasswordChange = async (newPassword: string) => {
    if (!userId) return;
    try {
      await mpUpdateMember(userId, { password: newPassword });
      alert('비밀번호가 변경되었습니다.');
    } catch (e) {
      console.error(e);
      showError('비밀번호 변경 중 오류가 발생했습니다.');
    }
  };

  if (!member) return null;

  const sections: Section[] = [
    {
      title: '기본정보',
      fields: [
        { label: '회원번호', value: member.memberNo },
        { label: '아이디', value: member.userId },
        {
          label: '비밀번호',
          value: (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography>●●●●●●●●</Typography>
              <Button variant="contained" size="small" onClick={() => setIsPasswordModalOpen(true)}>
                변경
              </Button>
            </Box>
          )
        },
        { label: '회원명', value: member.name },
        { label: '휴대폰번호', value: member.phone },
        { label: 'E-mail', value: member.email },
        { label: '추천코드', value: member.referralCode || '-' },
        { label: '가입일', value: member.createdAt },
        {
          label: '계정상태',
          value: isEditing ? (
            <RadioGroup row name="state" value={editValues.state} onChange={handleChange('state')}>
              <FormControlLabel value={true} control={<Radio size="small" />} label="활성" />
              <FormControlLabel value={false} control={<Radio size="small" />} label="비활성" />
            </RadioGroup>
          ) : (
            <Box
              sx={{
                display: 'inline-block',
                px: 1.5,
                py: 0.5,
                borderRadius: '4px',
                backgroundColor: member.state ? '#E5E7EB' : '#FEE2E2',
                color: member.state ? '#374151' : '#991B1B',
                fontSize: '14px',
                fontWeight: 500
              }}
            >
              {member.state ? '활성' : '비활성'}
            </Box>
          ),
          editable: true
        },
        {
          label: 'CSO 신고증',
          value: member.csoCertification ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography
                component="span"
                sx={{
                  color: '#2563EB',
                  textDecoration: 'underline',
                  cursor: 'pointer'
                }}
                onClick={() => openNotImplementedDialog('')}
              >
                CSO 신고증.pdf
              </Typography>
            </Box>
          ) : (
            '-'
          )
        }
      ]
    },
    {
      title: '동록서류',
      buttons: (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="contained" size="small" onClick={() => openNotImplementedDialog('')} color={'error'}>
            반려
          </Button>
          <Button variant="contained" size="small" onClick={() => openNotImplementedDialog('')} color={'success'}>
            승인
          </Button>
        </Box>
      ),
      fields: [
        {
          label: '유형',
          value: (
            <Box
              sx={{
                display: 'inline-block',
                px: 1.5,
                py: 0.5,
                borderRadius: '4px',
                backgroundColor: '#E5E7EB',
                color: '#374151',
                fontSize: '14px',
                fontWeight: 500
              }}
            >
              {member.partnershipType || '법인계약'}
            </Box>
          )
        },
        {
          label: '계약상태',
          value: (
            <Box
              sx={{
                display: 'inline-block',
                px: 1.5,
                py: 0.5,
                borderRadius: '4px',
                backgroundColor: member.businessInfo?.contractDate ? '#E5E7EB' : '#FEE2E2',
                color: member.businessInfo?.contractDate ? '#374151' : '#991B1B',
                fontSize: '14px',
                fontWeight: 500
              }}
            >
              {member.businessInfo?.contractDate ? '계약중' : '미계약'}
            </Box>
          )
        },
        { label: '회사명', value: member.businessInfo?.name || '케이메디컬스' },
        { label: '사업자등록번호', value: member.businessInfo?.businessNo || '465-86-03299' },
        { label: '정산은행', value: '우리은행 1005-123-45845' },
        {
          label: '재위탁계약서',
          value: (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="outlined" size="small" onClick={() => openNotImplementedDialog('')}>
                보기
              </Button>
              <Button variant="outlined" size="small" onClick={() => openNotImplementedDialog('')}>
                보기
              </Button>
              <Button variant="outlined" size="small" onClick={() => openNotImplementedDialog('')}>
                보기
              </Button>
            </Box>
          )
        },
        {
          label: 'CSO신고증',
          value: (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="outlined" size="small" onClick={() => openNotImplementedDialog('')}>
                보기
              </Button>
              <Button variant="outlined" size="small" onClick={() => openNotImplementedDialog('')}>
                보기
              </Button>
            </Box>
          )
        },
        {
          label: '판매위수탁 교육이수증',
          value: (
            <Button variant="outlined" size="small" onClick={() => openNotImplementedDialog('')}>
              보기
            </Button>
          )
        },
        { label: '계약일', value: member.businessInfo?.contractDate || '2025년 4월 23일' }
      ]
    },
    {
      title: '비고',
      fields: [
        {
          label: '메모',
          value: isEditing ? (
            <TextField
              fullWidth
              multiline
              rows={3}
              value={editValues.memo || ''}
              onChange={handleChange('memo')}
              placeholder="메모를 입력하세요"
            />
          ) : (
            <Typography sx={{ fontSize: '14px', minHeight: '80px', p: 1 }}>{member.memo || '등록된 메모가 없습니다.'}</Typography>
          )
        }
      ]
    },
    {
      title: '마케팅 수신동의',
      fields: [
        {
          label: '수신동의',
          value: (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={
                      isEditing
                        ? (editValues.marketingConsent as MarketingAgreements)?.sms
                        : (member.marketingConsent as MarketingAgreements)?.sms
                    }
                    onChange={handleChange('marketingConsent.sms')}
                    disabled={!isEditing}
                  />
                }
                label="SMS"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={
                      isEditing
                        ? (editValues.marketingConsent as MarketingAgreements)?.email
                        : (member.marketingConsent as MarketingAgreements)?.email
                    }
                    onChange={handleChange('marketingConsent.email')}
                    disabled={!isEditing}
                  />
                }
                label="이메일"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={
                      isEditing
                        ? (editValues.marketingConsent as MarketingAgreements)?.push
                        : (member.marketingConsent as MarketingAgreements)?.push
                    }
                    onChange={handleChange('marketingConsent.push')}
                    disabled={!isEditing}
                  />
                }
                label="App Push"
              />
            </Box>
          )
        }
      ]
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h4" sx={{ fontSize: '24px', fontWeight: 600 }}>
              회원정보
            </Typography>
            {!isEditing ? (
              <Button startIcon={<Edit2 size={18} />} variant="contained" onClick={handleEdit}>
                수정하기
              </Button>
            ) : (
              <Box>
                <Button
                  variant="contained"
                  onClick={handleCancel}
                  sx={{
                    mr: 1
                  }}
                >
                  취소
                </Button>
                <Button variant="contained" onClick={handleSave}>
                  저장
                </Button>
              </Box>
            )}
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: '18px',
                    fontWeight: 600
                  }}
                >
                  {sections[0].title}
                </Typography>
                {sections[0].buttons}
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {sections[0].fields.map((field, fieldIndex) => (
                  <Box key={fieldIndex}>
                    <Typography
                      sx={{
                        fontSize: '14px',
                        fontWeight: 500,
                        mb: 1
                      }}
                    >
                      {field.label}
                    </Typography>
                    <Box>{field.value}</Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Card sx={{ border: '1px solid #E5E7EB', borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontSize: '18px',
                      fontWeight: 600
                    }}
                  >
                    {sections[1].title}
                  </Typography>
                  {sections[1].buttons}
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  {sections[1].fields.map((field, fieldIndex) => (
                    <Box key={fieldIndex}>
                      <Typography
                        sx={{
                          fontSize: '14px',
                          fontWeight: 500,
                          mb: 1
                        }}
                      >
                        {field.label}
                      </Typography>
                      <Box>{field.value}</Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ border: '1px solid #E5E7EB', borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontSize: '18px',
                      fontWeight: 600
                    }}
                  >
                    {sections[2].title}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  {sections[2].fields.map((field, fieldIndex) => (
                    <Box key={fieldIndex}>
                      <Typography
                        sx={{
                          fontSize: '14px',
                          fontWeight: 500,
                          mb: 1
                        }}
                      >
                        {field.label}
                      </Typography>
                      <Box>{field.value}</Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Card sx={{ height: '100%', border: '1px solid #E5E7EB', borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: '18px',
                    fontWeight: 600
                  }}
                >
                  {sections[3].title}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {sections[3].fields.map((field, fieldIndex) => (
                  <Box key={fieldIndex}>
                    <Typography
                      sx={{
                        fontSize: '14px',
                        fontWeight: 500,
                        mb: 1
                      }}
                    >
                      {field.label}
                    </Typography>
                    <Box>{field.value}</Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
          <Button variant="contained" onClick={() => navigate(-1)}>
            취소
          </Button>
          <Button variant="contained" onClick={handleSave}>
            저장
          </Button>
        </Grid>
      </Grid>

      <PasswordChangeDialog open={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} onSave={handlePasswordChange} />
    </Box>
  );
}

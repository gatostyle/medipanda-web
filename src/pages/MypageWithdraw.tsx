import { deleteMember } from '@/backend';
import { MedipandaButton } from '@/custom/components/MedipandaButton';
import { useSession } from '@/hooks/useSession';
import { colors } from '@/themes';
import { Button, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export default function MypageWithdraw() {
  const { session } = useSession();

  const handleWithdraw = async () => {
    const confirmed = confirm('정말로 탈퇴하시겠습니까?');

    if (!confirmed) {
      return;
    }

    try {
      await deleteMember(session!.userId);
      alert('회원 탈퇴가 완료되었습니다. 그동안 메디판다를 이용해주셔서 감사합니다.');
      window.location.href = '/logout';
    } catch (e) {
      console.error(e);
      alert('회원 탈퇴 중 오류가 발생했습니다.');
    }
  };

  return (
    <>
      <Stack alignItems='center'>
        <Stack direction='row'>
          <img src='/assets/crying-panda.svg' />
          <Stack
            sx={{
              marginLeft: '30px',
            }}
          >
            <Typography variant='heading2B' sx={{}}>
              정말로
            </Typography>
            <Typography variant='heading2B' sx={{}}>
              회원을 탈퇴하시겠어요?
            </Typography>
          </Stack>
        </Stack>

        <Stack
          alignItems='center'
          gap='30px'
          sx={{
            width: '500px',
            padding: '30px 105px',
            border: `1px solid ${colors.gray30}`,
            marginTop: '30px',
            borderRadius: '5px',
            backgroundColor: '#f7f7f7',
          }}
        >
          <Stack gap='8px'>
            <Typography variant='largeTextB' sx={{ color: colors.gray80, textAlign: 'center' }}>
              1. 편리한 정산업무
            </Typography>
            <Typography variant='mediumTextR' sx={{ color: colors.gray80, textAlign: 'center' }}>
              매번 엑셀작업으로 정산을 하셨다면,
              <br />
              전산화된 데이터로 정산관리가 가능해집니다.
            </Typography>
          </Stack>
          <Stack gap='8px'>
            <Typography variant='largeTextB' sx={{ color: colors.gray80, textAlign: 'center' }}>
              2. CSO-MR의 커뮤니티
            </Typography>
            <Typography variant='mediumTextR' sx={{ color: colors.gray80, textAlign: 'center' }}>
              제약영업에 대한 고민거리를 동료들과나누며
              <br />
              영업네트워킹 및 정보 공유가 가능합니다.
            </Typography>
          </Stack>
          <Stack gap='8px'>
            <Typography variant='largeTextB' sx={{ color: colors.gray80, textAlign: 'center' }}>
              3. CSO활동에 필요한 정보
            </Typography>
            <Typography variant='mediumTextR' sx={{ color: colors.gray80, textAlign: 'center' }}>
              내가 거래하는 제약사의 이슈사항을 바로 바로 알림을 <br />
              받을 수 있습니다. <br />
              CSO 시작부터 진행하면서 필요한 정보들을 무료로 <br />
              제공 받으실 수 있습니다.
            </Typography>
          </Stack>
          <Stack gap='8px'>
            <Typography variant='largeTextB' sx={{ color: colors.gray80, textAlign: 'center' }}>
              4. 특별한 혜택
            </Typography>
            <Typography variant='mediumTextR' sx={{ color: colors.gray80, textAlign: 'center' }}>
              와인, 레스토랑 등 다양한 제휴 할인 혜택을 <br />
              받으실 수 있습니다.
            </Typography>
          </Stack>
        </Stack>

        <Typography variant='heading2B' sx={{ color: colors.gray80, marginTop: '30px' }}>
          위 혜택들이 사라져요.
        </Typography>
        <Typography variant='largeTextB' sx={{ color: colors.gray80, marginTop: '10px' }}>
          탈퇴할 경우, 동일한 아이디로는 재가입이 불가해요.
        </Typography>

        <Stack
          direction='row'
          gap='10px'
          sx={{
            width: '330px',
            marginTop: '60px',
          }}
        >
          <Button
            fullWidth
            variant='outlined'
            sx={{
              height: '49px',
              backgroundColor: colors.gray50,
              color: colors.white,
            }}
            onClick={handleWithdraw}
          >
            탈퇴하기
          </Button>
          <MedipandaButton fullWidth variant='contained' size='large' component={RouterLink} to='/'>
            취소하기
          </MedipandaButton>
        </Stack>
      </Stack>
    </>
  );
}

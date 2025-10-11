import { createAuthRequest, type KmcAuthRequest, result as getAuthResult } from '@/backend';
import { normalizePhoneNumber } from '@/lib/utils/form';

export const kmcAuthRequest: KmcAuthRequest = {
  cpId: 'XQWT1001',
  urlCode: '001001',
  certMet: 'M',
  plusInfo: 'WEB',
};

export async function requestKmcAuth() {
  const { certNum } = await createAuthRequest(kmcAuthRequest);
  const certUrl = `https://prod.api.medipanda.co.kr/v1/kmc/auth/launch?certNum=${certNum}`;
  const popup = window.open(certUrl, '_blank', 'width=500,height=700');

  return new Promise<{ name: string; phone: string; birth: string; gender: 'MALE' | 'FEMALE' }>(resolve => {
    const interval = setInterval(async () => {
      getAuthResult({ certNum })
        .then(result => {
          if (result.status == 'SUCCESS' || result.status == 'FAIL' || result.status == 'NOT_FOUND') {
            clearInterval(interval);
            popup?.close();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { name, phone, birth, gender } = result as any;
            resolve({
              name,
              phone: normalizePhoneNumber(phone),
              birth: birth.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'),
              gender: gender === '0' ? 'MALE' : 'FEMALE',
            });
          }
        })
        .catch();
    }, 500);
  });
}

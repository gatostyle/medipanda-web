import { getLatestPrivacyPolicy } from '@/backend';
import { FixedLinearProgress } from '@/lib/components/FixedLinearProgress';
import { colors } from '@/themes';
import { Typography } from '@mui/material';
import { useEffect, useState } from 'react';

export default function Privacy() {
  const [detail, setDetail] = useState<string | null>(null);

  useEffect(() => {
    fetchDetail();
  }, []);

  const fetchDetail = async () => {
    const data = await getLatestPrivacyPolicy();
    setDetail(data);
  };

  if (detail === null) {
    return <FixedLinearProgress />;
  }

  return (
    <>
      <Typography variant='heading3M' sx={{ alignSelf: 'center', color: colors.gray80 }}>
        개인정보처리방침
      </Typography>
      <iframe
        srcDoc={detail + '<style>html { padding: 20px }</style>'}
        style={{
          alignSelf: 'center',
          width: '912px',
          height: '912px',
          border: `1px solid ${colors.gray40}`,
          marginTop: '20px',
          boxSizing: 'border-box',
          overflow: 'auto',
        }}
      />
    </>
  );
}

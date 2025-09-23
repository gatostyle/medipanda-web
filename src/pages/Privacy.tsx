import { getLatestPrivacyPolicy } from '@/backend';
import { FixedLinearLoader } from '@/lib/react/FixedLinearLoader';
import { colors } from '@/themes';
import { Box, Typography } from '@mui/material';
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
    return <FixedLinearLoader />;
  }

  return (
    <>
      <Typography variant='heading3M' sx={{ color: colors.gray80 }}>
        개인정보처리방침
      </Typography>
      <Box dangerouslySetInnerHTML={{ __html: detail }} />
    </>
  );
}

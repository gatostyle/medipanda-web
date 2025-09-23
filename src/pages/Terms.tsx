import { getLatestTerms } from '@/backend';
import { FixedLinearLoader } from '@/lib/react/FixedLinearLoader';
import { colors } from '@/themes';
import { Box, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

export default function Terms() {
  const [detail, setDetail] = useState<string | null>(null);

  useEffect(() => {
    fetchDetail();
  }, []);

  const fetchDetail = async () => {
    const data = await getLatestTerms();
    setDetail(data);
  };

  if (detail === null) {
    return <FixedLinearLoader />;
  }

  return (
    <>
      <Typography variant='heading3M' sx={{ color: colors.gray80 }}>
        이용약관
      </Typography>
      <Box dangerouslySetInnerHTML={{ __html: detail }} />
    </>
  );
}

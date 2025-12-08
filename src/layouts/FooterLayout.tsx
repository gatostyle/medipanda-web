import { Footer } from '@/components/Footer';
import { Stack } from '@mui/material';
import { styled } from '@mui/material/styles';
import { memo, type ReactNode } from 'react';
import { Outlet } from 'react-router-dom';

const MaxWidthContainerWrapper = styled(Stack)({
  justifyContent: 'center',
  alignItems: 'center',
}) as typeof Stack;

const MaxWidthContainer = styled(Stack)({
  width: '1224px',
});

function FooterLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Stack sx={{ minHeight: '100vh' }}>
        <MaxWidthContainerWrapper component='main' sx={{ flexGrow: 1, my: '50px' }}>
          <MaxWidthContainer sx={{ flexGrow: 1 }}>
            {children}
            <Outlet />
          </MaxWidthContainer>
        </MaxWidthContainerWrapper>

        <Footer />
      </Stack>
    </>
  );
}

export default memo(FooterLayout);

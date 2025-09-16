import { MpProviders } from '@/medipanda/providers';
import Notistack from '@/_able/components/third-party/Notistack';
import ThemeCustomization from '@/_able/themes';
import { RouterProvider } from 'react-router';
import { router } from './router';

export function App() {
  return (
    <>
      <ThemeCustomization>
        <MpProviders>
          <Notistack>
            <RouterProvider router={router} />
          </Notistack>
        </MpProviders>
      </ThemeCustomization>
    </>
  );
}

import { Providers } from '@/Providers';
import Notistack from '@/_able/components/third-party/Notistack';
import ThemeCustomization from '@/_able/themes';
import { RouterProvider } from 'react-router';
import { router } from './router';

export function App() {
  return (
    <>
      <ThemeCustomization>
        <Notistack>
          <Providers>
            <RouterProvider router={router} />
          </Providers>
        </Notistack>
      </ThemeCustomization>
    </>
  );
}

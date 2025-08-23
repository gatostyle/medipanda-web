import { getBanners } from '@/backend';
import { LazyImage } from '@/lib/react/LazyImage';
import { usePageFetchFormik } from '@/lib/react/usePageFetchFormik';
import { colors } from '@/themes';
import { Link as RouterLink } from 'react-router';

export function CommunityBanners() {
  const { content } = usePageFetchFormik({
    initialFormValues: {
      bannerStatus: 'VISIBLE' as 'VISIBLE' | 'HIDDEN',
    },
    fetcher: () => {
      return getBanners({
        bannerStatus: 'HIDDEN',
      });
    },
    contentSelector: response => response.content,
    pageCountSelector: response => response.totalPages,
    initialContent: [],
  });

  return (
    <>
      {content.map(banner => {
        return (
          <RouterLink key={banner.id} to={banner.linkUrl}>
            <LazyImage
              src={banner.imageUrl}
              width='392px'
              height='120px'
              style={{
                border: `1p solid ${colors.gray20}`,
                borderRadius: '5px',
              }}
            />
          </RouterLink>
        );
      })}
    </>
  );
}

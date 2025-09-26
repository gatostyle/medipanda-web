import { getBanners } from '@/backend';
import { LazyImage } from '@/lib/components/LazyImage';
import { usePageFetchFormik } from '@/lib/components/usePageFetchFormik';
import { colors } from '@/themes';
import { Link as RouterLink } from 'react-router-dom';

export function CommunityBanners() {
  const { content } = usePageFetchFormik({
    fetcher: () => {
      return getBanners({
        isExposed: true,
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

import { type BannerResponse, getBanners } from '@/backend';
import { LazyImage } from '@/lib/components/LazyImage';
import { DateUtils } from '@/lib/utils/dateFormat';
import { setSchema } from '@/lib/utils/url';
import { colors } from '@/themes';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

export function CommunityBanners() {
  const [contents, setContents] = useState<BannerResponse[]>([]);

  const fetchContents = async () => {
    const response = await getBanners({ isExposed: true });

    setContents(
      response.content.filter(banner => {
        return DateUtils.utcToKst(new Date(banner.startAt)) <= new Date() && DateUtils.utcToKst(new Date(banner.endAt)) >= new Date();
      }),
    );
  };

  useEffect(() => {
    fetchContents();
  }, []);

  return (
    <>
      {contents.map(banner => {
        return (
          <RouterLink key={banner.id} to={setSchema(banner.linkUrl)} target='_blank'>
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

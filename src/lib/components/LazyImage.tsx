import { Skeleton } from '@mui/material';
import { type DetailedHTMLProps, type ImgHTMLAttributes, useEffect, useState } from 'react';

export function LazyImage(props: DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>) {
  const { src, width, height } = props;
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!src) {
      setLoaded(true);
      return;
    }

    setLoaded(false);
    const img = new Image();
    img.onload = () => setLoaded(true);
    img.onerror = () => setLoaded(true);
    img.src = src;
  }, [src]);

  if (!loaded) {
    return <Skeleton {...props} variant='rounded' width={width} height={height} />;
  }

  return <img {...props} />;
}

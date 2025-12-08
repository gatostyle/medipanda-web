import { forwardRef, type ReactNode, type Ref, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';

export function useCarousel(length: number, intervalMs = 3000) {
  const [index, setIndex] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const next = useCallback(() => {
    setIndex(prev => (prev - 1 + length) % length); // ← left-to-right
  }, [length]);

  const prev = useCallback(() => {
    setIndex(prev => (prev + 1) % length);
  }, [length]);

  const getOffset = (i: number) => {
    return (i - index + length) % length;
  };

  useEffect(() => {
    timer.current = setInterval(() => {
      next();
    }, intervalMs);

    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [length, intervalMs, next]);

  return { index, getOffset, next, prev };
}

export interface MedipandaCarouselHandle {
  next: () => void;
  prev: () => void;
}

interface MedipandaCarouselProps {
  children: ReactNode[];
  interval?: number;
  width?: number;
}

function MedipandaCarousel_({ children, interval = 3000, width = 300 }: MedipandaCarouselProps, ref: Ref<MedipandaCarouselHandle>) {
  const { getOffset, next, prev } = useCarousel(children.length, interval);

  useImperativeHandle(ref, () => ({ next, prev }), [next, prev]);

  return (
    <div style={{ overflow: 'hidden', width }}>
      <div
        style={{
          display: 'flex',
          width: `${children.length * width}px`,
          transform: `translateX(-${getOffset(0) * width}px)`,
          transition: 'transform 0.5s ease-in-out',
        }}
      >
        {children.map((child, i) => (
          <div key={i} style={{ flex: '0 0 auto', width }}>
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}

export const MedipandaCarousel = forwardRef(MedipandaCarousel_);

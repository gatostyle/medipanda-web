import { OutputResolution } from './types';

export const CANVAS_WIDTH = 1000;
export const CANVAS_HEIGHT = 750;

export const POINT_RADIUS = 8;
export const POINT_CLICK_THRESHOLD = 15;
export const POINT_COLORS = ['#ff4757', '#2ed573', '#3742fa', '#ffa502'];
export const POINT_LABELS = ['좌상단', '우상단', '우하단', '좌하단'];
export const POINT_EMOJIS = ['1️⃣', '2️⃣', '3️⃣', '4️⃣'];

export const LINE_WIDTH = 3;
export const LINE_DASH = [12, 6];
export const OVERLAY_ALPHA = 0.3;
export const SELECTION_AREA_ALPHA = 0.2;
export const SELECTION_BORDER_COLOR = '#007bff';
export const CONNECTING_LINE_COLOR = '#ff6b35';

export const DEFAULT_BRIGHTNESS = 0;
export const DEFAULT_CONTRAST = 1.0;
export const BRIGHTNESS_MIN = -50;
export const BRIGHTNESS_MAX = 50;
export const CONTRAST_MIN = 0.5;
export const CONTRAST_MAX = 2.0;
export const CONTRAST_STEP = 0.1;

export const RESOLUTION_OPTIONS = [
  { value: OutputResolution.HIGH_QUALITY, label: '1500px (고품질)' },
  { value: OutputResolution.HIGHEST_QUALITY, label: '2000px (최고품질)' },
  { value: OutputResolution.PRINT_QUALITY, label: '3000px (인쇄용)' },
  { value: OutputResolution.ORIGINAL, label: '원본 크기 유지' }
];

export const SHARPENING_KERNEL = [
  [-1, -1, -1],
  [-1, 9, -1],
  [-1, -1, -1]
];

export const DEFAULT_FILENAME_PREFIX = 'transformed_image';

export const CLICK_ANIMATION_DURATION = 500;
export const DIALOG_TRANSITION_DURATION = 300;

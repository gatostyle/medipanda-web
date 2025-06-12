export interface Point {
  x: number;
  y: number;
}

export interface ImageEnhancementOptions {
  brightness: number;
  contrast: number;
  sharpenFilter: boolean;
  contrastEnhance: boolean;
  noiseReduction: boolean;
}

export interface PerspectiveTransformDialogProps {
  open: boolean;
  onClose: () => void;
  imageUrl?: string;
  onSave?: (transformedImageData: string) => void;
}

export interface TransformState {
  points: Point[];
  draggedPointIndex: number;
  isDragging: boolean;
  backgroundImage: HTMLImageElement | null;
  scannedImageData: string | null;
  imageScale: number;
  imageOffsetX: number;
  imageOffsetY: number;
}

export enum OutputResolution {
  HIGH_QUALITY = 1500,
  HIGHEST_QUALITY = 2000,
  PRINT_QUALITY = 3000,
  ORIGINAL = 'original'
}

export interface Matrix3x3 {
  data: number[][];
}

export interface Color {
  r: number;
  g: number;
  b: number;
}

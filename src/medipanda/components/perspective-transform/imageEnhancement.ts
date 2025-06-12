import { ImageEnhancementOptions } from './types';
import { SHARPENING_KERNEL } from './constants';

export function adjustBrightnessContrast(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  brightness: number,
  contrast: number
): void {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.max(0, Math.min(255, contrast * data[i] + brightness));
    data[i + 1] = Math.max(0, Math.min(255, contrast * data[i + 1] + brightness));
    data[i + 2] = Math.max(0, Math.min(255, contrast * data[i + 2] + brightness));
  }

  ctx.putImageData(imageData, 0, 0);
}

export function applySharpeningFilter(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const imageData = ctx.getImageData(0, 0, width, height);
  const outputData = ctx.createImageData(width, height);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let r = 0;
      let g = 0;
      let b = 0;

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const pixelIndex = ((y + ky) * width + (x + kx)) * 4;
          const weight = SHARPENING_KERNEL[ky + 1][kx + 1];

          r += imageData.data[pixelIndex] * weight;
          g += imageData.data[pixelIndex + 1] * weight;
          b += imageData.data[pixelIndex + 2] * weight;
        }
      }

      const outputIndex = (y * width + x) * 4;
      outputData.data[outputIndex] = Math.max(0, Math.min(255, r));
      outputData.data[outputIndex + 1] = Math.max(0, Math.min(255, g));
      outputData.data[outputIndex + 2] = Math.max(0, Math.min(255, b));
      outputData.data[outputIndex + 3] = 255;
    }
  }

  copyEdgePixels(imageData, outputData, width, height);

  ctx.putImageData(outputData, 0, 0);
}

export function enhanceContrast(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  let min = 255;
  let max = 0;
  for (let i = 0; i < data.length; i += 4) {
    const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
    min = Math.min(min, gray);
    max = Math.max(max, gray);
  }

  const range = max - min;
  if (range === 0) return;

  for (let i = 0; i < data.length; i += 4) {
    data[i] = ((data[i] - min) / range) * 255;
    data[i + 1] = ((data[i + 1] - min) / range) * 255;
    data[i + 2] = ((data[i + 2] - min) / range) * 255;
  }

  ctx.putImageData(imageData, 0, 0);
}

export function applyNoiseReduction(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const imageData = ctx.getImageData(0, 0, width, height);
  const outputData = ctx.createImageData(width, height);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const rValues: number[] = [];
      const gValues: number[] = [];
      const bValues: number[] = [];

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const pixelIndex = ((y + ky) * width + (x + kx)) * 4;
          rValues.push(imageData.data[pixelIndex]);
          gValues.push(imageData.data[pixelIndex + 1]);
          bValues.push(imageData.data[pixelIndex + 2]);
        }
      }

      rValues.sort((a, b) => a - b);
      gValues.sort((a, b) => a - b);
      bValues.sort((a, b) => a - b);

      const outputIndex = (y * width + x) * 4;
      outputData.data[outputIndex] = rValues[4];
      outputData.data[outputIndex + 1] = gValues[4];
      outputData.data[outputIndex + 2] = bValues[4];
      outputData.data[outputIndex + 3] = 255;
    }
  }

  copyEdgePixels(imageData, outputData, width, height);

  ctx.putImageData(outputData, 0, 0);
}

function copyEdgePixels(sourceData: ImageData, targetData: ImageData, width: number, height: number): void {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
        const index = (y * width + x) * 4;
        targetData.data[index] = sourceData.data[index];
        targetData.data[index + 1] = sourceData.data[index + 1];
        targetData.data[index + 2] = sourceData.data[index + 2];
        targetData.data[index + 3] = 255;
      }
    }
  }
}

export function applyImageEnhancements(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: ImageEnhancementOptions
): void {
  if (options.brightness !== 0 || options.contrast !== 1.0) {
    adjustBrightnessContrast(ctx, width, height, options.brightness, options.contrast);
  }

  if (options.sharpenFilter) {
    applySharpeningFilter(ctx, width, height);
  }

  if (options.contrastEnhance) {
    enhanceContrast(ctx, width, height);
  }

  if (options.noiseReduction) {
    applyNoiseReduction(ctx, width, height);
  }
}

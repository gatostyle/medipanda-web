export interface Point {
  x: number;
  y: number;
}

export class PerspectiveTransform {
  private matrix: number[][];

  constructor(src: Point[], dst: Point[]) {
    if (src.length !== 4 || dst.length !== 4) {
      throw new Error('Perspective transform requires exactly 4 points');
    }
    this.matrix = this.calculateHomographyMatrix(src, dst);
  }

  private calculateHomographyMatrix(srcPoints: Point[], dstPoints: Point[]): number[][] {
    const A: number[][] = [];

    for (let i = 0; i < 4; i++) {
      const sx = srcPoints[i].x;
      const sy = srcPoints[i].y;
      const dx = dstPoints[i].x;
      const dy = dstPoints[i].y;

      A.push([sx, sy, 1, 0, 0, 0, -dx * sx, -dx * sy]);
      A.push([0, 0, 0, sx, sy, 1, -dy * sx, -dy * sy]);
    }

    const b = dstPoints.flatMap((p) => [p.x, p.y]);
    const h = this.solveLinearSystem(A, b);

    return [
      [h[0], h[1], h[2]],
      [h[3], h[4], h[5]],
      [h[6], h[7], 1]
    ];
  }

  private solveLinearSystem(A: number[][], b: number[]): number[] {
    const n = A.length;
    const m = A[0].length;

    for (let i = 0; i < Math.min(n, m); i++) {
      let maxRow = i;
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(A[k][i]) > Math.abs(A[maxRow][i])) {
          maxRow = k;
        }
      }

      [A[i], A[maxRow]] = [A[maxRow], A[i]];
      [b[i], b[maxRow]] = [b[maxRow], b[i]];

      for (let k = i + 1; k < n; k++) {
        if (Math.abs(A[i][i]) > 1e-10) {
          const factor = A[k][i] / A[i][i];
          for (let j = i; j < m; j++) {
            A[k][j] -= factor * A[i][j];
          }
          b[k] -= factor * b[i];
        }
      }
    }

    const x = new Array(m).fill(0);
    for (let i = Math.min(n, m) - 1; i >= 0; i--) {
      x[i] = b[i];
      for (let j = i + 1; j < m; j++) {
        x[i] -= A[i][j] * x[j];
      }
      if (Math.abs(A[i][i]) > 1e-10) {
        x[i] /= A[i][i];
      }
    }

    return x;
  }

  private invertMatrix3x3(m: number[][]): number[][] {
    const det =
      m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
      m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
      m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);

    if (Math.abs(det) < 1e-10) {
      return [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1]
      ];
    }

    const invDet = 1 / det;

    return [
      [
        (m[1][1] * m[2][2] - m[1][2] * m[2][1]) * invDet,
        (m[0][2] * m[2][1] - m[0][1] * m[2][2]) * invDet,
        (m[0][1] * m[1][2] - m[0][2] * m[1][1]) * invDet
      ],
      [
        (m[1][2] * m[2][0] - m[1][0] * m[2][2]) * invDet,
        (m[0][0] * m[2][2] - m[0][2] * m[2][0]) * invDet,
        (m[0][2] * m[1][0] - m[0][0] * m[1][2]) * invDet
      ],
      [
        (m[1][0] * m[2][1] - m[1][1] * m[2][0]) * invDet,
        (m[0][1] * m[2][0] - m[0][0] * m[2][1]) * invDet,
        (m[0][0] * m[1][1] - m[0][1] * m[1][0]) * invDet
      ]
    ];
  }

  transformPoint(point: Point): Point {
    const H = this.matrix;
    const w = H[2][0] * point.x + H[2][1] * point.y + H[2][2];
    if (Math.abs(w) < 1e-10) return { x: 0, y: 0 };

    return {
      x: (H[0][0] * point.x + H[0][1] * point.y + H[0][2]) / w,
      y: (H[1][0] * point.x + H[1][1] * point.y + H[1][2]) / w
    };
  }

  private applyHomographyTransform(x: number, y: number, H: number[][]): Point {
    const w = H[2][0] * x + H[2][1] * y + H[2][2];
    if (Math.abs(w) < 1e-10) return { x: 0, y: 0 };

    return {
      x: (H[0][0] * x + H[0][1] * y + H[0][2]) / w,
      y: (H[1][0] * x + H[1][1] * y + H[1][2]) / w
    };
  }

  applyToCanvas(
    sourceCanvas: HTMLCanvasElement,
    destCanvas: HTMLCanvasElement,
    sourcePoints: Point[],
    destWidth: number,
    destHeight: number
  ): void {
    const srcCtx = sourceCanvas.getContext('2d');
    const dstCtx = destCanvas.getContext('2d');

    if (!srcCtx || !dstCtx) return;

    dstCtx.imageSmoothingEnabled = true;
    dstCtx.imageSmoothingQuality = 'high';

    const srcData = srcCtx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
    destCanvas.width = destWidth;
    destCanvas.height = destHeight;
    const dstData = dstCtx.createImageData(destWidth, destHeight);

    const destPoints: Point[] = [
      { x: 0, y: 0 },
      { x: destWidth, y: 0 },
      { x: destWidth, y: destHeight },
      { x: 0, y: destHeight }
    ];

    const H = this.calculateHomographyMatrix(sourcePoints, destPoints);

    const invH = this.invertMatrix3x3(H);

    for (let y = 0; y < destHeight; y++) {
      for (let x = 0; x < destWidth; x++) {
        const srcPoint = this.applyHomographyTransform(x, y, invH);

        const color = this.bilinearInterpolation(srcData, srcPoint.x, srcPoint.y, sourceCanvas.width, sourceCanvas.height);

        if (color) {
          const dstIndex = (y * destWidth + x) * 4;
          dstData.data[dstIndex] = color.r;
          dstData.data[dstIndex + 1] = color.g;
          dstData.data[dstIndex + 2] = color.b;
          dstData.data[dstIndex + 3] = 255;
        }
      }
    }

    dstCtx.putImageData(dstData, 0, 0);
  }

  private bilinearInterpolation(
    imageData: ImageData,
    x: number,
    y: number,
    width: number,
    height: number
  ): { r: number; g: number; b: number } | null {
    if (x < 0 || x >= width - 1 || y < 0 || y >= height - 1) {
      return null;
    }

    const x1 = Math.floor(x);
    const y1 = Math.floor(y);
    const x2 = Math.min(x1 + 1, width - 1);
    const y2 = Math.min(y1 + 1, height - 1);

    const dx = x - x1;
    const dy = y - y1;

    const getPixel = (px: number, py: number) => {
      const index = (py * width + px) * 4;
      return {
        r: imageData.data[index],
        g: imageData.data[index + 1],
        b: imageData.data[index + 2]
      };
    };

    const p1 = getPixel(x1, y1);
    const p2 = getPixel(x2, y1);
    const p3 = getPixel(x1, y2);
    const p4 = getPixel(x2, y2);

    const r = p1.r * (1 - dx) * (1 - dy) + p2.r * dx * (1 - dy) + p3.r * (1 - dx) * dy + p4.r * dx * dy;

    const g = p1.g * (1 - dx) * (1 - dy) + p2.g * dx * (1 - dy) + p3.g * (1 - dx) * dy + p4.g * dx * dy;

    const b = p1.b * (1 - dx) * (1 - dy) + p2.b * dx * (1 - dy) + p3.b * (1 - dx) * dy + p4.b * dx * dy;

    return {
      r: Math.round(r),
      g: Math.round(g),
      b: Math.round(b)
    };
  }
}

export function calculateOutputDimensions(points: Point[], targetResolution?: number): { width: number; height: number } {
  const width1 = Math.sqrt(Math.pow(points[1].x - points[0].x, 2) + Math.pow(points[1].y - points[0].y, 2));
  const width2 = Math.sqrt(Math.pow(points[2].x - points[3].x, 2) + Math.pow(points[2].y - points[3].y, 2));
  const height1 = Math.sqrt(Math.pow(points[3].x - points[0].x, 2) + Math.pow(points[3].y - points[0].y, 2));
  const height2 = Math.sqrt(Math.pow(points[2].x - points[1].x, 2) + Math.pow(points[2].y - points[1].y, 2));

  const avgWidth = (width1 + width2) / 2;
  const avgHeight = (height1 + height2) / 2;

  if (targetResolution) {
    const scaleFactor = targetResolution / Math.max(avgWidth, avgHeight);
    return {
      width: Math.round(avgWidth * scaleFactor),
      height: Math.round(avgHeight * scaleFactor)
    };
  }

  return {
    width: Math.round(avgWidth),
    height: Math.round(avgHeight)
  };
}

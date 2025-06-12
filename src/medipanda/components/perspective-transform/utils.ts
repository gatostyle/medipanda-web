import { Point, Color, Matrix3x3 } from './types';

export function calculateHomographyMatrix(srcPoints: Point[], dstPoints: Point[]): Matrix3x3 {
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
  const h = solveLinearSystem(A, b);

  return {
    data: [
      [h[0], h[1], h[2]],
      [h[3], h[4], h[5]],
      [h[6], h[7], 1]
    ]
  };
}

function solveLinearSystem(A: number[][], b: number[]): number[] {
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

export function applyHomographyTransform(x: number, y: number, H: Matrix3x3): Point {
  const h = H.data;
  const w = h[2][0] * x + h[2][1] * y + h[2][2];

  if (Math.abs(w) < 1e-10) {
    return { x: 0, y: 0 };
  }

  return {
    x: (h[0][0] * x + h[0][1] * y + h[0][2]) / w,
    y: (h[1][0] * x + h[1][1] * y + h[1][2]) / w
  };
}

export function invertMatrix3x3(m: Matrix3x3): Matrix3x3 {
  const d = m.data;
  const det =
    d[0][0] * (d[1][1] * d[2][2] - d[1][2] * d[2][1]) -
    d[0][1] * (d[1][0] * d[2][2] - d[1][2] * d[2][0]) +
    d[0][2] * (d[1][0] * d[2][1] - d[1][1] * d[2][0]);

  if (Math.abs(det) < 1e-10) {
    return {
      data: [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1]
      ]
    };
  }

  const invDet = 1 / det;

  return {
    data: [
      [
        (d[1][1] * d[2][2] - d[1][2] * d[2][1]) * invDet,
        (d[0][2] * d[2][1] - d[0][1] * d[2][2]) * invDet,
        (d[0][1] * d[1][2] - d[0][2] * d[1][1]) * invDet
      ],
      [
        (d[1][2] * d[2][0] - d[1][0] * d[2][2]) * invDet,
        (d[0][0] * d[2][2] - d[0][2] * d[2][0]) * invDet,
        (d[0][2] * d[1][0] - d[0][0] * d[1][2]) * invDet
      ],
      [
        (d[1][0] * d[2][1] - d[1][1] * d[2][0]) * invDet,
        (d[0][1] * d[2][0] - d[0][0] * d[2][1]) * invDet,
        (d[0][0] * d[1][1] - d[0][1] * d[1][0]) * invDet
      ]
    ]
  };
}

export function bilinearInterpolation(imageData: ImageData, x: number, y: number, width: number, height: number): Color | null {
  if (x < 0 || x >= width - 1 || y < 0 || y >= height - 1) {
    return null;
  }

  const x1 = Math.floor(x);
  const y1 = Math.floor(y);
  const x2 = Math.min(x1 + 1, width - 1);
  const y2 = Math.min(y1 + 1, height - 1);

  const dx = x - x1;
  const dy = y - y1;

  const getPixel = (px: number, py: number): Color => {
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
    r: Math.round(Math.max(0, Math.min(255, r))),
    g: Math.round(Math.max(0, Math.min(255, g))),
    b: Math.round(Math.max(0, Math.min(255, b)))
  };
}

export function isPointNear(point: Point, x: number, y: number, threshold: number): boolean {
  const distance = Math.sqrt(Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2));
  return distance <= threshold;
}

export function calculateAverageDimensions(points: Point[]): { width: number; height: number } {
  if (points.length !== 4) {
    return { width: 0, height: 0 };
  }

  const width1 = Math.sqrt(Math.pow(points[1].x - points[0].x, 2) + Math.pow(points[1].y - points[0].y, 2));
  const width2 = Math.sqrt(Math.pow(points[2].x - points[3].x, 2) + Math.pow(points[2].y - points[3].y, 2));
  const height1 = Math.sqrt(Math.pow(points[3].x - points[0].x, 2) + Math.pow(points[3].y - points[0].y, 2));
  const height2 = Math.sqrt(Math.pow(points[2].x - points[1].x, 2) + Math.pow(points[2].y - points[1].y, 2));

  return {
    width: (width1 + width2) / 2,
    height: (height1 + height2) / 2
  };
}

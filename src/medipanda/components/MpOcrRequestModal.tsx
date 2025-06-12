import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, LinearProgress, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { OcrResponse } from 'medipanda/api-definitions/MpOcr';

interface Point {
  x: number;
  y: number;
}

interface OcrRequestModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (response: OcrResponse) => void;
  imageUrl?: string;
}

export function MpOcrRequestModal({ open, onClose, onSubmit, imageUrl }: OcrRequestModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const transformedCanvasRef = useRef<HTMLCanvasElement>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedPointIndex, setDraggedPointIndex] = useState(-1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
  const [lastDragTime, setLastDragTime] = useState<number>(0);

  useEffect(() => {
    if (open && imageUrl) {
      const img = new Image();
      img.onload = () => {
        setBackgroundImage(img);
        setPoints([]);
        redraw();
      };
      img.src = imageUrl;
    } else if (open && !imageUrl) {
      setBackgroundImage(null);
      setPoints([]);
      loadSampleImage();
    }
  }, [open, imageUrl]);

  const getPointAtPosition = (x: number, y: number): number => {
    for (let i = 0; i < points.length; i++) {
      const distance = Math.sqrt(Math.pow(x - points[i].x, 2) + Math.pow(y - points[i].y, 2));
      if (distance <= 15) {
        return i;
      }
    }
    return -1;
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (points.length >= 4 && draggedPointIndex === -1) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    const clickedPointIndex = getPointAtPosition(x, y);
    if (clickedPointIndex !== -1) return;

    if (points.length < 4) {
      setPoints([...points, { x, y }]);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    const pointIndex = getPointAtPosition(x, y);
    if (pointIndex !== -1) {
      setDraggedPointIndex(pointIndex);
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    if (isDragging && draggedPointIndex !== -1) {
      const currentTime = Date.now();
      if (currentTime - lastDragTime >= 1000) {
        const newPoints = [...points];
        newPoints[draggedPointIndex] = { x, y };
        setPoints(newPoints);
        setLastDragTime(currentTime);
      }
    } else {
      const pointIndex = getPointAtPosition(x, y);
      canvas.style.cursor = pointIndex !== -1 ? 'move' : 'crosshair';
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggedPointIndex(-1);
  };

  const loadSampleImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#f8f9fa');
    gradient.addColorStop(1, '#e9ecef');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#dee2e6';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 20) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    ctx.fillStyle = 'white';
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(100, 75);
    ctx.lineTo(400, 60);
    ctx.lineTo(425, 300);
    ctx.lineTo(75, 325);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#333';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('Sample Prescription', 150, 120);
    ctx.font = '12px Arial';
    ctx.fillText('Patient: John Doe', 150, 150);
    ctx.fillText('Medicine: Sample Med 100mg', 150, 170);
    ctx.fillText('Quantity: 30 tablets', 150, 190);
    ctx.fillText('Instructions: 1 tablet daily', 150, 210);
  };

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (backgroundImage) {
      const scale = Math.min(canvas.width / backgroundImage.width, canvas.height / backgroundImage.height);
      const w = backgroundImage.width * scale;
      const h = backgroundImage.height * scale;
      const x = (canvas.width - w) / 2;
      const y = (canvas.height - h) / 2;
      ctx.drawImage(backgroundImage, x, y, w, h);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    if (points.length === 4) {
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.closePath();
      ctx.fillStyle = 'rgba(0, 123, 255, 0.2)';
      ctx.fill();
      ctx.strokeStyle = '#007bff';
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    if (points.length > 1) {
      ctx.strokeStyle = '#ff6b35';
      ctx.lineWidth = 2;
      ctx.setLineDash([12, 6]);
      for (let i = 0; i < points.length - 1; i++) {
        ctx.beginPath();
        ctx.moveTo(points[i].x, points[i].y);
        ctx.lineTo(points[i + 1].x, points[i + 1].y);
        ctx.stroke();
      }
      if (points.length === 4) {
        ctx.beginPath();
        ctx.moveTo(points[3].x, points[3].y);
        ctx.lineTo(points[0].x, points[0].y);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }

    const colors = ['#ff4757', '#2ed573', '#3742fa', '#ffa502'];
    const labels = ['1', '2', '3', '4'];
    points.forEach((point, index) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 10, 0, 2 * Math.PI);
      ctx.fillStyle = colors[index];
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = 'white';
      ctx.fill();

      ctx.fillStyle = colors[index];
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(labels[index], point.x, point.y + 4);
    });

    if (points.length === 4) {
      updateTransformedPreview();
    }
  }, [backgroundImage, points]);

  const updateTransformedPreview = () => {
    const srcCanvas = canvasRef.current;
    const dstCanvas = transformedCanvasRef.current;
    if (!srcCanvas || !dstCanvas || points.length !== 4) return;

    const srcCtx = srcCanvas.getContext('2d');
    const dstCtx = dstCanvas.getContext('2d');
    if (!srcCtx || !dstCtx) return;

    const width1 = Math.sqrt(Math.pow(points[1].x - points[0].x, 2) + Math.pow(points[1].y - points[0].y, 2));
    const width2 = Math.sqrt(Math.pow(points[2].x - points[3].x, 2) + Math.pow(points[2].y - points[3].y, 2));
    const height1 = Math.sqrt(Math.pow(points[3].x - points[0].x, 2) + Math.pow(points[3].y - points[0].y, 2));
    const height2 = Math.sqrt(Math.pow(points[2].x - points[1].x, 2) + Math.pow(points[2].y - points[1].y, 2));

    const avgWidth = (width1 + width2) / 2;
    const avgHeight = (height1 + height2) / 2;

    const targetResolution = 3000;
    const scaleFactor = targetResolution / Math.max(avgWidth, avgHeight);
    const outputWidth = Math.round(avgWidth * scaleFactor);
    const outputHeight = Math.round(avgHeight * scaleFactor);

    dstCanvas.width = outputWidth;
    dstCanvas.height = outputHeight;

    const dstPoints = [
      { x: 0, y: 0 },
      { x: outputWidth, y: 0 },
      { x: outputWidth, y: outputHeight },
      { x: 0, y: outputHeight }
    ];

    const H = calculateHomographyMatrix(points, dstPoints);
    const invH = invertMatrix3x3(H);

    const srcImageData = srcCtx.getImageData(0, 0, srcCanvas.width, srcCanvas.height);
    const dstImageData = dstCtx.createImageData(outputWidth, outputHeight);

    for (let y = 0; y < outputHeight; y++) {
      for (let x = 0; x < outputWidth; x++) {
        const srcPoint = applyHomographyTransform(x, y, invH);

        if (srcPoint.x >= 0 && srcPoint.x < srcCanvas.width - 1 && srcPoint.y >= 0 && srcPoint.y < srcCanvas.height - 1) {
          const x0 = Math.floor(srcPoint.x);
          const x1 = Math.ceil(srcPoint.x);
          const y0 = Math.floor(srcPoint.y);
          const y1 = Math.ceil(srcPoint.y);

          const fx = srcPoint.x - x0;
          const fy = srcPoint.y - y0;

          const getPixel = (px: number, py: number) => {
            const idx = (py * srcCanvas.width + px) * 4;
            return {
              r: srcImageData.data[idx],
              g: srcImageData.data[idx + 1],
              b: srcImageData.data[idx + 2],
              a: srcImageData.data[idx + 3]
            };
          };

          const p00 = getPixel(x0, y0);
          const p10 = getPixel(x1, y0);
          const p01 = getPixel(x0, y1);
          const p11 = getPixel(x1, y1);

          const r = (1 - fx) * (1 - fy) * p00.r + fx * (1 - fy) * p10.r + (1 - fx) * fy * p01.r + fx * fy * p11.r;
          const g = (1 - fx) * (1 - fy) * p00.g + fx * (1 - fy) * p10.g + (1 - fx) * fy * p01.g + fx * fy * p11.g;
          const b = (1 - fx) * (1 - fy) * p00.b + fx * (1 - fy) * p10.b + (1 - fx) * fy * p01.b + fx * fy * p11.b;
          const a = (1 - fx) * (1 - fy) * p00.a + fx * (1 - fy) * p10.a + (1 - fx) * fy * p01.a + fx * fy * p11.a;

          const dstIdx = (y * outputWidth + x) * 4;
          dstImageData.data[dstIdx] = Math.round(r);
          dstImageData.data[dstIdx + 1] = Math.round(g);
          dstImageData.data[dstIdx + 2] = Math.round(b);
          dstImageData.data[dstIdx + 3] = Math.round(a);
        }
      }
    }

    dstCtx.putImageData(dstImageData, 0, 0);
  };

  const calculateHomographyMatrix = (srcPoints: Point[], dstPoints: Point[]): number[][] => {
    const A: number[][] = [];
    const b: number[] = [];

    for (let i = 0; i < 4; i++) {
      const sx = srcPoints[i].x;
      const sy = srcPoints[i].y;
      const dx = dstPoints[i].x;
      const dy = dstPoints[i].y;

      A.push([sx, sy, 1, 0, 0, 0, -dx * sx, -dx * sy]);
      A.push([0, 0, 0, sx, sy, 1, -dy * sx, -dy * sy]);
      b.push(dx);
      b.push(dy);
    }

    const h = solveLinearSystem(A, b);
    return [
      [h[0], h[1], h[2]],
      [h[3], h[4], h[5]],
      [h[6], h[7], 1]
    ];
  };

  const solveLinearSystem = (A: number[][], b: number[]): number[] => {
    const n = A.length;
    const augmented = A.map((row, i) => [...row, b[i]]);

    for (let i = 0; i < n; i++) {
      let maxRow = i;
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
          maxRow = k;
        }
      }

      [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];

      for (let k = i + 1; k < n; k++) {
        const c = augmented[k][i] / augmented[i][i];
        for (let j = i; j < n + 1; j++) {
          if (i === j) {
            augmented[k][j] = 0;
          } else {
            augmented[k][j] -= c * augmented[i][j];
          }
        }
      }
    }

    const x = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      x[i] = augmented[i][n] / augmented[i][i];
      for (let k = i - 1; k >= 0; k--) {
        augmented[k][n] -= augmented[k][i] * x[i];
      }
    }

    return x;
  };

  const applyHomographyTransform = (x: number, y: number, H: number[][]): Point => {
    const w = H[2][0] * x + H[2][1] * y + H[2][2];
    return {
      x: (H[0][0] * x + H[0][1] * y + H[0][2]) / w,
      y: (H[1][0] * x + H[1][1] * y + H[1][2]) / w
    };
  };

  const invertMatrix3x3 = (m: number[][]): number[][] => {
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
  };

  useEffect(() => {
    redraw();
  }, [points, redraw]);

  useEffect(() => {
    if (points.length === 4) {
      updateTransformedPreview();
    }
  }, [points]);

  const handleSubmit = async () => {
    if (points.length !== 4) return;

    setIsProcessing(true);

    try {
      const transformedCanvas = transformedCanvasRef.current;
      if (!transformedCanvas) {
        throw new Error('Transformed canvas not found');
      }

      const blob = await new Promise<Blob>((resolve, reject) => {
        transformedCanvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to convert canvas to blob'));
            }
          },
          'image/jpeg',
          0.95
        );
      });

      const formData = new FormData();
      formData.append('file', blob, 'scanned.jpg');

      if (backgroundImage && imageUrl) {
        const originalResponse = await fetch(imageUrl);
        const originalBlob = await originalResponse.blob();
        formData.append('original-file', originalBlob, 'original.jpg');

        formData.append('width', backgroundImage.width.toString());
        formData.append('height', backgroundImage.height.toString());

        const canvas = canvasRef.current!;
        const scale = Math.min(canvas.width / backgroundImage.width, canvas.height / backgroundImage.height);
        const w = backgroundImage.width * scale;
        const h = backgroundImage.height * scale;
        const imageOffsetX = (canvas.width - w) / 2;
        const imageOffsetY = (canvas.height - h) / 2;
        const imageScale = 1 / scale;

        const originalPoints = points.map((point) => ({
          x: (point.x - imageOffsetX) * imageScale,
          y: (point.y - imageOffsetY) * imageScale
        }));

        formData.append('x1', originalPoints[0].x.toString());
        formData.append('y1', originalPoints[0].y.toString());
        formData.append('x2', originalPoints[1].x.toString());
        formData.append('y2', originalPoints[1].y.toString());
        formData.append('x3', originalPoints[2].x.toString());
        formData.append('y3', originalPoints[2].y.toString());
        formData.append('x4', originalPoints[3].x.toString());
        formData.append('y4', originalPoints[3].y.toString());
      }

      const response = await fetch('/ocr', {
        method: 'POST',
        mode: 'cors',
        headers: {
          Accept: 'application/json'
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`OCR API error: ${response.status}`);
      }

      const ocrData = await response.json();

      onSubmit(ocrData);
      onClose();
    } catch (error) {
      console.error('OCR processing error:', error);
      alert('OCR 처리 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setPoints([]);
    setIsProcessing(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xl" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">OCR 요청</Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="body2" color="text.secondary">
                상단 캔버스: 원본 이미지 - 4개의 모서리 점을 클릭하여 문서 영역을 선택하세요
              </Typography>
              <Typography variant="body2" color="text.secondary">
                하단 캔버스: 변환된 이미지 - 선택한 영역이 자동으로 변환됩니다
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box display="flex" flexDirection="column" gap={2}>
          <Box>
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              style={{
                border: '2px solid #333',
                cursor: 'crosshair',
                display: 'block',
                margin: '0 auto',
                backgroundColor: 'white',
                maxWidth: '100%',
                height: 'auto'
              }}
              onClick={handleCanvasClick}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
          </Box>

          <Box
            sx={{ overflow: 'auto', maxHeight: '400px', border: '1px solid #e0e0e0', borderRadius: 1, p: 1, backgroundColor: '#f5f5f5' }}
          >
            <canvas
              ref={transformedCanvasRef}
              style={{
                border: '2px solid #007bff',
                display: 'block',
                margin: '0 auto',
                backgroundColor: '#f0f0f0',
                maxWidth: '100%',
                height: 'auto'
              }}
            />
          </Box>
        </Box>

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body1" color={points.length === 4 ? 'success.main' : 'text.secondary'} fontWeight="bold">
            {points.length === 4
              ? '문서 모서리가 모두 선택되었습니다!'
              : `4개 점을 클릭해서 문서 모서리를 선택해주세요 (${points.length}/4)`}
          </Typography>
        </Box>

        {isProcessing && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress />
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
              OCR 처리 중...
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="inherit">
          취소
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="success" disabled={points.length !== 4 || isProcessing}>
          제출
        </Button>
      </DialogActions>
    </Dialog>
  );
}

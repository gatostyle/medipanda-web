import axios from '@/utils/axios';

export interface OcrResponse {
  code: string;
  name: string;
  volume: number;
  price: number;
  rate: number;
  unit: string;
  totalAmount: number;
  feeAmount: number;
}

export async function requestOcr(data: {
  drugCompanyCode: string;
  file: Blob;
  originalFile: Blob;
  originalFileName: string;
  width: number;
  height: number;
  points: { x: number; y: number }[];
}): Promise<OcrResponse[]> {
  const form = new FormData();
  form.append('drug-company-code', data.drugCompanyCode);
  form.append('cropped-image', data.file, `${data.originalFileName}_scanned.jpg`);
  form.append('original-image', data.originalFile, data.originalFileName);

  form.append('width', data.width.toString());
  form.append('height', data.height.toString());

  form.append('x1', data.points[0].x.toString());
  form.append('y1', data.points[0].y.toString());
  form.append('x2', data.points[1].x.toString());
  form.append('y2', data.points[1].y.toString());
  form.append('x3', data.points[2].x.toString());
  form.append('y3', data.points[2].y.toString());
  form.append('x4', data.points[3].x.toString());
  form.append('y4', data.points[3].y.toString());

  const response = await axios.request<OcrResponse[]>({
    method: 'POST',
    url: '/ocr',
    data: form,
  });

  return response.data;
}

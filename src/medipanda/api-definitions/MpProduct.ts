import { delay } from 'medipanda/utils/mock-helpers';
import { NotImplementedError } from './NotImplementedError';

export interface MpRateTableUploadResponse {
  success: boolean;
  message: string;
  updatedCount?: number;
}

export const mpUploadRateTable = async (file: File): Promise<MpRateTableUploadResponse> => {
  await delay(500);
  // Mock implementation
  return {
    success: true,
    message: '요율표가 성공적으로 업로드되었습니다.',
    updatedCount: 0
  };

  // Real API implementation
  // const formData = new FormData();
  // formData.append('file', file);
  // const { data } = await axios.post<MpRateTableUploadResponse>('/v1/products/rate-table', formData, {
  //   headers: { 'Content-Type': 'multipart/form-data' }
  // });
  // return data;
};

export const mpDownloadProductsExcel = async (): Promise<void> => {
  await delay(300);
  throw new NotImplementedError('엑셀 다운로드');

  /*
  // Real API implementation
  const response = await axios.get('/v1/products/excel', { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'products.xlsx';
  link.click();
  */
};

export const mpDownloadRateTableTemplate = async (): Promise<void> => {
  await delay(300);
  // Mock implementation - create a dummy download
  const link = document.createElement('a');
  link.href = `data:text/plain`;
  link.download = `test.xlsx`;
  link.click();

  // Real API implementation
  // const response = await axios.get('/v1/products/rate-table/template', {
  //   responseType: 'blob'
  // });
  // const url = window.URL.createObjectURL(new Blob([response.data]));
  // const link = document.createElement('a');
  // link.href = url;
  // link.setAttribute('download', '요율표_양식.xlsx');
  // document.body.appendChild(link);
  // link.click();
  // link.remove();
};

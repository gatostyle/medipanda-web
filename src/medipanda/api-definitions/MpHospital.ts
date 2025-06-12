import { delay } from 'medipanda/utils/mock-helpers';
import { NotImplementedError } from './NotImplementedError';

export const mpDownloadHospitalTemplate = async (): Promise<void> => {
  await delay(300);
  throw new NotImplementedError('양식 다운로드');

  // const response = await axios.get('/v1/hospitals/template', { responseType: 'blob' });
  // const url = window.URL.createObjectURL(new Blob([response.data]));
  // const link = document.createElement('a');
  // link.href = url;
  // link.download = 'hospital_template.xlsx';
  // link.click();
};

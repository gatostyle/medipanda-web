import { NotImplementedError } from './NotImplementedError';

export const mpDownloadSettlementEDI = async (): Promise<void> => {
  throw new NotImplementedError('EDI 다운로드');

  // const response = await axios.get('/v1/settlements/edi', { responseType: 'blob' });
  // const url = window.URL.createObjectURL(new Blob([response.data]));
  // const link = document.createElement('a');
  // link.href = url;
  // link.download = 'settlements.edi';
  // link.click();
};

export const mpPrintSettlementEDI = async (): Promise<void> => {
  throw new NotImplementedError('EDI 인쇄');

  // await axios.post('/v1/settlements/edi/print');
};

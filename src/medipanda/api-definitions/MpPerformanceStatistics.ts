/**
 * API Definition for Performance Statistics
 * 실적통계 관련 타입 정의
 */

import { delay } from 'medipanda/utils/mock-helpers';
import { NotImplementedError } from './NotImplementedError';

export interface MpPerformanceStatistics {
  id: number;
  drugCompany: string;
  companyName: string;
  dealerName: string;
  institutionCode: string;
  institutionName: string;
  settlementMonth: string;
  prescriptionAmount: number;
  totalAmount: number;
  commissionAmount: number;
  basicCommissionRate: number;
}

export const mpGetPerformanceStatistics = async (): Promise<MpPerformanceStatistics[]> => {
  await delay(300);
  const { mockPerformanceStatistics } = await import('medipanda/api-mock-data/MpPerformanceStatistics');
  return mockPerformanceStatistics;

  /*
  // Real API implementation
  const { data } = await axios.get<MpPerformanceStatistics[]>('/v1/performance-statistics');
  return data;
  */
};

export const mpDownloadPerformanceStatisticsExcel = async (): Promise<void> => {
  await delay(300);
  throw new NotImplementedError('Excel 다운로드');

  /*
  // Real API implementation
  const response = await axios.get('/v1/performance-statistics/excel', { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'performance_statistics.xlsx';
  link.click();
  */
};

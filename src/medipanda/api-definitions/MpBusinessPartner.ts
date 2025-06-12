import { delay } from 'medipanda/utils/mock-helpers';
import { NotImplementedError } from './NotImplementedError';
import { mockString } from 'medipanda/mockup';

export const mpDownloadBusinessPartnerTemplate = async (): Promise<void> => {
  await delay(300);
  throw new NotImplementedError(mockString('양식다운로드'));
};

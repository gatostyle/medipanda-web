import { delay } from 'utils/medipanda/delay';
import { mockPrescriptionProducts } from 'api-mock-data/MpPrescriptionProductMock';

export interface MpPrescriptionProduct {
  id: number;
  brandCode: string;
  productName: string;
  standard: string;
  unit: string;
  guarantee: string;
  unitPrice: number;
  quantity: number;
  amount: number;
  note: string;
}

export interface MpPrescriptionProductSearchRequest {
  prescriptionFormId?: number;
}

export const mpFetchPrescriptionProducts = async (request: MpPrescriptionProductSearchRequest = {}): Promise<MpPrescriptionProduct[]> => {
  await delay(300);

  return Object.values(mockPrescriptionProducts);
};

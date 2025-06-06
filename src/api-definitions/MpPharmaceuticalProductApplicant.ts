import { delay } from 'utils/medipanda/delay';
import { mockPharmaceuticalProductApplicants } from 'api-mock-data/MpPharmaceuticalProductApplicantMock';

export interface MpPharmaceuticalProductApplicant {
  id: number;
  memberNumber: string;
  userId: string;
  memberName: string;
  phoneNumber: string;
  applicationDate: string;
  partnerContract: string;
  salesQuantity: number;
}

export interface MpPharmaceuticalProductApplicantSearchRequest {
  productId?: number;
}

export const mpFetchPharmaceuticalProductApplicants = async (
  request: MpPharmaceuticalProductApplicantSearchRequest = {}
): Promise<MpPharmaceuticalProductApplicant[]> => {
  await delay(300);

  return Object.values(mockPharmaceuticalProductApplicants);
};

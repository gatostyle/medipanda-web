import { delay } from 'utils/medipanda/delay';
import { MpPagedRequest, MpPagedResponse, MpWithSequence } from './MpPaged';
import { mockPharmaceuticalCompanies } from 'api-mock-data/MpPharmaceuticalCompanyMock';

export interface MpPharmaceuticalCompany {
  id: number;
  companyName: string;
  totalQuantity: number;
  soldQuantity: number;
  manager: string;
  managerName: string;
  contractDate: string;
  sequence: number;
}

export interface MpPharmaceuticalCompanySearchRequest extends MpPagedRequest<MpPharmaceuticalCompany> {
  searchKeyword?: string;
}

export const mpFetchPharmaceuticalCompanies = async (
  request: MpPharmaceuticalCompanySearchRequest
): Promise<MpPagedResponse<MpPharmaceuticalCompany>> => {
  await delay(500);

  let filteredCompanies = Object.values(mockPharmaceuticalCompanies);

  if (request.searchKeyword) {
    filteredCompanies = filteredCompanies.filter((item) => item.companyName.toLowerCase().includes(request.searchKeyword!.toLowerCase()));
  }

  const contentWithSequence: MpWithSequence<MpPharmaceuticalCompany>[] = filteredCompanies
    .slice(request.page * request.size, (request.page + 1) * request.size)
    .map((item, index) => ({
      ...item,
      sequence: filteredCompanies.length - request.page * request.size - index
    }));

  return {
    content: contentWithSequence,
    pageable: {
      pageNumber: request.page
    },
    totalPages: Math.ceil(filteredCompanies.length / request.size),
    totalElements: filteredCompanies.length
  };
};

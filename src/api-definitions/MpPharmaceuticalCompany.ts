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

export interface MpPharmaceuticalCompanyDetail {
  id: number;
  companyName: string;
  businessRegistrationNo: string;
  totalQuantity: number;
  settlementDay: string;
  contractManager: string;
  phoneNumber: string;
  contractDate: string;
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

export const mpFetchPharmaceuticalCompanyDetail = async (companyId: number): Promise<MpPharmaceuticalCompanyDetail> => {
  await delay(300);

  const company = mockPharmaceuticalCompanies[companyId];
  if (!company) {
    throw new Error(`제약사 ID ${companyId}를 찾을 수 없습니다.`);
  }

  return {
    id: company.id,
    companyName: company.companyName,
    businessRegistrationNo: `${110 + company.id}-${10200 + company.id}`,
    totalQuantity: company.totalQuantity,
    settlementDay: company.manager,
    contractManager: company.managerName,
    phoneNumber: '010-xxxx-xxxx',
    contractDate: company.contractDate
  };
};

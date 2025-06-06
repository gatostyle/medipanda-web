import { delay } from 'utils/medipanda/delay';
import { MpPagedRequest, MpPagedResponse, MpWithSequence } from './MpPaged';
import { mockPharmaceuticalProducts } from 'api-mock-data/MpPharmaceuticalProductMock';

export interface MpPharmaceuticalProduct {
  id: number;
  thumbnail: string;
  company: string;
  productName: string;
  price: number;
  commission: string;
  contractDate: string;
  contractPeriod: string;
  applicantCount: number;
  salesCount: number;
  sequence: number;
}

export interface MpPharmaceuticalProductSearchRequest extends MpPagedRequest<MpPharmaceuticalProduct> {
  searchKeyword?: string;
  company?: string;
  startDate?: string;
  endDate?: string;
}

export const mpFetchPharmaceuticalProducts = async (
  request: MpPharmaceuticalProductSearchRequest
): Promise<MpPagedResponse<MpPharmaceuticalProduct>> => {
  await delay(500);

  let filteredProducts = Object.values(mockPharmaceuticalProducts);

  if (request.searchKeyword) {
    filteredProducts = filteredProducts.filter((item) => item.productName.toLowerCase().includes(request.searchKeyword!.toLowerCase()));
  }

  if (request.company && request.company !== '위탁사') {
    filteredProducts = filteredProducts.filter((item) => item.company === request.company);
  }

  const contentWithSequence: MpWithSequence<MpPharmaceuticalProduct>[] = filteredProducts
    .slice(request.page * request.size, (request.page + 1) * request.size)
    .map((item, index) => ({
      ...item,
      sequence: filteredProducts.length - request.page * request.size - index
    }));

  return {
    content: contentWithSequence,
    pageable: {
      pageNumber: request.page
    },
    totalPages: Math.ceil(filteredProducts.length / request.size),
    totalElements: filteredProducts.length
  };
};

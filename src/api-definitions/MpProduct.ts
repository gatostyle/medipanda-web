import { delay } from 'utils/medipanda/delay';
import { MpPagedRequest, MpPagedResponse, MpWithSequence } from './MpPaged';
import { mockProducts } from 'api-mock-data/MpProductMock';

export interface MpProduct {
  id: number;
  manufacturer: string;
  type: string;
  name: string;
  ingredient: string;
  code: string;
  price: string;
  baseFee: string;
  sectionFee: boolean;
  state: string;
  note: string;
  sequence: number;
}

export interface MpProductSearchRequest extends Omit<MpPagedRequest<MpProduct>, 'sectionFee'> {
  searchType?: string;
  searchKeyword?: string;
  sectionFee?: boolean | string;
}

export const mpFetchProducts = async (request: MpProductSearchRequest): Promise<MpPagedResponse<MpProduct>> => {
  await delay(500);

  let filteredProducts = Object.values(mockProducts);

  if (request.searchType && request.searchKeyword) {
    filteredProducts = filteredProducts.filter((product) => {
      switch (request.searchType) {
        case '제품명/성분명':
          return (
            product.name.toLowerCase().includes(request.searchKeyword!.toLowerCase()) ||
            product.ingredient.toLowerCase().includes(request.searchKeyword!.toLowerCase())
          );
        case '제품코드':
          return product.code.toLowerCase().includes(request.searchKeyword!.toLowerCase());
        default:
          return true;
      }
    });
  }

  if (request.sectionFee && request.sectionFee !== '구간수수료 여부') {
    const hasSectionFee = request.sectionFee === '있음';
    filteredProducts = filteredProducts.filter((product) => product.sectionFee === hasSectionFee);
  }

  const contentWithSequence: MpWithSequence<MpProduct>[] = filteredProducts
    .slice(request.page * request.size, (request.page + 1) * request.size)
    .map((product, index) => ({
      ...product,
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

  /*
  // TODO
  const axiosResponse = await axios.request<MpPagedResponse<MpProduct>>({
    url: `/v1/products`,
    method: 'GET',
    params: request
  });
  return mpSetSequence(request, axiosResponse.data);
  */
};

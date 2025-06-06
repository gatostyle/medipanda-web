export type MpPagedRequest<T> = Partial<T> & {
  page: number;
  size: number;
  sortProperty?: keyof T;
  descending?: boolean;
};

export interface MpPagedResponse<T> {
  totalElements: number;
  totalPages: number;
  pageable: {
    pageNumber: number;
  };
  content: MpWithSequence<T>[];
}

export type MpWithSequence<T> = T & { sequence: number };

export function mpSetSequence<T>(request: MpPagedRequest<T>, response: MpPagedResponse<T>): MpPagedResponse<T> {
  return {
    ...response,
    content: response.content.map((it, i) => {
      return {
        ...it,
        sequence: response.totalElements - (request.page - 1) * request.size - i
      };
    })
  };
}

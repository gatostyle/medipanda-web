import { Sequenced } from 'medipanda/utils/withSequence';

export type MpPagedRequest<T> = Partial<T> & {
  page: number;
  size: number;
  sortProperty?: keyof T;
  descending?: boolean;
};

export interface MpPagedResponse<T> {
  totalElements: number;
  size: number;
  totalPages: number;
  pageable: {
    pageNumber: number;
  };
  content: Sequenced<T>[];
  number: number;
}

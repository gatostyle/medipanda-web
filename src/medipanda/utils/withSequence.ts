interface PagedResponse<T> {
  totalElements: number;
  size: number;
  content: T[];
  number: number;
}
export type Sequenced<T> = T & { sequence: number };

export function withSequence<T>(response: PagedResponse<T>): PagedResponse<Sequenced<T>>;
export function withSequence<T>(array: T[]): Sequenced<T>[];
export function withSequence<T>(responseOrArray: PagedResponse<T> | T[]): PagedResponse<Sequenced<T>> | Sequenced<T>[] {
  if (Array.isArray(responseOrArray)) {
    return responseOrArray.map((item, index, array) => ({
      ...item,
      sequence: array.length - index
    }));
  }

  return {
    ...responseOrArray,
    content: responseOrArray.content.map((item, index) => ({
      ...item,
      sequence: responseOrArray.totalElements - responseOrArray.size * responseOrArray.number - index
    }))
  };
}

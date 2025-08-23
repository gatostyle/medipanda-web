interface PagedResponse<T> {
  totalElements: number;
  size: number;
  content: T[];
  number: number;
}

type ContentOf<P> = P extends { content: (infer T)[] } ? T : never;

export type Sequenced<T> = T & { sequence: number };

export function withSequence<P extends PagedResponse<object>>(
  response: P,
): P extends PagedResponse<object> ? Omit<P, 'content'> & { content: Sequenced<ContentOf<P>>[] } : never;
export function withSequence<T>(array: T[]): Sequenced<T>[];
export function withSequence<T, P extends PagedResponse<object>>(
  responseOrArray: P | T[],
): (P extends PagedResponse<object> ? Omit<P, 'content'> & { content: Sequenced<ContentOf<P>>[] } : never) | Sequenced<T>[] {
  if (Array.isArray(responseOrArray)) {
    return responseOrArray.map((item, index, array) => ({
      ...item,
      sequence: array.length - index,
    }));
  }

  return {
    ...responseOrArray,
    content: (responseOrArray.content as ContentOf<P>[]).map<Sequenced<ContentOf<P>>>((item, index) => ({
      ...item,
      sequence: responseOrArray.totalElements - responseOrArray.size * responseOrArray.number - index,
    })),
  } as any;
}

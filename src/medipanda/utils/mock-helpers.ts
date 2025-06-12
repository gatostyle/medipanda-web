import { MpPagedRequest, MpPagedResponse } from 'medipanda/api-definitions/MpPaged';
import { Sequenced } from 'medipanda/utils/withSequence';

export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockPaginate = <T>(data: T[], request: MpPagedRequest<T> & { sort?: string; searchKeyword?: string }): MpPagedResponse<T> => {
  const { page, size, sort } = request;

  let filtered = [...data];

  if (request.searchKeyword) {
    const keyword = request.searchKeyword.toLowerCase();
    filtered = filtered.filter((item) => Object.values(item as any).some((value) => String(value).toLowerCase().includes(keyword)));
  }

  Object.entries(request).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== '' &&
      key !== 'page' &&
      key !== 'size' &&
      key !== 'sort' &&
      key !== 'searchKeyword' &&
      key !== 'searchType'
    ) {
      filtered = filtered.filter((item: any) => {
        if (Array.isArray(value)) {
          return value.includes(item[key]);
        }
        if (typeof value === 'boolean') {
          return value ? item[key] === true : true; // If value is false, don't filter (show all)
        }
        return String(item[key]).toLowerCase().includes(String(value).toLowerCase());
      });
    }
  });

  if (sort) {
    const [field, direction] = sort.split(',');
    filtered.sort((a: any, b: any) => {
      const aVal = a[field];
      const bVal = b[field];
      const result = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      return direction === 'desc' ? -result : result;
    });
  }

  const totalElements = filtered.length;
  const totalPages = Math.ceil(totalElements / size);
  const startIndex = page * size;
  const endIndex = startIndex + size;
  const paginatedData = filtered.slice(startIndex, endIndex);

  const contentWithSequence: Sequenced<T>[] = paginatedData.map((item, index) => ({
    ...item,
    sequence: totalElements - startIndex - index
  }));

  return {
    content: contentWithSequence,
    totalElements,
    size: size,
    totalPages,
    pageable: {
      pageNumber: page
    },
    number: page
  };
};

export interface MockCRUD<T extends { id: number }> {
  getData: () => T[];
  setData: (data: T[]) => void;
  create: (item: Omit<T, 'id'>) => Promise<T>;
  update: (id: number, updates: Partial<T>) => Promise<T>;
  delete: (id: number) => Promise<void>;
  findById: (id: number) => T | undefined;
}

export const mockCRUD = <T extends { id: number }>(initialData: T[] = []): MockCRUD<T> => {
  let data: T[] = [...initialData];

  return {
    getData: () => [...data],

    setData: (newData: T[]) => {
      data = [...newData];
    },

    create: async (item: Omit<T, 'id'>): Promise<T> => {
      await delay(300);
      const maxId = data.length > 0 ? Math.max(...data.map((d) => d.id)) : 0;
      const newItem = { ...item, id: maxId + 1 } as T;
      data.push(newItem);
      return newItem;
    },

    update: async (id: number, updates: Partial<T>): Promise<T> => {
      await delay(300);
      const index = data.findIndex((item) => item.id === id);
      if (index === -1) {
        throw new Error(`Item with id ${id} not found`);
      }
      data[index] = { ...data[index], ...updates };
      return data[index];
    },

    delete: async (id: number): Promise<void> => {
      await delay(300);
      const index = data.findIndex((item) => item.id === id);
      if (index === -1) {
        throw new Error(`Item with id ${id} not found`);
      }
      data.splice(index, 1);
    },

    findById: (id: number): T | undefined => {
      return data.find((item) => item.id === id);
    }
  };
};

import { getBoards } from '@/backend';

export type BoardSortType = NonNullable<NonNullable<Parameters<typeof getBoards>[0]>['sortType']>;

import { getBoards, getProductSummaries } from '@/backend';

export type ProductSortType = NonNullable<NonNullable<Parameters<typeof getProductSummaries>[0]>['sortType']>;

export type BoardSortType = NonNullable<NonNullable<Parameters<typeof getBoards>[0]>['sortType']>;

export type BoardType = NonNullable<NonNullable<Parameters<typeof getBoards>[0]>['boardType']>;

export type NoticeType = NonNullable<NonNullable<Parameters<typeof getBoards>[0]>['noticeType']>;

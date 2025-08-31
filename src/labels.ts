import type { NoticeType } from '@/backend-types';

export const NoticeLabels: Record<NoticeType, string> = {
  PRODUCT_STATUS: '제품현황',
  MANUFACTURING_SUSPENSION: '정산 및 생산중단',
  NEW_PRODUCT: '신제품 정보',
  POLICY: '제약사 정책',
  GENERAL: '일반공지',
  ANONYMOUS_BOARD: '익명게시판',
  MR_CSO_MATCHING: 'MR-CSO 매칭',
};

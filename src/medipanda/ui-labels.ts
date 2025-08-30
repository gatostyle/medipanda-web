export const EXPENSE_REPORT_STATUS_LABELS: Record<'PENDING' | 'COMPLETED', string> = {
  PENDING: '미진행',
  COMPLETED: '진행완료',
};

export const EXPENSE_REPORT_CLASSIFICATION_LABELS: Record<'SAMPLE_PROVIDE' | 'PRODUCT_BRIEFING_MULTI' | 'PRODUCT_BRIEFING_SINGLE', string> =
  {
    SAMPLE_PROVIDE: '견본품제공',
    PRODUCT_BRIEFING_MULTI: '제품설명회(다기관)',
    PRODUCT_BRIEFING_SINGLE: '제품설명회(단일기관)',
  };

export const BOARD_TYPE_LABELS: Record<string, string> = {
  ANONYMOUS: '익명게시판',
  MR_CSO_MATCHING: 'MR-CSO 매칭',
  NOTICE: '공지사항',
  INQUIRY: '문의',
  FAQ: 'FAQ',
  CSO_A_TO_Z: 'CSO A to Z',
  EVENT: '이벤트',
  SALES_AGENCY: '영업대행',
  PRODUCT: '제품',
};

export const NOTICE_TYPE_LABELS: Record<
  'PRODUCT_STATUS' | 'MANUFACTURING_SUSPENSION' | 'NEW_PRODUCT' | 'POLICY' | 'GENERAL' | 'ANONYMOUS_BOARD' | 'MR_CSO_MATCHING',
  string
> = {
  PRODUCT_STATUS: '제약사 - 제품현향',
  MANUFACTURING_SUSPENSION: '제약사 - 정산 및 생산중단',
  NEW_PRODUCT: '제약사 - 신제품 정보',
  POLICY: '제약사 정책',
  GENERAL: '일반공지',
  ANONYMOUS_BOARD: '익명게시판',
  MR_CSO_MATCHING: 'MR-CSO 매칭',
};

export const EXPOSURE_RANGE_LABELS: Record<'ALL' | 'CONTRACTED' | 'UNCONTRACTED', string> = {
  ALL: '전체',
  CONTRACTED: '계약',
  UNCONTRACTED: '미계약',
};

export const EVENT_STATUS_LABELS: Record<'IN_PROGRESS' | 'FINISHED', string> = {
  IN_PROGRESS: '진행중',
  FINISHED: '종료',
};

export const CONTRACT_STATUS_LABELS: Record<'CONTRACT' | 'NON_CONTRACT', string> = {
  CONTRACT: '계약',
  NON_CONTRACT: '미계약',
};

export const PARTNER_CONTRACT_STATUS_LABELS: Record<'NONE' | 'CSO' | 'INDIVIDUAL' | 'ORGANIZATION', string> = {
  NONE: '미계약',
  CSO: 'CSO',
  INDIVIDUAL: '개인',
  ORGANIZATION: '기관',
};

export const MEMBER_ROLE_LABELS: Record<'USER' | 'ADMIN' | 'SUPER_ADMIN', string> = {
  USER: '사용자',
  ADMIN: '관리자',
  SUPER_ADMIN: '슈퍼 관리자',
};

export const MEMBER_ACCOUNT_STATUS_LABELS: Record<'ACTIVATED' | 'BLOCKED' | 'DELETED', string> = {
  ACTIVATED: '활성',
  BLOCKED: '비활성',
  DELETED: '탈퇴',
};

export const CONSENT_LABELS: Record<string, string> = {
  true: '동의',
  false: '미동의',
};

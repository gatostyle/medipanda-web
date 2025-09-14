export enum ContractStatus {
  CONTRACT = 'CONTRACT',
  NON_CONTRACT = 'NON_CONTRACT',
}

export const ContractStatusLabel: Record<ContractStatus, string> = {
  [ContractStatus.CONTRACT]: '계약',
  [ContractStatus.NON_CONTRACT]: '미계약',
};

export enum BoardType {
  ANONYMOUS = 'ANONYMOUS',
  MR_CSO_MATCHING = 'MR_CSO_MATCHING',
  NOTICE = 'NOTICE',
  INQUIRY = 'INQUIRY',
  FAQ = 'FAQ',
  CSO_A_TO_Z = 'CSO_A_TO_Z',
  EVENT = 'EVENT',
  SALES_AGENCY = 'SALES_AGENCY',
  PRODUCT = 'PRODUCT',
}

export const BoardTypeLabel: Record<BoardType, string> = {
  [BoardType.ANONYMOUS]: '익명게시판',
  [BoardType.MR_CSO_MATCHING]: 'MR-CSO 매칭',
  [BoardType.NOTICE]: '공지사항',
  [BoardType.INQUIRY]: '1:1 문의',
  [BoardType.FAQ]: 'FAQ',
  [BoardType.CSO_A_TO_Z]: 'CSO A to Z',
  [BoardType.EVENT]: '이벤트',
  [BoardType.SALES_AGENCY]: '영업대행상품',
  [BoardType.PRODUCT]: '제품',
};

export enum NoticeType {
  PRODUCT_STATUS = 'PRODUCT_STATUS',
  MANUFACTURING_SUSPENSION = 'MANUFACTURING_SUSPENSION',
  NEW_PRODUCT = 'NEW_PRODUCT',
  POLICY = 'POLICY',
  GENERAL = 'GENERAL',
  ANONYMOUS_BOARD = 'ANONYMOUS_BOARD',
  MR_CSO_MATCHING = 'MR_CSO_MATCHING',
}

export const NoticeTypeLabel: Record<NoticeType, string> = {
  [NoticeType.PRODUCT_STATUS]: '제약사 - 제품현향',
  [NoticeType.MANUFACTURING_SUSPENSION]: '제약사 - 정산 및 생산중단',
  [NoticeType.NEW_PRODUCT]: '제약사 - 신제품 정보',
  [NoticeType.POLICY]: '제약사 정책',
  [NoticeType.GENERAL]: '일반공지',
  [NoticeType.ANONYMOUS_BOARD]: '익명게시판',
  [NoticeType.MR_CSO_MATCHING]: 'MR-CSO 매칭',
};

export enum BoardExposureRange {
  ALL = 'ALL',
  CONTRACTED = 'CONTRACTED',
  UNCONTRACTED = 'UNCONTRACTED',
}

export const BoardExposureRangeLabel: Record<BoardExposureRange, string> = {
  [BoardExposureRange.ALL]: '전체',
  [BoardExposureRange.CONTRACTED]: '계약',
  [BoardExposureRange.UNCONTRACTED]: '미계약',
};
export enum BannerStatus {
  VISIBLE = 'VISIBLE',
  HIDDEN = 'HIDDEN',
}

export const BannerStatusLabel: Record<BannerStatus, string> = {
  [BannerStatus.VISIBLE]: '노출',
  [BannerStatus.HIDDEN]: '미노출',
};

export enum BannerScope {
  ENTIRE = 'ENTIRE',
  CONTRACT = 'CONTRACT',
  NON_CONTRACT = 'NON_CONTRACT',
}

export const BannerScopeLabel: Record<BannerScope, string> = {
  [BannerScope.ENTIRE]: '전체',
  [BannerScope.CONTRACT]: '계약',
  [BannerScope.NON_CONTRACT]: '미계약',
};

export enum AdminPermission {
  MEMBER_MANAGEMENT = 'MEMBER_MANAGEMENT',
  PRODUCT_MANAGEMENT = 'PRODUCT_MANAGEMENT',
  TRANSACTION_MANAGEMENT = 'TRANSACTION_MANAGEMENT',
  CONTRACT_MANAGEMENT = 'CONTRACT_MANAGEMENT',
  PRESCRIPTION_MANAGEMENT = 'PRESCRIPTION_MANAGEMENT',
  SETTLEMENT_MANAGEMENT = 'SETTLEMENT_MANAGEMENT',
  EXPENSE_REPORT_MANAGEMENT = 'EXPENSE_REPORT_MANAGEMENT',
  COMMUNITY_MANAGEMENT = 'COMMUNITY_MANAGEMENT',
  CONTENT_MANAGEMENT = 'CONTENT_MANAGEMENT',
  CUSTOMER_SERVICE = 'CUSTOMER_SERVICE',
  BANNER_MANAGEMENT = 'BANNER_MANAGEMENT',
  PERMISSION_MANAGEMENT = 'PERMISSION_MANAGEMENT',
  ALL = 'ALL',
}

export enum EventStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  FINISHED = 'FINISHED',
}

export const EventStatusLabel: Record<EventStatus, string> = {
  [EventStatus.IN_PROGRESS]: '진행중',
  [EventStatus.FINISHED]: '종료',
};

export enum PrescriptionStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export const PrescriptionStatusLabel: Record<PrescriptionStatus, string> = {
  [PrescriptionStatus.PENDING]: '접수대기',
  [PrescriptionStatus.IN_PROGRESS]: '처리중',
  [PrescriptionStatus.COMPLETED]: '입력완료',
};

export enum PrescriptionPartnerStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export const PrescriptionPartnerStatusLabel: Record<PrescriptionPartnerStatus, string> = {
  [PrescriptionStatus.PENDING]: '승인대기',
  [PrescriptionStatus.IN_PROGRESS]: '승인진행중',
  [PrescriptionStatus.COMPLETED]: '승인완료',
};

export enum MemberType {
  NONE = 'NONE',
  CSO = 'CSO',
  INDIVIDUAL = 'INDIVIDUAL',
  ORGANIZATION = 'ORGANIZATION',
}

export function memberTypeToContractStatus(memberType: MemberType): ContractStatus {
  switch (memberType) {
    case MemberType.NONE:
    case MemberType.CSO:
      return ContractStatus.NON_CONTRACT;
    case MemberType.INDIVIDUAL:
    case MemberType.ORGANIZATION:
      return ContractStatus.CONTRACT;
  }
}

export enum PartnerContractType {
  INDIVIDUAL = 'INDIVIDUAL',
  ORGANIZATION = 'ORGANIZATION',
}

export const PartnerContractTypeLabel: Record<PartnerContractType, string> = {
  [PartnerContractType.INDIVIDUAL]: '개인계약',
  [PartnerContractType.ORGANIZATION]: '법인계약',
};

export enum PartnerContractStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export const PartnerContractStatusLabel: Record<PartnerContractStatus, string> = {
  [PartnerContractStatus.PENDING]: '미계약',
  [PartnerContractStatus.APPROVED]: '계약중',
  [PartnerContractStatus.REJECTED]: '반려',
  [PartnerContractStatus.CANCELLED]: '계약 종료',
};

export enum SettlementStatus {
  REQUEST = 'REQUEST',
  OBJECTION = 'OBJECTION',
}

export const SettlementStatusLabel: Record<SettlementStatus, string> = {
  [SettlementStatus.REQUEST]: '정산요청',
  [SettlementStatus.OBJECTION]: '이의신청',
};

export enum PostAttachmentType {
  EDITOR = 'EDITOR',
  ATTACHMENT = 'ATTACHMENT',
}

export enum PartnerContractFileType {
  BUSINESS_REGISTRATION = 'BUSINESS_REGISTRATION',
  SUBCONTRACT_AGREEMENT = 'SUBCONTRACT_AGREEMENT',
  CSO_CERTIFICATE = 'CSO_CERTIFICATE',
  SALES_EDUCATION_CERT = 'SALES_EDUCATION_CERT',
}

export const PartnerContractFileTypeLabel: Record<PartnerContractFileType, string> = {
  [PartnerContractFileType.BUSINESS_REGISTRATION]: '사업자등록증',
  [PartnerContractFileType.SUBCONTRACT_AGREEMENT]: '재위탁계약서',
  [PartnerContractFileType.CSO_CERTIFICATE]: 'CSO 신고증',
  [PartnerContractFileType.SALES_EDUCATION_CERT]: '판매위수탁 교육이수증',
};

export enum AccountStatus {
  ACTIVATED = 'ACTIVATED',
  BLOCKED = 'BLOCKED',
  DELETED = 'DELETED',
}

export const AccountStatusLabel: Record<AccountStatus, string> = {
  [AccountStatus.ACTIVATED]: '활성',
  [AccountStatus.BLOCKED]: '비활성',
  [AccountStatus.DELETED]: '탈퇴',
};

export enum ExpenseReportType {
  SAMPLE_PROVIDE = 'SAMPLE_PROVIDE',
  PRODUCT_BRIEFING_MULTI = 'PRODUCT_BRIEFING_MULTI',
  PRODUCT_BRIEFING_SINGLE = 'PRODUCT_BRIEFING_SINGLE',
}

export const ExpenseReportTypeLabel: Record<ExpenseReportType, string> = {
  [ExpenseReportType.SAMPLE_PROVIDE]: '견본품제공',
  [ExpenseReportType.PRODUCT_BRIEFING_MULTI]: '제품설명회(복수기관)',
  [ExpenseReportType.PRODUCT_BRIEFING_SINGLE]: '제품설명회(개별기관)',
};

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export const RoleLabel: Record<Role, string> = {
  [Role.USER]: '사용자',
  [Role.ADMIN]: '관리자',
  [Role.SUPER_ADMIN]: '슈퍼 관리자',
};

export enum CommentType {
  COMMENT = 'COMMENT',
  REPLY = 'REPLY',
}

export const CommentTypeLabel: Record<CommentType, string> = {
  [CommentType.COMMENT]: '댓글',
  [CommentType.REPLY]: '대댓글',
};

export enum PostType {
  BOARD = 'BOARD',
  COMMENT = 'COMMENT',
}

export const PostTypeLabel: Record<PostType, string> = {
  [PostType.BOARD]: '게시글',
  [PostType.COMMENT]: '댓글',
};

export enum PharmacyStatus {
  NORMAL = 'NORMAL',
  CLOSED = 'CLOSED',
  DELETED = 'DELETED',
  NONE = 'NONE',
}

export const PharmacyStatusLabel: Record<PharmacyStatus, string> = {
  [PharmacyStatus.NORMAL]: '정상',
  [PharmacyStatus.CLOSED]: '폐업',
  [PharmacyStatus.DELETED]: '삭제됨',
  [PharmacyStatus.NONE]: '',
};

export enum ExpenseReportStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
}

export const ExpenseReportStatusLabel: Record<ExpenseReportStatus, string> = {
  [ExpenseReportStatus.PENDING]: '미진행',
  [ExpenseReportStatus.COMPLETED]: '진행완료',
};

export enum PriceUnit {
  KRW = 'KRW',
  USD = 'USD',
  EUR = 'EUR',
}

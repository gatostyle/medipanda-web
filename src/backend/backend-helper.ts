export const ContractStatus = {
  CONTRACT: 'CONTRACT',
  NON_CONTRACT: 'NON_CONTRACT',
} as const;

export const ContractStatusLabel: Record<keyof typeof ContractStatus, string> = {
  [ContractStatus.CONTRACT]: '계약',
  [ContractStatus.NON_CONTRACT]: '미계약',
};

export const BoardType = {
  ANONYMOUS: 'ANONYMOUS',
  MR_CSO_MATCHING: 'MR_CSO_MATCHING',
  NOTICE: 'NOTICE',
  INQUIRY: 'INQUIRY',
  FAQ: 'FAQ',
  CSO_A_TO_Z: 'CSO_A_TO_Z',
  EVENT: 'EVENT',
  SALES_AGENCY: 'SALES_AGENCY',
  PRODUCT: 'PRODUCT',
} as const;

export const BoardTypeLabel: Record<keyof typeof BoardType, string> = {
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

export const NoticeType = {
  PRODUCT_STATUS: 'PRODUCT_STATUS',
  MANUFACTURING_SUSPENSION: 'MANUFACTURING_SUSPENSION',
  NEW_PRODUCT: 'NEW_PRODUCT',
  POLICY: 'POLICY',
  GENERAL: 'GENERAL',
  ANONYMOUS_BOARD: 'ANONYMOUS_BOARD',
  MR_CSO_MATCHING: 'MR_CSO_MATCHING',
} as const;

export const NoticeTypeLabel: Record<keyof typeof NoticeType, string> = {
  [NoticeType.PRODUCT_STATUS]: '제약사 - 제품현향',
  [NoticeType.MANUFACTURING_SUSPENSION]: '제약사 - 정산 및 생산중단',
  [NoticeType.NEW_PRODUCT]: '제약사 - 신제품 정보',
  [NoticeType.POLICY]: '제약사 정책',
  [NoticeType.GENERAL]: '일반공지',
  [NoticeType.ANONYMOUS_BOARD]: '익명게시판',
  [NoticeType.MR_CSO_MATCHING]: 'MR-CSO 매칭',
};

export function isDrugCompanyNoticeType(noticeType: keyof typeof NoticeType): boolean {
  return (
    [
      NoticeType.PRODUCT_STATUS,
      NoticeType.MANUFACTURING_SUSPENSION,
      NoticeType.NEW_PRODUCT,
      NoticeType.POLICY,
    ] as (keyof typeof NoticeType)[]
  ).includes(noticeType);
}

export const BoardExposureRange = {
  ALL: 'ALL',
  CONTRACTED: 'CONTRACTED',
  UNCONTRACTED: 'UNCONTRACTED',
} as const;

export const BoardExposureRangeLabel: Record<keyof typeof BoardExposureRange, string> = {
  [BoardExposureRange.ALL]: '전체',
  [BoardExposureRange.CONTRACTED]: '계약',
  [BoardExposureRange.UNCONTRACTED]: '미계약',
};
export const BannerStatus = {
  VISIBLE: 'VISIBLE',
  HIDDEN: 'HIDDEN',
} as const;

export const BannerStatusLabel: Record<keyof typeof BannerStatus, string> = {
  [BannerStatus.VISIBLE]: '노출',
  [BannerStatus.HIDDEN]: '미노출',
};

export const BannerScope = {
  ENTIRE: 'ENTIRE',
  CONTRACT: 'CONTRACT',
  NON_CONTRACT: 'NON_CONTRACT',
} as const;

export const BannerScopeLabel: Record<keyof typeof BannerScope, string> = {
  [BannerScope.ENTIRE]: '전체',
  [BannerScope.CONTRACT]: '계약',
  [BannerScope.NON_CONTRACT]: '미계약',
};

export const AdminPermission = {
  MEMBER_MANAGEMENT: 'MEMBER_MANAGEMENT',
  PRODUCT_MANAGEMENT: 'PRODUCT_MANAGEMENT',
  TRANSACTION_MANAGEMENT: 'TRANSACTION_MANAGEMENT',
  CONTRACT_MANAGEMENT: 'CONTRACT_MANAGEMENT',
  PRESCRIPTION_MANAGEMENT: 'PRESCRIPTION_MANAGEMENT',
  SETTLEMENT_MANAGEMENT: 'SETTLEMENT_MANAGEMENT',
  EXPENSE_REPORT_MANAGEMENT: 'EXPENSE_REPORT_MANAGEMENT',
  COMMUNITY_MANAGEMENT: 'COMMUNITY_MANAGEMENT',
  CONTENT_MANAGEMENT: 'CONTENT_MANAGEMENT',
  CUSTOMER_SERVICE: 'CUSTOMER_SERVICE',
  BANNER_MANAGEMENT: 'BANNER_MANAGEMENT',
  PERMISSION_MANAGEMENT: 'PERMISSION_MANAGEMENT',
  ALL: 'ALL',
} as const;

export const EventStatus = {
  IN_PROGRESS: 'IN_PROGRESS',
  FINISHED: 'FINISHED',
} as const;

export const EventStatusLabel: Record<keyof typeof EventStatus, string> = {
  [EventStatus.IN_PROGRESS]: '진행중',
  [EventStatus.FINISHED]: '종료',
};

export const PrescriptionStatus = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
} as const;

export const PrescriptionStatusLabel: Record<keyof typeof PrescriptionStatus, string> = {
  [PrescriptionStatus.PENDING]: '접수대기',
  [PrescriptionStatus.IN_PROGRESS]: '처리중',
  [PrescriptionStatus.COMPLETED]: '입력완료',
};

export const PrescriptionPartnerStatus = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
} as const;

export const PrescriptionPartnerStatusLabel: Record<keyof typeof PrescriptionPartnerStatus, string> = {
  [PrescriptionStatus.PENDING]: '승인대기',
  [PrescriptionStatus.IN_PROGRESS]: '승인진행중',
  [PrescriptionStatus.COMPLETED]: '승인완료',
};

export const MemberType = {
  NONE: 'NONE',
  CSO: 'CSO',
  INDIVIDUAL: 'INDIVIDUAL',
  ORGANIZATION: 'ORGANIZATION',
} as const;

export function memberTypeToContractStatus(memberType: keyof typeof MemberType): keyof typeof ContractStatus {
  switch (memberType) {
    case MemberType.NONE:
    case MemberType.CSO:
      return ContractStatus.NON_CONTRACT;
    case MemberType.INDIVIDUAL:
    case MemberType.ORGANIZATION:
      return ContractStatus.CONTRACT;
  }
}

export const PartnerContractType = {
  INDIVIDUAL: 'INDIVIDUAL',
  ORGANIZATION: 'ORGANIZATION',
} as const;

export const PartnerContractTypeLabel: Record<keyof typeof PartnerContractType, string> = {
  [PartnerContractType.INDIVIDUAL]: '개인계약',
  [PartnerContractType.ORGANIZATION]: '법인계약',
};

export const PartnerContractStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
} as const;

export const PartnerContractStatusLabel: Record<keyof typeof PartnerContractStatus, string> = {
  [PartnerContractStatus.PENDING]: '미계약',
  [PartnerContractStatus.APPROVED]: '계약중',
  [PartnerContractStatus.REJECTED]: '반려',
  [PartnerContractStatus.CANCELLED]: '계약 종료',
};

export const SettlementStatus = {
  REQUEST: 'REQUEST',
  OBJECTION: 'OBJECTION',
} as const;

export const SettlementStatusLabel: Record<keyof typeof SettlementStatus, string> = {
  [SettlementStatus.REQUEST]: '정산요청',
  [SettlementStatus.OBJECTION]: '이의신청',
};

export const PostAttachmentType = {
  EDITOR: 'EDITOR',
  ATTACHMENT: 'ATTACHMENT',
} as const;

export const PartnerContractFileType = {
  BUSINESS_REGISTRATION: 'BUSINESS_REGISTRATION',
  SUBCONTRACT_AGREEMENT: 'SUBCONTRACT_AGREEMENT',
  CSO_CERTIFICATE: 'CSO_CERTIFICATE',
  SALES_EDUCATION_CERT: 'SALES_EDUCATION_CERT',
} as const;

export const PartnerContractFileTypeLabel: Record<keyof typeof PartnerContractFileType, string> = {
  [PartnerContractFileType.BUSINESS_REGISTRATION]: '사업자등록증',
  [PartnerContractFileType.SUBCONTRACT_AGREEMENT]: '재위탁계약서',
  [PartnerContractFileType.CSO_CERTIFICATE]: 'CSO 신고증',
  [PartnerContractFileType.SALES_EDUCATION_CERT]: '판매위수탁 교육이수증',
};

export const AccountStatus = {
  ACTIVATED: 'ACTIVATED',
  BLOCKED: 'BLOCKED',
  DELETED: 'DELETED',
} as const;

export const AccountStatusLabel: Record<keyof typeof AccountStatus, string> = {
  [AccountStatus.ACTIVATED]: '활성',
  [AccountStatus.BLOCKED]: '비활성',
  [AccountStatus.DELETED]: '탈퇴',
};

export const ExpenseReportType = {
  SAMPLE_PROVIDE: 'SAMPLE_PROVIDE',
  PRODUCT_BRIEFING_MULTI: 'PRODUCT_BRIEFING_MULTI',
  PRODUCT_BRIEFING_SINGLE: 'PRODUCT_BRIEFING_SINGLE',
} as const;

export const ExpenseReportTypeLabel: Record<keyof typeof ExpenseReportType, string> = {
  [ExpenseReportType.SAMPLE_PROVIDE]: '견본품제공',
  [ExpenseReportType.PRODUCT_BRIEFING_MULTI]: '제품설명회(복수기관)',
  [ExpenseReportType.PRODUCT_BRIEFING_SINGLE]: '제품설명회(개별기관)',
};

export const Role = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
} as const;

export const RoleLabel: Record<keyof typeof Role, string> = {
  [Role.USER]: '사용자',
  [Role.ADMIN]: '관리자',
  [Role.SUPER_ADMIN]: '슈퍼 관리자',
};

export const CommentType = {
  COMMENT: 'COMMENT',
  REPLY: 'REPLY',
} as const;

export const CommentTypeLabel: Record<keyof typeof CommentType, string> = {
  [CommentType.COMMENT]: '댓글',
  [CommentType.REPLY]: '대댓글',
};

export const PostType = {
  BOARD: 'BOARD',
  COMMENT: 'COMMENT',
} as const;

export const PostTypeLabel: Record<keyof typeof PostType, string> = {
  [PostType.BOARD]: '게시글',
  [PostType.COMMENT]: '댓글',
};

export const PharmacyStatus = {
  NORMAL: 'NORMAL',
  CLOSED: 'CLOSED',
  DELETED: 'DELETED',
  NONE: 'NONE',
} as const;

export const PharmacyStatusLabel: Record<keyof typeof PharmacyStatus, string> = {
  [PharmacyStatus.NORMAL]: '정상',
  [PharmacyStatus.CLOSED]: '폐업',
  [PharmacyStatus.DELETED]: '삭제됨',
  [PharmacyStatus.NONE]: '',
};

export const ExpenseReportStatus = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
} as const;

export const ExpenseReportStatusLabel: Record<keyof typeof ExpenseReportStatus, string> = {
  [ExpenseReportStatus.PENDING]: '미진행',
  [ExpenseReportStatus.COMPLETED]: '진행완료',
};

export const PriceUnit = {
  KRW: 'KRW',
  USD: 'USD',
  EUR: 'EUR',
} as const;

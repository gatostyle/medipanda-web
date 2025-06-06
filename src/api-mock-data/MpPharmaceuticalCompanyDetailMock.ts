import type { MpPharmaceuticalCompanyFeeRange, MpPharmaceuticalCompanyIssue } from 'api-definitions/MpPharmaceuticalCompanyDetail';

export const mockPharmaceuticalCompanyFeeRanges: Record<number, MpPharmaceuticalCompanyFeeRange> = {
  1: {
    id: 1,
    range: '3000만원~1억',
    feeRate: '4%',
    collection: '상계',
    approval: '수정'
  },
  2: {
    id: 2,
    range: '1억~2억',
    feeRate: '6%',
    collection: '상계',
    approval: '수정'
  },
  3: {
    id: 3,
    range: '2억~5억',
    feeRate: '8%',
    collection: '상계',
    approval: '수정'
  },
  4: {
    id: 4,
    range: '5억 이상',
    feeRate: '10%',
    collection: '상계',
    approval: '수정'
  }
};

export const mockPharmaceuticalCompanyIssues: Record<number, MpPharmaceuticalCompanyIssue> = {
  1: {
    id: 1,
    author: '관리자 1',
    companyName: 'CSO의 모든걸 알려준다',
    status: '노출',
    soldQuantity: 103120,
    createDate: '2025-04-01',
    updateDate: '2025-04-01'
  },
  2: {
    id: 2,
    author: '관리자 2',
    companyName: 'CSO 빌 기준',
    status: '미노출',
    soldQuantity: 5000,
    createDate: '2025-03-10',
    updateDate: '2025-03-10'
  },
  3: {
    id: 3,
    author: '관리자 3',
    companyName: '제약사 계약 관련 이슈',
    status: '노출',
    soldQuantity: 25000,
    createDate: '2025-03-15',
    updateDate: '2025-03-20'
  },
  4: {
    id: 4,
    author: '관리자 4',
    companyName: '정산 관련 문의사항',
    status: '노출',
    soldQuantity: 75000,
    createDate: '2025-04-05',
    updateDate: '2025-04-05'
  }
};

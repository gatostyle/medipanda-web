import { MpAdminMenuOptionsResponse } from 'api-definitions/MpAdminMenuOptions';

export const mockAdminMenuOptions: MpAdminMenuOptionsResponse = {
  menuOptions: [
    { id: 1, name: '회원관리', description: '회원 정보 및 권한 관리', isActive: true },
    { id: 2, name: '제품관리', description: '제품 정보 및 재고 관리', isActive: true },
    { id: 3, name: '거래관리', description: '거래처 및 계약 관리', isActive: true },
    { id: 4, name: '계약관리', description: '계약서 및 약정 관리', isActive: true },
    { id: 5, name: '처방관리', description: '처방전 및 의료진 관리', isActive: true },
    { id: 6, name: '사원관리', description: '내부 직원 관리', isActive: true },
    { id: 7, name: '정산관리', description: '매출 및 수익 정산', isActive: true },
    { id: 8, name: '지출보고관리', description: '비용 및 지출 내역', isActive: true },
    { id: 9, name: '커뮤니티', description: '사용자 커뮤니티 관리', isActive: true },
    { id: 10, name: '콘텐츠관리', description: '컨텐츠 및 게시물 관리', isActive: true },
    { id: 11, name: '고객센터', description: '고객 문의 및 지원', isActive: true },
    { id: 12, name: '벤더관리', description: '공급업체 관리', isActive: true },
    { id: 13, name: '공통관리', description: '시스템 공통 설정', isActive: true }
  ]
};

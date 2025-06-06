import { MpPermissionCategoriesResponse, MpPermissionFeaturesResponse } from 'api-definitions/MpPermissionCategories';

export const mockPermissionCategories: MpPermissionCategoriesResponse = {
  categories: [
    { id: 1, name: 'CSO A TO Z', description: 'CSO 업무 전반에 대한 정보' },
    { id: 2, name: '제품검색', description: '의약품 및 제품 검색 기능' },
    { id: 3, name: '제약사별 이슈사항', description: '제약사별 중요 이슈 정보' }
  ]
};

export const mockPermissionFeatures: MpPermissionFeaturesResponse = {
  features: [
    { id: 1, name: '댓글', description: '게시물에 댓글 작성 기능' },
    { id: 2, name: '좋아요', description: '게시물 좋아요 기능' },
    { id: 3, name: '첨부파일 업로드', description: '파일 첨부 및 업로드 기능' }
  ]
};

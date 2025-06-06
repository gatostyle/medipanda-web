import type { MpMemberPermissionResponse } from 'api-definitions/MpPermission';

export const mockMemberPermission: MpMemberPermissionResponse = {
  permissions: [
    // CSO A TO Z 카테고리
    {
      category: 'CSO A TO Z',
      feature: '댓글',
      permissions: {
        Contracted: true,
        NonContracted: false
      }
    },
    {
      category: 'CSO A TO Z',
      feature: '좋아요',
      permissions: {
        Contracted: true,
        NonContracted: true
      }
    },
    {
      category: 'CSO A TO Z',
      feature: '첨부파일 업로드',
      permissions: {
        Contracted: true,
        NonContracted: false
      }
    },
    // 제품검색 카테고리
    {
      category: '제품검색',
      feature: '댓글',
      permissions: {
        Contracted: true,
        NonContracted: true
      }
    },
    {
      category: '제품검색',
      feature: '좋아요',
      permissions: {
        Contracted: true,
        NonContracted: true
      }
    },
    {
      category: '제품검색',
      feature: '첨부파일 업로드',
      permissions: {
        Contracted: true,
        NonContracted: false
      }
    },
    // 제약사별 이슈사항 카테고리
    {
      category: '제약사별 이슈사항',
      feature: '댓글',
      permissions: {
        Contracted: true,
        NonContracted: false
      }
    },
    {
      category: '제약사별 이슈사항',
      feature: '좋아요',
      permissions: {
        Contracted: true,
        NonContracted: true
      }
    },
    {
      category: '제약사별 이슈사항',
      feature: '첨부파일 업로드',
      permissions: {
        Contracted: true,
        NonContracted: false
      }
    }
  ]
};

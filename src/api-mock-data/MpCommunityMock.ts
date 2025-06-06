import type { MpCommunityUser, MpCommunityPost, MpCommunityComment, MpBlindItem } from 'api-definitions/MpCommunity';

export const mockCommunityUsers: MpCommunityUser[] = [
  {
    id: 1,
    memberNumber: '20230',
    userId: 'Keymed11',
    memberName: '케이엔메디스',
    nickname: 'CSO000',
    phoneNumber: '010-3333-3231',
    email: 'fjdgksdaf@keymedi.com',
    hasContract: true,
    postCount: 30,
    commentCount: 30,
    likeCount: 30,
    blindPostCount: 3
  },
  {
    id: 2,
    memberNumber: '20231',
    userId: 'Keyd12',
    memberName: '케이엔메디스',
    nickname: 'Cso 조아',
    phoneNumber: '010-3333-1111',
    email: 'fjsd323gksdaf@keymedi.com',
    hasContract: false,
    postCount: 70,
    commentCount: 100,
    likeCount: 50,
    blindPostCount: 1
  }
];

export const mockCommunityPosts: MpCommunityPost[] = [
  {
    id: 1,
    accountType: '업무기사대면',
    userId: 'Keymed11',
    memberName: '케이엔메디스',
    nickname: 'CSO000',
    hasContract: true,
    title: '내가보기에 cso 는 문제가 있다',
    content: '내용...',
    likeCount: 10,
    commentCount: 100,
    viewCount: 1000,
    isBlind: false,
    registrationDate: '2025-04-10 13:10'
  },
  {
    id: 2,
    accountType: 'MR-CSO 매칭',
    userId: 'Keyd12',
    memberName: '다른회사 2',
    nickname: 'Cso 조아',
    hasContract: false,
    title: '여러분 다들 화이팅',
    content: '내용...',
    likeCount: 100,
    commentCount: 200,
    viewCount: 2123,
    isBlind: false,
    registrationDate: '2025-04-10 12:10'
  }
];

export const mockCommunityComments: MpCommunityComment[] = [
  {
    id: 1,
    postId: 1,
    userId: 'AAAAAAAAAA',
    memberName: '케이엔메디스',
    nickname: 'Keymed11',
    hasContract: true,
    type: '댓글',
    content: '화이팅',
    likeCount: 10,
    registrationDate: '2025-04-10 13:10'
  },
  {
    id: 2,
    postId: 1,
    userId: 'BBBBBBBBBBB',
    memberName: '다른회사 2',
    nickname: 'Keyd12',
    hasContract: false,
    type: '대댓글',
    content: '여러분 다들 화이팅',
    likeCount: 100,
    registrationDate: '2025-04-10 12:10'
  },
  {
    id: 3,
    postId: 2,
    userId: 'CCCCCCCCCCCC',
    memberName: '다른회사 3',
    nickname: 'Keyd123213214',
    hasContract: false,
    type: '대댓글',
    content: '성어요',
    likeCount: 0,
    registrationDate: '2025-04-10 10:10'
  }
];

export const mockBlindItems: MpBlindItem[] = [
  {
    id: 1,
    userId: '',
    memberName: '',
    nickname: '',
    hasContract: false,
    contentType: '',
    content: '화이팅',
    reportType: '도배글',
    likeCount: 10,
    blindProcessDate: '2025-04-10 13:10'
  },
  {
    id: 2,
    userId: '',
    memberName: '',
    nickname: '',
    hasContract: false,
    contentType: '',
    content: '화이팅',
    reportType: '홍보/스팸',
    likeCount: 100,
    blindProcessDate: '2025-04-10 12:10'
  },
  {
    id: 3,
    userId: '',
    memberName: '',
    nickname: '',
    hasContract: false,
    contentType: '',
    content: '화이팅',
    reportType: '개인정보 노출',
    likeCount: 0,
    blindProcessDate: '2025-04-10 10:10'
  }
];

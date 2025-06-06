import type { MpBusinessLineMember } from 'api-definitions/MpBusinessLineMember';

export const mockBusinessLineMembers: Record<number, MpBusinessLineMember> = {
  1: {
    id: 1,
    memberName: '김회원',
    memberNo: '10001',
    userId: 'user001'
  },
  2: {
    id: 2,
    memberName: '이회원',
    memberNo: '10002',
    userId: 'user002'
  },
  3: {
    id: 3,
    memberName: '박회원',
    memberNo: '10003',
    userId: 'user003'
  },
  4: {
    id: 4,
    memberName: '정회원',
    memberNo: '10004',
    userId: 'user004'
  },
  5: {
    id: 5,
    memberName: '최회원',
    memberNo: '10005',
    userId: 'user005'
  }
};

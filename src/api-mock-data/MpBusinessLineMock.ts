import type { MpBusinessLine } from 'api-definitions/MpBusinessLine';

export const mockBusinessLines: Record<number, MpBusinessLine> = {
  1: {
    id: 1,
    memberNo: '10001',
    userId: 'user001',
    memberName: '김회원',
    classification: '법인',
    dealerNo: 'D001',
    dealerName: '서울딜러',
    businessName: '서울메디컬',
    businessRegistrationNo: '123-45-67890',
    dealerRegistrationDate: '2024-01-15',
    sequence: 1
  },
  2: {
    id: 2,
    memberNo: '10002',
    userId: 'user002',
    memberName: '이회원',
    classification: '개인',
    dealerNo: 'D002',
    dealerName: '부산딜러',
    businessName: '부산헬스케어',
    businessRegistrationNo: '234-56-78901',
    dealerRegistrationDate: '2024-02-20',
    sequence: 2
  },
  3: {
    id: 3,
    memberNo: '10003',
    userId: 'user003',
    memberName: '박회원',
    classification: '법인',
    dealerNo: 'D003',
    dealerName: '대구딜러',
    businessName: '대구헬스케어',
    businessRegistrationNo: '345-67-89012',
    dealerRegistrationDate: '2024-03-10',
    sequence: 3
  },
  4: {
    id: 4,
    memberNo: '10004',
    userId: 'user004',
    memberName: '정회원',
    classification: '개인',
    dealerNo: 'D004',
    dealerName: '광주딜러',
    businessName: '광주메디칼',
    businessRegistrationNo: '456-78-90123',
    dealerRegistrationDate: '2024-04-05',
    sequence: 4
  },
  5: {
    id: 5,
    memberNo: '10005',
    userId: 'user005',
    memberName: '최회원',
    classification: '법인',
    dealerNo: 'D005',
    dealerName: '대전딜러',
    businessName: '대전바이오',
    businessRegistrationNo: '567-89-01234',
    dealerRegistrationDate: '2024-05-12',
    sequence: 5
  }
};

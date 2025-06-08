import type { MpHospital, MpInquiry } from 'api-definitions/MpContent';

export const mockHospitals: MpHospital[] = [
  {
    id: 1,
    region: '서울',
    district: '강남구',
    hospitalName: '키메디',
    address: '서울시 강남구 논현로 416, 4층 유기빌딩(역삼동)',
    registrationDate: '2025-04-10',
    category: '공공데이터'
  },
  {
    id: 2,
    region: '경기',
    district: '고양시',
    hospitalName: '국립암센터',
    address: '경기도 고양시 일산동구 일산로 323 (마두1동 809번지)',
    registrationDate: '2025-04-10',
    category: '타입스캔들'
  }
];

export const mockInquiries: MpInquiry[] = [
  {
    id: 1,
    inquiryNumber: '20230',
    memberName: 'Keymed11',
    userId: 'Keymed11',
    phoneNumber: '010-3333-3231',
    category: '제약',
    contractStatus: '답변대기중',
    title: '키후나티에서 활동 중인 당뇨약의 안데요',
    content: 'ㅁㄴㅇㄹ',
    response: 'asdf',
    inquiryDate: '2025-04-29 09:43:30',
    responseDate: '2025-04-29 09:43:30'
  },
  {
    id: 2,
    inquiryNumber: '20231',
    memberName: 'Keyd12',
    userId: 'Keyd12',
    phoneNumber: '010-3333-1111',
    category: '미계약',
    contractStatus: '확인중',
    title: 'CSO의 기초',
    content: '내용...',
    response: '',
    inquiryDate: '2025-04-29 09:43:30',
    responseDate: '2025-04-29 09:43:30'
  },
  {
    id: 3,
    inquiryNumber: '20221',
    memberName: 'Keyd1332',
    userId: 'Keyd1332',
    phoneNumber: '010-3333-1131',
    category: '미계약',
    contractStatus: '답변완료',
    title: 'CSO의 기초',
    content: '내용...',
    response: '',
    inquiryDate: '2025-04-10',
    responseDate: '2024-04-20'
  }
];

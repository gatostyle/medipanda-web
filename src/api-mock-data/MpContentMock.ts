import type {
  MpHospital,
  MpCsoAtoZ,
  MpCsoAtoZDetail,
  MpNotice,
  MpNoticeDetail,
  MpFaq,
  MpFaqDetail,
  MpInquiry,
  MpInquiryDetail
} from 'api-definitions/MpContent';

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

export const mockCsoAtoZItems: MpCsoAtoZ[] = [
  {
    id: 2,
    author: '관리자 1',
    title: 'CSO의 모든것을 알려준다',
    content: '내용...',
    status: '노출',
    viewCount: 103120,
    registrationDate: '2025-04-01'
  },
  {
    id: 1,
    author: '관리자 2',
    title: 'CSO의 기초',
    content: '내용...',
    status: '미노출',
    viewCount: 5000,
    registrationDate: '2025-03-10'
  }
];

export const mockCsoAtoZDetail: MpCsoAtoZDetail = {
  id: 1,
  author: '관리자',
  title: '내가보기에 CSO 는 문제가 있다',
  content: `asdf`,
  status: '노출',
  registrationDate: '2025-04-10 13:10'
};

export const mockNotices: MpNotice[] = [
  {
    id: 1,
    author: '관리자 1',
    title: 'CSO의 모든것을 알려준다',
    category: '노출',
    status: '노출',
    viewCount: 103120,
    registrationDate: '2025-04-01'
  },
  {
    id: 2,
    author: '관리자 2',
    title: 'CSO의 기초',
    category: '미노출',
    status: '미노출',
    viewCount: 5000,
    registrationDate: '2025-03-10'
  }
];

export const mockNoticeDetail: MpNoticeDetail = {
  id: 1,
  author: '관리자',
  title: '내가보기에 CSO 는 문제가 있다',
  content: `asdf`,
  category: '공지',
  status: '노출',
  registrationDate: '2025-04-10 13:10'
};

export const mockFaqs: MpFaq[] = [
  {
    id: 1,
    author: '관리자 1',
    title: 'CSO의 모든것을 알려준다',
    content: '내용...',
    category: '노출',
    status: '노출',
    viewCount: 103120,
    registrationDate: '2025-04-01'
  },
  {
    id: 2,
    author: '관리자 2',
    title: 'CSO의 기초',
    content: '내용...',
    category: '미노출',
    status: '미노출',
    viewCount: 5000,
    registrationDate: '2025-03-10'
  }
];

export const mockFaqDetail: MpFaqDetail = {
  id: 1,
  author: '관리자',
  title: '내가보기에 CSO 는 문제가 있다',
  content: `asdf`,
  category: 'FAQ',
  status: '노출',
  registrationDate: '2025-04-10 13:10'
};

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

export const mockInquiryDetail: MpInquiryDetail = {
  id: 1,
  inquiryNumber: '20230',
  memberName: '케이엔메디스',
  phoneNumber: '010-2222-3333',
  title: '키후나티에서 활동 중인 당뇨약의 안데요',
  content: `안녕하세요
다른아니라 키후나티 활동중에 제가 작성한 글에 대해서
심대범이 된 답글이 확인이 되시 않습니다.
혹시 간 문의확인 요청드립니다.`,
  response: `안녕하세요
CSO Link 담입니다.
해당내용은 ~~~~~~~~으로 확인이 되구있습니다.
감사합니다.
추가내용이 필요하시다면 고객센터로 연락주시면 감사하겠습니다.`,
  attachmentFile: '파일 업로드',
  inquiryDate: '2025-04-29 09:43:30',
  responseDate: '2025-04-29 09:43:30'
};

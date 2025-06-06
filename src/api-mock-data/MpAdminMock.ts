import type { MpAdmin } from 'api-definitions/MpAdmin';

export const mockAdmins: Record<number, MpAdmin> = {
  1: {
    id: 1,
    userId: 'admin001',
    name: '홍길동',
    email: 'admin001@keymedi.com',
    phone: '010-1234-5678',
    role: '최고관리자',
    state: true,
    createdAt: '2025-04-05 14:00'
  },
  2: {
    id: 2,
    userId: 'admin002',
    name: '김영희',
    email: 'admin002@keymedi.com',
    phone: '010-2345-6789',
    role: '운영자',
    state: true,
    createdAt: '2025-04-06 09:30'
  },
  3: {
    id: 3,
    userId: 'admin003',
    name: '박민수',
    email: 'admin003@keymedi.com',
    phone: '010-3456-7890',
    role: '운영자',
    state: false,
    createdAt: '2025-04-07 16:20'
  },
  4: {
    id: 4,
    userId: 'admin004',
    name: '이수진',
    email: 'admin004@keymedi.com',
    phone: '010-4567-8901',
    role: '관리자',
    state: true,
    createdAt: '2025-04-08 11:45'
  },
  5: {
    id: 5,
    userId: 'admin005',
    name: '정철호',
    email: 'admin005@keymedi.com',
    phone: '010-5678-9012',
    role: '관리자',
    state: true,
    createdAt: '2025-04-09 13:15'
  },
  6: {
    id: 6,
    userId: 'admin006',
    name: '최미영',
    email: 'admin006@keymedi.com',
    phone: '010-6789-0123',
    role: '사용자',
    state: false,
    createdAt: '2025-04-10 10:30'
  },
  7: {
    id: 7,
    userId: 'admin007',
    name: '강태우',
    email: 'admin007@keymedi.com',
    phone: '010-7890-1234',
    role: '사용자',
    state: true,
    createdAt: '2025-04-11 15:50'
  },
  8: {
    id: 8,
    userId: 'admin008',
    name: '윤서현',
    email: 'admin008@keymedi.com',
    phone: '010-8901-2345',
    role: '관리자',
    state: true,
    createdAt: '2025-04-12 08:20'
  }
};

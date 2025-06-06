import type { MpProductDetail, MpComparisonDrug } from 'api-definitions/MpProductDetail';

export const mockProductDetail: MpProductDetail = {
  id: 1,
  manufacturer: '한국제약',
  state: '허가',
  name: '타이레놀정 500mg',
  ingredient: '아세트아미노펜',
  code: 'A01AB02',
  price: '100원',
  baseFee: '80원',
  sectionFee: '20원',
  note: '해열진통제',
  generics: ['제네릭 타이레놀', '아세트아미노펜정'],
  sameIngredient: ['게보린정', '낙센정']
};

export const mockComparisonDrugs: Record<number, MpComparisonDrug> = {
  1: {
    id: 1,
    manufacturer: '동아제약',
    state: '허가',
    name: '게보린정',
    ingredient: '아세트아미노펜'
  },
  2: {
    id: 2,
    manufacturer: '유한제약',
    state: '허가',
    name: '낙센정',
    ingredient: '아세트아미노펜'
  },
  3: {
    id: 3,
    manufacturer: '대웅제약',
    state: '허가',
    name: '펜잘정',
    ingredient: '아세트아미노펜'
  },
  4: {
    id: 4,
    manufacturer: '삼진제약',
    state: '허가',
    name: '애드빌정',
    ingredient: '이부프로펜'
  }
};

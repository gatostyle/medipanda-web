import type { MpProduct } from 'api-definitions/MpProduct';

export const mockProducts: MpProduct[] = [
  {
    id: 1,
    manufacturer: '건일바이오팜',
    type: '오리지널',
    name: '엑스건정5/80mg',
    ingredient: 'valsartan and amlodipine 80 mg',
    code: '3333333',
    price: '1,500원',
    baseFee: '50%',
    sectionFee: true,
    state: '자사',
    note: '비고내용--------',
    sequence: 2
  },
  {
    id: 2,
    manufacturer: '진양제약(주)',
    type: '제네릭',
    name: '진토젯정10/20밀리그램_(1정)',
    ingredient: 'atorvastatin and ezetimibe 10 mg',
    code: '44444444444',
    price: '300원',
    baseFee: '30%',
    sectionFee: false,
    state: '수수료변경',
    note: '비고내용, 비고내용, 비고내용',
    sequence: 1
  },
  {
    id: 3,
    manufacturer: '대웅제약',
    type: '오리지널',
    name: '임팩타민정100mg',
    ingredient: 'sildenafil citrate 100 mg',
    code: '5555555',
    price: '2,500원',
    baseFee: '60%',
    sectionFee: true,
    state: '자사',
    note: '신규 등록 제품',
    sequence: 3
  },
  {
    id: 4,
    manufacturer: '한미약품',
    type: '제네릭',
    name: '암로디핀정5mg',
    ingredient: 'amlodipine besylate 5 mg',
    code: '6666666',
    price: '800원',
    baseFee: '40%',
    sectionFee: false,
    state: '수수료변경',
    note: '가격 조정 예정',
    sequence: 4
  },
  {
    id: 5,
    manufacturer: '종근당',
    type: '오리지널',
    name: '메바로친정20mg',
    ingredient: 'pravastatin sodium 20 mg',
    code: '7777777',
    price: '1,200원',
    baseFee: '45%',
    sectionFee: true,
    state: '자사',
    note: '베스트셀러 제품',
    sequence: 5
  }
];

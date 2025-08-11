import { requestOcr as originalRequestOcr } from './ocr';

export const requestOcr: typeof originalRequestOcr = async () => {
  return [
    {
      code: '1234',
      name: 'OCR결과약품1234',
      volume: 30,
      price: 60,
      rate: 0.1,
      totalAmount: 100,
      feeAmount: 10
    }
  ];
};

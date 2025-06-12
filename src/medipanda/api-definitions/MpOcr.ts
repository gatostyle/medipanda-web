export interface OcrEdiItem {
  code: string;
  name: string;
  volume: number;
  price: number;
  rate: number;
  totalAmount: number;
  feeAmount: number;
}

export type OcrResponse = OcrEdiItem[];

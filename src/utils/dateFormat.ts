import { format } from 'date-fns';

export const DATEFORMAT_YYYY_MM_DD_HH_MM = 'yyyy-MM-dd HH:mm';
export const DATEFORMAT_YYYY_MM_DD = 'yyyy-MM-dd';
export const DATEFORMAT_YYYY_MM = 'yyyy-MM';
export const DATEFORMAT_YYYY년_MM월 = 'yyyy-MM';

export function formatYyyyMmDdHhMm(dateOrString: Date | string): string {
  return format(typeof dateOrString === 'string' ? new Date(dateOrString) : dateOrString, DATEFORMAT_YYYY_MM_DD_HH_MM);
}

export function formatYyyyMmDd(dateOrString: Date | string): string {
  return format(typeof dateOrString === 'string' ? new Date(dateOrString) : dateOrString, DATEFORMAT_YYYY_MM_DD);
}

export function formatYyyyMm(dateOrString: Date | string): string {
  return format(typeof dateOrString === 'string' ? new Date(dateOrString) : dateOrString, DATEFORMAT_YYYY_MM);
}

export function formatYyyy년Mm월(dateOrString: Date | string): string {
  return format(typeof dateOrString === 'string' ? new Date(dateOrString) : dateOrString, DATEFORMAT_YYYY년_MM월);
}

import { format } from 'date-fns';

export const DATEFORMAT_YYYY_MM_DD_HH_MM = 'yyyy-MM-dd HH:mm';
export const DATEFORMAT_YYYY_MM_DD = 'yyyy-MM-dd';
export const DATEFORMAT_YYYY_MM = 'yyyy-MM';

export function formatYyyyMmDdHhMm(dateString: string): string;
export function formatYyyyMmDdHhMm(date: Date): string;
export function formatYyyyMmDdHhMm(dateOrString: Date | string): string {
  return format(typeof dateOrString === 'string' ? new Date(DateFix(dateOrString)) : dateOrString, DATEFORMAT_YYYY_MM_DD_HH_MM);
}

export function formatYyyyMmDd(dateString: string): string;
export function formatYyyyMmDd(date: Date): string;
export function formatYyyyMmDd(dateOrString: Date | string): string {
  return format(typeof dateOrString === 'string' ? new Date(DateFix(dateOrString)) : dateOrString, DATEFORMAT_YYYY_MM_DD);
}

export function formatYyyyMm(dateString: string): string;
export function formatYyyyMm(date: Date): string;
export function formatYyyyMm(dateOrString: Date | string): string {
  return format(typeof dateOrString === 'string' ? new Date(DateFix(dateOrString)) : dateOrString, DATEFORMAT_YYYY_MM);
}

export function DateFix(str: string): Date {
  return new Date(str.replace(/"/g, ''));
}

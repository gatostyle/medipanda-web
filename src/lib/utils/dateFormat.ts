import { format } from 'date-fns';

export const DAY_TO_MILLISECONDS = 24 * 60 * 60 * 1000;

export const DATEFORMAT_YYYY_MM_DD_HH_MM_SS = 'yyyy-MM-dd HH:mm:ss';
export const DATEFORMAT_YYYY_MM_DD_HH_MM = 'yyyy-MM-dd HH:mm';
export const DATEFORMAT_YYYY_MM_DD = 'yyyy-MM-dd';
export const DATEFORMAT_YYYY_MM = 'yyyy-MM';

export const DateUtils = {
  tryParseDate(dateString: string): Date | null {
    const date = new Date(dateString);
    return Number.isNaN(date.getTime()) ? null : date;
  },
  utcToKst(date: Date): Date {
    const kstDate = new Date(date);
    kstDate.setHours(kstDate.getHours() + 9);
    return kstDate;
  },
  kstToUtc(date: Date): Date {
    const utcDate = new Date(date);
    utcDate.setHours(utcDate.getHours() - 9);
    return utcDate;
  },
  parseUtcAndFormatKst(dateString: string, formatStr: string): string {
    return format(this.utcToKst(new Date(dateString)), formatStr);
  },
};

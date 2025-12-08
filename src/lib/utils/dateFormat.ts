import { format } from 'date-fns';

export const DAY_TO_MILLISECONDS = 24 * 60 * 60 * 1000;

export const DATEFORMAT_YYYY_MM_DD_HH_MM_SS = 'yyyy-MM-dd HH:mm:ss';
export const DATEFORMAT_YYYY_MM_DD_HH_MM = 'yyyy-MM-dd HH:mm';
export const DATEFORMAT_YYYY_MM_DD = 'yyyy-MM-dd';
export const DATEFORMAT_YYYY_MM = 'yyyy-MM';
export const DATEFORMAT_YYYY년_MM월 = 'yyyy년 MM월';
export const DATEFORMAT_YYYY년_MM월_DD일 = 'yyyy년 MM월 dd일';

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
  formatRelativeTime(date: Date): string {
    const now = new Date();
    const diff = Math.max(now.getTime() - date.getTime(), 0);

    if (diff === 0) {
      return '방금 전';
    }

    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) {
      return `${seconds}초 전`;
    }

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes}분 전`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `${hours}시간 전`;
    }

    const days = Math.floor(hours / 24);
    if (days < 7) {
      return `${days}일 전`;
    }

    return format(date, DATEFORMAT_YYYY_MM_DD);
  },
  getMonthRange(startDate: Date, endDate: Date): Date[] {
    const result = [];

    const start = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

    const current = new Date(start);

    while (current <= end) {
      result.push(new Date(current)); // clone
      current.setMonth(current.getMonth() + 1);
    }

    return result;
  },
  isExpired(date: Date): boolean {
    const now = new Date();
    return date < now;
  },
};

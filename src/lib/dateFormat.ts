import { format } from 'date-fns';

export const DATEFORMAT_YYYY_MM_DD_HH_MM = 'yyyy-MM-dd HH:mm';
export const DATEFORMAT_YYYY_MM_DD = 'yyyy-MM-dd';
export const DATEFORMAT_YYYY_MM = 'yyyy-MM';
export const DATEFORMAT_YYYY년_MM월 = 'yyyy년 MM월';

export function parseUtcDateString(dateString: string): Date {
  if (dateString.endsWith('Z')) {
    return new Date(dateString);
  } else {
    const date = new Date(dateString);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - userTimezoneOffset);
  }
}

export function formatYyyyMmDdHhMm(dateOrString: Date | string): string {
  return format(typeof dateOrString === 'string' ? parseUtcDateString(dateOrString) : dateOrString, DATEFORMAT_YYYY_MM_DD_HH_MM);
}

export function formatYyyyMmDd(dateOrString: Date | string): string {
  return format(typeof dateOrString === 'string' ? parseUtcDateString(dateOrString) : dateOrString, DATEFORMAT_YYYY_MM_DD);
}

export function formatYyyyMm(dateOrString: Date | string): string {
  return format(typeof dateOrString === 'string' ? parseUtcDateString(dateOrString) : dateOrString, DATEFORMAT_YYYY_MM);
}

export function formatYyyy년Mm월(dateOrString: Date | string): string {
  return format(typeof dateOrString === 'string' ? parseUtcDateString(dateOrString) : dateOrString, DATEFORMAT_YYYY년_MM월);
}

export function formatRelativeTime(dateOrString: Date | string): string {
  const date = typeof dateOrString === 'string' ? parseUtcDateString(dateOrString) : dateOrString;
  const now = new Date();
  const diff = now.getTime() - date.getTime();

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

  return formatYyyyMmDd(date);
}

export function isExpired(dateOrString: Date | string): boolean {
  const date = typeof dateOrString === 'string' ? parseUtcDateString(dateOrString) : dateOrString;
  const now = new Date();
  return date < now;
}

export function getMonthRange(startDateOrString: Date | string, endDateOrString: Date | string): Date[] {
  const startDate = typeof startDateOrString === 'string' ? parseUtcDateString(startDateOrString) : startDateOrString;
  const endDate = typeof endDateOrString === 'string' ? parseUtcDateString(endDateOrString) : endDateOrString;

  const result = [];

  const start = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

  const current = new Date(start);

  while (current <= end) {
    result.push(new Date(current)); // clone
    current.setMonth(current.getMonth() + 1);
  }

  return result;
}

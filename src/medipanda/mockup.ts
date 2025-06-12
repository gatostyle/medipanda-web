// These functions are the placeholder to indicate that the value is a hardcoded mockup.

export function mockBoolean(): boolean {
  return Math.random() < 0.5;
}

export function mockNumber(min: number = 0, max: number = 1000): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function mockString(prefix?: string): string {
  if (prefix) {
    return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
  }
  return '-';
}

export function mockArray<T>(): T[] {
  return [];
}

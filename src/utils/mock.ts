export function mockBoolean(value?: boolean): boolean {
  return value ?? Math.random() < 0.5;
}

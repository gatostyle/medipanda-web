export class NotImplementedError extends Error {
  constructor(feature: string) {
    super(`${feature} 기능은 아직 구현되지 않았습니다.`);
    this.name = 'NotImplementedError';
  }
}

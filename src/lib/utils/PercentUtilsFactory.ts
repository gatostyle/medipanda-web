export class PercentUtilsFactory {
  private readonly format: Intl.NumberFormatOptions;

  public constructor(format: Intl.NumberFormatOptions) {
    this.format = format;
  }

  public percentToDecimal(percent: number): number {
    return Math.max(0, Math.min(1, percent / 100));
  }

  public decimalToPercent(decimal: number): number {
    return Math.max(0, Math.min(100, decimal * 100));
  }

  public percentStringToDecimal(value: string): number {
    return Math.max(0, Math.min(1, Number(value.trim().replace(/,/g, '')) / 100));
  }

  public formatDecimal(decimal: number): string {
    return this.decimalToPercent(decimal).toLocaleString(undefined, this.format);
  }
}

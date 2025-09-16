import { type ChangeEventHandler } from 'react';

export function normalizeFormNumber(value: string, config?: { min?: number; max?: number }): string | null {
  const stringValue = value.trim();

  if (stringValue === '') {
    return stringValue;
  }

  const numberValue = Number(stringValue.replace(/,/g, ''));

  if (isNaN(numberValue)) {
    return null;
  }

  if (numberValue > Number.MAX_SAFE_INTEGER) {
    return String(Number.MAX_SAFE_INTEGER);
  }

  if (numberValue < Number.MIN_SAFE_INTEGER) {
    return String(Number.MIN_SAFE_INTEGER);
  }

  if (config?.max !== undefined && numberValue > config.max) {
    return String(config.max);
  }

  if (config?.min !== undefined && numberValue < config.min) {
    return String(config.min);
  }

  return numberValue.toLocaleString(undefined, { maximumFractionDigits: 9 }) + (stringValue.endsWith('.') ? '.' : '');
}

export function handleNumberChange(
  {
    setFieldValue,
  }: {
    setFieldValue: (field: string, value: string) => void;
  },
  config?: { min?: number; max?: number },
): ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement> {
  return event => {
    const normalized = normalizeFormNumber(event.target.value, config);

    if (normalized !== null) {
      setFieldValue(event.target.name, normalized);
      return;
    }
  };
}

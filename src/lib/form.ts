import { type ChangeEventHandler } from 'react';

export function normalizeSeperatedString(value: string, separator: string, charCounts: number[], prevValue = ''): string {
  const regex = new RegExp(`^${charCounts.map(count => `([^${separator}]{0,${count}})`).join('')}`);
  const [_, ...parts] = (value.replace(new RegExp(separator, 'g'), '').match(regex) ?? []).filter(part => part !== '');

  if (value.length > prevValue.length) {
    if (parts.length === charCounts.length || parts[parts.length - 1].length < charCounts[parts.length - 1]) {
      return parts.join('-');
    }

    return parts.join('-') + '-';
  } else {
    return parts.join('-');
  }
}

export function normalizePhoneNumber(value: string, prevValue = ''): string {
  return normalizeSeperatedString(value, '-', [3, 4, 4], prevValue);
}

export function normalizeBusinessNumber(value: string, prevValue = ''): string {
  return normalizeSeperatedString(value, '-', [3, 2, 5], prevValue);
}

function handleNumberStringChange<K extends string, T extends Record<K, string>>(
  { values, setFieldValue }: { values: T; setFieldValue: (field: K, value: string) => void },
  key: K,
  normalize: (value: string, prevValue: string) => string,
): ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement> {
  return event => {
    const normalized = normalize(event.target.value, values[key]);
    const nextSelectionEnd = event.target.selectionEnd === event.target.value.length ? normalized.length : (event.target.selectionEnd ?? 0);

    event.target.value = normalized;
    event.target.setSelectionRange(nextSelectionEnd, nextSelectionEnd);

    setFieldValue(key, normalized);
  };
}

export function handlePhoneNumberChange<K extends string, T extends Record<K, string>>(
  { values, setFieldValue }: { values: T; setFieldValue: (field: K, value: string) => void },
  key: K,
): ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement> {
  return handleNumberStringChange({ values, setFieldValue }, key, normalizePhoneNumber);
}

export function handleBusinessNumberChange<K extends string, T extends Record<K, string>>(
  { values, setFieldValue }: { values: T; setFieldValue: (field: K, value: string) => void },
  key: K,
): ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement> {
  return handleNumberStringChange({ values, setFieldValue }, key, normalizeBusinessNumber);
}

export function normalizeLocaleNumber(value: string, config?: { min?: number; max?: number }): string {
  const numberValue = Number(value.trim().replace(/,/g, ''));

  if (Number.isNaN(numberValue)) {
    return '0';
  }

  const clampedValue = Math.max(Math.min(numberValue, config?.max ?? Number.MAX_SAFE_INTEGER), config?.min ?? Number.MIN_SAFE_INTEGER);

  return clampedValue.toLocaleString(undefined, { maximumFractionDigits: 9 }) + (value.toString().endsWith('.') ? '.' : '');
}

export function handleLocaleNumberChange<K extends string, T extends Record<K, string>>(
  { values: _, setFieldValue }: { values: T; setFieldValue: (field: K, value: string) => void },
  key: K,
  config?: { min?: number; max?: number },
): ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement> {
  return event => {
    const normalized = normalizeLocaleNumber(event.target.value, config);
    const nextSelectionEnd = event.target.selectionEnd === event.target.value.length ? normalized.length : (event.target.selectionEnd ?? 0);

    event.target.value = normalized;
    event.target.setSelectionRange(nextSelectionEnd, nextSelectionEnd);

    setFieldValue(key, normalized);
  };
}

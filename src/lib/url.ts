export function setUrlParams<T extends Record<string, string | number | boolean | null | undefined>>(
  params: T,
  defaultValues: Partial<{ [K in keyof T]: T[K] | string }> = {},
): string {
  let url = window.location.search;
  Object.entries(params).forEach(([key, value]) => {
    const stringValue = String(value);
    if (value === null || value === undefined || stringValue === defaultValues[key]) {
      url = url.replace(new RegExp(`(\\?)?&?${key}=[^&]*`), '$1');
    } else {
      url = url.includes(`${key}=`)
        ? url.replace(new RegExp(`([?&]${key}=)[^&]*`), `$1${encodeURIComponent(stringValue)}`)
        : (url.includes('?') ? `${url}&` : `${url}?`) + `${key}=${encodeURIComponent(stringValue)}`;
    }
  });

  return url.replace(/[?&]$/, '');
}

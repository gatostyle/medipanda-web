export function setUrlParams<T extends Record<string, string | number | boolean | null | undefined>>(
  params: T,
  defaultValues: Partial<{ [K in keyof T]: T[K] | string }> = {},
): string {
  let url = window.location.search;
  Object.entries(params).forEach(([key, value]) => {
    const stringValue = String(value);
    if (value === null || value === undefined || stringValue === defaultValues[key]) {
      url = url.replace(new RegExp(`(\\?)?&?${key as string}=[^&]*`), '$1');
    } else {
      url = url.includes(`${key as string}=`)
        ? url.replace(new RegExp(`([?&]${key as string}=)[^&]*`), `$1${encodeURIComponent(stringValue)}`)
        : (url.includes('?') ? `${url}&` : `${url}?`) + `${key as string}=${encodeURIComponent(stringValue)}`;
    }
  });

  return url.replace(/[?&]$/, '');
}

export function MedipandaUrlFileName(url: string): string {
  const lastPath = url.split('/').pop();

  return lastPath?.slice(37) ?? '';
}

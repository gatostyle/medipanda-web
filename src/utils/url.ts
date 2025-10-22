export function MedipandaUrlFileName(url: string): string {
  const lastPath = url.split('/').pop();

  return window.decodeURIComponent(lastPath?.slice(37) ?? '');
}

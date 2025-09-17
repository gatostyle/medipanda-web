export function MedipandaUrlFileName(url: string): string {
  const lastPath = url.split('/').pop();

  return lastPath?.slice(37) ?? '';
}

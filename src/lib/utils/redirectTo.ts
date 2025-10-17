export function saveRedirectTo(currentUrl: string): string {
  const redirectTo = encodeURIComponent(currentUrl);
  return `/login?redirectTo=${redirectTo}`;
}

export function restoreRedirectTo(search: string): string | null {
  const redirectTo = new URLSearchParams(search).get('redirectTo');

  return redirectTo !== null ? decodeURIComponent(redirectTo) : null;
}

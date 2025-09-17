export function saveRedirectTo(currentUrl: string): string {
  const redirectTo = encodeURIComponent(currentUrl);
  return `/login?redirectTo=${redirectTo}`;
}

export function restoreRedirectTo(search: string): string {
  const redirectTo = new URLSearchParams(search).get('redirectTo');

  return redirectTo ? decodeURIComponent(redirectTo) : '/';
}

export function saveRedirectTo(location: { pathname: string } = window.location): string {
  const redirectTo = encodeURIComponent(location.pathname);
  return `/login?redirectTo=${redirectTo}`;
}

export function restoreRedirectTo(location: { search: string } = window.location): string {
  const redirectTo = new URLSearchParams(location.search).get('redirectTo');

  return redirectTo ? decodeURIComponent(redirectTo) : '/';
}

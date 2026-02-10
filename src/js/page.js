export function getPageFromURL() {
  const path = window.location.pathname;

  if (path.includes('favorites')) return 'favorites';
  return 'home';
}

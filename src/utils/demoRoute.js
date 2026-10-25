/** Preview URLs are isolated from the real storefront even when DATA_MODE=real. */
export function isDemoPath(pathname = '') {
  return pathname === '/demo' || pathname.startsWith('/demo/');
}

export function isDemoRuntime() {
  return process.env.NEXT_PUBLIC_DATA_MODE === 'demo' ||
    (typeof window !== 'undefined' && isDemoPath(window.location.pathname));
}

export function demoHref(href, pathname = typeof window === 'undefined' ? '' : window.location.pathname) {
  if (!isDemoPath(pathname) || typeof href !== 'string' || !href.startsWith('/') || href.startsWith('//') || isDemoPath(href)) return href;
  return href === '/' ? '/demo' : `/demo${href}`;
}

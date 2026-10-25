'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {demoHref, isDemoPath} from '@/utils/demoRoute';

/** Keep all in-app navigation within the isolated /demo branch. */
export default function PreviewLink({href, prefetch, ...props}) {
  const pathname = usePathname();
  return <Link {...props} href={demoHref(href, pathname)} prefetch={isDemoPath(pathname) ? false : prefetch} />;
}

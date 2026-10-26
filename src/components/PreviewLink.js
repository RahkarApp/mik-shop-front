'use client';
import Link, {useLinkStatus} from 'next/link';
import {LoaderCircle} from 'lucide-react';
import {usePathname} from 'next/navigation';
import {demoHref, isDemoPath} from '@/utils/demoRoute';

/** Keep all in-app navigation within the isolated /demo branch. */
function PendingStatus({label}) {
  const {pending} = useLinkStatus();
  if (!pending) return null;
  return <span role="status" className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-2 rounded-xl bg-white/95 text-gray-800 text-xs p-2 text-center">
    <LoaderCircle size={22} className="animate-spin motion-reduce:animate-none"/>{label}
  </span>;
}

export default function PreviewLink({href, prefetch, children, pendingLabel, ...props}) {
  const pathname = usePathname();
  return <Link {...props} href={demoHref(href, pathname)} prefetch={isDemoPath(pathname) ? false : prefetch}>
    {children}{pendingLabel && <PendingStatus label={pendingLabel}/>}
  </Link>;
}

import { headers, cookies } from 'next/headers';
import { TENANT_HEADER, TENANT_COOKIE } from '@/constants/config';
import { resolveTenantId } from '@/utils/tenant';
import { isDemo } from './api';
export async function getServerTenantId() {
  const h = await headers();
  if (!isDemo && h.get('x-store-demo-preview')!=='1') return null; // در Real بک‌اند فروشگاه را از Host معتبر شناسایی می‌کند.
  const c = await cookies();
  return resolveTenantId({explicit: h.get(TENANT_HEADER) || c.get(TENANT_COOKIE)?.value,hostname:h.get('host')||''});
}
export async function getServerStoreHost() { const h=await headers();return h.get('x-store-demo-preview')==='1' ? '__demo_preview__' : h.get('host')||''; }

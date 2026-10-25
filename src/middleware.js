/**
 * Middleware — تشخیص Tenant از subdomain، query و cookie
 *
 * اولویت:
 * 1. ?tenant= در URL
 * 2. Cookie shopsaz-tenant
 * 3. Subdomain (fashion.localhost، cosmetic.localhost، ...)
 * 4. پیش‌فرض: fashion-store
 */

import { NextResponse } from 'next/server';
import { TENANT_HEADER, TENANT_COOKIE } from '@/constants/config';
import { resolveTenantId, buildTenantCookie } from '@/utils/tenant';
import { isDemo } from '@/services/api';

export function middleware(request) {
  const { nextUrl } = request;
  const hostname = request.headers.get('host') || '';

  // ?tenant=fashion-store در URL
  const queryTenant = nextUrl.searchParams.get('tenant');

  // Cookie قبلی
  const cookieTenant = request.cookies.get(TENANT_COOKIE)?.value;

  if (!isDemo) return NextResponse.next();
  const tenantId = resolveTenantId({
    explicit: queryTenant || cookieTenant,
    hostname,
  });

  // هدر برای Server Components
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(TENANT_HEADER, tenantId);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // به‌روزرسانی Cookie
  response.headers.set('Set-Cookie', buildTenantCookie(tenantId));

  return response;
}

export const config = {
  matcher: [
    /*
     * همه مسیرها به جز فایل‌های استاتیک Next.js
     */
    '/((?!_next/static|_next/image|favicon.ico|fonts/).*)',
  ],
};

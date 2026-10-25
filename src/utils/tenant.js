/**
 * tenant.js — ابزارهای تشخیص و اعتبارسنجی Tenant
 */

import {
  DEFAULT_TENANT_ID,
  TENANT_SUBDOMAIN_MAP,
  VALID_TENANT_IDS,
  TENANT_COOKIE,
} from '@/constants/config';

/** آیا tenantId معتبر است؟ */
export function isValidTenantId(tenantId) {
  return VALID_TENANT_IDS.includes(tenantId);
}

/**
 * استخراج subdomain از hostname
 * fashion.localhost → fashion
 * cosmetic.shopsaz.ir → cosmetic
 */
export function getSubdomainFromHost(hostname) {
  if (!hostname) return null;

  const host = hostname.split(':')[0].toLowerCase();

  // localhost با subdomain: fashion.localhost
  if (host.endsWith('.localhost')) {
    return host.replace('.localhost', '');
  }

  const parts = host.split('.');
  // حداقل ۳ بخش برای subdomain واقعی: fashion.example.com
  if (parts.length >= 3) {
    return parts[0];
  }

  return null;
}

/**
 * tenantId از subdomain
 */
export function getTenantIdFromSubdomain(hostname) {
  const subdomain = getSubdomainFromHost(hostname);
  if (!subdomain) return null;
  return TENANT_SUBDOMAIN_MAP[subdomain] || null;
}

/**
 * tenantId نهایی با اولویت:
 * 1. مقدار صریح (cookie / query / header)
 * 2. subdomain
 * 3. پیش‌فرض
 */
export function resolveTenantId({ explicit, hostname }) {
  if (explicit && isValidTenantId(explicit)) {
    return explicit;
  }

  const fromSubdomain = getTenantIdFromSubdomain(hostname);
  if (fromSubdomain) {
    return fromSubdomain;
  }

  return DEFAULT_TENANT_ID;
}

/** رشته Cookie برای ست کردن در مرورگر */
export function buildTenantCookie(tenantId) {
  const maxAge = 60 * 60 * 24 * 30; // ۳۰ روز
  return `${TENANT_COOKIE}=${tenantId}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

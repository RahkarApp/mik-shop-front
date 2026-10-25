'use client';

/**
 * SiteConfigContext — مدیریت مرکزی SiteConfig
 *
 * تمام تصمیمات سیستم (Theme، Layout، Features، Pages) از این Context می‌آیند.
 * Behavior = Config
 */

import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import {
  getSiteConfig,
} from '@/services/siteConfigService';
import { applyThemeStyles, getThemeModeClasses } from '@/utils/theme';
import { buildTenantCookie } from '@/utils/tenant';
import { isDemo } from '@/services/api';
import { DEFAULT_TENANT_ID } from '@/constants/config';

// مقدار اولیه Context — قبل از لود Config
export const SiteConfigContext = createContext({
  config: null,
  loading: true,
  error: null,
  tenantId: DEFAULT_TENANT_ID,
  switchTenant: () => {},
  isFeatureEnabled: () => false,
  isPageEnabled: () => false,
});

/**
 * SiteConfigProvider — بارگذاری Config و اعمال Theme
 */
export function SiteConfigProvider({ children, initialTenantId }) {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tenantId, setTenantId] = useState(initialTenantId || null);

  // بارگذاری تنظیمات فروشگاه از سرویس مشترک (Backend واقعی یا Demo مستقل)
  const loadConfig = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    setConfig(null);
    setTenantId(null);

    try {
      const siteConfig = await getSiteConfig(id, typeof window !== 'undefined' ? window.location.host : '');
      setConfig(siteConfig);
      setTenantId(siteConfig.storeId || siteConfig.tenantId);
    } catch (err) {
      setError(err.message || 'خطا در بارگذاری تنظیمات');
    } finally {
      setLoading(false);
    }
  }, []);

  // بارگذاری اولیه — از initialTenantId سرور (Middleware)
  useEffect(() => {
    const id = initialTenantId;
    loadConfig(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTenantId]);

  // تغییر Tenant — شبیه‌سازی ورود به فروشگاه دیگر
  const handleSwitchTenant = useCallback(
    async (newTenantId) => {
      // ذخیره در Cookie برای Middleware درخواست‌های بعدی
      if (!isDemo) return;
      if (typeof document !== 'undefined') {
        document.cookie = buildTenantCookie(newTenantId);
      }
      window.location.assign(`/?tenant=${encodeURIComponent(newTenantId)}`);
    },
    [loadConfig]
  );

  // بررسی فعال بودن یک Feature
  const isFeatureEnabled = useCallback(
    (featureKey) => config?.features?.[featureKey] === true,
    [config]
  );

  // بررسی فعال بودن یک Page
  const isPageEnabled = useCallback(
    (pageKey) => config?.pages?.[pageKey] === true,
    [config]
  );

  // اعمال Theme روی document — Theme Switching بر اساس Config
  useEffect(() => {
    if (!config?.theme) return;

    const faviconUrl = config.branding?.favicon;
    if (faviconUrl) {
      let icon = document.querySelector('link[rel="icon"][data-store-icon]');
      if (!icon) { icon = document.createElement('link'); icon.rel = 'icon'; icon.dataset.storeIcon = 'true'; document.head.appendChild(icon); }
      icon.href = faviconUrl;
    }
    document.title = config.seo?.title || config.branding?.siteName || 'فروشگاه';
    const root = document.documentElement;
    const styles = applyThemeStyles(config.theme);

    Object.entries(styles).forEach(([key, value]) => {
      if (key.startsWith('--')) {
        root.style.setProperty(key, value);
      }
    });

    // کلاس mode برای light/dark
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(
      config.theme.mode === 'dark' ? 'theme-dark' : 'theme-light'
    );
  }, [config?.theme]);

  const value = useMemo(
    () => ({
      config,
      loading,
      error,
      tenantId,
      switchTenant: handleSwitchTenant,
      isFeatureEnabled,
      isPageEnabled,
      themeModeClasses: config?.theme
        ? getThemeModeClasses(config.theme.mode)
        : '',
    }),
    [
      config,
      loading,
      error,
      tenantId,
      handleSwitchTenant,
      isFeatureEnabled,
      isPageEnabled,
    ]
  );

  return (
    <SiteConfigContext.Provider value={value}>
      {children}
    </SiteConfigContext.Provider>
  );
}

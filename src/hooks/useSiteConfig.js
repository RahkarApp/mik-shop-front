'use client';

/**
 * useSiteConfig — دسترسی به SiteConfig در کامپوننت‌ها
 *
 * جریان: Component → useSiteConfig → SiteConfigContext → Service → HTTP API (Real) / Mock (Demo)
 */

import { useContext } from 'react';
import { SiteConfigContext } from '@/context/SiteConfigContext';

export function useSiteConfig() {
  const context = useContext(SiteConfigContext);

  if (!context) {
    throw new Error('useSiteConfig باید داخل SiteConfigProvider استفاده شود');
  }

  return context;
}

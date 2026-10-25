'use client';

/**
 * useBanners — دریافت بنرها از Service Layer
 * جریان: Component → Hook → productService → mockApi
 */

import { useEffect, useState } from 'react';
import { useSiteConfig } from './useSiteConfig';
import { getBanners } from '@/services/productService';

export function useBanners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { tenantId, loading: configLoading } = useSiteConfig();

  useEffect(() => {
    if (configLoading || !tenantId) return;
    let cancelled = false;
    setError(null);

    getBanners(tenantId)
      .then((data) => {
        if (!cancelled) setBanners(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tenantId, configLoading]);

  return { banners, loading, error };
}

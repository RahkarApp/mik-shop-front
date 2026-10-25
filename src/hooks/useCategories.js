'use client';

/**
 * useCategories — دریافت دسته‌بندی‌ها از Service Layer
 */

import { useEffect, useState } from 'react';
import { useSiteConfig } from './useSiteConfig';
import { getCategories } from '@/services/productService';

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { tenantId, loading: configLoading } = useSiteConfig();

  useEffect(() => {
    if (configLoading || !tenantId) return;
    let cancelled = false;
    setError(null);

    getCategories(tenantId)
      .then((data) => {
        if (!cancelled) setCategories(data);
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

  return { categories, loading, error };
}

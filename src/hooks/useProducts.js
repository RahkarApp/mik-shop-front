'use client';

/**
 * useProducts — دریافت محصولات از Service Layer
 * قیمت و موجودی همیشه از Micro Server می‌آیند
 */

import { useEffect, useState } from 'react';
import { useSiteConfig } from './useSiteConfig';
import { getProducts } from '@/services/productService';

/**
 * @param {Object} options — query, category, limit
 */
export function useProducts(options = { limit: 8 }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { tenantId, loading: configLoading } = useSiteConfig();

  const limit = options.limit ?? 8;
  const query = options.query ?? '';
  const category = options.category ?? '';
  const sort = options.sort ?? 'newest';
  const minPrice = options.minPrice ?? '';
  const maxPrice = options.maxPrice ?? '';
  const availableOnly = options.availableOnly ?? '';
  const page = options.page ?? 1;

  useEffect(() => {
    if (configLoading || !tenantId) return;
    let cancelled = false;
    setError(null);
    setLoading(true);

    getProducts({ query, category, limit, sort, minPrice, maxPrice, availableOnly, page }, tenantId)
      .then((data) => {
        if (!cancelled) setProducts(Array.isArray(data) ? data : data?.items || []);
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
  }, [limit, query, category, sort, minPrice, maxPrice, availableOnly, page, tenantId, configLoading]);

  return { products, loading, error };
}

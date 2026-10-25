'use client';

/**
 * useBlogPosts — دریافت پست‌های بلاگ از Service Layer
 */

import { useEffect, useState } from 'react';
import { useSiteConfig } from './useSiteConfig';
import { getBlogPosts } from '@/services/productService';

export function useBlogPosts(limit = 3) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { tenantId, loading: configLoading } = useSiteConfig();

  useEffect(() => {
    if (configLoading || !tenantId) return;
    let cancelled = false;
    setError(null);

    getBlogPosts(limit, tenantId)
      .then((data) => {
        if (!cancelled) setPosts(data);
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
  }, [limit, tenantId, configLoading]);

  return { posts, loading, error };
}

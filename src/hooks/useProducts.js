'use client';

import {useEffect, useState} from 'react';
import {usePathname} from 'next/navigation';
import {useSiteConfig} from './useSiteConfig';
import {getProducts} from '@/services/productService';
import {isDemoPath} from '@/utils/demoRoute';

export function useProducts(options = {}) {
  const {tenantId, loading:configLoading, error:configError} = useSiteConfig();
  const pathname = usePathname();
  const {limit=8, query='', category='', sort='newest', minPrice='', maxPrice='', availableOnly='', page=1} = options;
  const key = JSON.stringify([tenantId, isDemoPath(pathname), limit, query, category, sort, minPrice, maxPrice, availableOnly, page]);
  const [result, setResult] = useState({key:null, products:[], error:null, loading:true, hasNextPage:false});

  useEffect(() => {
    if (configLoading || !tenantId) return;
    let active = true;
    setResult({key, products:[], error:null, loading:true, hasNextPage:false});
    getProducts({limit, query, category, sort, minPrice, maxPrice, availableOnly, page}, tenantId)
      .then(data => {
        if (!active) return;
        const products = Array.isArray(data) ? data : data?.items || [];
        setResult({key, products, loading:false, error:null, hasNextPage:Array.isArray(data) ? products.length >= limit : Boolean(data?.nextCursor)});
      })
      .catch(err => {if (active) setResult({key, products:[], loading:false, error:err.message, hasNextPage:false});});
    return () => {active = false;};
  }, [key, configLoading]);

  if (configError) return {products:[], loading:false, error:configError, hasNextPage:false};
  return result.key === key && !configLoading ? result : {products:[], loading:true, error:null, hasNextPage:false};
}

'use client';

import {useEffect, useState} from 'react';
import {useSiteConfig} from './useSiteConfig';
import {getCategories} from '@/services/productService';
import {customerErrorMessage} from '@/utils/customerError';

const EMPTY = [];
export function useCategories({enabled=true} = {}) {
  const {tenantId, loading:configLoading} = useSiteConfig();
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState({key:null, categories:EMPTY, loading:true, error:null});
  const key = `${tenantId}:${attempt}`;
  useEffect(() => {
    if (!enabled || configLoading || !tenantId) return;
    let active = true;
    setResult({key, categories:EMPTY, loading:true, error:null});
    getCategories(tenantId).then(categories => {if (active) setResult({key, categories, loading:false, error:null});})
      .catch(error => {if (active) setResult({key, categories:EMPTY, loading:false, error:customerErrorMessage(error,'categories')});});
    return () => {active = false;};
  }, [enabled, configLoading, tenantId, attempt]);
  const current = enabled && !configLoading && result.key === key;
  return {categories:current ? result.categories : EMPTY, loading:enabled && (!current || result.loading),
    error:current ? result.error : null, retry:() => setAttempt(value => value + 1)};
}

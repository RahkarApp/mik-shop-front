'use client';

import {useEffect, useState} from 'react';
import {useSiteConfig} from './useSiteConfig';
import {useShopActions} from './useShopActions';
import {customerErrorMessage} from '@/utils/customerError';

const EMPTY = [];
export function useCheckoutMethods({enabled, onUnauthorized}) {
  const {tenantId, loading:configLoading} = useSiteConfig();
  const {getShopMethods} = useShopActions();
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState({key:null, loading:true, error:'', shippingMethods:EMPTY, paymentMethods:EMPTY});
  const key = `${tenantId}:${attempt}`;
  useEffect(() => {
    if (!enabled || !tenantId || configLoading) return;
    let active = true;
    setResult({key, loading:true, error:'', shippingMethods:EMPTY, paymentMethods:EMPTY});
    getShopMethods().then(methods => {if (active) setResult({...methods, key, loading:false, error:''});})
      .catch(error => {
        if (!active) return;
        if (error.status === 401) onUnauthorized();
        setResult({key, loading:false, error:customerErrorMessage(error,'methods'), shippingMethods:EMPTY, paymentMethods:EMPTY});
      });
    return () => {active = false;};
  }, [enabled, tenantId, configLoading, getShopMethods, attempt, onUnauthorized]);
  const current = enabled && !configLoading && result.key === key;
  return {shippingMethods:current ? result.shippingMethods : EMPTY, paymentMethods:current ? result.paymentMethods : EMPTY,
    loading:!current || result.loading, error:current ? result.error : '', retry:() => setAttempt(value => value + 1)};
}

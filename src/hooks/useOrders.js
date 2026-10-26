'use client';

import {useEffect, useState} from 'react';
import {getOrders, getOrder} from '@/services/shopService';
import {useSiteConfig} from './useSiteConfig';
import {customerErrorMessage} from '@/utils/customerError';
import {orderNeedsPolling} from '@/utils/orderPayment';

export function useOrders(orderId, enabled=true) {
  const {tenantId, loading:configLoading, error:configError} = useSiteConfig();
  const key = JSON.stringify([tenantId, orderId, enabled]);
  const [requestVersion, setRequestVersion] = useState(0);
  const [result, setResult] = useState({key:null, data:null, loading:true, error:''});
  useEffect(() => {
    if (!enabled || !tenantId || configLoading) return;
    let active = true;
    setResult({key, data:orderId ? null : [], loading:true, error:''});
    (orderId ? getOrder(orderId, tenantId) : getOrders(tenantId))
      .then(data => {if (active) setResult({key, data:orderId ? data : Array.isArray(data) ? data : data?.items || [], loading:false, error:''});})
      .catch(error => {if (active) setResult({key, data:null, loading:false, error:customerErrorMessage(error,'order')});});
    return () => {active = false;};
  }, [key, configLoading, requestVersion]);

  const current = result.key === key && !configLoading;
  useEffect(() => {
    if (!enabled || !current || !orderId || !orderNeedsPolling(result.data)) return;
    let active = true;
    let timer = setTimeout(async function poll() {
      try {
        const data = await getOrder(orderId, tenantId);
        if (!active) return;
        setResult({key, data, loading:false, error:''});
        if (orderNeedsPolling(data)) timer = setTimeout(poll, 500);
      } catch (error) {
        if (active) setResult(previous => ({...previous, loading:false, error:customerErrorMessage(error,'order')}));
      }
    }, 500);
    return () => {active = false;clearTimeout(timer);};
  }, [key, current, result.data?.processingStatus, result.data?.paymentState, result.data?.paymentUrl, result.data?.paymentExpiresAt]);

  const retry = () => setRequestVersion(version => version + 1);
  if (!enabled) return {data:null, loading:false, error:'', retry};
  if (configError) return {data:null, loading:false, error:configError, retry};
  return current ? {...result, retry} : {data:orderId ? null : [], loading:true, error:'', retry};
}

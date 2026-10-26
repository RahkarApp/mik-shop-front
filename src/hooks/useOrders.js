'use client';

import {useEffect, useState} from 'react';
import {getOrders, getOrder} from '@/services/shopService';
import {useSiteConfig} from './useSiteConfig';

export function useOrders(orderId, enabled=true) {
  const {tenantId, loading:configLoading, error:configError} = useSiteConfig();
  const key = JSON.stringify([tenantId, orderId, enabled]);
  const [result, setResult] = useState({key:null, data:null, loading:true, error:''});
  useEffect(() => {
    if (!enabled || !tenantId || configLoading) return;
    let active = true;
    setResult({key, data:orderId ? null : [], loading:true, error:''});
    (orderId ? getOrder(orderId, tenantId) : getOrders(tenantId))
      .then(data => {if (active) setResult({key, data:orderId ? data : Array.isArray(data) ? data : data?.items || [], loading:false, error:''});})
      .catch(error => {if (active) setResult({key, data:null, loading:false, error:error.message});});
    return () => {active = false;};
  }, [key, configLoading]);

  const current = result.key === key && !configLoading;
  useEffect(() => {
    const status = result.data?.processingStatus;
    if (!enabled || !current || !orderId || !status || ['CONFIRMED','CANCELLED','ACTION_REQUIRED'].includes(status)) return;
    let active = true;
    let requesting = false;
    const timer = setInterval(async () => {
      if (requesting) return;
      requesting = true;
      try {const data = await getOrder(orderId, tenantId);if (active) setResult({key, data, loading:false, error:''});}
      catch (error) {if (active) setResult(previous => ({...previous, error:error.message}));}
      finally {requesting = false;}
    }, 4000);
    return () => {active = false;clearInterval(timer);};
  }, [key, current, result.data?.processingStatus]);

  if (!enabled) return {data:null, loading:false, error:''};
  if (configError) return {data:null, loading:false, error:configError};
  return current ? result : {data:orderId ? null : [], loading:true, error:''};
}

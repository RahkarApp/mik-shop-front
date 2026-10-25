'use client';
import {useEffect,useState} from 'react';
import {getOrders,getOrder} from '@/services/shopService';
import {useSiteConfig} from './useSiteConfig';
export function useOrders(orderId) {
 const {tenantId}=useSiteConfig();const [data,setData]=useState(orderId?null:[]),[loading,setLoading]=useState(true),[error,setError]=useState('');
 useEffect(()=>{if(!tenantId)return;let active=true;setLoading(true);setError('');
  (orderId?getOrder(orderId,tenantId):getOrders(tenantId)).then((x)=>{if(active)setData(orderId?x:(Array.isArray(x)?x:x?.items||[]));}).catch((e)=>{if(active)setError(e.message);}).finally(()=>{if(active)setLoading(false);});
  return()=>{active=false};},[tenantId,orderId]);
 useEffect(()=>{
  if(!orderId||!tenantId||!data||['CONFIRMED','CANCELLED','ACTION_REQUIRED'].includes(data.processingStatus))return;
  let active=true;
  const timer=setInterval(()=>getOrder(orderId,tenantId).then(latest=>{if(active)setData(latest)}).catch(err=>{if(active)setError(err.message)}),4000);
  return()=>{active=false;clearInterval(timer)};
 },[orderId,tenantId,data?.processingStatus]);
 return {data,loading,error};
}

'use client';

import {useEffect, useState} from 'react';
import Link from '@/components/PreviewLink';
import {useSiteConfig} from '@/hooks/useSiteConfig';
import {useShopActions} from '@/hooks/useShopActions';

export default function Wishlist() {
  const {tenantId, loading:configLoading, isFeatureEnabled} = useSiteConfig();
  const {getWishlist, removeWishlist} = useShopActions();
  const enabled = isFeatureEnabled('wishlist');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removing, setRemoving] = useState(null);
  useEffect(() => {
    if (!tenantId || configLoading || !enabled) return;
    let active = true;
    setLoading(true);setError('');setItems([]);
    getWishlist().then(data => {if (active) setItems(Array.isArray(data) ? data : data?.items || []);})
      .catch(err => {if (active) setError(err.message);})
      .finally(() => {if (active) setLoading(false);});
    return () => {active = false;};
  }, [tenantId, enabled, configLoading]);

  async function remove(id) {
    if (removing !== null) return;
    setRemoving(id);setError('');
    try {await removeWishlist(id);setItems(previous => previous.filter(item => item.productId !== id));}
    catch (err) {setError(err.message);}
    finally {setRemoving(null);}
  }
  return <main className="p-6">
    <h1 className="font-bold text-xl mb-5">علاقه‌مندی‌ها</h1>
    {configLoading ? <p role="status">در حال بارگذاری...</p> : !enabled ? <p>علاقه‌مندی‌ها در این فروشگاه فعال نیست.</p> : <>
      {loading && <p role="status">در حال دریافت علاقه‌مندی‌ها...</p>}
      {error && <p role="alert" className="text-red-600">{error}</p>}
      {!loading && !error && !items.length && <p className="text-gray-500">هنوز محصولی به علاقه‌مندی‌ها اضافه نکرده‌اید.</p>}
      {items.map(item => <div key={item.productId} className="flex justify-between p-3 border-b">
        <Link href={`/${encodeURIComponent(item.productId)}`} className="relative" pendingLabel="در حال باز کردن محصول...">{item.name || `محصول ${item.productId}`}</Link>
        <button type="button" disabled={removing !== null} onClick={() => remove(item.productId)} className="text-red-600 disabled:opacity-50">{removing === item.productId ? 'در حال حذف...' : 'حذف'}</button>
      </div>)}
    </>}
  </main>;
}

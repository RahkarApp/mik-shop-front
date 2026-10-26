'use client';

import {useEffect, useRef, useState} from 'react';
import {useRouter} from 'next/navigation';
import Link from '@/components/PreviewLink';
import {useSiteConfig} from '@/hooks/useSiteConfig';
import {useShopActions} from '@/hooks/useShopActions';
import {demoHref} from '@/utils/demoRoute';

export default function ProfileClient() {
  const router = useRouter();
  const {tenantId, isFeatureEnabled} = useSiteConfig();
  const {getProfile, updateProfile, createAddress, removeAddress, logout} = useShopActions();
  const [profile, setProfile] = useState(null);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const lock = useRef(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!tenantId) return;
    let active = true;
    setLoading(true);setProfile(null);setError('');
    getProfile().then(data => {if (active) setProfile(data);})
      .catch(err => {if (active) setError(err.message);})
      .finally(() => {if (active) setLoading(false);});
    return () => {active = false;};
  }, [tenantId]);

  async function perform(name, action) {
    if (lock.current) return;
    lock.current = true;setBusy(name);setError('');setMessage('');
    try {await action();}
    catch (err) {setError(err.message);}
    finally {lock.current = false;setBusy('');}
  }
  const save = event => {
    event.preventDefault();
    perform('save', async () => {
      const result = await updateProfile({expectedRevision:profile.revision, name:profile.name.trim()});
      setProfile(result);setMessage('مشخصات ذخیره شد.');
    });
  };
  const add = () => perform('address', async () => {
    if (!address.trim()) return;
    await createAddress({title:'نشانی', fullAddress:address.trim()});
    setProfile(await getProfile());setAddress('');setMessage('نشانی ثبت شد.');
  });
  const remove = id => perform(`remove:${id}`, async () => {
    await removeAddress(id);setProfile(await getProfile());setMessage('نشانی حذف شد.');
  });

  return <main className="max-w-4xl mx-auto p-6 space-y-5">
    <h1 className="font-bold text-2xl">حساب کاربری</h1>
    {loading ? <p role="status">در حال دریافت اطلاعات...</p> : !profile ? <Link href="/login" className="text-primary underline">ورود به حساب</Link> : <>
      <form onSubmit={save} className="bg-white border rounded-2xl p-5 space-y-4">
        <label className="block">نام<input required disabled={!!busy} className="block p-3 border rounded-xl w-full" value={profile.name || ''} onChange={event => setProfile(previous => ({...previous, name:event.target.value}))}/></label>
        <label className="block">شماره تماس<input readOnly className="block p-3 border rounded-xl w-full bg-gray-100" value={profile.phone || ''}/></label>
        <button disabled={!!busy} className="bg-primary text-white rounded-xl px-5 py-3 disabled:opacity-50">{busy === 'save' ? 'در حال ذخیره...' : 'ذخیره مشخصات'}</button>
      </form>
      <section className="bg-white border rounded-2xl p-5">
        <h2 className="font-bold mb-3">نشانی‌ها</h2>
        {!profile.addresses?.length && <p className="text-sm text-gray-500">هنوز نشانی ثبت نکرده‌اید.</p>}
        {(profile.addresses || []).map(item => {
          const id = item.addressId ?? item.id;
          return <div className="flex justify-between gap-3 p-3 border-b" key={id}>
            <span>{item.fullAddress ?? item.text}</span>
            <button type="button" disabled={!!busy} className="text-red-600 disabled:opacity-50" onClick={() => remove(id)}>{busy === `remove:${id}` ? 'در حال حذف...' : 'حذف'}</button>
          </div>;
        })}
        <label className="block mt-4 text-sm">نشانی جدید<input disabled={!!busy} className="border rounded-xl p-3 mt-2 w-full" value={address} onChange={event => setAddress(event.target.value)}/></label>
        <button type="button" disabled={!!busy || !address.trim()} onClick={add} className="bg-primary text-white p-3 rounded-xl mt-3 disabled:opacity-50">{busy === 'address' ? 'در حال ثبت...' : 'ثبت نشانی'}</button>
      </section>
      <div className="flex flex-wrap gap-5">
        <Link href="/orders" className="underline">سفارش‌های من</Link>
        {isFeatureEnabled('wishlist') && <Link href="/wishlist" className="underline">علاقه‌مندی‌ها</Link>}
        <button type="button" disabled={!!busy} className="underline text-red-600" onClick={() => perform('logout', async () => {await logout();router.replace(demoHref('/login'));router.refresh();})}>{busy === 'logout' ? 'در حال خروج...' : 'خروج از حساب'}</button>
      </div>
    </>}
    {error && <p role="alert" className="text-red-600">{error}</p>}
    {message && <p role="status">{message}</p>}
  </main>;
}

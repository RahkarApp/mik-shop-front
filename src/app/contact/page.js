'use client';
import {useSiteConfig} from '@/hooks/useSiteConfig';
export default function InfoPage() {const {config,loading,error}=useSiteConfig();const brand=config?.branding||{};
return <main className="max-w-3xl mx-auto p-8 bg-white rounded-2xl border"><h1 className="text-2xl font-bold mb-6">راه‌های ارتباط</h1>{loading?'در حال بارگذاری...':error?<p role="alert">{error}</p>: <div className='space-y-3'><p>تلفن: {brand.phone||'ثبت نشده'}</p><p>آدرس: {brand.address||'ثبت نشده'}</p><a href={brand.social?.instagram||'#'}>اینستاگرام</a></div> }</main>}

'use client';
import {useSiteConfig} from '@/hooks/useSiteConfig';
export default function InfoPage() {const {config,loading,error}=useSiteConfig();const brand=config?.branding||{};
return <main className="max-w-3xl mx-auto p-8 bg-white rounded-2xl border"><h1 className="text-2xl font-bold mb-6">سؤالات متداول</h1>{loading?'در حال بارگذاری...':error?<p role="alert">{error}</p>: <p>{config?.content?.faq||'پرسش‌های متداول هنوز توسط فروشگاه ثبت نشده‌اند.'}</p> }</main>}

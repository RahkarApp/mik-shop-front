'use client';
import {useEffect,useState} from 'react';
import {useShopActions} from '@/hooks/useShopActions';
import {useSiteConfig} from '@/hooks/useSiteConfig';
export default function ReviewsPanel({productId}){
 const {tenantId,config}=useSiteConfig();const {getReviews,submitReview}=useShopActions();const [reviews,setReviews]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[rating,setRating]=useState(5),[text,setText]=useState(''),[busy,setBusy]=useState(false);
 useEffect(()=>{if(!tenantId||!config?.features?.reviews)return;let alive=true;getReviews(productId).then(x=>{if(alive)setReviews(x?.items||x||[])}).catch(e=>{if(alive)setError(e.message)}).finally(()=>{if(alive)setLoading(false)});return()=>{alive=false}},[tenantId,config?.features?.reviews,productId]);
 if(!config?.features?.reviews)return null;
 async function send(e){e.preventDefault();setBusy(true);setError('');try{const r=await submitReview(productId,{rating:Number(rating),text:text.trim()});setReviews(old=>[r,...old]);setText('')}catch(e){setError(e.message)}finally{setBusy(false)}}
 return <section className="bg-white border border-gray-100 rounded-2xl p-6 w-full mt-6"><h2 className="font-bold text-xl mb-4">دیدگاه مشتریان</h2>{loading?<p>در حال دریافت دیدگاه‌ها...</p>:reviews.length?<div className="space-y-3">{reviews.map((r,i)=><div key={r.id||i} className="border-b py-3"><b>{r.rating} از ۵</b><p>{r.text}</p></div>)}</div>:<p>هنوز دیدگاهی ثبت نشده است.</p>}<form onSubmit={send} className="mt-6 space-y-3"><label className="block">امتیاز<select value={rating} onChange={e=>setRating(e.target.value)} className="block border rounded-lg p-2 mt-1">{[5,4,3,2,1].map(n=><option key={n} value={n}>{n}</option>)}</select></label><textarea required minLength={3} value={text} onChange={e=>setText(e.target.value)} className="border rounded-lg p-3 w-full" placeholder="دیدگاه خود را بنویسید"/><button disabled={busy} className="bg-primary text-white px-4 py-2 rounded-lg disabled:opacity-50">ارسال دیدگاه</button></form>{error&&<p role="alert" className="text-red-600 mt-3">{error}</p>}</section>
}

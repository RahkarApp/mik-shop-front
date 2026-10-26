'use client';
import {demoHref} from '@/utils/demoRoute';
import {useState,useEffect,useRef} from 'react';
import {useRouter} from 'next/navigation';
import {useShopActions} from '@/hooks/useShopActions';
import {normalizeDigits} from '@/utils/format';
export default function Login(){
 const {requestOtp,verifyOtp,updateProfile,getProfile}=useShopActions();
 const router=useRouter();
 const [phone,setPhone]=useState(''),[challengeId,setChallengeId]=useState(''),[code,setCode]=useState('');
 const [requiresName,setRequiresName]=useState(false),[name,setName]=useState('');
 const [wait,setWait]=useState(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const lock=useRef(false);
 useEffect(()=>{if(!wait)return;const timer=setTimeout(()=>setWait(value=>Math.max(0,value-1)),1000);return()=>clearTimeout(timer)},[wait]);
 function complete(){const next=new URLSearchParams(window.location.search).get('next')==='/checkout'?'/checkout':'/profile';router.replace(demoHref(next));router.refresh();}
 async function resend(){if(busy||wait>0)return;setBusy(true);setError('');try{const result=await requestOtp(phone);if(!result?.challengeId)throw new Error('ارسال مجدد انجام نشد');setChallengeId(result.challengeId);setWait(result.resendAfterSeconds??60);setCode('')}catch(e){setError(e.message)}finally{setBusy(false)}}
 async function submit(e){
  e.preventDefault();if(lock.current||busy)return;lock.current=true;setBusy(true);setError('');
  try{
   if(requiresName){
    if(!name.trim())throw new Error('برای تکمیل پروفایل، نام را وارد کنید');
    const profile=await getProfile();
    await updateProfile({expectedRevision:profile.revision,name:name.trim()});
    complete();return;
   }
   if(!challengeId){
    if(!/^09\d{9}$/.test(phone))throw new Error('شماره موبایل معتبر نیست');
    const result=await requestOtp(phone);
    if(!result?.challengeId)throw new Error('شناسه چالش از سرور دریافت نشد');
    setChallengeId(result.challengeId);setWait(result.resendAfterSeconds??60);return;
   }
   if(!/^\d{5}$/.test(code))throw new Error('کد تأیید باید پنج رقم باشد');
   const result=await verifyOtp(challengeId,code);
   if(result.requiresName===true||result.profilePending===true){setRequiresName(true);return;}
   complete();
  }catch(e){setError(e.message)}finally{setBusy(false);lock.current=false}
 }
 return <main className="max-w-md mx-auto bg-white p-7 rounded-2xl border"><h1 className="text-xl font-bold mb-5">ورود به حساب</h1>
  <form onSubmit={submit} className="space-y-4">
   {requiresName?<label className="block">تکمیل نام مشتری<input required className="w-full border rounded-xl p-3 mt-2" value={name} onChange={e=>setName(e.target.value)}/></label>:
    <label className="block">{challengeId?'کد پنج‌رقمی تأیید':'شماره موبایل'}
     <input required disabled={busy} maxLength={challengeId?5:11} autoComplete={challengeId?'one-time-code':'tel-national'} className="w-full border rounded-xl p-3 mt-2" value={challengeId?code:phone} onChange={e=>challengeId?setCode(normalizeDigits(e.target.value)):setPhone(normalizeDigits(e.target.value))} inputMode="numeric"/></label>}
   {challengeId&&!requiresName&&<div className="flex justify-between text-xs text-gray-600"><button type="button" disabled={busy||wait>0} onClick={resend}>{wait>0?`ارسال مجدد پس از ${wait} ثانیه`:'ارسال مجدد کد'}</button><button type="button" disabled={busy} onClick={()=>{setChallengeId('');setCode('');setError('')}}>ویرایش شماره</button></div>}
   {error&&<p role="alert" className="text-red-600">{error}</p>}
   <button disabled={busy} className="w-full bg-primary text-white rounded-xl p-3 disabled:opacity-50">{busy?'در حال انجام...':requiresName?'تکمیل پروفایل':challengeId?'تأیید':'ارسال کد'}</button>
  </form>
 </main>;
}

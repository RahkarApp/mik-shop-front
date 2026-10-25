'use client';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {useShopActions} from '@/hooks/useShopActions';
export default function Login(){
 const {requestOtp,verifyOtp,updateProfile}=useShopActions();
 const router=useRouter();
 const [phone,setPhone]=useState(''),[challengeId,setChallengeId]=useState(''),[code,setCode]=useState('');
 const [requiresName,setRequiresName]=useState(false),[name,setName]=useState('');
 const [wait,setWait]=useState(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
 async function submit(e){
  e.preventDefault();setBusy(true);setError('');
  try{
   if(requiresName){
    if(!name.trim())throw new Error('برای تکمیل پروفایل، نام را وارد کنید');
    await updateProfile({name:name.trim()});
    router.replace('/profile');router.refresh();return;
   }
   if(!challengeId){
    if(!/^09\d{9}$/.test(phone))throw new Error('شماره موبایل معتبر نیست');
    const result=await requestOtp(phone);
    if(!result?.challengeId)throw new Error('شناسه چالش از سرور دریافت نشد');
    setChallengeId(result.challengeId);setWait(result.resendAfterSeconds??null);return;
   }
   if(!/^\d{5}$/.test(code))throw new Error('کد تأیید باید پنج رقم باشد');
   const result=await verifyOtp(challengeId,code);
   if(result.requiresName===true||result.profilePending===true){setRequiresName(true);return;}
   router.replace('/profile');router.refresh();
  }catch(e){setError(e.message)}finally{setBusy(false)}
 }
 return <main className="max-w-md mx-auto bg-white p-7 rounded-2xl border"><h1 className="text-xl font-bold mb-5">ورود به حساب</h1>
  <form onSubmit={submit} className="space-y-4">
   {requiresName?<label className="block">تکمیل نام مشتری<input required className="w-full border rounded-xl p-3 mt-2" value={name} onChange={e=>setName(e.target.value)}/></label>:
    <label className="block">{challengeId?'کد پنج‌رقمی تأیید':'شماره موبایل'}
     <input required className="w-full border rounded-xl p-3 mt-2" value={challengeId?code:phone} onChange={e=>challengeId?setCode(e.target.value):setPhone(e.target.value)} inputMode="numeric"/></label>}
   {challengeId&&!requiresName&&<p className="text-xs text-gray-600">شناسه چالش مستقل از شماره موبایل است. {wait!=null?`ارسال مجدد پس از ${wait} ثانیه ممکن است.`:''}</p>}
   {error&&<p role="alert" className="text-red-600">{error}</p>}
   <button disabled={busy} className="w-full bg-primary text-white rounded-xl p-3 disabled:opacity-50">{busy?'در حال انجام...':requiresName?'تکمیل پروفایل':challengeId?'تأیید':'ارسال کد'}</button>
  </form>
 </main>;
}

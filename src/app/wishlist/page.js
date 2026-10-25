'use client';
import {useEffect,useState} from 'react';
import {useSiteConfig} from '@/hooks/useSiteConfig';
import {useShopActions} from '@/hooks/useShopActions';
import Link from 'next/link';
export default function Wishlist(){const {tenantId}=useSiteConfig();const {getWishlist,removeWishlist}=useShopActions();const [items,setItems]=useState([]),[error,setError]=useState('');useEffect(()=>{if(tenantId)getWishlist().then(setItems).catch(e=>setError(e.message))},[tenantId]);return <main className="p-6"><h1 className="font-bold text-xl mb-5">علاقه‌مندی‌ها</h1>{error&&<p role="alert">{error}</p>}{items.map(x=><div key={x.productId} className="flex justify-between p-3 border-b"><Link href={`/${x.productId}`}>محصول {x.productId}</Link><button onClick={async()=>{try{await removeWishlist(x.productId);setItems(a=>a.filter(i=>i.productId!==x.productId))}catch(e){setError(e.message)}}}>حذف</button></div>)}</main>}

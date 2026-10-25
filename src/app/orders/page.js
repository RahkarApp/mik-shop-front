'use client';
import OrderList from '@/components/shared/OrderList';
import {useOrders} from '@/hooks/useOrders';
export default function OrdersPage(){const {data,loading,error}=useOrders();return <main className="max-w-5xl mx-auto p-4"><h1 className="text-xl font-bold mb-4">سفارش‌های من</h1>{loading?<p>در حال بارگذاری...</p>:error?<p role="alert" className="text-red-600">{error}</p>:<OrderList orders={data}/>}</main>}

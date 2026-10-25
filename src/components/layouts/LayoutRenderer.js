'use client';
import HeaderA from './HeaderA';
import FooterA from './FooterA';
import {useSiteConfig} from '@/hooks/useSiteConfig';
export default function LayoutRenderer({children}){
 const {config,loading,error,themeModeClasses}=useSiteConfig();
 if(error)return <div role="alert" className="min-h-screen flex items-center justify-center p-8 text-red-600">{error}</div>;
 if(loading||!config)return <div className="min-h-screen flex items-center justify-center">در حال بارگذاری فروشگاه...</div>;
 return <div className={`min-h-screen w-full flex flex-col ${themeModeClasses}`}><HeaderA/><div className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-x-hidden">{children}</div><FooterA/></div>
}

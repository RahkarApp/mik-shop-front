import Link from "@/components/PreviewLink";
import { ArrowLeft } from "lucide-react";


export const metadata = {
  title: ' صفحه یافت نشد',
  description:'',
};
export default function NotFound() {
  return (
    <div className="max-h-screen min-h-[60vh] mmd:min-h-[70vh] flex items-center justify-center  text-secondary">
      <div className="text-center space-y-6">
        {/* عنوان و پیام خطا */}
        <h1 className="text-4xl md:text-6xl font-bold">404</h1>
        <p className="text-base md:text-xl font-medium">صفحه‌ای که به دنبال آن هستید یافت نشد!</p>
        <p className="text-sm md:text-base text-gray-600">
          به نظر می‌رسد آدرس وارد شده اشتباه است یا صفحه منتقل شده است.
        </p>

        {/* دکمه بازگشت به صفحه اصلی */}
        <Link href="/" className="inline-flex group">
          <div
            className="flex items-center py-3 px-6 bg-white text-secondary rounded-full shadow-lg 
            transform transition-all duration-300 group-hover:bg-violet-700 group-hover:text-white 
            group-hover:shadow-xl group-hover:-translate-y-1"
          >
            <p className="text-sm md:text-base font-semibold">بازگشت به صفحه اصلی</p>
            <ArrowLeft className="w-5 h-5 mr-2 animate-pulse-arrow" strokeWidth={2} />
          </div>
        </Link>
      </div>
    </div>
  );
}
import {LoaderCircle} from 'lucide-react';

export default function Loading() {
  return <div role="status" className="flex items-center justify-center gap-3 min-h-[40vh] text-gray-600">
    <LoaderCircle className="animate-spin motion-reduce:animate-none" size={24}/>در حال بارگذاری صفحه...
  </div>;
}

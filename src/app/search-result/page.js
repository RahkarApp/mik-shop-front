import { Suspense } from 'react';
import SearchResultClient from '@/components/templates/SearchResultClient';

export default function SearchResultPage() {
  return (
    <Suspense fallback={<p className="text-center py-20 text-gray-500">در حال بارگذاری...</p>}>
      <SearchResultClient />
    </Suspense>
  );
}

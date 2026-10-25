'use client';

/**
 * BlogPageClient — لیست بلاگ Config-Driven
 */

import Link from 'next/link';
import PageGuard from '@/components/shared/PageGuard';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { useSiteConfig } from '@/hooks/useSiteConfig';

function BlogContent() {
  const { posts, loading, error } = useBlogPosts(10);
  const { config, isFeatureEnabled } = useSiteConfig();

  if (!isFeatureEnabled('blog')) {
    return null;
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-black text-gray-900 mb-2">بلاگ {config?.branding?.siteName}</h1>
      <p className="text-gray-500 text-sm mb-8">آخرین مطالب و راهنماها</p>

      {loading && <p className="text-gray-500">در حال بارگذاری...</p>}
      {error && <div className="text-red-600 bg-red-50 p-4 rounded-lg">{error}</div>}

      <div className="flex flex-col gap-4">
        {posts.map((post) => (
          <article key={post.id} className="p-6 bg-white border border-gray-100 rounded-2xl hover:shadow-md transition-shadow">
            <h2 className="text-lg font-bold text-gray-800 mb-2">{post.title}</h2>
            <p className="text-sm text-gray-600 leading-7">{post.excerpt}</p>
            <Link href="#" className="inline-block mt-3 text-sm text-primary hover:underline">ادامه مطلب</Link>
          </article>
        ))}
      </div>
    </main>
  );
}

export default function BlogPageClient() {
  return (
    <PageGuard pageKey="blog">
      <BlogContent />
    </PageGuard>
  );
}

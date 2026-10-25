'use client';

/**
 * BlogSection — بخش بلاگ صفحه اصلی
 * فقط اگر pages.blog و features.blog فعال باشند
 */

import Link from '@/components/PreviewLink';
import { useSiteConfig } from '@/hooks/useSiteConfig';
import { useBlogPosts } from '@/hooks/useBlogPosts';

export default function BlogSection() {
  const { isPageEnabled, isFeatureEnabled } = useSiteConfig();
  const { posts, loading, error } = useBlogPosts(3);

  if (!isPageEnabled('blog') || !isFeatureEnabled('blog')) {
    return null;
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>
    );
  }

  return (
    <section className="w-full flex flex-col gap-6">
      <h2 className="text-xl md:text-2xl font-bold text-gray-800 border-r-4 border-secondary pr-3 rounded-sm">
        آخرین مطالب بلاگ
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {posts.map((post) => (
          <article
            key={post.id}
            className="p-5 rounded-xl border border-gray-200 bg-white hover:shadow-md transition-shadow"
          >
            <h3 className="font-bold text-gray-800 mb-2">{post.title}</h3>
            <p className="text-sm text-gray-600 leading-6">{post.excerpt}</p>
            <Link href="#" className="inline-block mt-3 text-sm text-primary hover:underline">
              ادامه مطلب
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

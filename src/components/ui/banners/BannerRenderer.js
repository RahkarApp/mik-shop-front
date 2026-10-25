'use client';
import Primary from './BannerA';
/** Single supported storefront template; backend customizes content and colors only. */
export default function BannerRenderer({banners}) { return <Primary banners={banners} />; }

'use client';
import Primary from './CategoriesA';
/** Single supported storefront template; backend customizes content and colors only. */
export default function CategoriesRenderer({categories}) { return <Primary categories={categories} />; }

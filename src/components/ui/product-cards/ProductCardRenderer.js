'use client';
import Primary from './ProductCardA';
/** Single supported storefront template; backend customizes content and colors only. */
export default function ProductCardRenderer({product}) { return <Primary product={product} />; }

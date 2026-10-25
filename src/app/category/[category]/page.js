import CategoryPageClient from '@/components/templates/CategoryPageClient';
import {getCategories} from '@/services/productService';
import {getServerTenantId,getServerStoreHost} from '@/services/tenantResolver';
import {getSiteConfig} from '@/services/siteConfigService';
function findCategory(items,target){for(const c of items||[]){if(String(c.id)===String(target))return c;const child=findCategory(c.subcategories,target);if(child)return child;}return null}
export async function generateMetadata({params}){const {category}=await params;const tenant=await getServerTenantId();const host=await getServerStoreHost();
try{const [c,site]=await Promise.all([getCategories(tenant,host),getSiteConfig(tenant,host)]);return {title:`${findCategory(Array.isArray(c)?c:c.items,category)?.name||category} | ${site.branding.siteName}`};}catch{return {title:'محصولات فروشگاه'}}}
export default async function CategoryPage({params}){const {category}=await params;return <CategoryPageClient categoryId={category} categoryName={category}/>}

/** سازگاری با واردکننده‌های قدیمی؛ API واقعی از Service عبور می‌کند. */
export {getProducts,getProductById,getBanners,getCategories as getMainCategories} from '@/services/productService';
export {getOrders,getOrder as getOrderById} from '@/services/shopService';

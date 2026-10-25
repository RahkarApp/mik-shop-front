'use client';
/** فعلاً فقط یک قالب داریم؛ داده فروشگاه نمی‌تواند نوع کامپوننت را تغییر دهد. */
import { DEFAULT_COMPONENTS } from '@/constants/config';
export function useComponentVariant(key){return DEFAULT_COMPONENTS[key]}
export function useComponents(){return DEFAULT_COMPONENTS}

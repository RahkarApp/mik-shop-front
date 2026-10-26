'use client';

import {useState} from 'react';
import {motion} from 'framer-motion';
import {Check} from 'lucide-react';
import ProductFeatureBar from '@/components/features/ProductFeatureBar';
import ProductCartControls from './ProductCartControls';
import {useSiteConfig} from '@/hooks/useSiteConfig';
import {productSelection} from '@/utils/cart';
import {formatMoney, formatPrice} from '@/utils/format';

export default function ProductDetailsClient({product}) {
  const {config} = useSiteConfig();
  const [selected, setSelected] = useState(() => productSelection(product).selectedFeatures);
  const {variant} = productSelection(product, selected);
  const price = variant ? variant.price : product.price;

  return <motion.div initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} transition={{duration:0.5}} className="flex-1 flex flex-col gap-6 min-w-0">
    <div className="flex flex-col gap-2 border-b border-gray-100 pb-4">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">{product.name}</h1>
      {product.brand && <span className="text-sm text-gray-500">برند: {product.brand}</span>}
    </div>
    <div className="flex flex-col gap-1 items-end self-start w-full">
      <div className="flex items-center justify-between w-full">
        <span className="text-sm text-gray-400">قیمت مصرف کننده:</span>
        <div className="flex flex-col items-end" aria-live="polite">
          {!variant && product.discount > 0 && product.originalPrice != null && <div className="flex items-center gap-2 mb-1">
            <span className="text-sm text-gray-400 line-through decoration-rose-500">{formatMoney(product.originalPrice, config?.currency)}</span>
            <span className="px-1.5 py-0.5 rounded-md bg-rose-500 text-white text-[10px] font-bold">{formatPrice(product.discount)}٪</span>
          </div>}
          <span className="text-2xl font-bold text-gray-900">{price == null ? 'قیمت نامشخص' : formatMoney(price, config?.currency)}</span>
        </div>
      </div>
    </div>
    {product.description && <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 leading-relaxed border border-gray-100/50"><p>{product.description}</p></div>}
    {!!product.features?.length && <div className="flex flex-col gap-5 py-2">
      {product.features.map(feature => <fieldset key={feature.name}>
        <legend className="text-sm font-bold text-gray-800 mb-3">
          {feature.name}: <span className="text-primary font-normal text-xs bg-primary/5 px-2 py-0.5 rounded">{selected[feature.name] || 'انتخاب کنید'}</span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {feature.options.map(option => {
            const active = selected[feature.name] === String(option.value);
            const unavailable = option.available === false;
            return <button key={option.value} type="button" onClick={() => setSelected(previous => ({...previous, [feature.name]:String(option.value)}))}
              disabled={unavailable} aria-pressed={active} title={unavailable ? 'ناموجود' : String(option.value)}
              className={`min-w-10 px-3 py-2 rounded-lg border text-xs transition-all duration-200 relative ${active ? 'border-primary bg-primary text-white shadow-md shadow-primary/20' : 'border-gray-200 bg-white text-gray-700 hover:border-primary/50'} ${unavailable ? 'opacity-40 cursor-not-allowed' : ''}`}>
              {option.value}{active && <span className="absolute -top-1.5 -right-1.5 bg-white text-primary rounded-full p-0.5 shadow-sm border border-gray-100"><Check size={8}/></span>}
            </button>;
          })}
        </div>
      </fieldset>)}
    </div>}
    <div className="mt-auto pt-4 flex flex-col gap-3">
      <ProductFeatureBar productName={product.name} productId={product.id}/>
      <ProductCartControls key={JSON.stringify(selected)} product={product} selectedFeatures={selected}/>
    </div>
  </motion.div>;
}

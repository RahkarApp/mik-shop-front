'use client';

import React, { useState } from "react";
import { useCart } from "@/components/shared/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { Check, AlertCircle } from "lucide-react";
import ProductFeatureBar from "@/components/features/ProductFeatureBar";
import {useShopActions} from '@/hooks/useShopActions';
import { useSiteConfig } from "@/hooks/useSiteConfig";
import {formatMoney} from "@/utils/format";

const toFa = (n) => new Intl.NumberFormat("fa-IR").format(n);

export default function ProductDetailsClient({ product }) {
  const { dispatch } = useCart();
  const {validateStockBeforeAdd}=useShopActions();
  const {config} = useSiteConfig();
  const [selected, setSelected] = useState({});

  const isAvailable = (() => {
    if (!product.features || product.features.length === 0) {
      return product.stock > 0;
    }
    for (const key in selected) {
      const feature = product.features.find((f) => f.name === key);
      const option = feature?.options.find((o) => o.value === selected[key]);
      if (!option?.available) return false;
    }
    return product.stock > 0;
  })();

  const allFeaturesSelected = product.features ? Object.keys(selected).length === product.features.length : true;

  const handleSelect = (featureName, optionValue) => {
    setSelected((prev) => ({ ...prev, [featureName]: optionValue }));
  };

  const [stockError, setStockError] = useState(null);

  const handleAddToCart = async () => {
    setStockError(null);
    const validation = await validateStockBeforeAdd(product.id, 1, selected);
    if (!validation.valid) {
      setStockError(validation.reason);
      return;
    }
    dispatch({
      type: 'ADD_ITEM',
      payload: { product: {...product,price:validation.price,proUID:validation.proUID}, selectedFeatures: selected },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="flex-1 flex flex-col gap-6"
    >
      <div className="flex flex-col gap-2 border-b border-gray-100 pb-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
          {product.name}
        </h1>
        {product.brand && <span className="text-sm text-gray-500">برند: {product.brand}</span>}
      </div>

      <div className="flex flex-col gap-1 items-end self-start w-full">
        <div className="flex items-center justify-between w-full">
          <span className="text-sm text-gray-400">قیمت مصرف کننده:</span>
          <div className="flex flex-col items-end">
            {product.discount > 0 && (
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm text-gray-400 line-through decoration-rose-500">
                  {toFa(product.originalPrice)}
                </span>
                <span className="px-1.5 py-0.5 rounded-md bg-rose-500 text-white text-[10px] font-bold">
                  {toFa(product.discount)}%
                </span>
              </div>
            )}
            <span className="text-2xl font-bold text-gray-900">
              {formatMoney(product.price, config?.currency)}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 leading-relaxed border border-gray-100/50">
        <p>{product.description}</p>
      </div>

      {product.features && product.features.length > 0 && (
        <div className="flex flex-col gap-5 py-2">
          {product.features.map((feature) => (
            <div key={feature.name}>
              <div className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                {feature.name}:
                <span className="text-primary font-normal text-xs bg-primary/5 px-2 py-0.5 rounded">
                  {selected[feature.name] || "انتخاب کنید"}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {feature.options.map((option) => {
                  const active = selected[feature.name] === option.value;
                  const disabled = !option.available;
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleSelect(feature.name, option.value)}
                      disabled={disabled}
                      aria-pressed={active}
                      className={`
                        min-w-[40px] px-3 py-2 rounded-lg border text-xs transition-all duration-200 relative
                        ${active
                          ? "border-primary bg-primary text-white shadow-md shadow-primary/20 scale-105"
                          : "border-gray-200 bg-white text-gray-700 hover:border-primary/50 hover:bg-gray-50"
                        }
                        ${disabled ? "opacity-40 cursor-not-allowed bg-gray-50" : ""}
                      `}
                      title={disabled ? "ناموجود" : option.value}
                    >
                      {option.value}
                      {active && <motion.div layoutId={`check-${feature.name}`} className="absolute -top-1.5 -right-1.5 bg-white text-primary rounded-full p-0.5 shadow-sm border border-gray-100"><Check size={8} /></motion.div>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-auto pt-4 flex flex-col gap-3">
        <ProductFeatureBar productName={product.name} productId={product.id} />

        {stockError && (
          <div className="w-full bg-rose-50 border border-rose-100 rounded-xl p-3 text-rose-600 text-xs font-semibold">
            {stockError}
          </div>
        )}

        <AnimatePresence>
          {!isAvailable && allFeaturesSelected && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full bg-rose-50 border border-rose-100 rounded-xl p-3 flex items-center gap-2 text-rose-600"
            >
              <AlertCircle size={16} />
              <span className="text-xs font-semibold">این ترکیب انتخابی در انبار موجود نیست.</span>
            </motion.div>
          )}

          {product.stock === 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="w-full bg-gray-100 border border-gray-200 rounded-xl p-3 text-center"
            >
              <span className="text-gray-500 text-xs font-semibold">کالای انتخابی فعلا ناموجود است.</span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`
             w-full py-4 rounded-xl font-bold font-lg shadow-lg transition-all flex items-center justify-center gap-2
             ${(!isAvailable || !allFeaturesSelected || product.stock === 0)
              ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
              : "bg-gray-900 text-white hover:bg-primary hover:shadow-primary/30"
            }
          `}
          disabled={!isAvailable || !allFeaturesSelected || product.stock === 0}
          onClick={handleAddToCart}
        >
          {product.stock === 0
            ? "ناموجود"
            : allFeaturesSelected
              ? isAvailable
                ? "افزودن به سبد خرید"
                : "عدم موجودی ترکیب"
              : "لطفا ویژگی‌ها را انتخاب کنید"}
        </motion.button>
      </div>

      {/* Example usage:
      <img src={product.image} alt={product.name} />
      */}
    </motion.div>
  );
}

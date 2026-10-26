'use client';

import {useState, useRef, createContext, useContext, useEffect} from 'react';
import {usePathname} from 'next/navigation';
import {useSiteConfig} from '@/hooks/useSiteConfig';
import {cartReducer, cartEstimate, findCartItem} from '@/utils/cart';
import {isDemoPath} from '@/utils/demoRoute';
import {validateStockBeforeAdd} from '@/services/inventorySync';

const CartContext = createContext();

export function CartProvider({children}) {
  const {tenantId, loading} = useSiteConfig();
  const pathname = usePathname();
  const mode = process.env.NEXT_PUBLIC_DATA_MODE === 'demo' || isDemoPath(pathname) ? 'demo' : 'real';
  const scope = !loading && tenantId ? `${mode}:${tenantId}` : null;
  const [state, setState] = useState([]);
  const [readyScope, setReadyScope] = useState(null);
  const [pending, setPending] = useState({});
  const [storageError, setStorageError] = useState('');
  const stateRef = useRef([]);
  const currentScope = useRef(scope);
  const epoch = useRef(0);
  if (currentScope.current !== scope) epoch.current += 1;
  currentScope.current = scope;
  const locks = useRef(new Set());
  const ready = scope !== null && readyScope === scope;

  function dispatch(action) {
    if (currentScope.current !== scope || !ready) return;
    if (action.type === 'CLEAR_CART') epoch.current += 1;
    stateRef.current = cartReducer(stateRef.current, action);
    setState(stateRef.current);
  }

  useEffect(() => {
    if (!scope) return;
    let restored = [];
    try { restored = cartReducer([], {type:'RESTORE', payload:JSON.parse(localStorage.getItem(`shopsaz-cart:${scope}`) || '[]')}); }
    catch { setStorageError('ذخیره‌سازی مرورگر در دسترس نیست؛ سبد پس از بستن صفحه ممکن است حفظ نشود.'); }
    stateRef.current = restored;
    setState(restored);
    setReadyScope(scope);
  }, [scope]);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(`shopsaz-cart:${scope}`, JSON.stringify(state)); }
    catch { setStorageError('ذخیره‌سازی مرورگر در دسترس نیست؛ سبد پس از بستن صفحه ممکن است حفظ نشود.'); }
  }, [state, ready, scope]);

  async function changeCart(product, selectedFeatures, quantity, item) {
    const lockKey = `${scope}:${product.id}`;
    if (!ready || currentScope.current !== scope || locks.current.has(lockKey)) return {valid:false};
    locks.current.add(lockKey);
    const operationEpoch = epoch.current;
    setPending(old => ({...old, [lockKey]:true}));
    try {
      const existing = item || findCartItem(stateRef.current, product, selectedFeatures);
      const target = quantity ?? (existing?.quantity || 0) + 1;
      if (!Number.isSafeInteger(target) || target < 0 || target > 1000) return {valid:false, reason:'حداکثر تعداد مجاز در سبد ۱۰۰۰ عدد است'};
      if (existing && target <= existing.quantity) {
        dispatch({type:'UPDATE_QUANTITY', payload:{cartItemId:existing.cartItemId, quantity:target}});
        return {valid:true};
      }
      const result = await validateStockBeforeAdd(product.id, target, tenantId, selectedFeatures, existing?.proUID);
      if (currentScope.current !== scope || epoch.current !== operationEpoch) return {valid:false};
      if (!result.valid) return result;
      const fresh = {...product, ...result.product, price:result.price, stock:result.stock, proUID:result.proUID};
      const resolvedItem = existing || findCartItem(stateRef.current, fresh, result.selectedFeatures);
      const resolvedQuantity = quantity ?? (resolvedItem?.quantity || 0) + 1;
      if (resolvedQuantity > Number(result.stock) || resolvedQuantity > 1000) return {valid:false, reason:'موجودی کافی نیست'};
      if (resolvedItem) dispatch({type:'UPDATE_QUANTITY', payload:{cartItemId:resolvedItem.cartItemId, quantity:resolvedQuantity, product:fresh}});
      else dispatch({type:'ADD_ITEM', payload:{product:fresh, selectedFeatures:result.selectedFeatures}});
      return result;
    } finally {
      locks.current.delete(lockKey);
      setPending(old => {const next = {...old}; delete next[lockKey]; return next;});
    }
  }

  const cart = ready ? state : [];
  return <CartContext.Provider value={{
    cart, ready, dispatch, storageError,
    cartItemCount:cart.reduce((count, item) => count + item.quantity, 0), cartTotal:cartEstimate(cart),
    isUpdating:productId => Boolean(pending[`${scope}:${productId}`]),
    addItem:(product, features) => changeCart(product, features),
    setItemQuantity:(item, quantity) => changeCart(item, item.selectedFeatures || {}, quantity, item),
  }}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) throw new Error('useCart must be used within a CartProvider');
  return context;
}

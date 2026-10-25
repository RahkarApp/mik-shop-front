'use client';

import React, { useState, useReducer, createContext, useContext, useEffect } from 'react';
import { useSiteConfig } from '@/hooks/useSiteConfig';
import {cartItemKey, sanitizeCart, cartEstimate} from '@/utils/cart';
import {isDemoRuntime} from '@/utils/demoRoute';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, selectedFeatures } = action.payload;
      if (!product || product.id == null) return state;
      const cartItemId = cartItemKey(product, selectedFeatures);

      const existingItemIndex = state.findIndex(item => item.cartItemId === cartItemId);

      if (existingItemIndex > -1) {
        const updatedState = [...state];
        updatedState[existingItemIndex] = {...updatedState[existingItemIndex], quantity: updatedState[existingItemIndex].quantity + 1};
        return updatedState;
      } else {
        return [...state, { ...product, selectedFeatures, cartItemId, quantity: 1 }];
      }
    }
    case 'REMOVE_ITEM': {
      return state.filter(item => item.cartItemId !== action.payload.cartItemId);
    }
    case 'UPDATE_QUANTITY': {
      return state.map(item =>
        item.cartItemId === action.payload.cartItemId
          ? { ...item, quantity: Number.isSafeInteger(action.payload.quantity) ? Math.max(1, Math.min(1000, action.payload.quantity)) : item.quantity }
          : item
      );
    }
    case 'RESTORE': return sanitizeCart(action.payload);
    case 'CLEAR_CART': {
      return [];
    }
    default:
      return state;
  }
};

// هر فروشگاه سبد مستقل دارد؛ هیچ سبدی نباید به Tenant دیگر منتقل شود.
export const CartProvider = ({ children }) => {
  const { tenantId, loading } = useSiteConfig();
  const [state, dispatch] = useReducer(cartReducer, []);
  const [readyTenant, setReadyTenant] = React.useState(null);
  useEffect(() => {
    if (loading || !tenantId) return;
    try {
      const value = JSON.parse(localStorage.getItem(`shopsaz-cart:${isDemoRuntime()?"demo":"real"}:${tenantId}`) || '[]');
      dispatch({type:'RESTORE',payload:sanitizeCart(value)});
    } catch { dispatch({type:'RESTORE',payload:[]}); }
    setReadyTenant(tenantId);
  }, [tenantId, loading]);
  useEffect(() => {
    if (readyTenant === tenantId && tenantId) localStorage.setItem(`shopsaz-cart:${isDemoRuntime()?"demo":"real"}:${tenantId}`, JSON.stringify(state));
  }, [state, readyTenant, tenantId]);

  const cartItemCount = state.reduce((count, item) => count + item.quantity, 0);
  const cartTotal = cartEstimate(state);

  return (
    <CartContext.Provider value={{ cart: readyTenant === tenantId ? state : [], dispatch, cartItemCount: readyTenant === tenantId ? cartItemCount : 0, cartTotal: readyTenant === tenantId ? cartTotal : 0 }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

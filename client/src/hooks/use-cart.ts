import { useState, useEffect } from "react";
import type { Product } from "@shared/schema";

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

const CART_KEY = "nup_cart";

function loadCart(): CartItem[] {
  try {
    const stored = localStorage.getItem(CART_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveCart(cart: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>(loadCart);

  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  const addToCart = (product: Product, size?: string, color?: string) => {
    setCart(prev => {
      const existing = prev.find(
        item => item.product.id === product.id && item.selectedSize === size && item.selectedColor === color
      );
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id && item.selectedSize === size && item.selectedColor === color
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1, selectedSize: size, selectedColor: color }];
    });
  };

  const updateQuantity = (productId: string, delta: number, size?: string, color?: string) => {
    setCart(prev =>
      prev.map(item => {
        if (item.product.id === productId && item.selectedSize === size && item.selectedColor === color) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      }).filter(item => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: string, size?: string, color?: string) => {
    setCart(prev =>
      prev.filter(item => !(item.product.id === productId && item.selectedSize === size && item.selectedColor === color))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return { cart, addToCart, updateQuantity, removeFromCart, clearCart, cartTotal, cartCount };
}

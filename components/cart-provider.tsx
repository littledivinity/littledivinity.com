"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

import { getPrimaryImage } from "../lib/api";
import { Product } from "../lib/types";

const CART_STORAGE_KEY = "little-divinity-cart";

export type CartProductInput = Pick<
  Product,
  "id" | "slug" | "name" | "price" | "sale_price" | "effective_price" | "images" | "category_name" | "category_slug" | "is_sellable"
> & {
  variantId?: number | null;
};

export type CartItem = {
  id: number;
  slug: string;
  variantId?: number | null;
  cartKey: string;
  name: string;
  price: number;
  image: string;
  categoryName?: string | null;
  categorySlug?: string | null;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (product: CartProductInput, quantity?: number) => void;
  getItemQuantity: (cartKey: string) => number;
  removeItem: (cartKey: string) => void;
  updateQuantity: (cartKey: string, quantity: number) => void;
  clearCart: () => void;
  isAddedModalOpen: boolean;
  lastAddedItem: CartItem | null;
  setAddedModalOpen: (open: boolean) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function buildCartKey(slug: string, variantId?: number | null): string {
  return `${slug}__${variantId ?? "default"}`;
}

function readCart(): CartItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map((item) => ({
      ...item,
      variantId: item.variantId ?? null,
      cartKey: item.cartKey || buildCartKey(item.slug, item.variantId ?? null),
    }));
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent("little-divinity-cart-updated"));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isAddedModalOpen, setAddedModalOpen] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState<CartItem | null>(null);

  useEffect(() => {
    const sync = () => setItems(readCart());

    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("little-divinity-cart-updated", sync as EventListener);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("little-divinity-cart-updated", sync as EventListener);
    };
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return {
      items,
      count,
      subtotal,
      isAddedModalOpen,
      lastAddedItem,
      setAddedModalOpen,
      addItem(product, quantity = 1) {
        if (product.is_sellable === false) {
          return;
        }

        const nextItems = [...readCart()];
        const cartKey = buildCartKey(product.slug, product.variantId ?? null);
        const index = nextItems.findIndex((item) => item.cartKey === cartKey);
        const safeQuantity = Math.max(1, quantity);
        let addedItem: CartItem;

        if (index >= 0) {
          nextItems[index] = {
            ...nextItems[index],
            quantity: nextItems[index].quantity + safeQuantity,
          };
          addedItem = nextItems[index];
        } else {
          const newItem = {
            id: product.id,
            slug: product.slug,
            variantId: product.variantId ?? null,
            cartKey,
            name: product.name,
            price: Number(product.effective_price ?? product.sale_price ?? product.price ?? 0),
            image: getPrimaryImage(product),
            categoryName: product.category_name,
            categorySlug: product.category_slug,
            quantity: safeQuantity,
          };
          nextItems.push(newItem);
          addedItem = newItem;
        }

        writeCart(nextItems);
        setItems(nextItems);
        setLastAddedItem(addedItem);
        setAddedModalOpen(true);
      },
      getItemQuantity(cartKey) {
        return items.find((item) => item.cartKey === cartKey)?.quantity ?? 0;
      },
      removeItem(cartKey) {
        const nextItems = readCart().filter((item) => item.cartKey !== cartKey);
        writeCart(nextItems);
        setItems(nextItems);
      },
      updateQuantity(cartKey, quantity) {
        const nextItems = readCart().map((item) =>
          item.cartKey === cartKey ? { ...item, quantity: Math.max(1, quantity) } : item
        );
        writeCart(nextItems);
        setItems(nextItems);
      },
      clearCart() {
        writeCart([]);
        setItems([]);
      },
    };
  }, [items, isAddedModalOpen, lastAddedItem]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}

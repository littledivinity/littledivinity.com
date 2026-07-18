"use client";

import { Product } from "../lib/types";
import { isProductSellable } from "../lib/api";
import { buildCartKey, useCart } from "./cart-provider";
import { CartQuantityControl } from "./cart-quantity-control";

type AddToCartButtonProps = {
  product: Product;
  className?: string;
  label?: string;
};

export function AddToCartButton({ product, className = "product-card-action", label = "Add To Cart" }: AddToCartButtonProps) {
  const { addItem, getItemQuantity } = useCart();
  const isSellable = isProductSellable(product);
  const cartKey = buildCartKey(product.slug, null);
  const quantity = getItemQuantity(cartKey);

  if (!isSellable) {
    return (
      <button type="button" className={`${className} product-card-action-disabled`} disabled aria-disabled="true">
        Coming Soon
      </button>
    );
  }

  if (quantity > 0) {
    return <CartQuantityControl cartKey={cartKey} className="product-card-quantity-wrap" compact />;
  }

  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        addItem(product, 1);
      }}
    >
      {label}
    </button>
  );
}

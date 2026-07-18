"use client";

import { useCart } from "./cart-provider";

type CartQuantityControlProps = {
  cartKey: string;
  className?: string;
  compact?: boolean;
};

export function CartQuantityControl({
  cartKey,
  className = "",
  compact = false,
}: CartQuantityControlProps) {
  const { getItemQuantity, removeItem, updateQuantity } = useCart();
  const quantity = getItemQuantity(cartKey);

  if (quantity < 1) {
    return null;
  }

  return (
    <div className={`cart-quantity-control ${compact ? "compact" : ""} ${className}`.trim()}>
      <button
        type="button"
        className="cart-quantity-button"
        aria-label="Decrease quantity"
        onClick={() => {
          if (quantity <= 1) {
            removeItem(cartKey);
            return;
          }

          updateQuantity(cartKey, quantity - 1);
        }}
      >
        −
      </button>
      <span className="cart-quantity-value">{quantity}</span>
      <button
        type="button"
        className="cart-quantity-button"
        aria-label="Increase quantity"
        onClick={() => updateQuantity(cartKey, quantity + 1)}
      >
        +
      </button>
      {compact ? null : (
        <button type="button" className="cart-remove-chip" onClick={() => removeItem(cartKey)}>
          Remove
        </button>
      )}
    </div>
  );
}

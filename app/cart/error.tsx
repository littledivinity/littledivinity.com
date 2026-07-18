"use client";

import { useEffect } from "react";

export default function CartError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Cart page error:", error);
  }, [error]);

  return (
    <div style={{ padding: "3rem", textAlign: "center", fontFamily: "sans-serif" }}>
      <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
        Something went wrong with your cart.
      </h2>
      <p style={{ color: "#666", marginBottom: "2rem" }}>
        Your selected items are still saved. Please try again or contact support if this persists.
      </p>
      <button
        onClick={reset}
        style={{
          padding: "0.75rem 2rem",
          background: "#1a1a1a",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "1rem",
        }}
      >
        Try Again
      </button>
    </div>
  );
}

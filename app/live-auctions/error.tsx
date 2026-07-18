"use client";

import { useEffect } from "react";

export default function LiveAuctionsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Live auctions page error:", error);
  }, [error]);

  return (
    <div style={{ padding: "3rem", textAlign: "center", fontFamily: "sans-serif" }}>
      <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
        Something went wrong while loading live auctions.
      </h2>
      <p style={{ color: "#666", marginBottom: "2rem" }}>
        Please try again in a moment or contact support if the issue keeps happening.
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

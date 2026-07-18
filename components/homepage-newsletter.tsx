"use client";

import { FormEvent, useState } from "react";
import { subscribeNewsletter } from "../lib/api";

type HomepageNewsletterProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
  buttonText?: string;
  placeholder?: string;
  footnote?: string;
};

export function HomepageNewsletter({
  eyebrow = "The Divinity Circle",
  title = "Unlock 10% Off Your First Order",
  description = "Subscribe to get early access to festive edits, curated gifting guides, care instructions, and exclusive subscriber-only collections.",
  buttonText = "Claim Discount",
  placeholder = "Enter your email address",
  footnote = "Join 45,000+ happy homes. Free shipping above ₹999 nationwide.",
}: HomepageNewsletterProps) {
  const [value, setValue] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmed = value.trim();
    const valid = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(trimmed);

    if (!valid) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setStatus("idle");
    setMessage("");

    try {
      // Direct integration with existing backend subscription API
      const result = await subscribeNewsletter(trimmed);
      setLoading(false);
      
      if (result.success) {
        setStatus("success");
        setMessage(result.message || "Welcome! Check your inbox for your 10% discount code.");
        setValue("");
      } else {
        setStatus("error");
        setMessage(result.message || "Could not complete subscription. Please try again.");
      }
    } catch (err) {
      setLoading(false);
      setStatus("error");
      setMessage("A connection error occurred. Please try again.");
    }
  };

  return (
    <section className="content-section soft-section homepage-newsletter-section" style={{ background: "var(--bg)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", padding: "5rem 0" }}>
      <div className="container" style={{ maxWidth: "680px", margin: "0 auto", textAlign: "center" }}>
        <p className="eyebrow" style={{ color: "var(--accent)", letterSpacing: "2px", fontWeight: 600, fontSize: "0.95rem" }}>{eyebrow}</p>
        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(2rem, 4vw, 2.8rem)", color: "var(--accent-deep)", fontWeight: 600, marginTop: "0.5rem", marginBottom: "1rem" }}>
          {title}
        </h2>
        <p style={{ color: "var(--muted)", fontSize: "1.08rem", lineHeight: 1.7, marginBottom: "2.5rem" }}>
          {description}
        </p>

        {status === "success" ? (
          <div style={{
            padding: "1.5rem",
            border: "1px solid #226643",
            borderRadius: "20px",
            background: "rgba(34, 102, 67, 0.05)",
            color: "#226643",
            fontWeight: 500,
            fontSize: "1.05rem",
            animation: "fadeIn 0.3s ease"
          }}>
            ✓ {message}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="homepage-newsletter-form" style={{ display: "flex", gap: "0.5rem", maxWidth: "520px", margin: "0 auto", flexWrap: "wrap" }}>
            <input
              type="email"
              placeholder={placeholder}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              disabled={loading}
              required
              aria-label="Email address"
              style={{
                flex: 1,
                minWidth: "260px",
                padding: "0.9rem 1.4rem",
                borderRadius: "12px",
                border: "1px solid var(--line-strong)",
                background: "var(--white)",
                color: "var(--text)",
                fontFamily: "inherit",
                fontSize: "1rem",
                outline: "none",
                transition: "all 0.2s"
              }}
            />
            <button
              type="submit"
              disabled={loading}
              className="primary-button"
              style={{
                padding: "0.9rem 2rem",
                borderRadius: "12px",
                justifyContent: "center",
                whiteSpace: "nowrap"
              }}
            >
              {loading ? "Joining..." : buttonText}
            </button>
          </form>
        )}

        {message && status === "error" && (
          <p style={{ marginTop: "1rem", color: "#e05a47", fontSize: "0.95rem", fontWeight: 500 }}>
            ⚠️ {message}
          </p>
        )}

        <p style={{ marginTop: "1.5rem", fontSize: "0.82rem", color: "var(--muted)" }}>
          {footnote}
        </p>
      </div>
    </section>
  );
}

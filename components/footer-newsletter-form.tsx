"use client";

import { FormEvent, useState } from "react";
import { subscribeNewsletter } from "../lib/api";

export function FooterNewsletterForm({ email: fallbackEmail }: { email: string }) {
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
      const result = await subscribeNewsletter(trimmed);
      setLoading(false);
      
      if (result.success) {
        setStatus("success");
        setMessage(result.message || "Thank you for subscribing!");
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
    <>
      <form className="footer-newsletter-form" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your e-mail"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          aria-label="Email address"
          disabled={loading}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "..." : "Join"}
        </button>
      </form>
      {message ? (
        <p style={{
          marginTop: "0.7rem",
          fontSize: "0.9rem",
          fontWeight: 600,
          color: status === "success" ? "#c5a059" : (status === "error" ? "#e05a47" : "rgba(var(--rgb-text), 0.68)")
        }}>
          {message}
        </p>
      ) : null}
    </>
  );
}

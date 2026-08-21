"use client";

import { getStoredCustomerToken } from "./customer-auth";
import { ProductReviewFeed } from "./types";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.API_BASE_URL ||
  "https://ecombeckend.saaszo.in/api/v1"
).trim().replace(/\/+$/, "");

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

async function readPayload<T>(response: Response): Promise<ApiResponse<T>> {
  return (await response.json().catch(() => ({}))) as ApiResponse<T>;
}

export async function fetchProductReviews(productSlug: string): Promise<ProductReviewFeed> {
  const token = getStoredCustomerToken();
  const response = await fetch(`${API_BASE_URL}/catalog/products/${productSlug}/reviews`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });

  const payload = await readPayload<ProductReviewFeed>(response);

  if (!response.ok || !payload.data) {
    throw new Error(payload.message || "Unable to load reviews.");
  }

  return payload.data;
}

export async function submitProductReview(productSlug: string, input: {
  rating: number;
  comment: string;
  images: File[];
}): Promise<{ review?: ProductReviewFeed["viewer_review"] }> {
  const token = getStoredCustomerToken();

  if (!token) {
    throw new Error("Please sign in to submit a review.");
  }

  const formData = new FormData();
  formData.append("rating", String(input.rating));
  formData.append("comment", input.comment);
  input.images.forEach((file) => formData.append("images[]", file));

  const response = await fetch(`${API_BASE_URL}/catalog/products/${productSlug}/reviews`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const payload = await readPayload<{ review?: ProductReviewFeed["viewer_review"] }>(response);

  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || "Unable to submit your review.");
  }

  return payload.data || {};
}

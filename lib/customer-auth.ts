"use client";

import { CustomerAddress, CustomerAuthConfig, CustomerUser } from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.API_BASE_URL ||
  "https://ecombeckend.saaszo.in/api/v1";

const CUSTOMER_TOKEN_KEY = "little-divinity-customer-token";

type AuthResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

type CustomerAuthPayload = {
  token: string;
  token_type: string;
  expires_at?: string | null;
  user: CustomerUser;
};

async function request<T>(path: string, init?: RequestInit, token?: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {})
    }
  });

  const payload = (await response.json().catch(() => ({}))) as AuthResponse<T>;

  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || "Something went wrong.");
  }

  return payload.data as T;
}

export function getStoredCustomerToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    window.sessionStorage.getItem(CUSTOMER_TOKEN_KEY) ||
    window.localStorage.getItem(CUSTOMER_TOKEN_KEY)
  );
}

export function storeCustomerToken(token: string, persistent = false): void {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(CUSTOMER_TOKEN_KEY, token);
  if (persistent) {
    window.localStorage.setItem(CUSTOMER_TOKEN_KEY, token);
  }
}

export function clearCustomerToken(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(CUSTOMER_TOKEN_KEY);
  window.localStorage.removeItem(CUSTOMER_TOKEN_KEY);
}

export async function fetchCustomerAuthConfig(): Promise<CustomerAuthConfig> {
  return request<CustomerAuthConfig>("/customer/auth/config", {
    method: "GET",
    cache: "no-store"
  });
}

export async function registerCustomer(input: {
  name: string;
  email: string;
  phone?: string;
  password: string;
  password_confirmation: string;
}): Promise<{ user: CustomerUser; requires_verification: boolean }> {
  return request("/customer/auth/register", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export async function loginCustomer(input: {
  email: string;
  password: string;
}): Promise<CustomerAuthPayload> {
  return request<CustomerAuthPayload>("/customer/auth/login", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export async function verifyCustomerEmailOtp(input: {
  email: string;
  code: string;
}): Promise<CustomerAuthPayload> {
  return request<CustomerAuthPayload>("/customer/auth/verify-email-otp", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export async function resendCustomerVerificationOtp(email: string): Promise<void> {
  await request("/customer/auth/resend-verification-otp", {
    method: "POST",
    body: JSON.stringify({ email })
  });
}

export async function sendCustomerForgotPasswordOtp(email: string): Promise<void> {
  await request("/customer/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email })
  });
}

export async function resetCustomerPassword(input: {
  email: string;
  code: string;
  password: string;
  password_confirmation: string;
}): Promise<void> {
  await request("/customer/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export async function fetchCurrentCustomer(token: string): Promise<CustomerUser> {
  const data = await request<{ user: CustomerUser }>("/customer/auth/me", {
    method: "GET",
    cache: "no-store"
  }, token);

  return data.user;
}

export async function logoutCustomer(token: string): Promise<void> {
  await request("/customer/auth/logout", {
    method: "POST",
    body: JSON.stringify({})
  }, token);
}

export async function fetchCustomerAddresses(token: string): Promise<CustomerAddress[]> {
  const data = await request<{ addresses: CustomerAddress[] }>("/customer/addresses", {
    method: "GET",
    cache: "no-store"
  }, token);

  return data.addresses || [];
}

export async function createCustomerAddress(
  token: string,
  input: Omit<CustomerAddress, "id" | "created_at" | "updated_at">
): Promise<CustomerAddress[]> {
  const data = await request<{ addresses: CustomerAddress[] }>("/customer/addresses", {
    method: "POST",
    body: JSON.stringify(input)
  }, token);

  return data.addresses || [];
}

export async function updateCustomerAddress(
  token: string,
  addressId: number,
  input: Omit<CustomerAddress, "id" | "created_at" | "updated_at">
): Promise<CustomerAddress[]> {
  const data = await request<{ addresses: CustomerAddress[] }>(`/customer/addresses/${addressId}`, {
    method: "PUT",
    body: JSON.stringify(input)
  }, token);

  return data.addresses || [];
}

export async function deleteCustomerAddress(token: string, addressId: number): Promise<CustomerAddress[]> {
  const data = await request<{ addresses: CustomerAddress[] }>(`/customer/addresses/${addressId}`, {
    method: "DELETE"
  }, token);

  return data.addresses || [];
}

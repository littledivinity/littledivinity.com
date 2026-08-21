import { resolveAssetUrl } from "./api";

function normalizeApiBaseUrl(rawUrl?: string | null): string {
  const fallback = "https://ecombeckend.saaszo.in/api/v1";
  if (!rawUrl || !rawUrl.trim()) return fallback;
  let url = rawUrl.trim().replace(/\/+$/, "");
  if (!url.endsWith("/api/v1")) {
    url = url.endsWith("/api") ? `${url}/v1` : `${url}/api/v1`;
  }
  return url;
}

const API_BASE_URL = normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL);

/**
 * Registry Product Search
 */
export async function searchRegistryProducts(query = ""): Promise<Array<{ id: number; name: string }>> {
  try {
    const response = await fetch(`${API_BASE_URL}/registry/products?q=${encodeURIComponent(query)}`, {
      cache: "no-store"
    });
    if (!response.ok) return [];
    const result = await response.json();
    return result.success ? result.products : [];
  } catch {
    return [];
  }
}

/**
 * Submit Guarantee Registration (Multipart form upload)
 */
export async function submitGuaranteeRegistration(formData: FormData): Promise<{
  success: boolean;
  message: string;
  data?: {
    registration_code: string;
    verification_status: string;
    warranty_start_date: string;
    warranty_end_date: string;
  };
  errors?: Record<string, string[]>;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/registry/register`, {
      method: "POST",
      body: formData,
      cache: "no-store"
    });
    const result = await response.json();
    return result;
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Guarantee registration submission failed. Please try again."
    };
  }
}

/**
 * Check Guarantee Warranty Status
 */
export async function checkGuaranteeStatus(params: {
  code?: string;
  order_number?: string;
  email?: string;
  phone?: string;
}): Promise<{
  success: boolean;
  message: string;
  registrations?: Array<{
    registration_code: string;
    product_name: string;
    purchase_source: string;
    purchase_date: string;
    verification_status: string;
    warranty_start: string | null;
    warranty_end: string | null;
    is_active: boolean;
    buyback_eligible: boolean;
    claims: Array<{
      claim_code: string;
      issue_type: string;
      status: string;
      created_at: string;
    }>;
    buybacks: Array<{
      request_code: string;
      status: string;
      estimated_value: string | null;
      final_value: string | null;
      created_at: string;
    }>;
  }>;
}> {
  try {
    const query = new URLSearchParams();
    if (params.code) query.set("code", params.code);
    if (params.order_number) query.set("order_number", params.order_number);
    if (params.email) query.set("email", params.email);
    if (params.phone) query.set("phone", params.phone);

    const response = await fetch(`${API_BASE_URL}/registry/status?${query.toString()}`, {
      cache: "no-store"
    });
    const result = await response.json();
    return result;
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Failed to lookup warranty status. Please check your network connection."
    };
  }
}

/**
 * Submit a Warranty Service Claim (Multipart images upload)
 */
export async function submitWarrantyClaim(formData: FormData): Promise<{
  success: boolean;
  message: string;
  claim_code?: string;
  errors?: Record<string, string[]>;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/registry/warranty-claim`, {
      method: "POST",
      body: formData,
      cache: "no-store"
    });
    const result = await response.json();
    return result;
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Warranty claim submission failed. Please try again."
    };
  }
}

/**
 * Submit a Buyback Evaluation Request (Multipart images upload)
 */
export async function submitBuybackRequest(formData: FormData): Promise<{
  success: boolean;
  message: string;
  request_code?: string;
  errors?: Record<string, string[]>;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/registry/buyback-request`, {
      method: "POST",
      body: formData,
      cache: "no-store"
    });
    const result = await response.json();
    return result;
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Buyback evaluation request failed. Please try again."
    };
  }
}

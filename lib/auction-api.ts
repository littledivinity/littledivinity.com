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

export interface Auction {
  id: number;
  title: string;
  status: "live" | "draft" | "ended" | "cancelled";
  image_url: string | null;
  start_price: number;
  current_bid: number;
  minimum_next_bid: number;
  min_bid_increment: number;
  start_at: string;
  end_at: string;
  seconds_left: number;
  total_bids: number;
  total_participants: number;
  product: { id: number; name: string; slug: string; images?: any; description?: string } | null;
  description?: string;
  winner?: { name?: string | null; bid?: number | null } | null;
}

export interface AuctionBid {
  masked_name: string;
  amount: number;
  is_winning: boolean;
  placed_at: string;
}

function normalizeAuction(raw: any): Auction {
  return {
    id: Number(raw?.id || 0),
    title: String(raw?.title || ""),
    status: raw?.status || "draft",
    image_url: raw?.image_url || null,
    start_price: Number(raw?.start_price || 0),
    current_bid: Number(raw?.current_bid || 0),
    minimum_next_bid: Number(raw?.minimum_next_bid || 0),
    min_bid_increment: Number(raw?.min_bid_increment || 0),
    start_at: String(raw?.start_at || ""),
    end_at: String(raw?.end_at || ""),
    seconds_left: Number(raw?.seconds_left || 0),
    total_bids: Number(raw?.total_bids || 0),
    total_participants: Number(raw?.total_participants || 0),
    product: raw?.product || null,
    description: raw?.description || undefined,
    winner: raw?.winner || raw?.winning_bid
      ? {
          name: raw?.winner?.name || null,
          bid: raw?.winner?.bid != null ? Number(raw.winner.bid) : raw?.winning_bid != null ? Number(raw.winning_bid) : null,
        }
      : null,
  };
}

export async function fetchAuctions(filter = "all"): Promise<Auction[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/auctions?filter=${filter}`, { cache: "no-store" });
    const data = await res.json();
    const auctions = Array.isArray(data?.data) ? data.data : [];
    return data.success ? auctions.map(normalizeAuction) : [];
  } catch { return []; }
}

export async function fetchAuction(id: number): Promise<Auction | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/auctions/${id}`, { cache: "no-store" });
    const data = await res.json();
    return data.success && data?.data ? normalizeAuction(data.data) : null;
  } catch { return null; }
}

export async function fetchAuctionBids(id: number): Promise<{ bids: AuctionBid[]; total_bids: number; total_participants: number }> {
  try {
    const res = await fetch(`${API_BASE_URL}/auctions/${id}/bids`, { cache: "no-store" });
    const data = await res.json();
    const bids = Array.isArray(data?.data)
      ? data.data.map((bid: any) => ({
          masked_name: String(bid?.bidder || "Anonymous"),
          amount: Number(bid?.amount || 0),
          is_winning: Boolean(bid?.is_winning),
          placed_at: String(bid?.placed_at || ""),
        }))
      : [];

    return data.success
      ? {
          bids,
          total_bids: Number(data?.meta?.total_bids || bids.length),
          total_participants: Number(data?.meta?.total_participants || new Set(bids.map((bid: AuctionBid) => bid.masked_name)).size),
        }
      : { bids: [], total_bids: 0, total_participants: 0 };
  } catch { return { bids: [], total_bids: 0, total_participants: 0 }; }
}

export async function placeBid(auctionId: number, amount: number, token: string): Promise<{
  success: boolean;
  message: string;
  current_bid?: number;
  minimum_next_bid?: number;
  total_bids?: number;
  total_participants?: number;
  seconds_left?: number;
  minimum_bid?: number;
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/auctions/${auctionId}/bid`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ amount }),
      cache: "no-store",
    });
    return await res.json();
  } catch (e: any) {
    return { success: false, message: e?.message || "Bid failed. Check your connection." };
  }
}

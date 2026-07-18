"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { fetchAuctions, type Auction } from "../../lib/auction-api";
import { getStoredCustomerToken } from "../../lib/customer-auth";

type Filter = "all" | "live" | "upcoming" | "ended";

function formatCountdown(endAt: string, status: string): string {
  if (status === "ended") return "AUCTION ENDED";
  if (status !== "live") return "UPCOMING";
  const diff = new Date(endAt).getTime() - Date.now();
  if (diff <= 0) return "ENDING...";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  if (h >= 24) {
    const d = Math.floor(h / 24);
    return `${d}d ${h % 24}h left`;
  }
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function AuctionCard({ auction }: { auction: Auction }) {
  const [, setTick] = useState(0);
  useEffect(() => {
    if (auction.status !== "live") return;
    const t = setInterval(() => setTick(x => x + 1), 1000);
    return () => clearInterval(t);
  }, [auction.status]);

  const countdown = formatCountdown(auction.end_at, auction.status);
  const imgSrc = auction.image_url || (Array.isArray(auction.product?.images) ? auction.product!.images[0] : null);

  return (
    <Link href={`/live-auctions/${auction.id}`} className="la-card">
      <div className="la-card-img">
        {imgSrc ? (
          <img src={imgSrc} alt={auction.title} />
        ) : (
          <div className="la-card-placeholder"><span>🏺</span></div>
        )}
        <div className={`la-status-badge la-status-${auction.status}`}>
          {auction.status === "live" && <span className="la-live-dot" />}
          {auction.status === "live" ? "LIVE" : auction.status === "draft" ? "UPCOMING" : "ENDED"}
        </div>
      </div>
      <div className="la-card-body">
        <p className="la-card-title">{auction.title}</p>
        {auction.product && <p className="la-card-sub">{auction.product.name}</p>}
        <div className="la-card-bid">
          <div>
            <span className="la-bid-label">CURRENT BID</span>
            <strong className="la-bid-amount">₹{auction.current_bid.toLocaleString("en-IN")}</strong>
          </div>
          <div className="la-countdown">
            {auction.status === "live" && <span className="la-countdown-label">TIME LEFT</span>}
            <span className={`la-countdown-val${auction.status === "live" ? " la-countdown-live" : ""}`}>
              {countdown}
            </span>
          </div>
        </div>
        <div className="la-card-meta">
          <span><strong>{auction.total_bids}</strong> bids</span>
          <span><strong>{auction.total_participants}</strong> bidders</span>
        </div>
        <div className={`la-card-btn${auction.status === "ended" ? " la-card-btn--muted" : ""}`}>
          {auction.status === "ended" ? "View Results" : auction.status === "live" ? "Place a Bid →" : "View Auction →"}
        </div>
      </div>
    </Link>
  );
}

export default function LiveAuctionsPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasToken, setHasToken] = useState(false);

  const load = useCallback(async () => {
    const data = await fetchAuctions(filter);
    setAuctions(data);
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHasToken(!!getStoredCustomerToken());
    }
    setLoading(true);
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, [load]);

  const liveCount = auctions.filter(a => a.status === "live").length;

  return (
    <div className="la-page">
        <div className="la-hero">
          <div className="la-hero-inner">
            <p className="la-hero-eyebrow">🔨 AUTHENTICATED ONE-OF-ONE BRASS AUCTIONS</p>
            <h1 className="la-hero-heading">Live Auctions</h1>
            <p className="la-hero-sub">Rare handcrafted brass artifacts auctioned to the highest bidder. Each piece verified and authenticated by Little Divinity ateliers.</p>
            {liveCount > 0 && (
              <div className="la-live-ticker">
                <span className="la-live-dot" />
                {liveCount} auction{liveCount > 1 ? "s" : ""} live right now
              </div>
            )}
          </div>
        </div>

        {!hasToken && (
          <div className="la-auth-banner">
            <span>🔒 <strong>Login required</strong> to place bids and participate in auctions.</span>
            <Link href="/account/login?redirect=/live-auctions" className="la-auth-btn">Login / Register</Link>
          </div>
        )}

        <div className="la-container">
          <div className="la-filters">
            {(["all", "live", "upcoming", "ended"] as Filter[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`la-filter-btn${filter === f ? " la-filter-btn--active" : ""}`}
              >
                {f === "all" ? "All Auctions" : f === "live" ? "🔴 Live Now" : f === "upcoming" ? "🕐 Upcoming" : "✓ Ended"}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="la-loading">
              <div className="la-spinner" />
              <span>Loading auctions…</span>
            </div>
          ) : auctions.length === 0 ? (
            <div className="la-empty">
              <div className="la-empty-icon">🔨</div>
              <h3>No auctions {filter !== "all" ? `in "${filter}"` : "yet"}</h3>
              <p>Check back soon. New one-of-one pieces drop regularly.</p>
            </div>
          ) : (
            <div className="la-grid">
              {auctions.map(a => <AuctionCard key={a.id} auction={a} />)}
            </div>
          )}
        </div>
      </div>
  );
}

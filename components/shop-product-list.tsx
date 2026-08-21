"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { getProducts } from "../lib/api";
import type { Product, ProductListResponse } from "../lib/types";
import { ProductCard } from "./product-card";

type ShopProductListProps = {
  initialProducts: Product[];
  initialPagination: ProductListResponse["pagination"];
  baseQuery: string;
  currencySymbol: string;
};

function getShopProductKey(product: Product): string {
  return product.id ? String(product.id) : product.slug;
}

export function ShopProductList({ initialProducts, initialPagination, baseQuery, currencySymbol }: ShopProductListProps) {
  const [items, setItems] = useState(initialProducts);
  const [pagination, setPagination] = useState(initialPagination);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef(false);

  const fetchClientProducts = useCallback(async (query: string, page = 1) => {
    const q = new URLSearchParams(query);
    if (page > 1) {
      q.set("page", String(page));
    }
    const queryString = q.toString();
    const url = `https://ecombeckend.saaszo.in/api/v1/catalog/products${queryString ? `?${queryString}` : ""}`;

    const res = await fetch(url, {
      headers: {
        Accept: "application/json"
      }
    });

    if (!res.ok) {
      throw new Error(`Failed to load products (${res.status})`);
    }

    const payload = await res.json();
    const productItems: Product[] = Array.isArray(payload?.data?.items)
      ? payload.data.items
      : Array.isArray(payload?.data)
      ? payload.data
      : [];

    const paginationData = payload?.data?.pagination || {
      current_page: page,
      per_page: productItems.length,
      total: productItems.length,
      last_page: 1
    };

    return { items: productItems, pagination: paginationData };
  }, []);

  useEffect(() => {
    let active = true;

    if (initialProducts && initialProducts.length > 0) {
      setItems(initialProducts);
      setPagination(initialPagination);
      setError(null);
      loadingRef.current = false;
      return;
    }

    setIsLoading(true);
    setError(null);

    fetchClientProducts(baseQuery, 1)
      .then((res) => {
        if (active && res.items) {
          setItems(res.items);
          setPagination(res.pagination);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : "Could not load products.");
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [baseQuery, initialProducts, initialPagination, fetchClientProducts]);

  const hasMore = pagination.current_page < pagination.last_page;

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) {
      return;
    }

    const nextPage = pagination.current_page + 1;
    loadingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchClientProducts(baseQuery, nextPage);

      setItems((currentItems) => {
        const seen = new Set(currentItems.map((product) => getShopProductKey(product)));
        const nextItems = response.items.filter((product) => {
          const key = getShopProductKey(product);
          if (seen.has(key)) {
            return false;
          }
          seen.add(key);
          return true;
        });

        return [...currentItems, ...nextItems];
      });
      setPagination(response.pagination);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load more products.");
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
    }
  }, [baseQuery, fetchClientProducts, hasMore, pagination.current_page]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting) {
          void loadMore();
        }
      },
      { rootMargin: "320px 0px" }
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [loadMore]);

  if (isLoading && !items.length) {
    return (
      <div className="product-grid shop-product-grid" aria-busy="true">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="product-card" style={{ minHeight: "360px", opacity: 0.6, background: "rgba(255, 255, 255, 0.7)", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ color: "var(--muted)" }}>Loading handcrafted brass pieces...</p>
          </div>
        ))}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="shop-empty-state">
        <h3>No products found</h3>
        <p>Try changing the category, price range, or sorting option.</p>
      </div>
    );
  }

  return (
    <>
      <div className="product-grid shop-product-grid">
        {items.map((product) => (
          <ProductCard key={getShopProductKey(product)} product={product} currencySymbol={currencySymbol} />
        ))}
      </div>

      <div ref={sentinelRef} className="shop-load-sentinel" aria-hidden="true" />

      <div className="shop-load-more-row" aria-live="polite">
        <span className="shop-load-status">
          Showing {items.length} of {pagination.total} products
        </span>

        {error ? <span className="shop-load-error">{error}</span> : null}

        {hasMore ? (
          <button type="button" className="secondary-button shop-load-more-button" onClick={loadMore} disabled={isLoading}>
            {isLoading ? "Loading products..." : "Load more products"}
          </button>
        ) : (
          <span className="shop-load-complete">All products loaded</span>
        )}
      </div>
    </>
  );
}

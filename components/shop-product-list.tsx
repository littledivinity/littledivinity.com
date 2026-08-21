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

  useEffect(() => {
    if (initialProducts && initialProducts.length > 0) {
      setItems(initialProducts);
      setPagination(initialPagination);
      setError(null);
      loadingRef.current = false;
    } else {
      let active = true;
      setIsLoading(true);
      getProducts(baseQuery)
        .then((res) => {
          if (active && res?.items && res.items.length > 0) {
            setItems(res.items);
            setPagination(res.pagination);
            setError(null);
          }
        })
        .catch((err) => {
          if (active) setError("Could not load products. Please retry.");
        })
        .finally(() => {
          if (active) setIsLoading(false);
        });
      return () => {
        active = false;
      };
    }
  }, [baseQuery, initialProducts, initialPagination]);

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
      const query = new URLSearchParams(baseQuery);
      query.set("page", String(nextPage));
      const response = await getProducts(query.toString());

      if (response.pagination.current_page < nextPage || response.pagination.total < items.length) {
        throw new Error("Could not load more products. Please retry.");
      }

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
  }, [baseQuery, hasMore, items.length, pagination.current_page]);

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

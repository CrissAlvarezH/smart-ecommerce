"use client";

import { useState, useEffect, useCallback } from "react";

// Store-specific cart state management
const storeCartCounts = new Map<string, number>();
const storeSubscribers = new Map<string, Set<(count: number) => void>>();

const notifyStoreSubscribers = (storeSlug: string, count: number) => {
  storeCartCounts.set(storeSlug, count);
  const subscribers = storeSubscribers.get(storeSlug);
  if (subscribers) {
    subscribers.forEach(callback => callback(count));
  }
};

const fetchStoreCartCount = async (storeSlug: string): Promise<number> => {
  try {
    const response = await fetch(`/api/stores/${storeSlug}/cart/count`, {
      method: 'GET',
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      return data.count || 0;
    }
    return 0;
  } catch (error) {
    console.error('Error fetching store cart count:', error);
    return 0;
  }
};

export function useStoreCart(storeSlug: string) {
  const [cartCount, setCartCount] = useState(storeCartCounts.get(storeSlug) || 0);
  const [isLoading, setIsLoading] = useState(true);

  const refreshCartCount = useCallback(async () => {
    try {
      const count = await fetchStoreCartCount(storeSlug);
      notifyStoreSubscribers(storeSlug, count);
    } catch (error) {
      console.error('Error refreshing store cart count:', error);
    }
  }, [storeSlug]);

  const updateCartCount = useCallback((newCount: number) => {
    notifyStoreSubscribers(storeSlug, newCount);
  }, [storeSlug]);

  const incrementCartCount = useCallback((increment: number = 1) => {
    const currentCount = storeCartCounts.get(storeSlug) || 0;
    notifyStoreSubscribers(storeSlug, currentCount + increment);
  }, [storeSlug]);

  const decrementCartCount = useCallback((decrement: number = 1) => {
    const currentCount = storeCartCounts.get(storeSlug) || 0;
    notifyStoreSubscribers(storeSlug, Math.max(0, currentCount - decrement));
  }, [storeSlug]);

  useEffect(() => {
    // Initialize subscribers map for this store if needed
    if (!storeSubscribers.has(storeSlug)) {
      storeSubscribers.set(storeSlug, new Set());
    }

    // Subscribe to store-specific cart state changes
    const updateCartState = (count: number) => {
      setCartCount(count);
      setIsLoading(false);
    };

    const subscribers = storeSubscribers.get(storeSlug)!;
    subscribers.add(updateCartState);

    // Initial fetch if we don't have a count yet for this store
    if (!storeCartCounts.has(storeSlug)) {
      refreshCartCount();
    } else {
      setIsLoading(false);
    }

    return () => {
      subscribers.delete(updateCartState);
    };
  }, [storeSlug, refreshCartCount]);

  return {
    cartCount,
    isLoading,
    refreshCartCount,
    updateCartCount,
    incrementCartCount,
    decrementCartCount,
  };
}
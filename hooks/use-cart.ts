"use client";

import { useState, useEffect, useCallback } from "react";

// Global cart state management
let globalCartCount = 0;
const subscribers = new Set<(count: number) => void>();

const notifySubscribers = (count: number) => {
  globalCartCount = count;
  subscribers.forEach(callback => callback(count));
};

const fetchCartCount = async (): Promise<number> => {
  try {
    const response = await fetch('/api/cart/count', {
      method: 'GET',
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      return data.count || 0;
    }
    return 0;
  } catch (error) {
    console.error('Error fetching cart count:', error);
    return 0;
  }
};

export function useCart() {
  const [cartCount, setCartCount] = useState(globalCartCount);
  const [isLoading, setIsLoading] = useState(true);

  const refreshCartCount = useCallback(async () => {
    try {
      const count = await fetchCartCount();
      notifySubscribers(count);
    } catch (error) {
      console.error('Error refreshing cart count:', error);
    }
  }, []);

  const updateCartCount = useCallback((newCount: number) => {
    notifySubscribers(newCount);
  }, []);

  const incrementCartCount = useCallback((increment: number = 1) => {
    notifySubscribers(globalCartCount + increment);
  }, []);

  const decrementCartCount = useCallback((decrement: number = 1) => {
    notifySubscribers(Math.max(0, globalCartCount - decrement));
  }, []);

  useEffect(() => {
    // Subscribe to global cart state changes
    const updateCartState = (count: number) => {
      setCartCount(count);
      setIsLoading(false);
    };

    subscribers.add(updateCartState);

    // Initial fetch if we don't have a count yet
    if (globalCartCount === 0) {
      refreshCartCount();
    } else {
      setIsLoading(false);
    }

    return () => {
      subscribers.delete(updateCartState);
    };
  }, [refreshCartCount]);

  return {
    cartCount,
    isLoading,
    refreshCartCount,
    updateCartCount,
    incrementCartCount,
    decrementCartCount,
  };
}
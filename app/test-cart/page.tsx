"use client";

import { AddToCartButton } from "@/components/products/add-to-cart-button";

export default function TestCartPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Test Add to Cart</h1>
      <div className="space-y-4">
        <div className="border p-4 rounded">
          <h3 className="font-semibold mb-2">Test Product - Wireless Bluetooth Headphones</h3>
          <p className="text-gray-600 mb-4">Price: $99.99</p>
          <AddToCartButton
            productId="864890b5-c2cb-4095-9493-fffdeaa00c9b"
            productName="Wireless Bluetooth Headphones"
            inStock={true}
            size="lg"
          />
        </div>
        <div className="border p-4 rounded">
          <h3 className="font-semibold mb-2">Test Product - Cotton T-Shirt</h3>
          <p className="text-gray-600 mb-4">Price: $29.99</p>
          <AddToCartButton
            productId="411a0ed2-43ce-4a76-92d7-c9a7c1f65888"
            productName="Cotton T-Shirt"
            inStock={true}
            size="lg"
          />
        </div>
      </div>
    </div>
  );
}
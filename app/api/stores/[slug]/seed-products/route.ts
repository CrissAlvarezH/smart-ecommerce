import { NextRequest, NextResponse } from "next/server";
import { storeService } from "@/services/stores";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // Verify store exists
    const store = await storeService.getStoreBySlug(slug);
    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    // TODO: Implement store-specific product seeding
    // For now, return mock data
    const products = Array.from({ length: 10 }, (_, i) => ({
      id: `product-${i + 1}`,
      name: `Store Product ${i + 1}`,
      storeId: store.id,
    }));
    
    return NextResponse.json({ 
      success: true, 
      products,
      message: `Added ${products.length} products to ${store.name}` 
    });
  } catch (error) {
    console.error('Error seeding store products:', error);
    return NextResponse.json(
      { error: "Failed to seed products" }, 
      { status: 500 }
    );
  }
}
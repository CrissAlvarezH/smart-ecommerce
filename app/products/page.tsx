import { ProductGrid } from "@/components/products/product-grid";
import { productService } from "@/services/products";

export default async function ProductsPage() {
  // Get products from database
  const dbProducts = await productService.getProducts();
  
 // Transform database products to match the expected format
  const products = dbProducts.map(product => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    shortDescription: product.shortDescription || undefined,
    price: product.price,
    compareAtPrice: product.compareAtPrice || undefined,
    categoryName: product.categoryName || undefined,
    image: product.image ? {
      url: product.image.url,
      altText: product.image.altText || product.name,
    } : undefined,
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">All Products</h1>
        <p className="text-gray-600">Discover our amazing collection of products</p>
      </div>

      <ProductGrid products={products} />
    </div>
  );
}
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/products/product-grid";
import { ArrowRight } from "lucide-react";

import { productService } from "@/services/products";

export default async function Home() {
  // Get featured products from database
  const dbFeaturedProducts = await productService.getFeaturedProducts();
  
  // Transform database products to match the expected format
  const featuredProducts = dbFeaturedProducts.map(product => ({
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
    <main className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center py-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg mb-16">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
          Smart Ecommerce
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Discover amazing products at unbeatable prices. Quality you can trust, delivered to your door.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/products">
            <Button size="lg" className="min-w-40">
              Shop Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Button variant="outline" size="lg" className="min-w-40">
            Learn More
          </Button>
        </div>
      </section>

      {/* Featured Products */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Products</h2>
            <p className="text-gray-600">Hand-picked favorites just for you</p>
          </div>
          <Link href="/products">
            <Button variant="outline">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <ProductGrid products={featuredProducts} />
      </section>

      {/* Categories Section */}
      <section className="mt-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { name: "Electronics", image: "/categories/electronics.jpg", count: "120+ products" },
            { name: "Clothing", image: "/categories/clothing.jpg", count: "200+ products" },
            { name: "Books", image: "/categories/books.jpg", count: "500+ products" },
            { name: "Home & Garden", image: "/categories/home-garden.jpg", count: "80+ products" },
          ].map((category) => (
            <Link 
              key={category.name} 
              href={`/categories/${category.name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`}
              className="group"
            >
              <div className="bg-gray-100 aspect-square rounded-lg overflow-hidden mb-3 group-hover:scale-105 transition-transform">
                <div className="h-full w-full bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-700">{category.name[0]}</span>
                </div>
              </div>
              <h3 className="font-semibold text-lg mb-1 group-hover:text-blue-600 transition-colors">
                {category.name}
              </h3>
              <p className="text-sm text-gray-500">{category.count}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

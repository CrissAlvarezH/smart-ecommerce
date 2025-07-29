import { notFound } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AddToCartButton } from "@/components/products/add-to-cart-button";
import { productService } from "@/services/products";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  // Get product from database
  const product = await productService.getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const price = parseFloat(product.price);
  const comparePrice = product.compareAtPrice ? parseFloat(product.compareAtPrice) : null;
  const discount = comparePrice ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;
  const inStock = product.inventory > 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/products" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Products
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden bg-gray-100 rounded-lg">
            <Image
              src={product.images[0]?.url || "/placeholder.jpg"}
              alt={product.images[0]?.altText || product.name}
              width={600}
              height={600}
              className="h-full w-full object-cover"
            />
          </div>
          
          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.slice(1).map((image, index) => (
                <div key={index} className="w-20 h-20 overflow-hidden bg-gray-100 rounded-md">
                  <Image
                    src={image.url}
                    alt={image.altText || `${product.name} ${index + 2}`}
                    width={80}
                    height={80}
                    className="h-full w-full object-cover cursor-pointer hover:opacity-80"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">{product.categoryName}</Badge>
              {!inStock && <Badge variant="destructive">Out of Stock</Badge>}
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl font-bold text-gray-900">
                ${price.toFixed(2)}
              </span>
              {comparePrice && (
                <>
                  <span className="text-lg text-gray-500 line-through">
                    ${comparePrice.toFixed(2)}
                  </span>
                  <Badge variant="destructive">
                    -{discount}% OFF
                  </Badge>
                </>
              )}
            </div>

            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">SKU:</span>
                  <span className="text-sm font-medium">{product.sku}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Availability:</span>
                  <span className={`text-sm font-medium ${inStock ? 'text-green-600' : 'text-red-600'}`}>
                    {inStock ? `${product.inventory} in stock` : 'Out of stock'}
                  </span>
                </div>
                {product.collections.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Collections:</span>
                    <div className="flex gap-1">
                      {product.collections.map((collection) => (
                        <Badge key={collection.id} variant="outline" className="text-xs">
                          {collection.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <AddToCartButton
              productId={product.id}
              productName={product.name}
              inStock={inStock}
              size="lg"
              className="w-full"
            />
            
            <Button variant="outline" size="lg" className="w-full">
              Buy Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
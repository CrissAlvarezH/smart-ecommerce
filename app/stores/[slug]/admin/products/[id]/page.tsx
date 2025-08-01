import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Package, Image as ImageIcon, Layers } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import * as productsRepo from "@/repositories/admin/products";
import * as collectionsRepo from "@/repositories/admin/collections";
import { ProductDeleteButton } from "@/components/admin/product-delete-button";
import { deleteProductAction } from "../actions";
import { BackButton } from "@/components/ui/back-button";
import { formatDateToLocaleString } from "@/lib/dates";
import Image from "next/image";

interface ProductDetailsPageProps {
  params: Promise<{ slug: string; id: string }>;
}

export default async function ProductDetailsPage({ params }: ProductDetailsPageProps) {
  const { slug, id } = await params;
  
  // Fetch product, images, and collections in parallel
  const [product, productImages, productCollections] = await Promise.all([
    productsRepo.getProductById(id),
    productsRepo.getProductImages(id),
    collectionsRepo.getProductCollections(id)
  ]);
  
  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BackButton></BackButton>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Product Details</h2>
            <p className="text-gray-600 mt-2">
              View and manage product information
            </p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Link href={`/stores/${slug}/admin/products/${product.id}/edit`}>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Edit Product
            </Button>
          </Link>
          <ProductDeleteButton 
            product={product} 
            deleteAction={deleteProductAction}
            redirectPath={`/stores/${slug}/admin/products`}
          />
        </div>
      </div>

      {/* Product Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Product Name</label>
              <p className="text-lg font-semibold">{product.name}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Slug</label>
              <p className="text-sm text-gray-700 font-mono bg-gray-50 px-2 py-1 rounded">
                {product.slug}
              </p>
            </div>
            
            {product.shortDescription && (
              <div>
                <label className="text-sm font-medium text-gray-500">Short Description</label>
                <p className="text-sm text-gray-700">{product.shortDescription}</p>
              </div>
            )}
            
            {product.description && (
              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                  {product.description}
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div className="mt-1">
                  <Badge variant={product.isActive ? "default" : "secondary"}>
                    {product.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              
              {product.isFeatured && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Featured</label>
                  <div className="mt-1">
                    <Badge variant="outline">Featured Product</Badge>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Inventory */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing & Inventory</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Price</label>
                <p className="text-2xl font-bold text-green-600">
                  ${parseFloat(product.price).toFixed(2)}
                </p>
              </div>
              
              {product.compareAtPrice && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Compare Price</label>
                  <p className="text-lg text-gray-500 line-through">
                    ${parseFloat(product.compareAtPrice).toFixed(2)}
                  </p>
                </div>
              )}
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Inventory</label>
              <p className="text-xl font-semibold">
                {product.inventory} units
                <span className={`ml-2 text-sm ${
                  product.inventory > 10 ? 'text-green-600' : 
                  product.inventory > 0 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {product.inventory > 10 ? '(In Stock)' : 
                   product.inventory > 0 ? '(Low Stock)' : '(Out of Stock)'}
                </span>
              </p>
            </div>
            
            {product.sku && (
              <div>
                <label className="text-sm font-medium text-gray-500">SKU</label>
                <p className="text-sm font-mono bg-gray-50 px-2 py-1 rounded w-fit">
                  {product.sku}
                </p>
              </div>
            )}
            
            {product.weight && (
              <div>
                <label className="text-sm font-medium text-gray-500">Weight</label>
                <p className="text-sm text-gray-700">{product.weight}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Product Images */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Product Images
            <Badge variant="outline" className="ml-2">
              {productImages.length} {productImages.length === 1 ? 'image' : 'images'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {productImages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ImageIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p>No images uploaded yet.</p>
              <p className="text-sm mt-2">
                Images will help customers visualize the product.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {productImages.map((image, index) => (
                <div key={image.id} className="relative group">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border">
                    <Image
                      src={image.url}
                      alt={image.altText || `Product image ${index + 1}`}
                      width={300}
                      height={300}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  <div className="mt-2 text-center">
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                      <span>Position: {image.position + 1}</span>
                      {index === 0 && (
                        <Badge variant="secondary" className="text-xs">
                          Main
                        </Badge>
                      )}
                    </div>
                    {image.altText && (
                      <p className="text-xs text-gray-600 mt-1 truncate">
                        {image.altText}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Information */}
      {product.categoryName && (
        <Card>
          <CardHeader>
            <CardTitle>Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm">
                {product.categoryName}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Collections Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Collections
            <Badge variant="outline" className="ml-2">
              {productCollections.length} {productCollections.length === 1 ? 'collection' : 'collections'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {productCollections.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Layers className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p>Not in any collections yet.</p>
              <p className="text-sm mt-2">
                Collections help organize and group related products.
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {productCollections.map((collection) => (
                <Link
                  key={collection.id}
                  href={`/stores/${slug}/admin/collections/${collection.id}/products`}
                  className="inline-block"
                >
                  <Badge 
                    variant={collection.isActive ? "default" : "secondary"} 
                    className="text-sm hover:bg-opacity-80 transition-colors cursor-pointer"
                  >
                    {collection.name}
                    {!collection.isActive && " (Inactive)"}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Metadata</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="font-medium text-gray-500">Created</label>
              <p className="text-gray-700">
                {formatDateToLocaleString(new Date(product.createdAt))}
              </p>
            </div>
            <div>
              <label className="font-medium text-gray-500">Last Updated</label>
              <p className="text-gray-700">
                {formatDateToLocaleString(new Date(product.updatedAt))}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
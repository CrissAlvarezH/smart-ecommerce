import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { getStoreBySlugAction, getStoreCartItemsAction } from "../../actions";
import { getCartWithShippingAction } from "../cart/actions";
import { CheckoutClient } from "./checkout-client";
import { validateRequest } from "@/lib/auth";

interface CheckoutPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { slug } = await params;
  
  // Get store info
  const storeResult = await getStoreBySlugAction({ slug });
  if (!storeResult.data) {
    notFound();
  }
  
  const store = storeResult.data.store;
  if (!store) {
    notFound();
  }

  // Get current user if authenticated
  const { user } = await validateRequest();

  // Get cart data
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(`cart_session_${slug}`)?.value;
  
  if (!sessionId) {
    notFound();
  }

  // Get cart items
  const cartResult = await getStoreCartItemsAction({ storeSlug: slug, sessionId });
  if (!cartResult.data || cartResult.data.cartItems.length === 0) {
    notFound();
  }

  // Get shipping info
  const shippingResult = await getCartWithShippingAction({ storeSlug: slug });
  const cart = shippingResult.data?.cart;
  const shippingCost = cart?.shippingCost || "0.00";
  const shippingZoneId = cart?.shippingZoneId;
  
  // Extract complete shipping address information
  const shippingAddress = {
    street: cart?.shippingAddress || "",
    city: cart?.shippingCity || "",
    department: cart?.shippingState || "", // Note: using shippingState as it's the field name in the schema
    postalCode: cart?.shippingPostalCode || "",
    country: cart?.shippingCountry || "Colombia",
    additionalInfo: "", // This might need to be extracted from the shipping address if it's stored as JSON
  };

  console.log("🚢 Checkout shipping debug:", { 
    cart, 
    shippingCost, 
    shippingZoneId, 
    shippingAddress 
  });

  if (!shippingZoneId) {
    // Redirect back to cart if no shipping method selected
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Shipping Method Required</h1>
          <p className="text-gray-600 mb-6">
            Please select a shipping method before proceeding to checkout.
          </p>
          <a href={`/stores/${slug}/client/cart`} className="text-blue-600 hover:underline">
            Return to Cart
          </a>
        </div>
      </div>
    );
  }

  const cartItems = cartResult.data.cartItems;

  // Calculate totals
  const subtotal = cartItems.reduce((total, item) => {
    return total + (parseFloat(item.product.price) * item.quantity);
  }, 0);

  const shipping = parseFloat(shippingCost);
  const total = subtotal + shipping;

  return (
    <CheckoutClient
      store={store}
      cartItems={cartItems}
      subtotal={subtotal}
      shippingCost={shipping}
      total={total}
      shippingAddress={shippingAddress}
      user={user}
    />
  );
}
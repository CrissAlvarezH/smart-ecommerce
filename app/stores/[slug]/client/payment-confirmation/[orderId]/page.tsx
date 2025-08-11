import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { formatPrice } from "@/lib/format-price";
import { ordersService } from "@/services/orders.service";
import Link from "next/link";

interface PaymentConfirmationPageProps {
  params: Promise<{
    slug: string;
    orderId: string;
  }>;
}

export default async function PaymentConfirmationPage({ params }: PaymentConfirmationPageProps) {
  const { slug, orderId } = await params;

  try {
    const orderData = await ordersService.getOrderStatus(orderId);
    const { order, paymentTransaction } = orderData;

    if (!order) {
      notFound();
    }

    // Determine payment status and UI
    let statusIcon;
    let statusColor;
    let statusTitle;
    let statusMessage;

    switch (order.paymentStatus) {
      case "paid":
        statusIcon = <CheckCircle className="h-16 w-16 text-green-500" />;
        statusColor = "text-green-600";
        statusTitle = "Payment Successful!";
        statusMessage = "Your order has been confirmed and we're processing it now.";
        break;
      case "pending":
        statusIcon = <Clock className="h-16 w-16 text-yellow-500" />;
        statusColor = "text-yellow-600";
        statusTitle = "Payment Pending";
        statusMessage = "We're waiting for payment confirmation. This may take a few minutes.";
        break;
      case "failed":
        statusIcon = <XCircle className="h-16 w-16 text-red-500" />;
        statusColor = "text-red-600";
        statusTitle = "Payment Failed";
        statusMessage = "Unfortunately, your payment could not be processed. Please try again.";
        break;
      default:
        statusIcon = <AlertCircle className="h-16 w-16 text-gray-500" />;
        statusColor = "text-gray-600";
        statusTitle = "Payment Status Unknown";
        statusMessage = "We're checking your payment status. Please wait a moment.";
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Payment Status */}
          <Card className="mb-8">
            <CardContent className="pt-8 text-center">
              <div className="mb-6">
                {statusIcon}
              </div>
              
              <h1 className={`text-2xl font-bold mb-2 ${statusColor}`}>
                {statusTitle}
              </h1>
              
              <p className="text-gray-600 mb-6">
                {statusMessage}
              </p>

              {order.paymentStatus === "failed" && (
                <div className="mb-6">
                  <Link href={`/stores/${slug}/client/checkout`}>
                    <Button>Try Again</Button>
                  </Link>
                </div>
              )}

              {order.paymentStatus === "pending" && (
                <div className="mb-6">
                  <Button 
                    onClick={() => window.location.reload()}
                    variant="outline"
                  >
                    Refresh Status
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Details */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Order ID</p>
                  <p className="font-medium">{order.id}</p>
                </div>
                <div>
                  <p className="text-gray-600">Order Date</p>
                  <p className="font-medium">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Payment Method</p>
                  <p className="font-medium capitalize">
                    {order.paymentMethod || 'Not specified'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Total Amount</p>
                  <p className="font-medium text-lg">{formatPrice(parseFloat(order.total))}</p>
                </div>
              </div>

              {paymentTransaction && (
                <div className="pt-4 border-t">
                  <p className="text-gray-600 text-sm mb-2">Transaction Details</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Transaction ID</p>
                      <p className="font-medium font-mono text-xs">{paymentTransaction.wompiTransactionId}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Status</p>
                      <p className="font-medium">{paymentTransaction.wompiStatus}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Name</p>
                  <p className="font-medium">{order.customerName}</p>
                </div>
                <div>
                  <p className="text-gray-600">Email</p>
                  <p className="font-medium">{order.customerEmail}</p>
                </div>
                <div>
                  <p className="text-gray-600">Phone</p>
                  <p className="font-medium">{order.customerPhone}</p>
                </div>
                {order.customerDocument && (
                  <div>
                    <p className="text-gray-600">ID Number</p>
                    <p className="font-medium">{order.customerDocument}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Shipping Information */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-gray-600 text-sm mb-1">Shipping Address</p>
                <div className="font-medium">
                  <p>{order.shippingAddress.street}</p>
                  <p>{order.shippingAddress.city}, {order.shippingAddress.department}</p>
                  <p>{order.shippingAddress.country}</p>
                  {order.shippingAddress.postalCode && (
                    <p>Postal Code: {order.shippingAddress.postalCode}</p>
                  )}
                  {order.shippingAddress.additionalInfo && (
                    <p className="text-gray-600 text-sm">{order.shippingAddress.additionalInfo}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm pt-4 border-t">
                <div>
                  <p className="text-gray-600">Shipping Method</p>
                  <p className="font-medium capitalize">{order.shippingMethod}</p>
                </div>
                <div>
                  <p className="text-gray-600">Shipping Cost</p>
                  <p className="font-medium">{formatPrice(parseFloat(order.shippingCost))}</p>
                </div>
              </div>

              {order.shippingTrackingNumber && (
                <div className="pt-4 border-t">
                  <p className="text-gray-600 text-sm">Tracking Number</p>
                  <p className="font-medium font-mono">{order.shippingTrackingNumber}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Notes */}
          {order.notes && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Order Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{order.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <Link href={`/stores/${slug}/client/products`}>
              <Button variant="outline">
                Continue Shopping
              </Button>
            </Link>
            
            {order.paymentStatus === "paid" && (
              <Button onClick={() => window.print()}>
                Print Receipt
              </Button>
            )}
          </div>

          {/* What's Next */}
          {order.paymentStatus === "paid" && (
            <Card className="mt-8 bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-green-800 mb-2">What's Next?</h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• You will receive an email confirmation shortly</li>
                  <li>• We&apos;ll notify you when your order ships</li>
                  <li>• Track your order status in your account</li>
                  <li>• Contact us if you have any questions</li>
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading order:", error);
    notFound();
  }
}
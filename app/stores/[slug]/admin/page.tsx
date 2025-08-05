import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Tag, Users, DollarSign, TrendingUp, Eye } from "lucide-react";

interface AdminDashboardProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function AdminDashboard({ params }: AdminDashboardProps) {
  const { slug } = await params;
  // TODO: Implement actual metrics when we have store-specific data
  const metrics = [
    {
      title: "Total Products",
      value: "0",
      change: "+0%",
      trend: "up",
      icon: Package,
    },
    {
      title: "Categories",
      value: "0",
      change: "+0%",
      trend: "up",
      icon: Tag,
    },
    {
      title: "Total Orders",
      value: "0",
      change: "+0%",
      trend: "up",
      icon: Users,
    },
    {
      title: "Revenue",
      value: "$0",
      change: "+0%",
      trend: "up",
      icon: DollarSign,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Overview of your store performance and key metrics
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {metric.title}
              </CardTitle>
              <metric.icon className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-gray-600 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {metric.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <a
                href={`/stores/${slug}/admin/products/new`}
                className="flex items-center gap-2 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Package className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Add Product</span>
              </a>
              <a
                href={`/stores/${slug}/admin/categories/new`}
                className="flex items-center gap-2 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Tag className="h-5 w-5 text-green-600" />
                <span className="font-medium">Add Category</span>
              </a>
            </div>
            <a
              href={`/stores/${slug}/client`}
              className="flex items-center gap-2 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Eye className="h-5 w-5 text-purple-600" />
              <span className="font-medium">View Store</span>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                <span className="text-sm text-gray-600">Set up your store information</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                <span className="text-sm text-gray-600">Create product categories</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                <span className="text-sm text-gray-600">Add your first products</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                <span className="text-sm text-gray-600">Configure payment settings</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";
import { dashboardApi } from "@/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/input";
import { Badge, EmptyState, PageHeader, Spinner, Table, Td, Th, orderStatusVariant } from "@/components/ui/common";
import { formatCurrency, formatDate } from "@/utils/cn";

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => dashboardApi.get().then((r) => r.data.data),
  });

  if (isLoading) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (error || !data) return <EmptyState message="Failed to load dashboard" />;

  const stats = [
    { label: "Products", value: data.stats.total_products },
    { label: "Customers", value: data.stats.total_customers },
    { label: "Orders", value: data.stats.total_orders },
    { label: "Revenue", value: formatCurrency(data.stats.total_revenue) },
    { label: "Low Stock", value: data.stats.low_stock_count },
  ];

  return (
    <div>
      <PageHeader title="Dashboard" />
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">{s.value}</p></CardContent>
          </Card>
        ))}
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">Monthly Sales</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.charts.monthly_sales}>
                <XAxis dataKey="month" /><YAxis /><Tooltip />
                <Bar dataKey="revenue" fill="hsl(221.2 83.2% 53.3%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">Inventory Trends</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.charts.inventory_trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" /><YAxis /><Tooltip />
                <Line type="monotone" dataKey="stock_in" stroke="#22c55e" />
                <Line type="monotone" dataKey="stock_out" stroke="#ef4444" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader><CardTitle className="text-lg">Top Products</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <thead><tr><Th>Product</Th><Th>Qty Sold</Th><Th>Revenue</Th></tr></thead>
            <tbody>
              {data.charts.top_products.map((p) => (
                <tr key={p.product_id}>
                  <Td>{p.product_name}</Td>
                  <Td>{p.total_quantity}</Td>
                  <Td>{formatCurrency(p.total_revenue)}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Recent Orders</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <thead><tr><Th>Order #</Th><Th>Customer</Th><Th>Status</Th><Th>Total</Th><Th>Date</Th></tr></thead>
            <tbody>
              {data.recent_orders.map((o) => (
                <tr key={o.id}>
                  <Td>{o.order_number}</Td>
                  <Td>{o.customer ? `${o.customer.first_name} ${o.customer.last_name}` : "-"}</Td>
                  <Td><Badge variant={orderStatusVariant(o.status)}>{o.status}</Badge></Td>
                  <Td>{formatCurrency(o.total_amount)}</Td>
                  <Td>{formatDate(o.created_at)}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

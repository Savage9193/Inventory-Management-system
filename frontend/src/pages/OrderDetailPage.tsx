import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ordersApi } from "@/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/input";
import { Badge, PageHeader, Spinner, Table, Td, Th, orderStatusVariant } from "@/components/ui/common";
import { toast } from "@/components/ui/toast";
import { formatCurrency, formatDate } from "@/utils/cn";

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { canManageOrders } = useAuth();
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: () => ordersApi.get(Number(id)).then((r) => r.data.data),
  });

  const cancelMutation = useMutation({
    mutationFn: () => ordersApi.cancel(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", id] });
      toast("Order cancelled", "success");
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Cancel failed";
      toast(msg, "error");
    },
  });

  const completeMutation = useMutation({
    mutationFn: () => ordersApi.complete(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", id] });
      toast("Order completed", "success");
    },
    onError: () => toast("Complete failed", "error"),
  });

  if (isLoading) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (!order) return null;

  return (
    <div>
      <PageHeader title={`Order ${order.order_number}`} />
      <Card className="mx-auto max-w-3xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">{order.order_number}</CardTitle>
            <p className="text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
          </div>
          <Badge variant={orderStatusVariant(order.status)}>{order.status}</Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          {order.customer && (
            <div>
              <h3 className="mb-2 font-medium">Customer</h3>
              <p>{order.customer.first_name} {order.customer.last_name}</p>
              <p className="text-sm text-muted-foreground">{order.customer.email} | {order.customer.phone}</p>
            </div>
          )}

          <div>
            <h3 className="mb-2 font-medium">Items</h3>
            <Table>
              <thead><tr><Th>Product</Th><Th>Qty</Th><Th>Unit Price</Th><Th>Subtotal</Th></tr></thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <Td>{item.product?.name || `#${item.product_id}`}</Td>
                    <Td>{item.quantity}</Td>
                    <Td>{formatCurrency(item.unit_price)}</Td>
                    <Td>{formatCurrency(item.subtotal)}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          <div className="flex items-center justify-between border-t pt-4">
            <p className="text-xl font-bold">Total: {formatCurrency(order.total_amount)}</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate("/orders")}>Back</Button>
              {canManageOrders && order.status === "CONFIRMED" && (
                <>
                  <Button variant="destructive" onClick={() => cancelMutation.mutate()} disabled={cancelMutation.isPending}>Cancel</Button>
                  <Button onClick={() => completeMutation.mutate()} disabled={completeMutation.isPending}>Complete</Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

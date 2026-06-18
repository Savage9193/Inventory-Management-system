import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { ordersApi } from "@/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge, EmptyState, PageHeader, Spinner, Table, Td, Th, orderStatusVariant } from "@/components/ui/common";
import { formatCurrency, formatDate } from "@/utils/cn";

export default function OrdersPage() {
  const { canCreateOrders } = useAuth();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["orders", page],
    queryFn: () => ordersApi.list({ page, page_size: 10 }).then((r) => r.data),
  });

  return (
    <div>
      <PageHeader
        title="Orders"
        action={canCreateOrders ? <Link to="/orders/new"><Button><Plus className="mr-2 h-4 w-4" /> New Order</Button></Link> : undefined}
      />

      {isLoading ? <div className="flex justify-center py-20"><Spinner /></div> : !data?.data.length ? (
        <EmptyState message="No orders found" />
      ) : (
        <>
          <Table>
            <thead><tr><Th>Order #</Th><Th>Customer</Th><Th>Status</Th><Th>Total</Th><Th>Date</Th><Th>Actions</Th></tr></thead>
            <tbody>
              {data.data.map((o) => (
                <tr key={o.id}>
                  <Td>{o.order_number}</Td>
                  <Td>{o.customer ? `${o.customer.first_name} ${o.customer.last_name}` : "-"}</Td>
                  <Td><Badge variant={orderStatusVariant(o.status)}>{o.status}</Badge></Td>
                  <Td>{formatCurrency(o.total_amount)}</Td>
                  <Td>{formatDate(o.created_at)}</Td>
                  <Td><Link to={`/orders/${o.id}`}><Button size="sm" variant="outline">View</Button></Link></Td>
                </tr>
              ))}
            </tbody>
          </Table>
          <div className="mt-4 flex justify-between">
            <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <span className="text-sm text-muted-foreground">Page {data.meta.page} of {data.meta.total_pages}</span>
            <Button variant="outline" disabled={page >= data.meta.total_pages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </>
      )}
    </div>
  );
}

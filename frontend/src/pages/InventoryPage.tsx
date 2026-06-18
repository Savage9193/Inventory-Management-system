import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { inventoryApi } from "@/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/input";
import { EmptyState, PageHeader, Spinner, Table, Td, Th } from "@/components/ui/common";
import { formatDate } from "@/utils/cn";

export default function InventoryPage() {
  const [tab, setTab] = useState<"history" | "low-stock">("history");
  const [page, setPage] = useState(1);

  const historyQuery = useQuery({
    queryKey: ["inventory-history", page],
    queryFn: () => inventoryApi.history({ page, page_size: 10 }).then((r) => r.data),
    enabled: tab === "history",
  });

  const lowStockQuery = useQuery({
    queryKey: ["inventory-low-stock", page],
    queryFn: () => inventoryApi.lowStock({ page, page_size: 10 }).then((r) => r.data),
    enabled: tab === "low-stock",
  });

  const data = tab === "history" ? historyQuery.data : lowStockQuery.data;
  const isLoading = tab === "history" ? historyQuery.isLoading : lowStockQuery.isLoading;

  return (
    <div>
      <PageHeader title="Inventory" />
      <div className="mb-4 flex gap-2">
        <button
          className={`rounded-md px-4 py-2 text-sm font-medium ${tab === "history" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
          onClick={() => { setTab("history"); setPage(1); }}
        >
          History
        </button>
        <button
          className={`rounded-md px-4 py-2 text-sm font-medium ${tab === "low-stock" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
          onClick={() => { setTab("low-stock"); setPage(1); }}
        >
          Low Stock
        </button>
      </div>

      {isLoading ? <div className="flex justify-center py-20"><Spinner /></div> : !data?.data.length ? (
        <EmptyState message="No records found" />
      ) : tab === "history" ? (
        <Card>
          <CardHeader><CardTitle className="text-lg">Movement History</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <thead><tr><Th>Date</Th><Th>Product</Th><Th>Type</Th><Th>Qty</Th><Th>Reference</Th></tr></thead>
              <tbody>
                {historyQuery.data!.data.map((m) => (
                  <tr key={m.id}>
                    <Td>{formatDate(m.created_at)}</Td>
                    <Td>{m.product?.name || m.product_id}</Td>
                    <Td>{m.type}</Td>
                    <Td>{m.quantity}</Td>
                    <Td>{m.reference}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader><CardTitle className="text-lg">Low Stock Products</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <thead><tr><Th>SKU</Th><Th>Name</Th><Th>Stock</Th><Th>Reorder Level</Th></tr></thead>
              <tbody>
                {lowStockQuery.data!.data.map((p) => (
                  <tr key={p.id}>
                    <Td>{p.sku}</Td>
                    <Td>{p.name}</Td>
                    <Td className="font-semibold text-destructive">{p.stock_quantity}</Td>
                    <Td>{p.reorder_level}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

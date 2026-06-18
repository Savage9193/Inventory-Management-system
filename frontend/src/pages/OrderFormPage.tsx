import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { customersApi, ordersApi, productsApi } from "@/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, Input, Label } from "@/components/ui/input";
import { PageHeader, Spinner } from "@/components/ui/common";
import { toast } from "@/components/ui/toast";
import { formatCurrency } from "@/utils/cn";
import { Plus, Trash2 } from "lucide-react";

interface LineItem {
  product_id: number;
  quantity: number;
}

export default function OrderFormPage() {
  const navigate = useNavigate();
  const [customerId, setCustomerId] = useState<number | "">("");
  const [items, setItems] = useState<LineItem[]>([{ product_id: 0, quantity: 1 }]);

  const { data: customers } = useQuery({
    queryKey: ["customers-all"],
    queryFn: () => customersApi.list({ page_size: 100 }).then((r) => r.data.data),
  });

  const { data: products } = useQuery({
    queryKey: ["products-all"],
    queryFn: () => productsApi.list({ page_size: 100 }).then((r) => r.data.data),
  });

  const mutation = useMutation({
    mutationFn: () =>
      ordersApi.create({
        customer_id: Number(customerId),
        items: items.filter((i) => i.product_id > 0).map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
      }),
    onSuccess: () => {
      toast("Order created", "success");
      navigate("/orders");
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to create order";
      toast(msg, "error");
    },
  });

  if (!customers || !products) return <div className="flex justify-center py-20"><Spinner /></div>;

  const total = items.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.product_id);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  return (
    <div>
      <PageHeader title="New Order" />
      <Card className="mx-auto max-w-3xl">
        <CardHeader><CardTitle>Order Details</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label>Customer</Label>
            <select className="mt-1 flex h-10 w-full rounded-md border px-3 text-sm" value={customerId} onChange={(e) => setCustomerId(Number(e.target.value))}>
              <option value="">Select customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Items</Label>
              <Button type="button" size="sm" variant="outline" onClick={() => setItems([...items, { product_id: 0, quantity: 1 }])}>
                <Plus className="mr-1 h-4 w-4" /> Add Item
              </Button>
            </div>
            {items.map((item, idx) => (
              <div key={idx} className="flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <Label>Product</Label>
                  <select
                    className="mt-1 flex h-10 w-full rounded-md border px-3 text-sm"
                    value={item.product_id}
                    onChange={(e) => {
                      const next = [...items];
                      next[idx].product_id = Number(e.target.value);
                      setItems(next);
                    }}
                  >
                    <option value={0}>Select product</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock_quantity}) - {formatCurrency(p.price)}</option>
                    ))}
                  </select>
                </div>
                <div className="w-full sm:w-32">
                  <Label>Qty</Label>
                  <Input type="number" min={1} value={item.quantity} onChange={(e) => {
                    const next = [...items];
                    next[idx].quantity = Number(e.target.value);
                    setItems(next);
                  }} />
                </div>
                {items.length > 1 && (
                  <Button type="button" variant="destructive" size="icon" onClick={() => setItems(items.filter((_, i) => i !== idx))}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-t pt-4">
            <p className="text-lg font-semibold">Total: {formatCurrency(total)}</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate("/orders")}>Cancel</Button>
              <Button onClick={() => mutation.mutate()} disabled={!customerId || mutation.isPending}>Create Order</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

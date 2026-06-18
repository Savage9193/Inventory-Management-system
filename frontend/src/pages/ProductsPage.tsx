import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { productsApi } from "@/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge, EmptyState, PageHeader, Spinner, Table, Td, Th } from "@/components/ui/common";
import { toast } from "@/components/ui/toast";
import { formatCurrency } from "@/utils/cn";

export default function ProductsPage() {
  const { canManageProducts } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [lowStock, setLowStock] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["products", page, search, lowStock],
    queryFn: () => productsApi.list({ page, page_size: 10, search: search || undefined, low_stock: lowStock || undefined }).then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => productsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast("Product deleted", "success");
    },
    onError: () => toast("Failed to delete product", "error"),
  });

  return (
    <div>
      <PageHeader
        title="Products"
        action={canManageProducts ? (
          <Link to="/products/new"><Button><Plus className="mr-2 h-4 w-4" /> Add Product</Button></Link>
        ) : undefined}
      />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search products..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={lowStock} onChange={(e) => { setLowStock(e.target.checked); setPage(1); }} />
          Low stock only
        </label>
      </div>

      {isLoading ? <div className="flex justify-center py-20"><Spinner /></div> : !data?.data.length ? (
        <EmptyState message="No products found" />
      ) : (
        <>
          <Table>
            <thead>
              <tr><Th>SKU</Th><Th>Name</Th><Th>Category</Th><Th>Price</Th><Th>Stock</Th><Th>Status</Th>{canManageProducts && <Th>Actions</Th>}</tr>
            </thead>
            <tbody>
              {data.data.map((p) => (
                <tr key={p.id}>
                  <Td>{p.sku}</Td>
                  <Td>{p.name}</Td>
                  <Td>{p.category}</Td>
                  <Td>{formatCurrency(p.price)}</Td>
                  <Td>
                    <span className={p.stock_quantity <= p.reorder_level ? "font-semibold text-destructive" : ""}>{p.stock_quantity}</span>
                  </Td>
                  <Td>{p.stock_quantity <= p.reorder_level ? <Badge variant="warning">Low</Badge> : <Badge variant="success">OK</Badge>}</Td>
                  {canManageProducts && (
                    <Td className="space-x-2">
                      <Link to={`/products/${p.id}/edit`}><Button size="sm" variant="outline">Edit</Button></Link>
                      <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(p.id)}>Delete</Button>
                    </Td>
                  )}
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

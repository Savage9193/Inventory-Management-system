import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { customersApi } from "@/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState, PageHeader, Spinner, Table, Td, Th } from "@/components/ui/common";
import { toast } from "@/components/ui/toast";

export default function CustomersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["customers", page, search],
    queryFn: () => customersApi.list({ page, page_size: 10, search: search || undefined }).then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => customersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast("Customer deleted", "success");
    },
    onError: () => toast("Failed to delete customer", "error"),
  });

  return (
    <div>
      <PageHeader title="Customers" action={<Link to="/customers/new"><Button><Plus className="mr-2 h-4 w-4" /> Add Customer</Button></Link>} />
      <div className="relative mb-4">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search customers..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
      </div>

      {isLoading ? <div className="flex justify-center py-20"><Spinner /></div> : !data?.data.length ? (
        <EmptyState message="No customers found" />
      ) : (
        <>
          <Table>
            <thead><tr><Th>Name</Th><Th>Email</Th><Th>Phone</Th><Th>City</Th><Th>Actions</Th></tr></thead>
            <tbody>
              {data.data.map((c) => (
                <tr key={c.id}>
                  <Td>{c.first_name} {c.last_name}</Td>
                  <Td>{c.email}</Td>
                  <Td>{c.phone}</Td>
                  <Td>{c.city}</Td>
                  <Td className="space-x-2">
                    <Link to={`/customers/${c.id}/edit`}><Button size="sm" variant="outline">Edit</Button></Link>
                    <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(c.id)}>Delete</Button>
                  </Td>
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

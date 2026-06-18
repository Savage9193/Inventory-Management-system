import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { productsApi } from "@/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, Input, Label, Textarea } from "@/components/ui/input";
import { Spinner } from "@/components/ui/common";
import { toast } from "@/components/ui/toast";

const schema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.string().min(1),
  price: z.coerce.number().positive(),
  cost_price: z.coerce.number().min(0),
  stock_quantity: z.coerce.number().min(0),
  reorder_level: z.coerce.number().min(0),
});

type FormData = z.infer<typeof schema>;

export default function ProductFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => productsApi.get(Number(id)).then((r) => r.data.data),
    enabled: isEdit,
  });

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    values: product ? {
      sku: product.sku,
      name: product.name,
      description: product.description || "",
      category: product.category,
      price: product.price,
      cost_price: product.cost_price,
      stock_quantity: product.stock_quantity,
      reorder_level: product.reorder_level,
    } : undefined,
    defaultValues: { cost_price: 0, stock_quantity: 0, reorder_level: 10 },
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      isEdit ? productsApi.update(Number(id), data) : productsApi.create(data),
    onSuccess: () => {
      toast(isEdit ? "Product updated" : "Product created", "success");
      navigate("/products");
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Save failed";
      toast(msg, "error");
    },
  });

  if (isEdit && isLoading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader><CardTitle>{isEdit ? "Edit Product" : "New Product"}</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="grid gap-4 sm:grid-cols-2">
          {(["sku", "name", "category", "price", "cost_price", "stock_quantity", "reorder_level"] as const).map((field) => (
            <div key={field} className={field === "name" ? "sm:col-span-2" : ""}>
              <Label htmlFor={field}>{field.replace("_", " ")}</Label>
              <Input id={field} type={["price", "cost_price", "stock_quantity", "reorder_level"].includes(field) ? "number" : "text"} step="0.01" {...register(field)} />
              {errors[field] && <p className="text-sm text-destructive">{errors[field]?.message}</p>}
            </div>
          ))}
          <div className="sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register("description")} />
          </div>
          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit" disabled={isSubmitting}>{isEdit ? "Update" : "Create"}</Button>
            <Button type="button" variant="outline" onClick={() => navigate("/products")}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

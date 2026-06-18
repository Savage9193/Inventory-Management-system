import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { customersApi } from "@/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, Input, Label } from "@/components/ui/input";
import { Spinner } from "@/components/ui/common";
import { toast } from "@/components/ui/toast";

const schema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(7),
  address: z.string().min(1),
  city: z.string().min(1),
  country: z.string().min(1),
});

type FormData = z.infer<typeof schema>;

export default function CustomerFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const { data: customer, isLoading } = useQuery({
    queryKey: ["customer", id],
    queryFn: () => customersApi.get(Number(id)).then((r) => r.data.data),
    enabled: isEdit,
  });

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    values: customer || undefined,
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      isEdit ? customersApi.update(Number(id), data) : customersApi.create(data),
    onSuccess: () => {
      toast(isEdit ? "Customer updated" : "Customer created", "success");
      navigate("/customers");
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Save failed";
      toast(msg, "error");
    },
  });

  if (isEdit && isLoading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader><CardTitle>{isEdit ? "Edit Customer" : "New Customer"}</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="grid gap-4 sm:grid-cols-2">
          {(["first_name", "last_name", "email", "phone", "address", "city", "country"] as const).map((field) => (
            <div key={field} className={field === "address" ? "sm:col-span-2" : ""}>
              <Label htmlFor={field}>{field.replace("_", " ")}</Label>
              <Input id={field} {...register(field)} />
              {errors[field] && <p className="text-sm text-destructive">{errors[field]?.message}</p>}
            </div>
          ))}
          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit" disabled={isSubmitting}>{isEdit ? "Update" : "Create"}</Button>
            <Button type="button" variant="outline" onClick={() => navigate("/customers")}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

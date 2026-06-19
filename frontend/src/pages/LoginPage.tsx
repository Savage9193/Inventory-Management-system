import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Package, ShieldCheck, BarChart3, Globe, HelpCircle } from "lucide-react";

import { authApi } from "@/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";


const schema = z.object({
email: z.string().email(),
password: z.string().min(8),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
const { login } = useAuth();
const navigate = useNavigate();

const {
register,
handleSubmit,
formState: { errors, isSubmitting },
} = useForm<FormData>({
resolver: zodResolver(schema),
});

const onSubmit = async (data: FormData) => {
try {
const res = await authApi.login(data.email, data.password);

  const { user, tokens } = res.data.data;

  login(user, tokens.access_token, tokens.refresh_token);

  toast("Login successful", "success");

  navigate(user.role === "staff" ? "/products" : "/dashboard");
} catch (err: unknown) {
  const msg =
    (err as { response?: { data?: { message?: string } } })?.response
      ?.data?.message || "Login failed";

  toast(msg, "error");
}

};

return (
  <div className="min-h-screen bg-background">
    
    {/* Login Navbar */}
    <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b bg-background/90 backdrop-blur">
      <div className="flex h-full items-center justify-between px-6 lg:px-12">
  
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Package className="h-5 w-5" />
          </div>
  
          <div>
            <h2 className="text-lg font-bold">
              Inventory System
            </h2>
            <p className="text-xs text-muted-foreground">
              Enterprise Management Platform
            </p>
          </div>
        </div>
  
  
        {/* Right Menu */}
        <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
  
          <div className="flex items-center gap-2 cursor-pointer hover:text-primary">
            <Globe className="h-4 w-4" />
            English
          </div>
  
          <div className="flex items-center gap-2 cursor-pointer hover:text-primary">
            <HelpCircle className="h-4 w-4" />
            Help
          </div>
  
        </div>
  
      </div>
    </header>
  
  
    {/* Main Content */}
    <div className="grid min-h-screen pt-16 lg:grid-cols-2">
{/* Left Section */} <div className="hidden lg:flex flex-col justify-center bg-muted/30 p-12"> <div className="max-w-md"> <div className="mb-6 flex items-center gap-3"> <Package className="h-10 w-10 text-primary" /> <div> <h1 className="text-3xl font-bold">
Inventory Management System </h1> <p className="text-muted-foreground">
Manage products, orders, inventory and customers efficiently. </p> </div> </div>

      <div className="space-y-6 mt-10">
        <div className="flex items-start gap-4">
          <ShieldCheck className="h-6 w-6 text-primary mt-1" />
          <div>
            <h3 className="font-semibold">Secure Access</h3>
            <p className="text-sm text-muted-foreground">
              Role-based authentication for Admin and Staff users.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <BarChart3 className="h-6 w-6 text-primary mt-1" />
          <div>
            <h3 className="font-semibold">Dashboard Analytics</h3>
            <p className="text-sm text-muted-foreground">
              Track inventory, customers, orders and business insights.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <Package className="h-6 w-6 text-primary mt-1" />
          <div>
            <h3 className="font-semibold">Inventory Tracking</h3>
            <p className="text-sm text-muted-foreground">
              Monitor stock levels and product availability in real time.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>

  {/* Login Form */}
  <div className="flex items-center justify-center p-6 bg-background">
    <Card className="w-full max-w-md shadow-lg">
      <CardContent className="p-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold">Welcome Back</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Sign in to continue
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
        >
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              {...register("email")}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              {...register("password")}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing In..." : "Sign In"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-primary hover:underline"
          >
            Register
          </Link>
        </p>
      </CardContent>
    </Card>
  </div>
</div>
</div>
);
}
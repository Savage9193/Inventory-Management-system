import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Package, Users, ShoppingCart, Warehouse, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, show: (a: ReturnType<typeof useAuth>) => a.canViewDashboard },
  { to: "/products", label: "Products", icon: Package, show: () => true },
  { to: "/customers", label: "Customers", icon: Users, show: (a: ReturnType<typeof useAuth>) => a.canManageCustomers },
  { to: "/orders", label: "Orders", icon: ShoppingCart, show: (a: ReturnType<typeof useAuth>) => a.canCreateOrders },
  { to: "/inventory", label: "Inventory", icon: Warehouse, show: (a: ReturnType<typeof useAuth>) => a.canManageProducts },
];

export default function AppLayout() {
  const auth = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    auth.logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="hidden w-64 flex-col border-r bg-background md:flex">
        <div className="border-b p-6">
          <h2 className="text-lg font-bold">Inventory System</h2>
          <p className="text-xs text-muted-foreground">{auth.user?.full_name} ({auth.user?.role})</p>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {links.filter((l) => l.show(auth)).map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t p-4">
          <Button variant="outline" className="w-full" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}

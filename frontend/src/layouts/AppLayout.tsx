import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Warehouse,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import { useAuth } from "@/contexts/AuthContext";

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
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    auth.logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Mobile Header */}
      <div className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between border-b bg-background px-4 md:hidden">
        <h2 className="font-bold">Inventory System</h2>
  
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>
  
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
  
      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r bg-background transition-transform duration-300 md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b p-6">
          <div>
            <h2 className="text-lg font-bold">Inventory System</h2>
            <p className="text-xs text-muted-foreground">
              {auth.user?.full_name} ({auth.user?.role})
            </p>
          </div>
  
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
  
        <nav className="flex-1 space-y-1 p-4">
          {links
            .filter((l) => l.show(auth))
            .map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent"
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
        </nav>
  
        <div className="border-t p-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>
  
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-col border-r bg-background md:flex">
        <div className="border-b p-6">
          <h2 className="text-lg font-bold">Inventory System</h2>
          <p className="text-xs text-muted-foreground">
            {auth.user?.full_name} ({auth.user?.role})
          </p>
        </div>
  
        <nav className="flex-1 space-y-1 p-4">
          {links
            .filter((l) => l.show(auth))
            .map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent"
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
        </nav>
  
        <div className="border-t p-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>
  
      <main className="flex-1 overflow-auto p-4 pt-20 md:p-8 md:pt-8">
        <Outlet />
      </main>
    </div>
  );
}

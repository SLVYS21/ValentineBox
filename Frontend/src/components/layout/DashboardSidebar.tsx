import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Truck, 
  Receipt,
  Heart
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Tableau de bord", url: "/dashboard", icon: LayoutDashboard },
  { title: "Produits & Stock", url: "/products", icon: Package },
  { title: "Commandes", url: "/orders", icon: ShoppingCart, badge: 1 },
  { title: "Sourcing", url: "/sourcing", icon: Truck },
  { title: "Transactions", url: "/transactions", icon: Receipt },
];

export function DashboardSidebar() {
  return (
     <aside className="
      w-56
      bg-white
      border-r
      border-sidebar-border
      flex
      flex-col
      shrink-0
      min-h-screen
    ">
      {/* Logo */}
      <div className="h-14 px-4 flex items-center gap-2 border-b border-sidebar-border">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <Heart className="h-4 w-4 text-primary-foreground fill-current" />
        </div>
        <div>
          <span className="font-bold text-primary">Valentine</span>
          <span className="font-semibold text-foreground">Admin</span>
          <p className="text-[10px] text-muted-foreground -mt-0.5">Back-office v1.0</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium",
              "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              "transition-colors duration-150"
            )}
            activeClassName="bg-sidebar-accent text-primary font-semibold"
          >
            <item.icon className="h-4 w-4" />
            <span>{item.title}</span>
            {item.badge && (
              <span className="ml-auto bg-primary text-primary-foreground text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-primary">A</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">Admin</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-status-success rounded-full" />
              Online (NodeJS)
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

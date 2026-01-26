import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Sourcing from "./pages/Sourcing";
import Transactions from "./pages/Transactions";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function DashboardWrapper({ title }: { title: string }) {
  return <DashboardLayout title={title} />;
}

const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Dashboard routes with layout */}
        <Route element={<DashboardWrapper title="Tableau de bord" />}>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute permission="view_dashboard">
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route
          element={<DashboardWrapper title="Gestion des Produits & Stock" />}
        >
          <Route
            path="/products"
            element={
              <ProtectedRoute permission="manage_products">
                <Products />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route element={<DashboardWrapper title="Suivi des Commandes" />}>
          <Route
            path="/orders"
            element={
              <ProtectedRoute permission="manage_orders">
                <Orders />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route element={<DashboardWrapper title="Sourcing & Fournisseurs" />}>
          <Route path="/sourcing" element={<Sourcing />} />
        </Route>
        <Route
          element={<DashboardWrapper title="Comptabilité & Transactions" />}
        >
          <Route path="/transactions" element={<Transactions />} />
          {/* <Route
          path="/users"
          element={
            <ProtectedRoute requireSuperAdmin>
              <Users />
            </ProtectedRoute>
          }
        /> */}
        </Route>

        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CartProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </TooltipProvider>
    </CartProvider>
  </QueryClientProvider>
);

export default App;

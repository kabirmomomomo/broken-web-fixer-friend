
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import MenuEditor from "./pages/MenuEditor";
import MenuPreview from "./pages/MenuPreview";
import OrderDashboard from "./pages/OrderDashboard";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { OrderProvider } from "./contexts/OrderContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ThankYou from "./pages/ThankYou";
import PaymentPage from "./pages/PaymentPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route 
            path="/menu-editor" 
            element={
              <ProtectedRoute>
                <MenuEditor />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/menu-preview/:menuId" 
            element={
              <CartProvider>
                <OrderProvider>
                  <MenuPreview />
                </OrderProvider>
              </CartProvider>
            } 
          />
          <Route path="/menu-preview" element={<Navigate to="/menu-editor" replace />} />
          <Route 
            path="/payment/:menuId" 
            element={
              <CartProvider>
                <OrderProvider>
                  <PaymentPage />
                </OrderProvider>
              </CartProvider>
            } 
          />
          <Route 
            path="/thank-you" 
            element={
              <CartProvider>
                <OrderProvider>
                  <ThankYou />
                </OrderProvider>
              </CartProvider>
            } 
          />
          <Route 
            path="/restaurant/:restaurantId/orders" 
            element={
              <CartProvider>
                <OrderProvider>
                  <OrderDashboard />
                </OrderProvider>
              </CartProvider>
            } 
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

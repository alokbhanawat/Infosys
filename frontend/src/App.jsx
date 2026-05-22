import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import RegisterForm from "./components/RegisterForm";
import LoginForm from "./components/LoginForm";
import Dashboard from "./components/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import CartPage from "./pages/CartPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import OrdersPage from "./pages/OrdersPage";
import ProfilePage from "./pages/ProfilePage";
import ProductDetailPage from "./pages/ProductDetailPage";
import ProductsPage from "./pages/ProductsPage";
import AddressesPage from "./pages/AddressesPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/" element={<LoginForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
        </Route>

        <Route path="/products" element={<ProtectedRoute allowedRoles={["USER"]} />}>
          <Route element={<ProductsPage />} index />
          <Route path=":productId" element={<ProductDetailPage />} />
        </Route>

        <Route path="/cart" element={<ProtectedRoute allowedRoles={["USER"]} />}>
          <Route index element={<CartPage />} />
        </Route>

        <Route path="/orders" element={<ProtectedRoute allowedRoles={["USER"]} />}>
          <Route index element={<OrdersPage />} />
          <Route path="success" element={<OrderSuccessPage />} />
        </Route>

        <Route path="/profile" element={<ProtectedRoute allowedRoles={["USER"]} />}>
          <Route index element={<ProfilePage />} />
        </Route>

        <Route path="/addresses" element={<ProtectedRoute allowedRoles={["USER"]} />}>
          <Route index element={<AddressesPage />} />
        </Route>

        <Route path="/admin" element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
          <Route element={<Dashboard />} index />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

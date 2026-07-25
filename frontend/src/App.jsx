import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import ProductList from "./pages/ProductList";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ManageProducts from "./pages/ManageProducts";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Orders from "./pages/Orders";
import SellerOrders from "./pages/SellerOrders";
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<ProductList />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/manage-products"
          element={
            <ProtectedRoute roles={["admin", "sales_person"]}>
              <ManageProducts />
            </ProtectedRoute>
          }
        />
       <Route
  path="/cart"
  element={
    <ProtectedRoute roles={["user"]}>
      <Cart />
    </ProtectedRoute>
  }
/>
<Route
  path="/wishlist"
  element={
    <ProtectedRoute roles={["user"]}>
      <Wishlist />
    </ProtectedRoute>
  }
/>
<Route
  path="/orders"
  element={
    <ProtectedRoute roles={["user"]}>
      <Orders />
    </ProtectedRoute>
  }
/>
        <Route
          path="/seller-orders"
          element={
            <ProtectedRoute roles={["sales_person", "admin"]}>
              <SellerOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

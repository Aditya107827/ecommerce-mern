import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import MainLayout from "../layouts/MainLayout";
import AdminLayout from "../layouts/AdminLayout";
import Home from "../pages/customer/Home";
import Products from "../pages/customer/Products";
import ProductDetails from "../pages/customer/ProductDetails";
import Cart from "../pages/customer/Cart";
import Wishlist from "../pages/customer/Wishlist";
import Checkout from "../pages/customer/Checkout";
import Register from "../pages/auth/Register";
import Login from "../pages/auth/Login";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import Account from "../pages/customer/Account";
import ProtectedRoute from "./ProtectedRoute";
import OrderDetails from "../pages/customer/OrderDetails";
import Orders from "../pages/customer/Orders";
import AdminProducts from "../pages/admin/AdminProducts";
import AdminOrders from "../pages/admin/AdminOrders";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminReviews from "../pages/admin/AdminReviews";
import AdminSettings from "../pages/admin/AdminSettings";
import AdminRoute from "./AdminRoute";

function AppRoutes() {
    return (
        <BrowserRouter>
            <Toaster />
            <Routes>

                {/* Customer */}
                <Route element={<MainLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/products" element={<Products />} />
                    <Route
                        path="/products/:productId"
                        element={<ProductDetails />}
                    />

                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    <Route
                        path="/reset-password/:token"
                        element={<ResetPassword />}
                    />

                    <Route
                        path="/forgot-password"
                        element={<ForgotPassword />}
                    />

                    {/* Protected Customer Routes */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/wishlist" element={<Wishlist />} />
                        <Route path="/account" element={<Account />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/orders" element={<Orders />} />
                        <Route
                            path="/orders/:orderId"
                            element={<OrderDetails />}
                        />
                    </Route>
                </Route>

                {/* Protected Admin */}
                <Route element={<AdminRoute />}>
                    <Route path="/admin" element={<AdminLayout />}>
                        <Route
                            index
                            element={<AdminDashboard />}
                        />

                        <Route
                            path="products"
                            element={<AdminProducts />}
                        />

                        <Route
                            path="orders"
                            element={<AdminOrders />}
                        />
                        <Route
                            path="reviews"
                            element={<AdminReviews />}
                        />
                        <Route
                            path="settings"
                            element={<AdminSettings />}
                        />
                    </Route>
                </Route>

            </Routes>
        </BrowserRouter>
    );
}
export default AppRoutes;
import { useEffect, useState } from "react";
import api from "../../services/api";

function AdminDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                "/admin/dashboard"
            );

            setData(response.data);
        } catch (error) {
            console.error(
                "Failed to fetch dashboard:",
                error
            );

            setError(
                error.response?.data?.message ||
                    "Unable to load dashboard"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    if (loading) {
        return (
            <section className="flex min-h-[50vh] items-center justify-center">
                <p className="text-gray-500">
                    Loading dashboard...
                </p>
            </section>
        );
    }

    if (error) {
        return (
            <section className="space-y-4">
                <h1 className="text-4xl font-bold text-gray-900">
                    Admin Dashboard
                </h1>

                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>

                <button
                    type="button"
                    onClick={fetchDashboard}
                    className="rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
                >
                    Try Again
                </button>
            </section>
        );
    }

    const stats = data?.stats || {};
    const recentOrders = data?.recentOrders || [];

    return (
        <section className="space-y-8">

            {/* Header */}
            <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                    Admin Panel
                </p>

                <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900">
                    Dashboard
                </h1>

                <p className="mt-2 text-gray-500">
                    Overview of your E-Shop.
                </p>
            </div>


            {/* Main Stats */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

                <StatCard
                    title="Total Customers"
                    value={stats.totalCustomers || 0}
                />

                <StatCard
                    title="Total Products"
                    value={stats.totalProducts || 0}
                />

                <StatCard
                    title="Total Orders"
                    value={stats.totalOrders || 0}
                />

                <StatCard
                    title="Total Sales"
                    value={`₹${(
                        stats.totalSales || 0
                    ).toLocaleString("en-IN")}`}
                />

            </div>


            {/* Inventory / Order Stats */}
            <div className="grid gap-5 sm:grid-cols-3">

                <StatCard
                    title="Pending Orders"
                    value={stats.pendingOrders || 0}
                />

                <StatCard
                    title="Low Stock"
                    value={stats.lowStockProducts || 0}
                />

                <StatCard
                    title="Out of Stock"
                    value={stats.outOfStockProducts || 0}
                />

            </div>


            {/* Recent Orders */}
            <div className="rounded-2xl border border-gray-200 bg-white">

                <div className="border-b border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900">
                        Recent Orders
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Latest customer orders
                    </p>
                </div>


                {recentOrders.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No orders found.
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">

                        {recentOrders.map((order) => (
                            <div
                                key={order._id}
                                className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between"
                            >

                                <div>
                                    <p className="font-semibold text-gray-900">
                                        {order.user?.name ||
                                            "Unknown Customer"}
                                    </p>

                                    <p className="mt-1 text-sm text-gray-500">
                                        {order.user?.email ||
                                            "—"}
                                    </p>

                                    <p className="mt-1 text-xs text-gray-400">
                                        {new Date(
                                            order.createdAt
                                        ).toLocaleString(
                                            "en-IN"
                                        )}
                                    </p>
                                </div>


                                <div className="flex items-center gap-4">

                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                                            order.orderStatus ===
                                            "delivered"
                                                ? "bg-green-100 text-green-700"
                                                : order.orderStatus ===
                                                  "cancelled"
                                                ? "bg-red-100 text-red-700"
                                                : "bg-gray-100 text-gray-700"
                                        }`}
                                    >
                                        {order.orderStatus}
                                    </span>

                                    <span className="font-bold text-gray-900">
                                        ₹{order.total.toLocaleString(
                                            "en-IN"
                                        )}
                                    </span>

                                </div>

                            </div>
                        ))}

                    </div>
                )}

            </div>

        </section>
    );
}


function StatCard({ title, value }) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6">

            <p className="text-sm font-medium text-gray-500">
                {title}
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
                {value}
            </p>

        </div>
    );
}


export default AdminDashboard;
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../services/api";

const ORDER_STATUSES = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
];

const STATUS_TRANSITIONS = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["processing", "cancelled"],
    processing: ["shipped", "cancelled"],
    shipped: ["delivered"],
    delivered: [],
    cancelled: [],
};

function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState(null);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalOrders: 0,
        limit: 10,
        hasNextPage: false,
        hasPreviousPage: false,
    });

    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState("all");

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                `/orders/admin/all?page=${page}&limit=10&status=${statusFilter}`
            );

            setOrders(response.data.orders || []);
            setPagination(
                response.data.pagination || {
                    currentPage: 1,
                    totalPages: 1,
                    totalOrders: 0,
                    limit: 10,
                    hasNextPage: false,
                    hasPreviousPage: false,
                }
            );
        } catch (error) {
            console.error(
                "Failed to fetch admin orders:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to load orders"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [page, statusFilter]);

    const handleStatusChange = async (orderId, status) => {
        try {
            setUpdatingId(orderId);
            setError("");

            const response = await api.put(
                `/orders/admin/${orderId}/status`,
                {
                    status,
                }
            );

            const updatedOrder = response.data.order;

            setOrders((currentOrders) =>
                currentOrders.map((order) =>
                    order._id === orderId
                        ? updatedOrder
                        : order
                )
            );
        } catch (error) {
            console.error(
                "Failed to update order status:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to update order status"
            );
        } finally {
            setUpdatingId(null);
        }
    };

    const getStatusClasses = (status) => {
        switch (status) {
            case "delivered":
                return "bg-green-100 text-green-700";

            case "cancelled":
                return "bg-red-100 text-red-700";

            case "shipped":
                return "bg-blue-100 text-blue-700";

            case "processing":
                return "bg-purple-100 text-purple-700";

            case "confirmed":
                return "bg-indigo-100 text-indigo-700";

            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    if (loading) {
        return (
            <section className="flex min-h-[50vh] items-center justify-center">
                <p className="text-gray-500">
                    Loading orders...
                </p>
            </section>
        );
    }

    return (
        <section className="space-y-8">

            {/* Header */}
            <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                    Admin Panel
                </p>

                <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900">
                    Orders
                </h1>

                <p className="mt-2 text-gray-500">
                    Manage customer orders and update their status.
                </p>
            </div>

            {/* Error */}
            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* Order Count */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
                <p className="text-sm text-gray-500">
                    Total Orders
                </p>

                <p className="mt-1 text-3xl font-bold text-gray-900">
                    {pagination.totalOrders}
                </p>
            </div>


            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm font-semibold text-gray-900">
                        Filter Orders
                    </p>
                </div>

                <select
                    value={statusFilter}
                    onChange={(event) => {
                        setStatusFilter(event.target.value);
                        setPage(1);
                    }}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
                >
                    <option value="all">All Statuses</option>
                    {ORDER_STATUSES.map((status) => (
                        <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() +
                                status.slice(1)}
                        </option>
                    ))}
                </select>
            </div>

            {/* Orders */}
            {orders.length === 0 ? (
                <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
                    <h2 className="text-xl font-bold text-gray-900">
                        No Orders Found
                    </h2>

                    <p className="mt-2 text-gray-500">
                        Customer orders will appear here.
                    </p>
                </div>
            ) : (
                <>
                    <div className="space-y-5">

                        {orders.map((order) => (
                            <article
                                key={order._id}
                                className="rounded-2xl border border-gray-200 bg-white p-6"
                            >

                                {/* Top */}
                                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Order ID
                                        </p>

                                        <p className="mt-1 break-all font-semibold text-gray-900">
                                            {order._id}
                                        </p>

                                        <p className="mt-2 text-sm text-gray-500">
                                            {new Date(
                                                order.createdAt
                                            ).toLocaleString("en-IN")}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3">

                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusClasses(
                                                order.orderStatus
                                            )}`}
                                        >
                                            {order.orderStatus}
                                        </span>

                                        <select
                                            value={order.orderStatus}
                                            disabled={
                                                updatingId === order._id
                                            }
                                            onChange={(event) =>
                                                handleStatusChange(
                                                    order._id,
                                                    event.target.value
                                                )
                                            }
                                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {[
                                                order.orderStatus,
                                                ...(STATUS_TRANSITIONS[order.orderStatus] || []),
                                            ].map((status) => (
                                                <option
                                                    key={status}
                                                    value={status}
                                                >
                                                    {status
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        status.slice(1)}
                                                </option>
                                            ))}
                                        </select>

                                    </div>

                                </div>

                                <div className="my-6 border-t border-gray-100" />

                                {/* Customer */}
                                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Customer
                                        </p>

                                        <p className="mt-1 font-semibold text-gray-900">
                                            {order.user?.name ||
                                                "Unknown"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Email
                                        </p>

                                        <p className="mt-1 break-all font-semibold text-gray-900">
                                            {order.user?.email ||
                                                "—"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Items
                                        </p>

                                        <p className="mt-1 font-semibold text-gray-900">
                                            {order.items.length}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Total
                                        </p>

                                        <p className="mt-1 font-semibold text-gray-900">
                                            ₹{order.total.toLocaleString(
                                                "en-IN"
                                            )}
                                        </p>
                                    </div>

                                </div>

                                <div className="my-6 border-t border-gray-100" />

                                {/* Products */}
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">
                                        Order Items
                                    </h2>

                                    <div className="mt-4 space-y-3">

                                        {order.items.map((item, index) => (
                                            <div
                                                key={`${order._id}-${index}`}
                                                className="flex items-center justify-between gap-4 rounded-lg bg-gray-50 p-4"
                                            >
                                                <div className="flex min-w-0 items-center gap-4">
                                                    {item.image ? (
                                                        <img
                                                            src={item.image}
                                                            alt={item.name}
                                                            className="h-16 w-16 shrink-0 rounded-lg object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-gray-200 text-xs text-gray-500">
                                                            No Image
                                                        </div>
                                                    )}

                                                    <div className="min-w-0">
                                                        <p className="truncate font-semibold text-gray-900">
                                                            {item.name}
                                                        </p>

                                                        <p className="mt-1 text-sm text-gray-500">
                                                            ₹{item.price.toLocaleString("en-IN")} ×{" "}
                                                            {item.quantity}
                                                        </p>

                                                        {item.product && (
                                                            <Link
                                                                to={`/products/${item.product}`}
                                                                className="mt-1 inline-block text-xs font-semibold text-gray-600 hover:text-black hover:underline"
                                                            >
                                                                View Product
                                                            </Link>
                                                        )}
                                                    </div>
                                                </div>

                                                <p className="shrink-0 font-semibold text-gray-900">
                                                    ₹{(
                                                        item.price * item.quantity
                                                    ).toLocaleString("en-IN")}
                                                </p>
                                            </div>
                                        ))}

                                    </div>
                                </div>

                                <div className="my-6 border-t border-gray-100" />

                                {/* Payment + Address */}
                                <div className="grid gap-6 lg:grid-cols-2">

                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900">
                                            Payment
                                        </h2>

                                        <div className="mt-3 space-y-2 text-sm">

                                            <p>
                                                <span className="text-gray-500">
                                                    Method:
                                                </span>{" "}
                                                <span className="font-semibold uppercase">
                                                    {order.paymentMethod}
                                                </span>
                                            </p>

                                            <p>
                                                <span className="text-gray-500">
                                                    Status:
                                                </span>{" "}
                                                <span className="font-semibold capitalize">
                                                    {order.paymentStatus}
                                                </span>
                                            </p>

                                        </div>
                                    </div>

                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900">
                                            Delivery Address
                                        </h2>

                                        <div className="mt-3 text-sm leading-6 text-gray-600">

                                            <p className="font-semibold text-gray-900">
                                                {order.shippingAddress.fullName}
                                            </p>

                                            <p>
                                                {order.shippingAddress.addressLine1}
                                            </p>

                                            {order.shippingAddress.addressLine2 && (
                                                <p>
                                                    {order.shippingAddress.addressLine2}
                                                </p>
                                            )}

                                            <p>
                                                {order.shippingAddress.city},{" "}
                                                {order.shippingAddress.state}
                                            </p>

                                            <p>
                                                {order.shippingAddress.postalCode}
                                            </p>

                                            <p>
                                                Phone:{" "}
                                                {order.shippingAddress.phone}
                                            </p>

                                        </div>
                                    </div>

                                </div>

                            </article>
                        ))}

                    </div>
                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-center gap-4 pt-4">
                            <button
                                type="button"
                                disabled={!pagination.hasPreviousPage}
                                onClick={() =>
                                    setPage((currentPage) => currentPage - 1)
                                }
                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Previous
                            </button>

                            <span className="text-sm font-medium text-gray-600">
                                Page {pagination.currentPage} of{" "}
                                {pagination.totalPages}
                            </span>

                            <button
                                type="button"
                                disabled={!pagination.hasNextPage}
                                onClick={() =>
                                    setPage((currentPage) => currentPage + 1)
                                }
                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </section>
    );
}

export default AdminOrders;

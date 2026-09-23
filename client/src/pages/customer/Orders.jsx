import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get("/orders");

                setOrders(response.data.orders || []);
            } catch (error) {
                console.error(
                    "Failed to fetch orders:",
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

        fetchOrders();
    }, []);

    const handleCancelOrder = async (orderId) => {
        const confirmed = window.confirm(
            "Are you sure you want to cancel this order?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");

            const response = await api.put(
                `/orders/${orderId}/cancel`
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
                "Failed to cancel order:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to cancel order"
            );
        }
    };


    if (loading) {
        return (
            <section className="flex min-h-[60vh] items-center justify-center px-6">
                <p className="text-gray-500">
                    Loading your orders...
                </p>
            </section>
        );
    }


    if (error) {
        return (
            <section className="flex min-h-[60vh] items-center justify-center px-6">
                <div className="text-center">

                    <h1 className="text-3xl font-bold text-gray-900">
                        Unable to Load Orders
                    </h1>

                    <p className="mt-3 text-gray-500">
                        {error}
                    </p>

                    <Link
                        to="/account"
                        className="mt-6 inline-block rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white"
                    >
                        Back to Account
                    </Link>

                </div>
            </section>
        );
    }


    if (orders.length === 0) {
        return (
            <section className="flex min-h-[60vh] items-center justify-center px-6">
                <div className="text-center">

                    <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                        My Orders
                    </p>

                    <h1 className="mt-2 text-3xl font-bold text-gray-900">
                        No Orders Yet
                    </h1>

                    <p className="mt-3 text-gray-500">
                        Your previous orders will appear here.
                    </p>

                    <Link
                        to="/products"
                        className="mt-6 inline-block rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white"
                    >
                        Start Shopping
                    </Link>

                </div>
            </section>
        );
    }


    return (
        <section className="bg-gray-50 py-12">
            <div className="mx-auto max-w-5xl px-6">

                {/* Header */}
                <div className="mb-8">

                    <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                        My Account
                    </p>

                    <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900">
                        My Orders
                    </h1>

                    <p className="mt-2 text-gray-500">
                        View your orders and track their status.
                    </p>

                </div>


                {/* Orders */}
                <div className="space-y-5">

                    {orders.map((order) => (

                        <article
                            key={order._id}
                            className="rounded-2xl border border-gray-200 bg-white p-6"
                        >

                            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                                <div>

                                    <p className="text-sm text-gray-500">
                                        Order ID
                                    </p>

                                    <p className="mt-1 break-all font-semibold text-gray-900">
                                        {order._id}
                                    </p>

                                </div>


                                <div className="flex flex-wrap gap-3">

                                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold capitalize text-gray-700">
                                        {order.orderStatus}
                                    </span>

                                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold capitalize text-gray-700">
                                        Payment: {order.paymentStatus}
                                    </span>

                                </div>

                            </div>


                            <div className="my-5 border-t border-gray-100" />


                            <div className="grid gap-5 sm:grid-cols-3">

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
                                        ₹{order.total.toLocaleString("en-IN")}
                                    </p>

                                </div>


                                <div>

                                    <p className="text-sm text-gray-500">
                                        Payment Method
                                    </p>

                                    <p className="mt-1 font-semibold uppercase text-gray-900">
                                        {order.paymentMethod}
                                    </p>

                                </div>

                            </div>


                            <div className="mt-6 flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between">

                                <p className="text-sm text-gray-500">
                                    Ordered on{" "}
                                    {new Date(
                                        order.createdAt
                                    ).toLocaleDateString("en-IN")}
                                </p>

                                {["pending", "confirmed", "processing"].includes(
                                    order.orderStatus
                                ) && (
                                        <button
                                            type="button"
                                            onClick={() => handleCancelOrder(order._id)}
                                            className="rounded-lg border border-red-200 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                                        >
                                            Cancel Order
                                        </button>
                                    )}


                                <Link
                                    to={`/orders/${order._id}`}
                                    className="rounded-lg bg-black px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-gray-800"
                                >
                                    View Details
                                </Link>

                            </div>

                        </article>

                    ))}

                </div>

            </div>
        </section>
    );
}

export default Orders;
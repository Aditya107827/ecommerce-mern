import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../services/api";

function OrderDetails() {
    const { orderId } = useParams();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get(
                    `/orders/${orderId}`
                );

                setOrder(response.data.order);
            } catch (error) {
                console.error(
                    "Failed to fetch order:",
                    error
                );

                setError(
                    error.response?.data?.message ||
                    "Unable to load order"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId]);


    if (loading) {
        return (
            <section className="flex min-h-[60vh] items-center justify-center px-6">
                <p className="text-gray-500">
                    Loading order...
                </p>
            </section>
        );
    }


    if (error || !order) {
        return (
            <section className="flex min-h-[60vh] items-center justify-center px-6">
                <div className="text-center">

                    <h1 className="text-3xl font-bold text-gray-900">
                        Order Not Found
                    </h1>

                    <p className="mt-3 text-gray-500">
                        {error || "Unable to find this order."}
                    </p>

                    <Link
                        to="/products"
                        className="mt-6 inline-block rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white"
                    >
                        Continue Shopping
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
                        Order Confirmation
                    </p>

                    <h1 className="mt-2 text-4xl font-bold text-gray-900">
                        Order Placed Successfully
                    </h1>

                    <p className="mt-3 text-sm text-gray-500">
                        Order ID: {order._id}
                    </p>

                </div>


                <div className="grid gap-8 lg:grid-cols-[1fr_320px]">

                    {/* Main */}
                    <div className="space-y-6">

                        {/* Order Status */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-6">

                            <h2 className="text-xl font-bold text-gray-900">
                                Order Status
                            </h2>

                            <div className="mt-5 grid gap-4 sm:grid-cols-2">

                                <div>
                                    <p className="text-sm text-gray-500">
                                        Order Status
                                    </p>

                                    <p className="mt-1 font-semibold capitalize">
                                        {order.orderStatus}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">
                                        Payment
                                    </p>

                                    <p className="mt-1 font-semibold capitalize">
                                        {order.paymentStatus}
                                    </p>
                                </div>

                            </div>
                            <div className="mt-6 border-t border-gray-100 pt-6">
                                <p className="text-sm font-semibold text-gray-900">
                                    Status History
                                </p>

                                <div className="mt-4">
                                    {(() => {
                                        const statuses = [
                                            "pending",
                                            "confirmed",
                                            "processing",
                                            "shipped",
                                            "delivered",
                                        ];

                                        const currentIndex = statuses.indexOf(
                                            order.orderStatus
                                        );

                                        if (order.orderStatus === "cancelled") {
                                            return (
                                                <div className="flex items-start gap-3">
                                                    <div className="mt-1 h-3 w-3 shrink-0 rounded-full bg-red-500" />

                                                    <div>
                                                        <p className="font-medium capitalize text-red-600">
                                                            Cancelled
                                                        </p>

                                                        <p className="text-sm text-gray-500">
                                                            Order was cancelled
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        }

                                        return statuses.map((status, index) => {
                                            const historyEntry =
                                                order.statusHistory?.find(
                                                    (history) =>
                                                        history.status === status
                                                );

                                            const isCompleted =
                                                index < currentIndex;

                                            const isCurrent =
                                                index === currentIndex;

                                            return (
                                                <div
                                                    key={status}
                                                    className="flex items-start gap-3"
                                                >
                                                    <div className="flex flex-col items-center">
                                                        <div
                                                            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${isCompleted
                                                                    ? "bg-black text-white"
                                                                    : isCurrent
                                                                        ? "bg-black text-white"
                                                                        : "border border-gray-300 bg-white text-gray-400"
                                                                }`}
                                                        >
                                                            {isCompleted
                                                                ? "✓"
                                                                : isCurrent
                                                                    ? "●"
                                                                    : "○"}
                                                        </div>

                                                        {index < statuses.length - 1 && (
                                                            <div
                                                                className={`h-8 w-px ${isCompleted
                                                                        ? "bg-black"
                                                                        : "bg-gray-200"
                                                                    }`}
                                                            />
                                                        )}
                                                    </div>

                                                    <div className="pb-4">
                                                        <p
                                                            className={`font-medium capitalize ${isCurrent
                                                                    ? "text-gray-900"
                                                                    : isCompleted
                                                                        ? "text-gray-700"
                                                                        : "text-gray-400"
                                                                }`}
                                                        >
                                                            {status}
                                                        </p>

                                                        <p className="text-sm text-gray-500">
                                                            {historyEntry
                                                                ? new Date(
                                                                    historyEntry.changedAt
                                                                ).toLocaleString(
                                                                    "en-IN",
                                                                    {
                                                                        dateStyle: "medium",
                                                                        timeStyle: "short",
                                                                    }
                                                                )
                                                                : isCurrent
                                                                    ? "Current status"
                                                                    : "Upcoming"}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        });
                                    })()}
                                </div>
                            </div>

                        </div>


                        {/* Products */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-6">

                            <h2 className="text-xl font-bold text-gray-900">
                                Items
                            </h2>

                            <div className="mt-6 space-y-5">

                                {order.items.map((item) => (

                                    <div
                                        key={item.product}
                                        className="flex items-center gap-4 border-b border-gray-100 pb-5 last:border-0 last:pb-0"
                                    >

                                        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-100">

                                            {item.image ? (
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-xs text-gray-400">
                                                    Image
                                                </span>
                                            )}

                                        </div>


                                        <div className="flex-1">

                                            <h3 className="font-semibold text-gray-900">
                                                {item.name}
                                            </h3>

                                            <p className="mt-1 text-sm text-gray-500">
                                                Qty: {item.quantity}
                                            </p>

                                        </div>


                                        <p className="font-semibold text-gray-900">
                                            ₹{(
                                                item.price *
                                                item.quantity
                                            ).toLocaleString("en-IN")}
                                        </p>

                                    </div>

                                ))}

                            </div>

                        </div>


                        {/* Shipping Address */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-6">

                            <h2 className="text-xl font-bold text-gray-900">
                                Delivery Address
                            </h2>

                            <div className="mt-5 text-sm leading-6 text-gray-600">

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
                                    {order.shippingAddress.country}
                                </p>

                                <p className="mt-2">
                                    Phone:{" "}
                                    {order.shippingAddress.phone}
                                </p>

                            </div>

                        </div>

                    </div>


                    {/* Summary */}
                    <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-6">

                        <h2 className="text-xl font-bold text-gray-900">
                            Order Summary
                        </h2>


                        <div className="mt-6 space-y-3 text-sm">

                            <div className="flex justify-between">
                                <span className="text-gray-600">
                                    Subtotal
                                </span>

                                <span className="font-semibold">
                                    ₹{order.subtotal.toLocaleString("en-IN")}
                                </span>
                            </div>


                            <div className="flex justify-between">
                                <span className="text-gray-600">
                                    Shipping
                                </span>

                                <span className="font-semibold">
                                    {order.shippingCharge === 0
                                        ? "Free"
                                        : `₹${order.shippingCharge.toLocaleString("en-IN")}`}
                                </span>
                            </div>

                        </div>


                        <div className="my-6 border-t" />


                        <div className="flex justify-between">

                            <span className="font-bold">
                                Total
                            </span>

                            <span className="text-xl font-bold">
                                ₹{order.total.toLocaleString("en-IN")}
                            </span>

                        </div>


                        <div className="mt-6 rounded-lg bg-gray-50 p-4 text-sm">

                            <p className="text-gray-500">
                                Payment Method
                            </p>

                            <p className="mt-1 font-semibold uppercase">
                                {order.paymentMethod}
                            </p>

                        </div>


                        <Link
                            to="/products"
                            className="mt-6 block rounded-lg bg-black px-6 py-3 text-center text-sm font-semibold text-white hover:bg-gray-800"
                        >
                            Continue Shopping
                        </Link>

                    </aside>

                </div>

            </div>
        </section>
    );
}

export default OrderDetails;
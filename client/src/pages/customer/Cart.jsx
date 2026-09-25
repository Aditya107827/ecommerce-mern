import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
    fetchCart,
    removeCartItemAsync,
    updateCartItemAsync,
    clearCartAsync,
} from "../../store/cartSlice";

function Cart() {
    const dispatch = useDispatch();

    const cartItems = useSelector(
        (state) => state.cart.items
    );

    const loading = useSelector(
        (state) => state.cart.loading
    );

    const error = useSelector(
        (state) => state.cart.error
    );

    // Load cart from backend
    useEffect(() => {
        dispatch(fetchCart());
    }, [dispatch]);

    const hasStockIssue = cartItems.some(
        (item) => item.stock <= 0 || item.quantity > item.stock
    );

    const subtotal = cartItems.reduce(
        (total, item) =>
            total + item.price * item.quantity,
        0
    );




    if (loading && cartItems.length === 0) {
        return (
            <section className="flex min-h-[60vh] items-center justify-center px-6">
                <p className="text-gray-500">
                    Loading your cart...
                </p>
            </section>
        );
    }


    if (cartItems.length === 0) {
        return (
            <section className="flex min-h-[60vh] items-center justify-center px-6">
                <div className="text-center">

                    <h1 className="text-3xl font-bold text-gray-900">
                        Your Cart is Empty
                    </h1>

                    <p className="mt-3 text-gray-500">
                        Add some products to your cart and they will appear here.
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
        <section className="py-12">
            <div className="mx-auto max-w-7xl px-6">

                {/* Header */}
                <div className="mb-8 flex items-center justify-between">

                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                            Shopping Cart
                        </p>

                        <h1 className="mt-2 text-4xl font-bold text-gray-900">
                            Your Cart
                        </h1>
                    </div>


                    <button
                        type="button"
                        disabled={loading}
                        onClick={() =>
                            dispatch(clearCartAsync())
                        }
                        className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Clear Cart
                    </button>

                </div>


                {/* Error */}
                {error && (
                    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                        {error}
                    </div>
                )}


                <div className="grid gap-8 lg:grid-cols-[1fr_360px]">

                    {/* Cart Items */}
                    <div className="space-y-4">

                        {cartItems.map((item) => (

                            <div
                                key={item.id}
                                className="flex flex-col gap-5 rounded-2xl border border-gray-200 bg-white p-5 sm:flex-row sm:items-center"
                            >

                                {/* Image */}
                                <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-100">

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


                                {/* Product Info */}
                                <div className="flex-1">

                                    <h2 className="text-lg font-semibold text-gray-900">
                                        {item.name}
                                    </h2>

                                    <p className="mt-1 text-sm text-gray-500">
                                        ₹{item.price.toLocaleString("en-IN")}
                                    </p>

                                    {item.stock === 0 ? (
                                        <p className="mt-2 text-sm font-medium text-red-600">
                                            Out of stock
                                        </p>
                                    ) : item.quantity >= item.stock ? (
                                        <p className="mt-2 text-sm font-medium text-orange-600">
                                            Maximum available quantity reached
                                        </p>
                                    ) : (
                                        <p className="mt-2 text-sm text-gray-500">
                                            {item.stock - item.quantity} left in stock
                                        </p>
                                    )}


                                    {/* Quantity */}
                                    <div className="mt-4 flex items-center gap-3">

                                        <button
                                            type="button"
                                            disabled={loading}
                                            onClick={() => {

                                                if (item.quantity > 1) {
                                                    dispatch(
                                                        updateCartItemAsync({
                                                            productId: item.id,
                                                            quantity: item.quantity - 1,
                                                        })
                                                    );
                                                }

                                            }}
                                            className="h-9 w-9 rounded-lg border border-gray-300 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            −
                                        </button>


                                        <span className="w-6 text-center font-semibold">
                                            {item.quantity}
                                        </span>


                                        <button
                                            type="button"
                                            disabled={
                                                loading ||
                                                item.quantity >= item.stock
                                            }
                                            onClick={() =>
                                                dispatch(
                                                    updateCartItemAsync({
                                                        productId: item.id,
                                                        quantity: item.quantity + 1,
                                                    })
                                                )
                                            }
                                            className="h-9 w-9 rounded-lg border border-gray-300 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            +
                                        </button>

                                    </div>

                                </div>


                                {/* Price + Remove */}
                                <div className="flex items-center justify-between gap-6 sm:flex-col sm:items-end">

                                    <p className="font-bold text-gray-900">
                                        ₹{(
                                            item.price *
                                            item.quantity
                                        ).toLocaleString("en-IN")}
                                    </p>


                                    <button
                                        type="button"
                                        disabled={loading}
                                        onClick={() =>
                                            dispatch(
                                                removeCartItemAsync(item.id)
                                            )
                                        }
                                        className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                                    >
                                        Remove
                                    </button>

                                </div>

                            </div>

                        ))}

                    </div>


                    {/* Summary */}
                    <aside className="h-fit rounded-2xl border border-gray-200 p-6">

                        <h2 className="text-xl font-bold text-gray-900">
                            Order Summary
                        </h2>


                        <div className="mt-6 flex justify-between text-sm">

                            <span className="text-gray-600">
                                Subtotal
                            </span>

                            <span className="font-semibold">
                                ₹{subtotal.toLocaleString("en-IN")}
                            </span>

                        </div>


                        <div className="mt-3 flex justify-between text-sm">

                            <span className="text-gray-600">
                                Shipping
                            </span>

                            <span className="font-semibold">
                                Calculated at checkout
                            </span>

                        </div>


                        <div className="my-6 border-t" />


                        <div className="flex justify-between">

                            <span className="font-bold">
                                Total
                            </span>

                            <span className="text-xl font-bold">
                                ₹{subtotal.toLocaleString("en-IN")}
                            </span>

                        </div>


                        {hasStockIssue ? (
                            <button
                                type="button"
                                disabled
                                className="mt-6 block w-full cursor-not-allowed rounded-lg bg-gray-300 px-6 py-3 text-center text-sm font-semibold text-gray-500"
                            >
                                Stock Unavailable
                            </button>
                        ) : (
                            <Link
                                to="/checkout"
                                className="mt-6 block rounded-lg bg-black px-6 py-3 text-center text-sm font-semibold text-white hover:bg-gray-800"
                            >
                                Proceed to Checkout
                            </Link>
                        )}

                    </aside>

                </div>

            </div>
        </section>
    );
}

export default Cart;
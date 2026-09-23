import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { getAddresses } from "../../services/addressService";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { fetchCart } from "../../store/cartSlice";

function Checkout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();

  const cartItems = useSelector((state) => state.cart.items);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [addressLoading, setAddressLoading] = useState(true);

  const [paymentMethod, setPaymentMethod] = useState("cod");

  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const shipping = subtotal >= 1000 ? 0 : 50;

  const total = subtotal + shipping;

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  useEffect(() => {
    const fetchSavedAddresses = async () => {
      try {
        setAddressLoading(true);

        const data = await getAddresses();
        const addresses = data.addresses || [];

        setSavedAddresses(addresses);

        const defaultAddress = addresses.find(
          (address) => address.isDefault
        );

        if (defaultAddress) {
          setSelectedAddressId(defaultAddress._id);
        }
      } catch (error) {
        console.error(
          "Failed to fetch saved addresses:",
          error
        );
      } finally {
        setAddressLoading(false);
      }
    };

    fetchSavedAddresses();
  }, []);

  useEffect(() => {
    if (user?.email) {
      setFormData((current) => ({
        ...current,
        email: user.email,
      }));
    }
  }, [user]);

  useEffect(() => {
    if (!selectedAddressId) return;

    const selectedAddress = savedAddresses.find(
      (address) => address._id === selectedAddressId
    );

    if (!selectedAddress) return;

    setFormData((current) => ({
      ...current,
      fullName: selectedAddress.fullName,
      phone: selectedAddress.phone,
      address: selectedAddress.addressLine1,
      city: selectedAddress.city,
      state: selectedAddress.state,
      pincode: selectedAddress.postalCode,
    }));
  }, [selectedAddressId, savedAddresses]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!/^\d{6}$/.test(formData.pincode)) {
      setError("Please enter a valid 6-digit pincode.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    if (submitting) {
      return;
    }

    try {
      setSubmitting(true);

      const response = await api.post("/orders", {
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          addressLine1: formData.address,
          city: formData.city,
          state: formData.state,
          postalCode: formData.pincode,
          country: "India",
        },
        paymentMethod,
      });

      console.log("Order created:", response.data);

      // Refresh cart from backend
      await dispatch(fetchCart()).unwrap();

      // Go to order details
      navigate(`/orders/${response.data.order._id}`);
    } catch (error) {
      console.error("Order creation failed:", error);

      setError(
        error.response?.data?.message ||
        "Unable to place order. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Your Cart is Empty
          </h1>

          <p className="mt-3 text-gray-500">
            Add products before proceeding to checkout.
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
      <div className="mx-auto max-w-7xl px-6">

        {/* Header */}
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            Checkout
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900">
            Complete Your Order
          </h1>
        </div>

        <form onSubmit={handleSubmit}>{error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">

            {/* Left Side */}
            <div className="space-y-8">

              {/* Customer Information */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6">

                <h2 className="text-xl font-bold text-gray-900">
                  Customer Information
                </h2>

                <div className="mt-6 grid gap-5 sm:grid-cols-2">

                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium text-gray-700">
                      Full Name
                    </label>

                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      placeholder="Enter your full name"
                      className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Email
                    </label>

                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="you@example.com"
                      className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Phone Number
                    </label>

                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      placeholder="Enter phone number"
                      className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                    />
                  </div>

                </div>
              </div>

              {/* Saved Addresses */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Saved Addresses
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      Select an address for delivery.
                    </p>
                  </div>
                </div>

                {addressLoading ? (
                  <p className="mt-5 text-sm text-gray-500">
                    Loading saved addresses...
                  </p>
                ) : savedAddresses.length === 0 ? (
                  <p className="mt-5 text-sm text-gray-500">
                    No saved addresses found. You can enter a new address below.
                  </p>
                ) : (
                  <div className="mt-5 space-y-3">
                    {savedAddresses.map((address) => (
                      <label
                        key={address._id}
                        className={`flex cursor-pointer gap-4 rounded-xl border p-4 transition ${selectedAddressId === address._id
                          ? "border-black bg-gray-50"
                          : "border-gray-200 hover:border-gray-400"
                          }`}
                      >
                        <input
                          type="radio"
                          name="savedAddress"
                          value={address._id}
                          checked={selectedAddressId === address._id}
                          onChange={() =>
                            setSelectedAddressId(address._id)
                          }
                          className="mt-1"
                        />

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-gray-900">
                              {address.label}
                            </p>

                            {address.isDefault && (
                              <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                                Default
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-sm font-medium text-gray-800">
                            {address.fullName}
                          </p>

                          <p className="mt-1 text-sm text-gray-600">
                            {address.addressLine1}
                            {address.addressLine2
                              ? `, ${address.addressLine2}`
                              : ""}
                          </p>

                          <p className="text-sm text-gray-600">
                            {address.city}, {address.state} -{" "}
                            {address.postalCode}
                          </p>

                          <p className="mt-1 text-sm text-gray-500">
                            {address.phone}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Shipping Address */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6">

                <h2 className="text-xl font-bold text-gray-900">
                  Delivery Address
                </h2>

                <div className="mt-6 space-y-5">

                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Address
                    </label>

                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      rows="3"
                      placeholder="House no., street, area"
                      className="mt-2 w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                    />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-3">

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        City
                      </label>

                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        State
                      </label>

                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        required
                        className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Pincode
                      </label>

                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleChange}
                        required
                        maxLength="6"
                        placeholder="226001"
                        className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                      />
                    </div>

                  </div>

                </div>
              </div>

              {/* Payment Method */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6">

                <h2 className="text-xl font-bold text-gray-900">
                  Payment Method
                </h2>

                <div className="mt-5">

                  <label className="flex cursor-pointer items-center gap-4 rounded-xl border border-gray-300 p-4">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={(event) =>
                        setPaymentMethod(event.target.value)
                      }
                    />

                    <div>
                      <p className="font-semibold text-gray-900">
                        Cash on Delivery
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        Pay when your order is delivered.
                      </p>
                    </div>
                  </label>

                </div>
              </div>

            </div>

            {/* Right Side */}
            <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-6 lg:sticky lg:top-6">

              <h2 className="text-xl font-bold text-gray-900">
                Order Summary
              </h2>

              {/* Items */}
              <div className="mt-6 space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between gap-4"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {item.name}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Qty: {item.quantity}
                      </p>
                    </div>

                    <p className="text-sm font-semibold">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}
              </div>

              <div className="my-6 border-t" />

              <div className="space-y-3 text-sm">

                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Subtotal
                  </span>

                  <span className="font-semibold">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Shipping
                  </span>

                  <span className="font-semibold">
                    {shipping === 0
                      ? "Free"
                      : `₹${shipping}`}
                  </span>
                </div>

              </div>

              <div className="my-6 border-t" />

              <div className="flex items-center justify-between">
                <span className="text-lg font-bold">
                  Total
                </span>

                <span className="text-2xl font-bold">
                  ₹{total.toLocaleString("en-IN")}
                </span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-6 w-full rounded-lg bg-black px-6 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Placing Order..." : "Place Order"}
              </button>

              <Link
                to="/cart"
                className="mt-3 block text-center text-sm font-medium text-gray-600 hover:text-black"
              >
                ← Back to Cart
              </Link>

            </aside>

          </div>
        </form>

      </div>
    </section>
  );
}

export default Checkout;
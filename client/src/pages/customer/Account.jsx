import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
    getAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
} from "../../services/addressService";
import api from "../../services/api";

function Account() {
    const { user, logout } = useAuth();

    const [editingProfile, setEditingProfile] = useState(false);
    const [profileData, setProfileData] = useState({
        name: user?.name || "",
        phone: user?.phone || "",
    });
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileError, setProfileError] = useState("");
    const [profileSuccess, setProfileSuccess] = useState("");
    const [addresses, setAddresses] = useState([]);
    const [addressLoading, setAddressLoading] = useState(true);
    const [addressError, setAddressError] = useState("");

    const [showAddressForm, setShowAddressForm] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState(null);
    const [addressSubmitting, setAddressSubmitting] = useState(false);

    const [addressForm, setAddressForm] = useState({
        label: "Home",
        fullName: "",
        phone: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "India",
        isDefault: false,
    });

    const handleProfileChange = (event) => {
        const { name, value } = event.target;

        setProfileData((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const handleProfileSubmit = async (event) => {
        event.preventDefault();

        setProfileError("");
        setProfileSuccess("");

        if (!profileData.name.trim()) {
            setProfileError("Name is required.");
            return;
        }

        if (
            profileData.phone &&
            !/^[6-9]\d{9}$/.test(profileData.phone.trim())
        ) {
            setProfileError(
                "Please enter a valid 10-digit phone number."
            );
            return;
        }

        try {
            setProfileLoading(true);

            const response = await api.put("/auth/profile", {
                name: profileData.name.trim(),
                phone: profileData.phone.trim(),
            });

            setProfileSuccess(response.data.message);
            setEditingProfile(false);

            window.location.reload();
        } catch (error) {
            

            setProfileError(
                error.response?.data?.message ||
                "Unable to update profile."
            );
        } finally {
            setProfileLoading(false);
        }
    };
    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                setAddressLoading(true);
                setAddressError("");

                const data = await getAddresses();

                setAddresses(data.addresses || []);
            } catch (error) {
                console.error(
                    "Failed to fetch addresses:",
                    error
                );

                setAddressError(
                    error.response?.data?.message ||
                    "Unable to load addresses."
                );
            } finally {
                setAddressLoading(false);
            }
        };

        fetchAddresses();
    }, []);

    const handleSetDefaultAddress = async (addressId) => {
        try {
            setAddressError("");

            const data = await setDefaultAddress(addressId);

            setAddresses((currentAddresses) =>
                currentAddresses.map((address) => ({
                    ...address,
                    isDefault: address._id === data.address._id,
                }))
            );
        } catch (error) {
            console.error(
                "Failed to set default address:",
                error
            );

            setAddressError(
                error.response?.data?.message ||
                "Unable to set default address."
            );
        }
    };

    const handleDeleteAddress = async (addressId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this address?"
        );

        if (!confirmed) return;

        try {
            setAddressError("");

            await deleteAddress(addressId);

            setAddresses((currentAddresses) =>
                currentAddresses.filter(
                    (address) => address._id !== addressId
                )
            );
        } catch (error) {
            console.error(
                "Failed to delete address:",
                error
            );

            setAddressError(
                error.response?.data?.message ||
                "Unable to delete address."
            );
        }
    };
    const handleAddressChange = (e) => {
        const { name, value, type, checked } = e.target;

        setAddressForm((current) => ({
            ...current,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleAddAddress = () => {
        setEditingAddressId(null);
        setAddressForm({
            label: "Home",
            fullName: "",
            phone: "",
            addressLine1: "",
            addressLine2: "",
            city: "",
            state: "",
            postalCode: "",
            country: "India",
            isDefault: false,
        });
        setAddressError("");
        setShowAddressForm(true);
    };

    const handleEditAddress = (address) => {
        setEditingAddressId(address._id);

        setAddressForm({
            label: address.label || "Home",
            fullName: address.fullName || "",
            phone: address.phone || "",
            addressLine1: address.addressLine1 || "",
            addressLine2: address.addressLine2 || "",
            city: address.city || "",
            state: address.state || "",
            postalCode: address.postalCode || "",
            country: address.country || "India",
            isDefault: address.isDefault || false,
        });

        setAddressError("");
        setShowAddressForm(true);
    };

    const handleAddressSubmit = async (e) => {
        e.preventDefault();

        setAddressError("");

        if (
            !addressForm.fullName.trim() ||
            !addressForm.phone.trim() ||
            !addressForm.addressLine1.trim() ||
            !addressForm.city.trim() ||
            !addressForm.state.trim() ||
            !addressForm.postalCode.trim()
        ) {
            setAddressError("Please fill all required fields.");
            return;
        }

        if (!/^[6-9]\d{9}$/.test(addressForm.phone.trim())) {
            setAddressError("Please enter a valid 10-digit phone number.");
            return;
        }

        if (!/^\d{6}$/.test(addressForm.postalCode.trim())) {
            setAddressError("Please enter a valid 6-digit postal code.");
            return;
        }

        try {
            setAddressSubmitting(true);

            if (editingAddressId) {
                const data = await updateAddress(
                    editingAddressId,
                    addressForm
                );

                setAddresses((currentAddresses) =>
                    currentAddresses.map((address) =>
                        address._id === editingAddressId
                            ? data.address
                            : address
                    )
                );
            } else {
                const data = await createAddress(addressForm);

                setAddresses((currentAddresses) => [
                    ...currentAddresses,
                    data.address,
                ]);
            }

            setShowAddressForm(false);
            setEditingAddressId(null);
        } catch (error) {
            console.error("Failed to save address:", error);

            setAddressError(
                error.response?.data?.message ||
                "Unable to save address."
            );
        } finally {
            setAddressSubmitting(false);
        }
    };

    const handleLogout = async () => {
        await logout();
    };

    return (
        <section className="py-12">
            <div className="mx-auto max-w-4xl px-6">

                {/* Header */}
                <div className="mb-8">
                    <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                        My Account
                    </p>

                    <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900">
                        Welcome, {user?.name}
                    </h1>

                    <p className="mt-2 text-gray-500">
                        Manage your account information.
                    </p>
                </div>

                {/* Profile */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6">
                    <div className="flex items-center justify-between gap-4">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Profile Information
                        </h2>

                        {!editingProfile && (
                            <button
                                type="button"
                                onClick={() => {
                                    setProfileData({
                                        name: user?.name || "",
                                        phone: user?.phone || "",
                                    });
                                    setProfileError("");
                                    setProfileSuccess("");
                                    setEditingProfile(true);
                                }}
                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-900 transition hover:bg-gray-50"
                            >
                                Edit Profile
                            </button>
                        )}
                    </div>

                    {profileSuccess && (
                        <p className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
                            {profileSuccess}
                        </p>
                    )}

                    {profileError && (
                        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                            {profileError}
                        </p>
                    )}

                    {editingProfile ? (
                        <form
                            onSubmit={handleProfileSubmit}
                            className="mt-6 space-y-5"
                        >
                            <div>
                                <label
                                    htmlFor="name"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Full Name
                                </label>

                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    value={profileData.name}
                                    onChange={handleProfileChange}
                                    required
                                    className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Email
                                </label>

                                <input
                                    id="email"
                                    type="email"
                                    value={user?.email || ""}
                                    disabled
                                    className="mt-2 w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-500"
                                />

                                <p className="mt-1 text-xs text-gray-500">
                                    Email cannot be changed here.
                                </p>
                            </div>

                            <div>
                                <label
                                    htmlFor="phone"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Phone
                                </label>

                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    value={profileData.phone}
                                    onChange={handleProfileChange}
                                    maxLength={10}
                                    className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
                                />
                            </div>

                            <div className="flex flex-wrap gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={profileLoading}
                                    className="rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {profileLoading
                                        ? "Saving..."
                                        : "Save Changes"}
                                </button>

                                <button
                                    type="button"
                                    disabled={profileLoading}
                                    onClick={() => {
                                        setEditingProfile(false);
                                        setProfileError("");
                                        setProfileSuccess("");
                                    }}
                                    className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="mt-6 space-y-5">
                            <div>
                                <p className="text-sm text-gray-500">
                                    Full Name
                                </p>

                                <p className="mt-1 font-medium text-gray-900">
                                    {user?.name || "—"}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">
                                    Email
                                </p>

                                <p className="mt-1 font-medium text-gray-900">
                                    {user?.email || "—"}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">
                                    Phone
                                </p>

                                <p className="mt-1 font-medium text-gray-900">
                                    {user?.phone || "Not provided"}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">
                                    Account Type
                                </p>

                                <p className="mt-1 font-medium capitalize text-gray-900">
                                    {user?.role || "customer"}
                                </p>
                            </div>
                        </div>
                    )}

                    {!editingProfile && (
                        <div className="mt-8 border-t border-gray-200 pt-6">
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>

                <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                Saved Addresses
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Manage your saved delivery addresses.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={handleAddAddress}
                            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                        >
                            + Add Address
                        </button>
                    </div>

                    {showAddressForm && (
                        <form
                            onSubmit={handleAddressSubmit}
                            className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-5"
                        >
                            <div className="mb-5 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {editingAddressId ? "Edit Address" : "Add New Address"}
                                </h3>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddressForm(false);
                                        setEditingAddressId(null);
                                        setAddressError("");
                                    }}
                                    className="text-sm font-medium text-gray-600 hover:text-black"
                                >
                                    Cancel
                                </button>
                            </div>

                            {addressError && (
                                <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                                    {addressError}
                                </div>
                            )}

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Address Type
                                    </label>

                                    <select
                                        name="label"
                                        value={addressForm.label}
                                        onChange={handleAddressChange}
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-black"
                                    >
                                        <option value="Home">Home</option>
                                        <option value="Office">Office</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Full Name *
                                    </label>

                                    <input
                                        type="text"
                                        name="fullName"
                                        value={addressForm.fullName}
                                        onChange={handleAddressChange}
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-black"
                                        placeholder="Enter full name"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Phone *
                                    </label>

                                    <input
                                        type="tel"
                                        name="phone"
                                        value={addressForm.phone}
                                        onChange={handleAddressChange}
                                        maxLength={10}
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-black"
                                        placeholder="10-digit mobile number"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Country
                                    </label>

                                    <input
                                        type="text"
                                        name="country"
                                        value={addressForm.country}
                                        onChange={handleAddressChange}
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-black"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Address Line 1 *
                                    </label>

                                    <input
                                        type="text"
                                        name="addressLine1"
                                        value={addressForm.addressLine1}
                                        onChange={handleAddressChange}
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-black"
                                        placeholder="House no., street, area"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Address Line 2
                                    </label>

                                    <input
                                        type="text"
                                        name="addressLine2"
                                        value={addressForm.addressLine2}
                                        onChange={handleAddressChange}
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-black"
                                        placeholder="Landmark, apartment, etc. (optional)"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        City *
                                    </label>

                                    <input
                                        type="text"
                                        name="city"
                                        value={addressForm.city}
                                        onChange={handleAddressChange}
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-black"
                                        placeholder="City"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        State *
                                    </label>

                                    <input
                                        type="text"
                                        name="state"
                                        value={addressForm.state}
                                        onChange={handleAddressChange}
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-black"
                                        placeholder="State"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Postal Code *
                                    </label>

                                    <input
                                        type="text"
                                        name="postalCode"
                                        value={addressForm.postalCode}
                                        onChange={handleAddressChange}
                                        maxLength={6}
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-black"
                                        placeholder="6-digit pincode"
                                    />
                                </div>
                            </div>

                            <label className="mt-5 flex items-center gap-2 text-sm text-gray-700">
                                <input
                                    type="checkbox"
                                    name="isDefault"
                                    checked={addressForm.isDefault}
                                    onChange={handleAddressChange}
                                    className="h-4 w-4"
                                />
                                Set as default address
                            </label>

                            <div className="mt-5">
                                <button
                                    type="submit"
                                    disabled={addressSubmitting}
                                    className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {addressSubmitting
                                        ? "Saving..."
                                        : editingAddressId
                                            ? "Update Address"
                                            : "Save Address"}
                                </button>
                            </div>
                        </form>
                    )}

                    {addressLoading ? (
                        <p className="mt-6 text-sm text-gray-500">
                            Loading addresses...
                        </p>
                    ) : addressError ? (
                        <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                            {addressError}
                        </p>
                    ) : addresses.length === 0 ? (
                        <div className="mt-6 rounded-lg border border-dashed border-gray-300 p-6 text-center">
                            <p className="text-sm text-gray-500">
                                You have no saved addresses.
                            </p>
                        </div>
                    ) : (
                        <div className="mt-6 grid gap-4 md:grid-cols-2">
                            {addresses.map((address) => (
                                <div
                                    key={address._id}
                                    className="rounded-xl border border-gray-200 p-5"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-gray-900">
                                                    {address.label}
                                                </h3>

                                                {address.isDefault && (
                                                    <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                                                        Default
                                                    </span>
                                                )}
                                            </div>

                                            <p className="mt-3 font-medium text-gray-900">
                                                {address.fullName}
                                            </p>

                                            <p className="mt-1 text-sm text-gray-600">
                                                {address.phone}
                                            </p>

                                            <p className="mt-3 text-sm leading-6 text-gray-600">
                                                {address.addressLine1}
                                                {address.addressLine2 &&
                                                    `, ${address.addressLine2}`}
                                                <br />
                                                {address.city}, {address.state}
                                                <br />
                                                {address.postalCode}, {address.country}
                                            </p>
                                        </div>


                                        <div className="flex shrink-0 flex-col gap-2">
                                            {!address.isDefault && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleSetDefaultAddress(address._id)
                                                    }
                                                    className="text-sm font-medium text-gray-700 hover:text-black"
                                                >
                                                    Set Default
                                                </button>
                                            )}

                                            <button
                                                type="button"
                                                onClick={() => handleEditAddress(address)}
                                                className="text-sm font-medium text-gray-700 hover:text-black"
                                            >
                                                Edit
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleDeleteAddress(address._id)
                                                }
                                                className="text-sm font-medium text-red-600 hover:text-red-700"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Orders
                    </h2>

                    <p className="mt-2 text-sm text-gray-500">
                        View your previous orders and track their status.
                    </p>

                    <Link
                        to="/orders"
                        className="mt-5 inline-block rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                    >
                        My Orders
                    </Link>
                </div>

            </div>
        </section>
    );
}

export default Account;
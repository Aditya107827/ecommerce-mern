import { useEffect, useState } from "react";
import api from "../../services/api";

const emptyForm = {
    name: "",
    category: "",
    price: "",
    images: [],
    description: "",
    stock: "",
    featured: false,
};

function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState(emptyForm);

    const [editingId, setEditingId] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [uploadingImage, setUploadingImage] = useState(false);

    // Fetch products
    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/products");

            setProducts(response.data.products || []);
        } catch (error) {
            console.error("Failed to fetch products:", error);

            setError(
                error.response?.data?.message ||
                "Unable to load products"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);


    // Handle input changes
    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;

        setFormData((current) => ({
            ...current,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    // Image Upload Change


    const handleImageUpload = async (event) => {
        const files = Array.from(event.target.files);

        if (files.length === 0) {
            return;
        }

        if (files.length > 6) {
            setError("You can upload a maximum of 6 images.");
            return;
        }

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        for (const file of files) {
            if (!allowedTypes.includes(file.type)) {
                setError(
                    "Please select only JPG, PNG or WebP images."
                );
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                setError(
                    "Each image must be less than 5MB."
                );
                return;
            }
        }

        try {
            setUploadingImage(true);
            setError("");
            setSuccess("");

            const uploadData = new FormData();

            files.forEach((file) => {
                uploadData.append("images", file);
            });

            const response = await api.post(
                "/images/product",
                uploadData
            );

            setFormData((current) => ({
                ...current,
                images: [
                    ...current.images,
                    ...response.data.images,
                ],
            }));

            setSuccess(
                `${response.data.images.length} image(s) uploaded successfully`
            );
        } catch (error) {
            console.error(
                "Failed to upload images:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to upload images"
            );
        } finally {
            setUploadingImage(false);
            event.target.value = "";
        }
    };


    // Reset form
    const resetForm = () => {
        setFormData(emptyForm);
        setEditingId(null);
        setError("");
        setSuccess("");
    };


    // Submit create/update
    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (saving) {
            return;
        }

        try {
            setSaving(true);

            const payload = {
                name: formData.name.trim(),
                category: formData.category.trim(),
                price: Number(formData.price),
                images: formData.images,
                description: formData.description.trim(),
                stock: Number(formData.stock),
                featured: formData.featured,
            };

            if (editingId) {
                await api.put(
                    `/products/${editingId}`,
                    payload
                );

                setSuccess(
                    "Product updated successfully"
                );
            } else {
                await api.post("/products", payload);

                setSuccess(
                    "Product created successfully"
                );
            }

            resetForm();
            await fetchProducts();

        } catch (error) {
            console.error(
                "Failed to save product:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to save product"
            );
        } finally {
            setSaving(false);
        }
    };


    // Start editing
    const handleEdit = (product) => {
        setEditingId(product._id);

        setFormData({
            name: product.name || "",
            category: product.category || "",
            price: product.price ?? "",
            images: product.images || [],
            description: product.description || "",
            stock: product.stock ?? "",
            featured: Boolean(product.featured),
        });

        setError("");
        setSuccess("");

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };


    // Delete product
    const handleDelete = async (productId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this product?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");
            setSuccess("");

            await api.delete(
                `/products/${productId}`
            );

            setProducts((current) =>
                current.filter(
                    (product) =>
                        product._id !== productId
                )
            );

            setSuccess(
                "Product deleted successfully"
            );

        } catch (error) {
            console.error(
                "Failed to delete product:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to delete product"
            );
        }
    };


    return (
        <section className="space-y-8">

            {/* Header */}
            <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                    Admin Panel
                </p>

                <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900">
                    Products
                </h1>

                <p className="mt-2 text-gray-500">
                    Manage your store products, pricing and inventory.
                </p>
            </div>


            {/* Messages */}
            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {success && (
                <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    {success}
                </div>
            )}


            {/* Product Form */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6">

                <div className="flex items-center justify-between gap-4">

                    <h2 className="text-xl font-bold text-gray-900">
                        {editingId
                            ? "Edit Product"
                            : "Add Product"}
                    </h2>

                    {editingId && (
                        <button
                            type="button"
                            onClick={resetForm}
                            className="text-sm font-semibold text-gray-600 hover:text-black"
                        >
                            Cancel Edit
                        </button>
                    )}

                </div>


                <form
                    onSubmit={handleSubmit}
                    className="mt-6 space-y-5"
                >

                    <div className="grid gap-5 sm:grid-cols-2">

                        {/* Name */}
                        <div>
                            <label className="text-sm font-medium text-gray-700">
                                Product Name
                            </label>

                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="Product name"
                                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                            />
                        </div>


                        {/* Category */}
                        <div>
                            <label className="text-sm font-medium text-gray-700">
                                Category
                            </label>

                            <input
                                type="text"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                                placeholder="Electronics"
                                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                            />
                        </div>


                        {/* Price */}
                        <div>
                            <label className="text-sm font-medium text-gray-700">
                                Price
                            </label>

                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                required
                                min="0"
                                step="0.01"
                                placeholder="999"
                                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                            />
                        </div>


                        {/* Stock */}
                        <div>
                            <label className="text-sm font-medium text-gray-700">
                                Stock
                            </label>

                            <input
                                type="number"
                                name="stock"
                                value={formData.stock}
                                onChange={handleChange}
                                required
                                min="0"
                                step="1"
                                placeholder="20"
                                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                            />
                        </div>

                    </div>


                    {/* Product Images */}
                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Product Images
                        </label>

                        <div className="mt-2">
                            {/* Image Previews */}
                            {formData.images.length > 0 && (
                                <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
                                    {formData.images.map((image, index) => (
                                        <div
                                            key={image.publicId || index}
                                            className="relative aspect-square overflow-hidden rounded-xl bg-gray-100"
                                        >
                                            <img
                                                src={image.url}
                                                alt={`Product ${index + 1}`}
                                                className="h-full w-full object-cover"
                                            />

                                            {/* Remove Image */}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setFormData((current) => ({
                                                        ...current,
                                                        images: current.images.filter(
                                                            (_, imageIndex) =>
                                                                imageIndex !== index
                                                        ),
                                                    }));
                                                }}
                                                className="absolute right-2 top-2 rounded-full bg-black px-2 py-1 text-xs font-bold text-white hover:bg-red-600"
                                            >
                                                ×
                                            </button>

                                            {/* Primary Badge */}
                                            {index === 0 && (
                                                <span className="absolute bottom-2 left-2 rounded bg-black px-2 py-1 text-[10px] font-semibold text-white">
                                                    Primary
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Choose Images */}
                            <label
                                htmlFor="product-images"
                                className={`inline-flex cursor-pointer items-center rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 ${uploadingImage
                                    ? "cursor-not-allowed opacity-60"
                                    : ""
                                    }`}
                            >
                                {uploadingImage
                                    ? "Uploading..."
                                    : "Choose Images"}

                                <input
                                    id="product-images"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    multiple
                                    onChange={handleImageUpload}
                                    disabled={uploadingImage}
                                    className="hidden"
                                />
                            </label>

                            <p className="mt-2 text-xs text-gray-500">
                                Select up to 6 images. JPG, PNG or WebP. Maximum 5MB each.
                            </p>

                            {formData.images.length > 0 && (
                                <p className="mt-2 text-xs text-green-600">
                                    {formData.images.length} image(s) uploaded to Cloudinary
                                </p>
                            )}
                        </div>
                    </div>


                    {/* Description */}
                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Description
                        </label>

                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                            placeholder="Product description..."
                            className="mt-2 w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                        />
                    </div>


                    {/* Featured */}
                    <label className="flex cursor-pointer items-center gap-3">

                        <input
                            type="checkbox"
                            name="featured"
                            checked={formData.featured}
                            onChange={handleChange}
                            className="h-4 w-4"
                        />

                        <span className="text-sm font-medium text-gray-700">
                            Featured Product
                        </span>

                    </label>


                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={saving}
                        className="rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {saving
                            ? "Saving..."
                            : editingId
                                ? "Update Product"
                                : "Add Product"}
                    </button>

                </form>

            </div>


            {/* Product List */}
            <div className="rounded-2xl border border-gray-200 bg-white">

                <div className="border-b border-gray-200 p-6">

                    <h2 className="text-xl font-bold text-gray-900">
                        All Products
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        {products.length} product
                        {products.length !== 1 ? "s" : ""}
                    </p>

                </div>


                {loading ? (
                    <div className="p-8 text-center text-gray-500">
                        Loading products...
                    </div>
                ) : products.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No products found.
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">

                        {products.map((product) => (

                            <div
                                key={product._id}
                                className="flex flex-col gap-5 p-6 lg:flex-row lg:items-center lg:justify-between"
                            >

                                {/* Product */}
                                <div className="flex min-w-0 items-center gap-4">

                                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-100">

                                        {product.images?.length > 0 ? (
                                            <img
                                                src={product.images[0].url}
                                                alt={product.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-xs text-gray-400">
                                                No Image
                                            </span>
                                        )}

                                    </div>


                                    <div className="min-w-0">

                                        <h3 className="truncate font-semibold text-gray-900">
                                            {product.name}
                                        </h3>

                                        <p className="mt-1 text-sm text-gray-500">
                                            {product.category}
                                        </p>

                                        <p className="mt-1 font-bold text-gray-900">
                                            ₹{product.price.toLocaleString("en-IN")}
                                        </p>

                                    </div>

                                </div>


                                {/* Stock */}
                                <div className="text-sm">

                                    <p className="text-gray-500">
                                        Stock
                                    </p>

                                    <p
                                        className={`mt-1 font-semibold ${product.stock === 0
                                            ? "text-red-600"
                                            : product.stock <= 5
                                                ? "text-orange-600"
                                                : "text-gray-900"
                                            }`}
                                    >
                                        {product.stock}
                                    </p>

                                </div>


                                {/* Featured */}
                                <div className="text-sm">

                                    <p className="text-gray-500">
                                        Featured
                                    </p>

                                    <p className="mt-1 font-semibold">
                                        {product.featured
                                            ? "Yes"
                                            : "No"}
                                    </p>

                                </div>


                                {/* Actions */}
                                <div className="flex gap-2">

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleEdit(product)
                                        }
                                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                                    >
                                        Edit
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleDelete(
                                                product._id
                                            )
                                        }
                                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                                    >
                                        Delete
                                    </button>

                                </div>

                            </div>

                        ))}

                    </div>
                )}

            </div>

        </section>
    );
}

export default AdminProducts;
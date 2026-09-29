import { useEffect, useState } from "react";
import api from "../../services/api";
import { getProducts } from "../../services/productService";
function AdminSettings() {
    const [heroImage, setHeroImage] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [products, setProducts] = useState([]);
    const [heroSlides, setHeroSlides] = useState([]);
    const [heroSlideFile, setHeroSlideFile] = useState(null);
    const [selectedProductId, setSelectedProductId] = useState("");
    const [heroSlideUploading, setHeroSlideUploading] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await api.get("/store-settings");

                setHeroImage(response.data.heroImage?.url || "");
            } catch (error) {
                console.error("Failed to load store settings");
            } finally {
                setLoading(false);
            }
        };

        const fetchProducts = async () => {
            try {
                const data = await getProducts({
                    limit: 100,
                });

                setProducts(data.products || []);
            } catch (error) {
                console.error("Failed to load products");
            }
        };

        const fetchHeroSlides = async () => {
            try {
                const response = await api.get("/images/hero-slides");

                setHeroSlides(response.data.heroSlides || []);
            } catch (error) {
                console.error("Failed to load hero slides");
            }
        };

        fetchSettings();
        fetchProducts();
        fetchHeroSlides();
    }, []);

    

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        setSelectedFile(file);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            return;
        }

        try {
            setUploading(true);

            const formData = new FormData();
            formData.append("image", selectedFile);

            const response = await api.post(
                "/images/hero",
                formData
            );

            setHeroImage(response.data.heroImage?.url || "");
            setSelectedFile(null);
        } catch (error) {
            console.error("Failed to update hero image");
        } finally {
            setUploading(false);
        }
    };

    const handleHeroSlideUpload = async () => {
        if (!heroSlideFile || !selectedProductId) {
            return;
        }

        try {
            setHeroSlideUploading(true);

            const formData = new FormData();

            formData.append("image", heroSlideFile);
            formData.append("productId", selectedProductId);

            const response = await api.post(
                "/images/hero-slide",
                formData
            );

            setHeroSlides((prev) => [
                ...prev,
                response.data.heroSlide,
            ]);

            setHeroSlideFile(null);
            setSelectedProductId("");

        } catch (error) {
            console.error(
                "Failed to upload hero slide:",
                error
            );
        } finally {
            setHeroSlideUploading(false);
        }
    };

    return (
        <div className="space-y-8">

            {/* Header */}
            <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                    Store Settings
                </p>

                <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
                    Manage Store
                </h1>

                <p className="mt-2 text-sm text-gray-600">
                    Update the hero image displayed on your homepage.
                </p>
            </div>

            {/* Hero Image Card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

                <h2 className="text-lg font-semibold text-gray-900">
                    Hero Image
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                    This image will appear in the main hero section of the
                    homepage.
                </p>

                {/* Current Image */}
                <div className="mt-6">
                    <p className="mb-3 text-sm font-medium text-gray-700">
                        Current Hero Image
                    </p>

                    <div className="aspect-video w-full max-w-4xl overflow-hidden rounded-xl bg-gray-100">
                        {loading ? (
                            <div className="h-full w-full animate-pulse bg-gray-200" />
                        ) : heroImage ? (
                            <img
                                src={heroImage}
                                alt="Current hero"
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center text-sm text-gray-400">
                                No hero image uploaded
                            </div>
                        )}
                    </div>
                </div>

                {/* Upload */}
                <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700">
                        Choose New Image
                    </label>

                    <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleFileChange}
                        className="mt-2 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                    />
                </div>

                {/* Selected File */}
                {selectedFile && (
                    <p className="mt-3 text-sm text-gray-600">
                        Selected: {selectedFile.name}
                    </p>
                )}

                {/* Upload Button */}
                <button
                    type="button"
                    onClick={handleUpload}
                    disabled={!selectedFile || uploading}
                    className="mt-6 rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {uploading ? "Uploading..." : "Upload / Change Hero Image"}
                </button>

            </div>

            {/* Hero Slider */}
            {/* Hero Slider */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

                <h2 className="text-lg font-semibold text-gray-900">
                    Hero Slider
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                    Manage the images displayed in the homepage hero slider.
                </p>

                {/* Add Hero Slide */}
                <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-5">

                    <h3 className="text-base font-semibold text-gray-900">
                        Add New Slide
                    </h3>

                    <div className="mt-4 grid gap-4 md:grid-cols-2">

                        {/* Image */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Slide Image
                            </label>

                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={(e) =>
                                    setHeroSlideFile(e.target.files?.[0] || null)
                                }
                                className="mt-2 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                            />
                        </div>

                        {/* Product */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Linked Product
                            </label>

                            <select
                                value={selectedProductId}
                                onChange={(e) => setSelectedProductId(e.target.value)}
                                className="mt-2 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                            >
                                <option value="">
                                    Select a product
                                </option>

                                {products.map((product) => (
                                    <option
                                        key={product._id}
                                        value={product._id}
                                    >
                                        {product.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                    </div>

                    <button
                        type="button"
                        onClick={handleHeroSlideUpload}
                        disabled={
                            !heroSlideFile ||
                            !selectedProductId ||
                            heroSlideUploading ||
                            heroSlides.length >= 5
                        }
                        className="mt-5 rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {heroSlideUploading
                            ? "Uploading..."
                            : "Add Hero Slide"}
                    </button>

                    {heroSlides.length >= 5 && (
                        <p className="mt-3 text-sm text-red-600">
                            Maximum 5 hero slides are allowed.
                        </p>
                    )}

                </div>

                {/* Existing Slides */}
                {heroSlides.length === 0 ? (
                    <div className="mt-6 rounded-xl border border-dashed border-gray-300 px-6 py-10 text-center">
                        <p className="text-sm text-gray-500">
                            No hero slides added yet.
                        </p>
                    </div>
                ) : (
                    <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

                        {heroSlides.map((slide, index) => (

                            <div
                                key={slide._id}
                                className="overflow-hidden rounded-xl border border-gray-200 bg-white"
                            >

                                <div className="aspect-video bg-gray-100">
                                    <img
                                        src={slide.image?.url}
                                        alt={`Hero slide ${index + 1}`}
                                        className="h-full w-full object-cover"
                                    />
                                </div>

                                <div className="p-4">

                                    <p className="text-sm font-semibold text-gray-900">
                                        Slide {index + 1}
                                    </p>

                                    <p className="mt-1 text-xs text-gray-500">
                                        Product:{" "}
                                        {products.find(
                                            (product) =>
                                                product._id === slide.productId
                                        )?.name || "Product not found"}
                                    </p>

                                </div>

                            </div>

                        ))}

                    </div>
                )}

            </div>
        </div>
    );
}

export default AdminSettings;
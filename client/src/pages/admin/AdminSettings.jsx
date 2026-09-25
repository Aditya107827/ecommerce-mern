import { useEffect, useState } from "react";
import api from "../../services/api";

function AdminSettings() {
    const [heroImage, setHeroImage] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

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

        fetchSettings();
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
        </div>
    );
}

export default AdminSettings;
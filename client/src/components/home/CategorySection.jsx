import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { categories } from "../../constants/categories";
import { getProducts } from "../../services/productService";

function CategorySection() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategoryProducts = async () => {
            try {
                const data = await getProducts({
                    limit: 50,
                });

                setProducts(data.products || []);
            } catch (error) {
                console.error("Failed to load category images");
            } finally {
                setLoading(false);
            }
        };

        fetchCategoryProducts();
    }, []);

    return (
        <section className="bg-white py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-6">

                {/* Section Header */}
                <div className="mb-10">
                    <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                        Shop by category
                    </p>

                    <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        Find something you'll love
                    </h2>

                    <p className="mt-3 max-w-xl text-sm leading-6 text-gray-600 sm:text-base">
                        Browse our collection by category and discover
                        products that match your style.
                    </p>
                </div>

                {/* Categories */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {categories.map((category) => {
                        const categoryProduct = products.find(
                            (product) => product.category === category.id
                        );

                        const imageUrl =
                            categoryProduct?.images?.[0]?.url ||
                            categoryProduct?.image ||
                            "";

                        return (
                            <Link
                                key={category.id}
                                to={`/products?category=${category.id}`}
                                className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-gray-300 hover:shadow-lg"
                            >
                                {/* Category Image */}
                                <div className="h-44 overflow-hidden bg-gray-100">
                                    {loading ? (
                                        <div className="h-full w-full animate-pulse bg-gray-200" />
                                    ) : imageUrl ? (
                                        <img
                                            src={imageUrl}
                                            alt={category.name}
                                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center">
                                            <span className="text-4xl font-bold text-gray-300">
                                                {category.name.charAt(0)}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {category.name}
                                    </h3>

                                    <p className="mt-2 text-sm leading-6 text-gray-600">
                                        {category.description}
                                    </p>

                                    <span className="mt-5 inline-flex items-center text-sm font-semibold text-gray-900">
                                        Explore
                                        <span className="ml-1 transition-transform duration-300 group-hover:translate-x-1">
                                            →
                                        </span>
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </div>

            </div>
        </section>
    );
}

export default CategorySection;
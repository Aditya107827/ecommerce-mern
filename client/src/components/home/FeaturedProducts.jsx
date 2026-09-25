import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import ProductCard from "../product/ProductCard";
import { getProducts } from "../../services/productService";

function FeaturedProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeaturedProducts = async () => {
            try {
                const data = await getProducts({
                    limit: 50,
                });

                const featured = (data.products || [])
                    .filter((product) => product.featured === true)
                    .slice(0, 4);

                setProducts(featured);
            } catch (error) {
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchFeaturedProducts();
    }, []);

    return (
        <section className="bg-gray-50 py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-6">

                {/* Section Header */}
                <div className="mb-10 flex items-end justify-between gap-4">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                            Featured
                        </p>

                        <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            Our popular products
                        </h2>

                        <p className="mt-3 max-w-xl text-sm leading-6 text-gray-600 sm:text-base">
                            Explore some of our most popular products,
                            carefully selected for you.
                        </p>
                    </div>

                    <Link
                        to="/products"
                        className="hidden shrink-0 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-gray-100 sm:block"
                    >
                        View all →
                    </Link>
                </div>

                {/* Products */}
                {loading ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {[1, 2, 3, 4].map((item) => (
                            <div
                                key={item}
                                className="h-80 animate-pulse rounded-2xl bg-gray-200"
                            />
                        ))}
                    </div>
                ) : products.length > 0 ? (
                    <>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {products.map((product) => (
                                <ProductCard
                                    key={product._id}
                                    product={{
                                        ...product,
                                        id: product._id,
                                    }}
                                />
                            ))}
                        </div>

                        {/* Mobile View All */}
                        <div className="mt-8 text-center sm:hidden">
                            <Link
                                to="/products"
                                className="inline-flex rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-100"
                            >
                                View all products →
                            </Link>
                        </div>
                    </>
                ) : (
                    <div className="rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center">
                        <h3 className="text-lg font-semibold text-gray-900">
                            No featured products yet
                        </h3>

                        <p className="mt-2 text-sm text-gray-500">
                            Check back soon for our featured products.
                        </p>

                        <Link
                            to="/products"
                            className="mt-5 inline-flex rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                        >
                            Browse all products
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
}

export default FeaturedProducts;
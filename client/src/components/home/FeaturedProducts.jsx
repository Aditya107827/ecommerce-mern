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

                const featured = (data.products || []).filter(
                    (product) => product.featured === true
                );

                setProducts(featured);
            } catch (error) {
                console.error(
                    "Failed to fetch featured products:",
                    error
                );
            } finally {
                setLoading(false);
            }
        };

        fetchFeaturedProducts();
    }, []);

    return (
        <section className="bg-gray-50 py-16">
            <div className="mx-auto max-w-7xl px-6">

                <div className="mb-10 flex items-end justify-between gap-4">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                            Featured
                        </p>

                        <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
                            Our popular products
                        </h2>
                    </div>

                    <Link
                        to="/products"
                        className="hidden text-sm font-semibold text-gray-900 sm:block"
                    >
                        View all →
                    </Link>
                </div>

                {loading ? (
                    <div className="py-10 text-center text-gray-500">
                        Loading featured products...
                    </div>
                ) : (
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
                )}

            </div>
        </section>
    );
}

export default FeaturedProducts;
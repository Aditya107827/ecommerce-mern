import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import ProductCard from "../../components/product/ProductCard";
import { getProducts, getCategories } from "../../services/productService";

function Products() {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("newest");

    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalProducts: 0,
        limit: 12,
        hasNextPage: false,
        hasPreviousPage: false,
    });
    const [page, setPage] = useState(1);

    const [searchParams] = useSearchParams();

    const categoryFromUrl = searchParams.get("category");

    const [category, setCategory] = useState(
        categoryFromUrl || "all"
    );

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        setPage(1);
    }, [search, category, sort]);


    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getCategories();

                setCategories([
                    "all",
                    ...(data.categories || []),
                ]);
            } catch (error) {
                console.error(
                    "Failed to fetch categories:",
                    error
                );
            }
        };

        fetchCategories();
    }, []);

    // Fetch products from backend
    useEffect(() => {
        const timer = setTimeout(async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getProducts({
                    search,
                    category,
                    page,
                    limit: 12,
                    sort,
                });

                setProducts(data.products || []);

                setPagination(
                    data.pagination || {
                        currentPage: 1,
                        totalPages: 1,
                        totalProducts: 0,
                        limit: 12,
                        hasNextPage: false,
                        hasPreviousPage: false,
                    }
                );
            } catch (error) {
                console.error(
                    "Failed to fetch products:",
                    error
                );

                setError("Unable to load products.");
            } finally {
                setLoading(false);
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [search, category, page, sort]);

    // Categories from MongoDB products
    const [categories, setCategories] = useState(["all"]);



    return (
        <section className="py-12">
            <div className="mx-auto max-w-7xl px-6">

                {/* Header */}
                <div className="mb-8">
                    <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                        Shop
                    </p>

                    <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900">
                        All Products
                    </h1>
                </div>

                {/* Filters */}
                <div className="mb-8 flex flex-col gap-4 md:flex-row">

                    <input
                        type="search"
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                        placeholder="Search products..."
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black md:max-w-md"
                    />

                    <select
                        value={category}
                        onChange={(event) =>
                            setCategory(event.target.value)
                        }
                        className="rounded-lg border border-gray-300 px-4 py-3 outline-none"
                    >
                        {categories.map((item) => (
                            <option key={item} value={item}>
                                {item === "all"
                                    ? "All Categories"
                                    : item}
                            </option>
                        ))}
                    </select>

                    <select
                        value={sort}
                        onChange={(event) =>
                            setSort(event.target.value)
                        }
                        className="rounded-lg border border-gray-300 px-4 py-3 outline-none"
                    >
                        <option value="newest">
                            Newest
                        </option>

                        <option value="price_asc">
                            Price: Low to High
                        </option>

                        <option value="price_desc">
                            Price: High to Low
                        </option>
                    </select>

                </div>

                {/* Loading */}
                {loading && (
                    <div className="py-20 text-center">
                        <p className="text-gray-500">
                            Loading products...
                        </p>
                    </div>
                )}

                {/* Error */}
                {!loading && error && (
                    <div className="py-20 text-center">
                        <h2 className="text-xl font-semibold text-red-600">
                            {error}
                        </h2>
                    </div>
                )}

                {/* Products */}
                {!loading && !error && (
                    <>
                        <p className="mb-6 text-sm text-gray-500">
                            {pagination.totalProducts} product
                            {pagination.totalProducts !== 1
                                ? "s"
                                : ""}{" "}
                            found
                        </p>

                        {products.length > 0 ? (
                            <>
                                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                    {products.map(
                                        (product) => (
                                            <ProductCard
                                                key={
                                                    product._id ||
                                                    product.id
                                                }
                                                product={{
                                                    ...product,
                                                    id:
                                                        product._id ||
                                                        product.id,
                                                }}
                                            />
                                        )
                                    )}
                                </div>
                                {pagination.totalPages > 1 && (
                                    <div className="mt-10 flex items-center justify-center gap-4">
                                        <button
                                            type="button"
                                            disabled={!pagination.hasPreviousPage}
                                            onClick={() =>
                                                setPage((currentPage) => currentPage - 1)
                                            }
                                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            Previous
                                        </button>

                                        <span className="text-sm font-medium text-gray-600">
                                            Page {pagination.currentPage} of{" "}
                                            {pagination.totalPages}
                                        </span>

                                        <button
                                            type="button"
                                            disabled={!pagination.hasNextPage}
                                            onClick={() =>
                                                setPage((currentPage) => currentPage + 1)
                                            }
                                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </>

                        ) : (
                            <div className="py-20 text-center">
                                <h2 className="text-xl font-semibold">
                                    No products found
                                </h2>

                                <p className="mt-2 text-sm text-gray-500">
                                    Try a different search or
                                    category.
                                </p>
                            </div>
                        )}
                    </>
                )}

            </div>
        </section>
    );
}

export default Products;
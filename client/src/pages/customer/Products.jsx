import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SearchX } from "lucide-react";
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
        setCategory(categoryFromUrl || "all");
    }, [categoryFromUrl]);


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
                {/* Filters */}
                <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">

                        {/* Search */}
                        <div className="relative flex-1">
                            <Search
                                size={18}
                                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                            />

                            <input
                                type="search"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search products..."
                                className="w-full rounded-xl border border-gray-300 bg-gray-50 py-3 pl-11 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:bg-white focus:ring-2 focus:ring-gray-100"
                            />
                        </div>

                        {/* Category */}
                        <select
                            value={category}
                            onChange={(event) => setCategory(event.target.value)}
                            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:bg-white focus:ring-2 focus:ring-gray-100 sm:w-auto"
                        >
                            {categories.map((item) => (
                                <option key={item} value={item}>
                                    {item === "all" ? "All Categories" : item}
                                </option>
                            ))}
                        </select>

                        {/* Sort */}
                        <select
                            value={sort}
                            onChange={(event) => setSort(event.target.value)}
                            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:bg-white focus:ring-2 focus:ring-gray-100 sm:w-auto"
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
                </div>

                {/* Loading */}
                {/* Loading */}
                {loading && (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {Array.from({ length: 8 }).map((_, index) => (
                            <div
                                key={index}
                                className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
                            >
                                <div className="h-64 animate-pulse bg-gray-200" />

                                <div className="space-y-3 p-5">
                                    <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
                                    <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200" />
                                    <div className="h-5 w-24 animate-pulse rounded bg-gray-200" />

                                    <div className="mt-5 h-11 w-full animate-pulse rounded-lg bg-gray-200" />
                                </div>
                            </div>
                        ))}
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
                                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
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
                            <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 text-center">
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
                                    <SearchX
                                        size={26}
                                        className="text-gray-400"
                                    />
                                </div>

                                <h2 className="mt-5 text-xl font-semibold text-gray-900">
                                    No products found
                                </h2>

                                <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
                                    We couldn't find any products matching your search or selected category.
                                    Try changing your filters or browse all products.
                                </p>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearch("");
                                        setCategory("all");
                                        setPage(1);
                                    }}
                                    className="mt-6 rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                                >
                                    View All Products
                                </button>
                            </div>
                        )}
                    </>
                )}

            </div>
        </section>
    );
}

export default Products;
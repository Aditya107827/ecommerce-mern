import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SearchX, SlidersHorizontal, X } from "lucide-react";
import ProductCard from "../../components/product/ProductCard";
import { getProducts, getCategories } from "../../services/productService";


function ProductReveal({ children, delay = 0 }) {
    const cardRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const element = cardRef.current;

        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(element);
                }
            },
            {
                threshold: 0.12,
                rootMargin: "0px 0px -40px 0px",
            }
        );

        observer.observe(element);

        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={cardRef}
            style={{ transitionDelay: `${delay}ms` }}
            className={`transform transition-all duration-500 ease-out ${isVisible
                ? "translate-y-0 scale-100 opacity-100"
                : "translate-y-6 scale-[0.98] opacity-0"
                }`}
        >
            {children}
        </div>
    );
}

function Products() {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("newest");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalProducts: 0,
        limit: 16,
        hasNextPage: false,
        hasPreviousPage: false,
    });
    const [page, setPage] = useState(1);

    const [searchParams] = useSearchParams();

    const categoryFromUrl = searchParams.get("category");

    const [category, setCategory] = useState(
        categoryFromUrl || "all"
    );

    const [mobileCategory, setMobileCategory] = useState(
        categoryFromUrl || "all"
    );

    const [mobileMinPrice, setMobileMinPrice] = useState("");

    const [mobileMaxPrice, setMobileMaxPrice] = useState("");

    const activeFilterCount =
        (category !== "all" ? 1 : 0) +
        (minPrice !== "" || maxPrice !== "" ? 1 : 0);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        setPage(1);
    }, [search, category, sort, minPrice, maxPrice]);

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
                    ...(minPrice !== "" && { minPrice }),
                    ...(maxPrice !== "" && { maxPrice }),
                    page,
                    limit: 16,
                    sort,
                });

                setProducts(data.products || []);

                setPagination(
                    data.pagination || {
                        currentPage: 1,
                        totalPages: 1,
                        totalProducts: 0,
                        limit: 16,
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
        }, 900);

        return () => clearTimeout(timer);
    }, [search, category, page, sort, minPrice, maxPrice]);

    // Categories from MongoDB products
    const [categories, setCategories] = useState(["all"]);



    return (
        <section className="pt-4 pb-12 bg-[#F7F3E8]">
            <div className="mx-auto max-w-[1440px] px-4 sm:px-5 lg:px-4">

                {/* Page Header */}
                <div className="mb-8">


                    <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        {/* Title */}
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                            All Products
                        </h1>

                        {/* Search + Mobile Filters + Sort */}
                        <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-center lg:w-auto">
                            {/* Search */}
                            <div className="relative w-full lg:w-[320px]">
                                <Search
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search products..."
                                    className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-10 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                                />

                                {search && (
                                    <button
                                        type="button"
                                        onClick={() => setSearch("")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-700"
                                        aria-label="Clear search"
                                    >
                                        <SearchX size={17} />
                                    </button>
                                )}
                            </div>

                            {/* Mobile Filter + Sort */}
                            <div className="flex w-full gap-3 lg:w-auto">
                                {/* Filter Button - Mobile Only */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMobileCategory(category);
                                        setMobileMinPrice(minPrice);
                                        setMobileMaxPrice(maxPrice);
                                        setIsFilterOpen(true);
                                    }}
                                    className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50 lg:hidden"
                                >
                                    <SlidersHorizontal size={17} />

                                    <span>Filter</span>

                                    {activeFilterCount > 0 && (
                                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gray-900 px-1.5 text-[11px] font-semibold text-white">
                                            {activeFilterCount}
                                        </span>
                                    )}
                                </button>

                                {/* Sort */}
                                <select
                                    value={sort}
                                    onChange={(e) => setSort(e.target.value)}
                                    className="h-11 flex-1 rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-700 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100 lg:flex-none"
                                >
                                    <option value="newest">Newest</option>
                                    <option value="price_asc">
                                        Price: Low to High
                                    </option>
                                    <option value="price_desc">
                                        Price: High to Low
                                    </option>
                                    <option value="name_asc">
                                        Name: A-Z
                                    </option>
                                    <option value="name_desc">
                                        Name: Z-A
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

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
                        {/* Shop Content */}
                        <div className="flex flex-col gap-8 lg:flex-row">

                            {/* Desktop Category Sidebar */}
                            <aside className="hidden w-56 shrink-0 lg:block">
                                <div className="sticky top-24 rounded-2xl border border-gray-200 bg-white p-5">
                                    <h2 className="text-[15px] font-semibold text-gray-900">
                                        Categories
                                    </h2>

                                    <div className="mt-4 space-y-1">
                                        {categories.map((item) => {
                                            const isActive = category === item;

                                            return (
                                                <button
                                                    key={item}
                                                    type="button"
                                                    onClick={() => setCategory(item)}
                                                    className={`w-full rounded-lg px-3 py-2.5 text-left text-[14px] font-medium leading-5 transition ${isActive
                                                        ? "bg-gray-900 font-semibold text-white"
                                                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                                        }`}
                                                >
                                                    {item === "all"
                                                        ? "All Products"
                                                        : item}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <div className="mt-8 border-t border-gray-200 pt-6">
                                        <h3 className="text-[15px] font-semibold text-gray-900">
                                            Price Range
                                        </h3>

                                        <div className="mt-4 grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="mb-1 block text-xs text-gray-500">
                                                    Min Price
                                                </label>

                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={minPrice}
                                                    onChange={(e) => setMinPrice(e.target.value)}
                                                    placeholder="₹0"
                                                    className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-1 block text-xs text-gray-500">
                                                    Max Price
                                                </label>

                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={maxPrice}
                                                    onChange={(e) => setMaxPrice(e.target.value)}
                                                    placeholder="₹5000"
                                                    className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                                                />
                                            </div>
                                        </div>

                                        {(minPrice || maxPrice) && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setMinPrice("");
                                                    setMaxPrice("");
                                                }}
                                                className="mt-3 text-xs font-medium text-gray-500 hover:text-gray-900"
                                            >
                                                Clear price filter
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </aside>

                            {/* Products Area */}
                            <div className="min-w-0 flex-1">

                                {/* Product Count */}
                                <p className="mb-6 text-sm text-gray-500">
                                    {pagination.totalProducts} product
                                    {pagination.totalProducts !== 1
                                        ? "s"
                                        : ""}{" "}
                                    found
                                </p>

                                {products.length > 0 ? (
                                    <>
                                        {/* Product Grid */}
                                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                                            {products.map((product, index) => (
                                                <ProductReveal
                                                    key={product._id || product.id}
                                                    delay={(index % 4) * 80}
                                                >
                                                    <ProductCard
                                                        product={{
                                                            ...product,
                                                            id: product._id || product.id,
                                                        }}
                                                    />
                                                </ProductReveal>
                                            ))}
                                        </div>

                                        {/* Pagination */}
                                        {pagination.totalPages > 1 && (
                                            <div className="mt-10 flex items-center justify-center gap-4">
                                                <button
                                                    type="button"
                                                    disabled={!pagination.hasPreviousPage}
                                                    onClick={() =>
                                                        setPage(
                                                            (currentPage) =>
                                                                currentPage - 1
                                                        )
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
                                                        setPage(
                                                            (currentPage) =>
                                                                currentPage + 1
                                                        )
                                                    }
                                                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                                                >
                                                    Next
                                                </button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    /* Empty State */
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
                                            We couldn't find any products matching your
                                            search or selected category. Try changing
                                            your filters or browse all products.
                                        </p>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSearch("");
                                                setCategory("all");
                                                setMinPrice("");
                                                setMaxPrice("");
                                                setPage(1);
                                            }}
                                            className="mt-6 rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                                        >
                                            View All Products
                                        </button>
                                    </div>
                                )}

                            </div>
                        </div>
                    </>
                )}

            </div>

            {/* Mobile Filter Drawer */}
            {isFilterOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    {/* Overlay */}
                    <button
                        type="button"
                        aria-label="Close filters"
                        onClick={() => setIsFilterOpen(false)}
                        className="absolute inset-0 bg-black/40"
                    />

                    {/* Drawer */}
                    <div className="absolute bottom-0 left-0 right-0 flex h-[85vh] flex-col overflow-hidden rounded-t-3xl bg-white px-5 pt-4 shadow-2xl">
                        {/* Drawer Header */}
                        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Filters
                                </h2>
                                <p className="mt-1 text-xs text-gray-500">
                                    Refine your product search
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsFilterOpen(false)}
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-gray-200 hover:text-gray-900"
                                aria-label="Close filters"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Scrollable Filter Content */}
                        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                            {/* Categories */}
                            <div className="pt-5">
                                <h3 className="text-sm font-semibold text-gray-900">
                                    Categories
                                </h3>

                                <div className="mt-3 space-y-1">
                                    {categories.map((item) => {
                                        const isActive = mobileCategory === item;

                                        return (
                                            <button
                                                key={item}
                                                type="button"
                                                onClick={() => setMobileCategory(item)}
                                                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${isActive
                                                    ? "bg-gray-900 font-medium text-white"
                                                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                                    }`}
                                            >
                                                <span
                                                    className={`flex h-4 w-4 items-center justify-center rounded-full border ${isActive
                                                        ? "border-white"
                                                        : "border-gray-300"
                                                        }`}
                                                >
                                                    {isActive && (
                                                        <span className="h-2 w-2 rounded-full bg-white" />
                                                    )}
                                                </span>

                                                {item === "all"
                                                    ? "All Products"
                                                    : item}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Price Range */}
                            <div className="mt-6 border-t border-gray-200 pt-5">
                                <h3 className="text-sm font-semibold text-gray-900">
                                    Price Range
                                </h3>

                                <div className="mt-4 grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="mb-1 block text-xs text-gray-500">
                                            Min Price
                                        </label>

                                        <input
                                            type="number"
                                            min="0"
                                            value={mobileMinPrice}
                                            onChange={(e) =>
                                                setMobileMinPrice(e.target.value)
                                            }
                                            placeholder="₹0"
                                            className="h-11 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-xs text-gray-500">
                                            Max Price
                                        </label>

                                        <input
                                            type="number"
                                            min="0"
                                            value={mobileMaxPrice}
                                            onChange={(e) =>
                                                setMobileMaxPrice(e.target.value)
                                            }
                                            placeholder="₹5000"
                                            className="h-11 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>



                        {/* Sticky Actions */}
                        <div className="mt-4 flex shrink-0 gap-3 border-t border-gray-200 bg-white pt-4 pb-5">
                            <button
                                type="button"
                                onClick={() => {
                                    setMobileCategory("all");
                                    setMobileMinPrice("");
                                    setMobileMaxPrice("");
                                }}
                                className="h-11 flex-1 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                            >
                                Clear Filters
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setCategory(mobileCategory);
                                    setMinPrice(mobileMinPrice);
                                    setMaxPrice(mobileMaxPrice);
                                    setIsFilterOpen(false);
                                }}
                                className="h-11 flex-1 rounded-xl bg-gray-900 text-sm font-semibold text-white transition hover:bg-gray-800"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

export default Products;
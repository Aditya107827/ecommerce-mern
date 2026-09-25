import { Heart, ShoppingCart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";
import {
    addProductToWishlist,
    removeProductFromWishlist,
} from "../../store/wishlistSlice";

import { addProductToCart } from "../../store/cartSlice";


function ProductCard({ product }) {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useAuth();
    

    const wishlistItems = useSelector(
        (state) => state.wishlist.items
    );

    const wishlistLoading = useSelector(
        (state) => state.wishlist.loading
    );

    const isWishlisted = wishlistItems.some(
        (item) => item.id === product.id
    );

    const imageUrl =
        product.images?.[0]?.url ||
        product.image ||
        "";


    return (
        <article className="group overflow-hidden rounded-2xl border border-gray-200 bg-white">

            {/* Product Image */}
            <div className="relative h-64 overflow-hidden bg-gray-100">

                <Link
                    to={`/products/${product.id}`}
                    className="block h-full w-full"
                >
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={product.name}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                            loading="lazy"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center">
                            <span className="text-sm text-gray-400">
                                Product Image
                            </span>
                        </div>
                    )}
                </Link>

                {/* Wishlist Button */}
                <button
                    type="button"
                    disabled={wishlistLoading}
                    aria-label={
                        isWishlisted
                            ? `Remove ${product.name} from wishlist`
                            : `Add ${product.name} to wishlist`
                    }
                    onClick={() => {
                        if (!user) {
                            toast.error("Please login to manage your wishlist.");
                            navigate("/login", {
                                state: {
                                    from: {
                                        pathname: `/products/${product.id}`,
                                    },
                                },
                            });
                            return;
                        }

                        if (isWishlisted) {
                            dispatch(
                                removeProductFromWishlist(product.id)
                            );
                        } else {
                            dispatch(
                                addProductToWishlist(product.id)
                            );
                        }
                    }}
                    className="absolute right-4 top-4 rounded-full bg-white p-2 shadow-sm transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <Heart
                        size={18}
                        fill={
                            isWishlisted
                                ? "currentColor"
                                : "none"
                        }
                    />
                </button>

            </div>


            {/* Product Information */}
            <div className="p-5">

                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    {product.category
                        ?.replace(/-/g, " ")
                        .toUpperCase()}
                </p>


                <Link
                    to={`/products/${product.id}`}
                    className="mt-2 block text-lg font-semibold text-gray-900 hover:underline"
                >
                    {product.name}
                </Link>


                <p className="mt-2 text-lg font-bold text-gray-900">
                    ₹{product.price.toLocaleString("en-IN")}
                </p>


                <button
                    type="button"
                    onClick={() => {
                        if (!user) {
                            toast.error("Please login to add products to your cart.");
                            navigate("/login", {
                                state: {
                                    from: {
                                        pathname: `/products/${product.id}`,
                                    },
                                },
                            });
                            return;
                        }

                        dispatch(
                            addProductToCart({
                                productId: product.id,
                                quantity: 1,
                            })
                        );
                    }}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                >

                    <ShoppingCart size={18} />

                    Add to Cart

                </button>

            </div>

        </article>
    );
}

export default ProductCard;
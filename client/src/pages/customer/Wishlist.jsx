import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";

import {
  fetchWishlist,
  removeProductFromWishlist,
} from "../../store/wishlistSlice";

import { addProductToCart } from "../../store/cartSlice";

function Wishlist() {
  const dispatch = useDispatch();

  const wishlistItems = useSelector(
    (state) => state.wishlist.items
  );

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);


  if (wishlistItems.length === 0) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center px-6">
        <div className="text-center">
          <Heart className="mx-auto" size={40} />

          <h1 className="mt-4 text-3xl font-bold text-gray-900">
            Your Wishlist is Empty
          </h1>

          <p className="mt-3 text-gray-500">
            Save products you love and find them here later.
          </p>

          <Link
            to="/products"
            className="mt-6 inline-block rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white"
          >
            Explore Products
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <div className="mx-auto max-w-7xl px-6">

        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            Saved Products
          </p>

          <h1 className="mt-2 text-4xl font-bold text-gray-900">
            My Wishlist
          </h1>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {wishlistItems.map((product) => (
            <article
              key={product.id}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
            >
              
              {/* Image */}
              <Link
                to={`/products/${product.id}`}
                className="block h-64 overflow-hidden bg-gray-100"
              >
                {product.images?.[0]?.url || product.image ? (
                  <img
                    src={product.images?.[0]?.url || product.image}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="text-sm text-gray-400">
                      Product Image
                    </span>
                  </div>
                )}
              </Link>

              {/* Details */}
              <div className="p-5">

                <Link
                  to={`/products/${product.id}`}
                  className="text-lg font-semibold text-gray-900 hover:underline"
                >
                  {product.name}
                </Link>

                <p className="mt-2 font-bold">
                  ₹{product.price.toLocaleString("en-IN")}
                </p>

                <div className="mt-5 flex gap-2">

                  <button
                    type="button"
                    onClick={() =>
                      dispatch(
                        addProductToCart({
                          productId: product.id,
                          quantity: 1,
                        })
                      )
                    }
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white"
                  >
                    <ShoppingCart size={17} />
                    Add to Cart
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      dispatch(removeProductFromWishlist(product.id))
                    }
                    aria-label={`Remove ${product.name} from wishlist`}
                    className="rounded-lg border border-gray-300 px-4"
                  >
                    <Trash2 size={18} />
                  </button>

                </div>

              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}

export default Wishlist;
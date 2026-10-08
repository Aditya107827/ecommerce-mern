import { Link, useNavigate } from "react-router-dom";
import {
    Search,
    Heart,
    ShoppingCart,
    User,
} from "lucide-react";
import { useSelector } from "react-redux";
import { useAuth } from "../../context/AuthContext";

function Navbar() {
    const navigate = useNavigate();

    const cartItems = useSelector((state) => state.cart.items);

    const cartCount = cartItems.reduce(
        (total, item) => total + item.quantity,
        0
    );

    const wishlistItems = useSelector(
        (state) => state.wishlist.items
    );

    const wishlistCount = wishlistItems.length;

    const { user, isAuthenticated, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        navigate("/");
    };

    return (
        <header className="border-b border-[#E5DFD1] bg-[#F7F3E8]">
            <nav className="grid h-14 w-full grid-cols-3 items-center px-6 py-2">

                {/* Logo */}
                <Link
                    to="/"
                    className="flex shrink-0 items-center justify-self-start"
                >
                    <img
                        src="/images/logo3.png"
                        alt="Resin Aura"
                        className="h-[44px] w-auto object-contain sm:h-[46px] lg:h-[48px]"
                    />
                </Link>

                {/* Navigation */}
                <div className="hidden items-center justify-center gap-6 md:flex">

                    <Link
                        to="/"
                        className="text-sm font-medium hover:text-gray-600"
                    >
                        Home
                    </Link>

                    <Link
                        to="/products"
                        className="text-sm font-medium hover:text-gray-600"
                    >
                        Products
                    </Link>

                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">

                    {/* Search */}
                    <button
                        type="button"
                        aria-label="Search products"
                        onClick={() => navigate("/products")}
                    >
                        <Search size={20} />
                    </button>

                    {/* Wishlist */}
                    <Link
                        to="/wishlist"
                        aria-label={`Wishlist with ${wishlistCount} items`}
                        className="relative"
                    >
                        <Heart size={20} />

                        {wishlistCount > 0 && (
                            <span className="absolute -right-3 -top-3 flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-[10px] font-bold text-white">
                                {wishlistCount}
                            </span>
                        )}
                    </Link>

                    {/* Cart */}
                    <Link
                        to="/cart"
                        aria-label={`Cart with ${cartCount} items`}
                        className="relative"
                    >
                        <ShoppingCart size={20} />

                        {cartCount > 0 && (
                            <span className="absolute -right-3 -top-3 flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-[10px] font-bold text-white">
                                {cartCount}
                            </span>
                        )}
                    </Link>

                    {/* Account */}
                    {isAuthenticated ? (
                        <div className="flex items-center gap-3">

                            <Link
                                to="/account"
                                aria-label="My account"
                                className="flex items-center gap-2"
                            >
                                <User size={20} />

                                <span className="hidden text-sm font-medium lg:block">
                                    {user?.name}
                                </span>
                            </Link>

                            <button
                                type="button"
                                onClick={handleLogout}
                                className="hidden text-sm font-medium text-gray-600 hover:text-black lg:block"
                            >
                                Logout
                            </button>

                        </div>
                    ) : (
                        <Link
                            to="/login"
                            aria-label="Login"
                        >
                            <User size={20} />
                        </Link>
                    )}

                </div>
            </nav>
        </header>
    );
}

export default Navbar;
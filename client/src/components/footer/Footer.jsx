function Footer() {
    return (
        <footer className="border-t border-gray-200 bg-gray-50">
            <div className="mx-auto max-w-7xl px-6 py-12">

                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">

                    {/* Brand */}
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            E-Shop
                        </h2>

                        <p className="mt-3 max-w-xs text-sm leading-6 text-gray-600">
                            Quality products, thoughtfully selected and
                            delivered to your door.
                        </p>
                    </div>

                    {/* Shop */}
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">
                            Shop
                        </h3>

                        <ul className="mt-4 space-y-3 text-sm text-gray-600">
                            <li>
                                <a
                                    href="/products"
                                    className="transition hover:text-gray-900"
                                >
                                    All Products
                                </a>
                            </li>

                            <li>
                                <a
                                    href="/products?category=resin-photo-frames"
                                    className="transition hover:text-gray-900"
                                >
                                    Resin Photo Frames
                                </a>
                            </li>

                            <li>
                                <a
                                    href="/products?category=candles"
                                    className="transition hover:text-gray-900"
                                >
                                    Candles
                                </a>
                            </li>

                            <li>
                                <a
                                    href="/products?category=calendar"
                                    className="transition hover:text-gray-900"
                                >
                                    Calendars
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Account */}
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">
                            Account
                        </h3>

                        <ul className="mt-4 space-y-3 text-sm text-gray-600">
                            <li>
                                <a
                                    href="/account"
                                    className="transition hover:text-gray-900"
                                >
                                    My Account
                                </a>
                            </li>

                            <li>
                                <a
                                    href="/orders"
                                    className="transition hover:text-gray-900"
                                >
                                    My Orders
                                </a>
                            </li>

                            <li>
                                <a
                                    href="/wishlist"
                                    className="transition hover:text-gray-900"
                                >
                                    Wishlist
                                </a>
                            </li>

                            <li>
                                <a
                                    href="/cart"
                                    className="transition hover:text-gray-900"
                                >
                                    Cart
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">
                            Support
                        </h3>

                        <p className="mt-4 text-sm leading-6 text-gray-600">
                            Need help with your order or have a question?
                            Contact our support team.
                        </p>

                        <a
                            href="mailto:support@eshop.com"
                            className="mt-4 inline-block text-sm font-semibold text-gray-900 hover:underline"
                        >
                            Contact Support
                        </a>
                    </div>

                </div>

                {/* Bottom */}
                <div className="mt-10 flex flex-col gap-3 border-t border-gray-200 pt-6 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
                    <p>
                        © 2026 E-Shop. All rights reserved.
                    </p>

                    <p>
                        Built with care for a better shopping experience.
                    </p>
                </div>

            </div>
        </footer>
    );
}

export default Footer;
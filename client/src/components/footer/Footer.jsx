
import { Link } from "react-router-dom";
import {
    Mail,
    Phone,
    MessageCircle,
    ArrowUpRight,
} from "lucide-react";

const Footer = () => {
    // Business contact details
    const contact = {
        email: "adityasingh96481@gmail.com",
        phone: "+919648610826",
        whatsapp: "919648610826",
        instagram: "https://www.instagram.com/official.resinaura/",
    };

    const shopLinks = [
        { label: "All Products", to: "/products" },
        {
            label: "Resin Photo Frames",
            to: "/products?category=resin-photo-frames",
        },
        { label: "Candles", to: "/products?category=candles" },
        { label: "Calendars", to: "/products?category=calendar" },
    ];

    const accountLinks = [
        { label: "My Account", to: "/account" },
        { label: "My Orders", to: "/orders" },
        { label: "Wishlist", to: "/wishlist" },
        { label: "Shopping Cart", to: "/cart" },
    ];

    const policyLinks = [
        { label: "Privacy Policy", to: "/privacy-policy" },
        { label: "Terms & Conditions", to: "/terms-and-conditions" },
        { label: "Shipping Policy", to: "/shipping-policy" },
        { label: "Returns & Refunds", to: "/return-refund-policy" },
    ];

    const instagramUsername = contact.instagram
        .replace(/\/+$/, "")
        .split("/")
        .pop();

    const whatsappNumber = contact.whatsapp.replace(/\D/g, "");

    return (
        <footer className="border-t border-gray-200 bg-white text-gray-700">
            <div className="mx-auto max-w-7xl px-5 sm:px-6">

                {/* Main Footer */}
                <div className="grid grid-cols-1 gap-9 py-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12 lg:py-12">

                    {/* Brand */}
                    <div>
                        <Link
                            to="/"
                            aria-label="Resinaura home"
                            className="inline-block text-2xl font-extrabold tracking-tight text-gray-900"
                        >
                            Resin<span className="text-rose-600">aura</span>
                            <span className="text-rose-600">.</span>
                        </Link>

                        <p className="mt-3 max-w-xs text-sm leading-6 text-gray-500">
                            Thoughtfully chosen products to make your
                            everyday moments more special. Discover
                            something you’ll love at Resinaura.
                        </p>

                        <a
                            href={contact.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-5 inline-flex items-center gap-2 rounded-full border border-gray-200 px-3.5 py-2 text-sm font-medium transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                            aria-label="Visit Resinaura on Instagram"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="17"
                                height="17"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                            >
                                <rect
                                    x="3"
                                    y="3"
                                    width="18"
                                    height="18"
                                    rx="5"
                                />
                                <circle cx="12" cy="12" r="4" />
                                <circle
                                    cx="17.5"
                                    cy="6.5"
                                    r="0.8"
                                    fill="currentColor"
                                />
                            </svg>
                            Follow us on Instagram
                            <ArrowUpRight size={14} />
                        </a>
                    </div>

                    {/* Shop */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-gray-900">
                            Shop
                        </h3>

                        <ul className="mt-4 space-y-3">
                            {shopLinks.map((item) => (
                                <li key={item.label}>
                                    <Link
                                        to={item.to}
                                        className="inline-block text-sm text-gray-500 transition-colors hover:text-rose-600"
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Account and Policies */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-gray-900">
                            My Account
                        </h3>

                        <ul className="mt-4 space-y-3">
                            {accountLinks.map((item) => (
                                <li key={item.label}>
                                    <Link
                                        to={item.to}
                                        className="inline-block text-sm text-gray-500 transition-colors hover:text-rose-600"
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>

                        <h3 className="mt-7 text-xs font-bold uppercase tracking-[0.14em] text-gray-900">
                            Customer Information
                        </h3>

                        <ul className="mt-4 space-y-3">
                            {policyLinks.map((item) => (
                                <li key={item.label}>
                                    <Link
                                        to={item.to}
                                        className="inline-block text-sm text-gray-500 transition-colors hover:text-rose-600"
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Support */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-gray-900">
                            Contact Support
                        </h3>

                        <p className="mt-3 text-sm leading-6 text-gray-500">
                            Have a question about your product or order?
                            Get in touch with us.
                        </p>

                        <div className="mt-5 space-y-4">

                            {/* Email */}
                            <a
                                href={`mailto:${contact.email}`}
                                className="flex items-start gap-3 text-sm transition-colors hover:text-rose-600"
                            >
                                <Mail
                                    size={17}
                                    className="mt-0.5 shrink-0"
                                />
                                <span className="break-all">
                                    {contact.email}
                                </span>
                            </a>

                            {/* Phone */}
                            <a
                                href={`tel:${contact.phone}`}
                                className="flex items-start gap-3 text-sm transition-colors hover:text-rose-600"
                            >
                                <Phone
                                    size={17}
                                    className="mt-0.5 shrink-0"
                                />
                                <span>{contact.phone}</span>
                            </a>

                            {/* WhatsApp */}
                            <a
                                href={`https://wa.me/${whatsappNumber}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 text-sm transition-colors hover:text-green-600"
                            >
                                <MessageCircle
                                    size={17}
                                    className="shrink-0"
                                />
                                <span>Chat on WhatsApp</span>
                                <ArrowUpRight size={14} />
                            </a>

                            {/* Instagram ID */}
                            <a
                                href={contact.instagram}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-start gap-3 text-sm transition-colors hover:text-rose-600"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="17"
                                    height="17"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="mt-0.5 shrink-0"
                                    aria-hidden="true"
                                >
                                    <rect
                                        x="3"
                                        y="3"
                                        width="18"
                                        height="18"
                                        rx="5"
                                    />
                                    <circle cx="12" cy="12" r="4" />
                                    <circle
                                        cx="17.5"
                                        cy="6.5"
                                        r="0.8"
                                        fill="currentColor"
                                    />
                                </svg>

                                <span className="break-all">
                                    @{instagramUsername}
                                </span>

                                <ArrowUpRight
                                    size={14}
                                    className="shrink-0"
                                />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="flex flex-col gap-3 border-t border-gray-200 py-5 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
                    <p>
                        © {new Date().getFullYear()} Resinaura.
                        All rights reserved.
                    </p>

                    <Link
                        to="/products"
                        className="inline-flex items-center gap-1 font-medium transition-colors hover:text-rose-600"
                    >
                        Explore our collection
                        <ArrowUpRight size={14} />
                    </Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

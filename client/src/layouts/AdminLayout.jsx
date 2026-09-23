import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AdminLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    // Frontend admin protection


    return (
        <div className="min-h-screen bg-gray-50">

            {/* Admin Header */}
            <header className="border-b bg-white">
                <div className="flex items-center justify-between px-6 py-4">

                    <Link
                        to="/admin"
                        className="text-xl font-bold text-gray-900"
                    >
                        E-Shop Admin
                    </Link>

                    <div className="flex items-center gap-4">

                        <span className="text-sm text-gray-600">
                            {user.name}
                        </span>

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
                        >
                            Logout
                        </button>

                    </div>

                </div>
            </header>


            <div className="flex min-h-[calc(100vh-73px)]">

                {/* Sidebar */}
                <aside className="w-64 shrink-0 border-r bg-white">

                    <nav className="space-y-2 p-4">

                        <NavLink
                            to="/admin"
                            end
                            className={({ isActive }) =>
                                `block rounded-lg px-4 py-3 text-sm font-medium ${isActive
                                    ? "bg-black text-white"
                                    : "text-gray-700 hover:bg-gray-100"
                                }`
                            }
                        >
                            Dashboard
                        </NavLink>


                        <NavLink
                            to="/admin/products"
                            className={({ isActive }) =>
                                `block rounded-lg px-4 py-3 text-sm font-medium ${isActive
                                    ? "bg-black text-white"
                                    : "text-gray-700 hover:bg-gray-100"
                                }`
                            }
                        >
                            Products
                        </NavLink>


                        <NavLink
                            to="/admin/orders"
                            className={({ isActive }) =>
                                `block rounded-lg px-4 py-3 text-sm font-medium ${isActive
                                    ? "bg-black text-white"
                                    : "text-gray-700 hover:bg-gray-100"
                                }`
                            }
                        >
                            Orders
                        </NavLink>

                        <NavLink
                            to="/admin/reviews"
                            className={({ isActive }) =>
                                `block rounded-lg px-4 py-3 text-sm font-medium ${isActive
                                    ? "bg-black text-white"
                                    : "text-gray-700 hover:bg-gray-100"
                                }`
                            }
                        >
                            Reviews
                        </NavLink>

                    </nav>

                </aside>


                {/* Admin Content */}
                <main className="flex-1 p-6">
                    <Outlet />
                </main>

            </div>

        </div>
    );
}

export default AdminLayout;
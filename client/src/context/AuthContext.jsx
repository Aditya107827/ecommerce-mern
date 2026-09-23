import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";
import { useDispatch } from "react-redux";

import api from "../services/api";
import {
    fetchCart,
    resetCart,
} from "../store/cartSlice";

import {
    fetchWishlist,
    resetWishlist,
} from "../store/wishlistSlice";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const dispatch = useDispatch();

    // Check existing authenticated session
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await api.get("/auth/me");

                const authenticatedUser = response.data.user;

                setUser(authenticatedUser);

                // Load user's cart from backend
                await dispatch(fetchCart()).unwrap();
                await dispatch(fetchWishlist()).unwrap();
            } catch (error) {
                setUser(null);

                // Clear data belonging to expired session
                dispatch(resetCart());
                dispatch(resetWishlist());
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [dispatch]);


    useEffect(() => {
        const handleAuthExpired = () => {
            setUser(null);
            dispatch(resetCart());
            dispatch(resetWishlist());
        };

        window.addEventListener(
            "auth-expired",
            handleAuthExpired
        );

        return () => {
            window.removeEventListener(
                "auth-expired",
                handleAuthExpired
            );
        };
    }, [dispatch]);


    // Called after successful login
    const login = async (userData) => {
        setUser(userData);

        // Load cart belonging to logged-in user
        try {
            await dispatch(fetchCart()).unwrap();
            await dispatch(fetchWishlist()).unwrap();
        } catch (error) {
            console.error("Failed to load cart after login:", error);
        }
    };


    const logout = async () => {
        try {
            await api.post("/auth/logout");
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            setUser(null);
            dispatch(resetCart());
            dispatch(resetWishlist());
        }
    };


    const value = {
        user,
        loading,
        isAuthenticated: Boolean(user),
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}


export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    return context;
}
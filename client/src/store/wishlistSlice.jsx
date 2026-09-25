import {
    createAsyncThunk,
    createSlice,
} from "@reduxjs/toolkit";

import api from "../services/api";

const initialState = {
    items: [],
    loading: false,
    error: null,
};


// Convert backend product into frontend wishlist item
const normalizeWishlistProduct = (product) => {
    return {
        id: product._id,
        name: product.name,
        price: product.price,
        image: product.image || "",
        images: product.images || [],
        category: product.category,
        stock: product.stock,
        featured: product.featured,
    };
};


// Get current user's wishlist
export const fetchWishlist = createAsyncThunk(
    "wishlist/fetchWishlist",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get("/wishlist");

            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                "Unable to fetch wishlist"
            );
        }
    }
);


// Add product to wishlist
export const addProductToWishlist = createAsyncThunk(
    "wishlist/addProductToWishlist",
    async (productId, { rejectWithValue }) => {
        try {
            const response = await api.post("/wishlist", {
                productId,
            });

            return response.data.wishlist;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                "Unable to add product to wishlist"
            );
        }
    }
);


// Remove product from wishlist
export const removeProductFromWishlist = createAsyncThunk(
    "wishlist/removeProductFromWishlist",
    async (productId, { rejectWithValue }) => {
        try {
            const response = await api.delete(
                `/wishlist/${productId}`
            );

            return response.data.wishlist;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                "Unable to remove product from wishlist"
            );
        }
    }
);


// Clear wishlist
export const clearWishlistAsync = createAsyncThunk(
    "wishlist/clearWishlist",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.delete("/wishlist");

            return response.data.wishlist;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                "Unable to clear wishlist"
            );
        }
    }
);


const wishlistSlice = createSlice({
    name: "wishlist",

    initialState,

    reducers: {
        clearWishlistError: (state) => {
            state.error = null;
        },

        resetWishlist: (state) => {
            state.items = [];
            state.loading = false;
            state.error = null;
        },
    },

    extraReducers: (builder) => {

        // Fetch wishlist
        builder
            .addCase(fetchWishlist.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(fetchWishlist.fulfilled, (state, action) => {
                state.loading = false;

                state.items = (
                    action.payload.products || []
                )
                    .filter((product) => product)
                    .map(normalizeWishlistProduct);
            })

            .addCase(fetchWishlist.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });


        // Add product
        builder
            .addCase(addProductToWishlist.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(addProductToWishlist.fulfilled, (state, action) => {
                state.loading = false;

                state.items = (
                    action.payload.products || []
                )
                    .filter((product) => product)
                    .map(normalizeWishlistProduct);
            })

            .addCase(addProductToWishlist.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });


        // Remove product
        builder
            .addCase(removeProductFromWishlist.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(removeProductFromWishlist.fulfilled, (state, action) => {
                state.loading = false;

                state.items = (
                    action.payload.products || []
                )
                    .filter((product) => product)
                    .map(normalizeWishlistProduct);
            })

            .addCase(removeProductFromWishlist.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });


        // Clear wishlist
        builder
            .addCase(clearWishlistAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(clearWishlistAsync.fulfilled, (state) => {
                state.loading = false;
                state.items = [];
            })

            .addCase(clearWishlistAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});


export const {
    clearWishlistError,
    resetWishlist,
} = wishlistSlice.actions;


export default wishlistSlice.reducer;
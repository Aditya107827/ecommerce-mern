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


// Convert backend cart item into frontend cart item
const normalizeCartItem = (item) => {
    const product = item.product;

    return {
        id: product._id,
        name: product.name,
        price: product.price,
        image: product.images?.[0]?.url || product.image || "",
        category: product.category,
        stock: product.stock,
        quantity: item.quantity,
    };
};


// Get current user's cart
export const fetchCart = createAsyncThunk(
    "cart/fetchCart",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get("/cart");

            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                "Unable to fetch cart"
            );
        }
    }
);


// Add product to cart
export const addProductToCart = createAsyncThunk(
    "cart/addProductToCart",
    async ({ productId, quantity = 1 }, { rejectWithValue }) => {
        try {
            const response = await api.post("/cart", {
                productId,
                quantity,
            });

            return response.data.cart;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                "Unable to add product to cart"
            );
        }
    }
);


// Update quantity
export const updateCartItemAsync = createAsyncThunk(
    "cart/updateCartItem",
    async ({ productId, quantity }, { rejectWithValue }) => {
        try {
            const response = await api.put(
                `/cart/${productId}`,
                {
                    quantity,
                }
            );

            return response.data.cart;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                "Unable to update cart"
            );
        }
    }
);


// Remove item
export const removeCartItemAsync = createAsyncThunk(
    "cart/removeCartItem",
    async (productId, { rejectWithValue }) => {
        try {
            const response = await api.delete(
                `/cart/${productId}`
            );

            return response.data.cart;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                "Unable to remove product from cart"
            );
        }
    }
);


// Clear cart
export const clearCartAsync = createAsyncThunk(
    "cart/clearCart",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.delete("/cart");

            return response.data.cart;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                "Unable to clear cart"
            );
        }
    }
);


const cartSlice = createSlice({
    name: "cart",

    initialState,

    reducers: {
        clearCartError: (state) => {
            state.error = null;
        },

        resetCart: (state) => {
            state.items = [];
            state.loading = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {

        // Fetch cart
        builder
            .addCase(fetchCart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(fetchCart.fulfilled, (state, action) => {
                state.loading = false;

                state.items = (action.payload.items || [])
                    .filter((item) => item.product)
                    .map(normalizeCartItem);
            })

            .addCase(fetchCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });


        // Add to cart
        builder
            .addCase(addProductToCart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(addProductToCart.fulfilled, (state, action) => {
                state.loading = false;

                state.items = (action.payload.items || [])
                    .filter((item) => item.product)
                    .map(normalizeCartItem);
            })

            .addCase(addProductToCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });


        // Update quantity
        builder
            .addCase(updateCartItemAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(updateCartItemAsync.fulfilled, (state, action) => {
                state.loading = false;

                state.items = (action.payload.items || [])
                    .filter((item) => item.product)
                    .map(normalizeCartItem);
            })

            .addCase(updateCartItemAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });


        // Remove item
        builder
            .addCase(removeCartItemAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(removeCartItemAsync.fulfilled, (state, action) => {
                state.loading = false;

                state.items = (action.payload.items || [])
                    .filter((item) => item.product)
                    .map(normalizeCartItem);
            })

            .addCase(removeCartItemAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });


        // Clear cart
        builder
            .addCase(clearCartAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(clearCartAsync.fulfilled, (state) => {
                state.loading = false;
                state.items = [];
            })

            .addCase(clearCartAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});


export const {
    clearCartError,
    resetCart,
} = cartSlice.actions;

export default cartSlice.reducer;
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ENDPOINTS } from '@/config/api';

// Define the shape of our User and Auth state
export interface User {
    id: number;
    name: string;
    email: string;
    company?: string;
    designation?: string;
    phone_number?: string;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isUpdatingProfile: boolean;
    error: string | null;
}

// Initial state, trying to rehydrate from localStorage if possible
const initialState: AuthState = {
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token'),
    isLoading: false,
    isUpdatingProfile: false,
    error: null,
};

// --- Async Thunks for API calls ---

// 1. Login
export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async (credentials: { email: string; password: string }, { rejectWithValue }) => {
        try {
            const response = await fetch(ENDPOINTS.AUTH.LOGIN, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
            });

            const data = await response.json();

            if (data.status === 'success') {
                const user = {
                    id: data.data.id,
                    name: data.data.name,
                    email: data.data.email,
                    company: data.data.company,
                    designation: data.data.designation,
                    phone_number: data.data.phone_number
                };
                // Save to local storage for persistence
                localStorage.setItem('token', data.data.access_token);
                localStorage.setItem('user', JSON.stringify(user));
                return data;
            } else {
                return rejectWithValue(data.message || 'Login failed');
            }
        } catch (error: any) {
            return rejectWithValue(error.message || 'Network error occurred');
        }
    }
);

// 1.1 Fetch current user profile (Me)
export const fetchMe = createAsyncThunk(
    'auth/fetchMe',
    async (_, { getState, rejectWithValue }) => {
        try {
            const state: any = getState();
            const token = state.auth.token;
            if (!token) return rejectWithValue('No token found');

            const response = await fetch(ENDPOINTS.AUTH.ME, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            });

            const data = await response.json();

            if (data.status === 'success') {
                localStorage.setItem('user', JSON.stringify(data.data));
                return data.data as User;
            } else {
                return rejectWithValue(data.message || 'Failed to fetch user data');
            }
        } catch (error: any) {
            return rejectWithValue(error.message || 'Network error occurred');
        }
    }
);

// 1.2 Update Profile
export const updateProfile = createAsyncThunk(
    'auth/updateProfile',
    async (profileData: Partial<User>, { getState, rejectWithValue }) => {
        try {
            const state: any = getState();
            const token = state.auth.token;

            const response = await fetch(ENDPOINTS.AUTH.UPDATE_PROFILE, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(profileData),
            });

            const data = await response.json();

            if (data.status === 'success') {
                localStorage.setItem('user', JSON.stringify(data.data));
                return data.data as User;
            } else {
                return rejectWithValue(data.message || 'Profile update failed');
            }
        } catch (error: any) {
            return rejectWithValue(error.message || 'Network error occurred');
        }
    }
);

// 2. Signup
// ... (omitted actionSignup logic for brevity if possible, but I should keep it working)
export const signupUser = createAsyncThunk(
    'auth/signupUser',
    async (userData: any, { rejectWithValue }) => {
        try {
            const response = await fetch(`${ENDPOINTS.AUTH.LOGIN.replace('/login', '/signup')}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (data.status === 'success') {
                return data;
            } else {
                // Extract detailed error message if available
                let errorMessage = data.message || 'Signup failed';
                if (data.errors && typeof data.errors === 'object') {
                    const firstKey = Object.keys(data.errors)[0];
                    if (firstKey && Array.isArray(data.errors[firstKey]) && data.errors[firstKey].length > 0) {
                        errorMessage = data.errors[firstKey][0];

                        // Customize "already taken" message for email
                        if (firstKey === 'email' && errorMessage.toLowerCase().includes('already been taken')) {
                            errorMessage = 'This email address is already registered. Please login.';
                        }
                    }
                }
                return rejectWithValue(errorMessage);
            }
        } catch (error: any) {
            return rejectWithValue(error.message || 'Network error occurred');
        }
    }
);

// 3. Logout
export const logoutUser = createAsyncThunk(
    'auth/logoutUser',
    async (_, { getState, rejectWithValue }) => {
        try {
            const state: any = getState();
            const token = state.auth.token;

            const response = await fetch(ENDPOINTS.AUTH.LOGOUT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });

            const data = await response.json();

            if (data.status === 'success') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                return data;
            } else {
                return rejectWithValue(data.message || 'Logout failed');
            }
        } catch (error: any) {
            // Even if API fails, we should clear local token to log them out of the frontend
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return rejectWithValue(error.message || 'Network error occurred');
        }
    }
);

// --- Slice Definition ---
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // Synchronous logout fallback or token clear
        clearAuth: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.error = null;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        // LOGIN
        builder.addCase(loginUser.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(loginUser.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isAuthenticated = true;
            state.token = action.payload.data.access_token;
            state.user = {
                id: action.payload.data.id,
                name: action.payload.data.name,
                email: action.payload.data.email,
                company: action.payload.data.company,
                designation: action.payload.data.designation,
                phone_number: action.payload.data.phone_number
            };
        });
        builder.addCase(loginUser.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // FETCH ME
        builder.addCase(fetchMe.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(fetchMe.fulfilled, (state, action) => {
            state.isLoading = false;
            state.user = action.payload;
            state.isAuthenticated = true;
        });
        builder.addCase(fetchMe.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // UPDATE PROFILE
        builder.addCase(updateProfile.pending, (state) => {
            state.isUpdatingProfile = true;
            state.error = null;
        });
        builder.addCase(updateProfile.fulfilled, (state, action) => {
            state.isUpdatingProfile = false;
            state.user = action.payload;
        });
        builder.addCase(updateProfile.rejected, (state, action) => {
            state.isUpdatingProfile = false;
            state.error = action.payload as string;
        });

        // SIGNUP
        builder.addCase(signupUser.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(signupUser.fulfilled, (state) => {
            state.isLoading = false;
            // Depending on requirements, we might automatically log them in or redirect them.
            // Usually, user must log in after signup.
        });
        builder.addCase(signupUser.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // LOGOUT
        builder.addCase(logoutUser.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(logoutUser.fulfilled, (state) => {
            state.isLoading = false;
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
        });
        builder.addCase(logoutUser.rejected, (state, action) => {
            state.isLoading = false;
            state.user = null; // Force clear anyway
            state.token = null;
            state.isAuthenticated = false;
            state.error = action.payload as string;
        });
    },
});

export const { clearAuth, clearError } = authSlice.actions;
export default authSlice.reducer;

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ENDPOINTS } from '@/config/api';

export interface SearchResult {
    type: "dataset" | "dashboard";
    name: string;
    category: string;
    datasetId: string;
    dashboardId?: string;
    purchased?: boolean;
    route?: string;
}

export interface SearchState {
    results: SearchResult[];
    isLoading: boolean;
    error: string | null;
}

const initialState: SearchState = {
    results: [],
    isLoading: false,
    error: null,
};

export const searchDashboards = createAsyncThunk(
    'search/searchDashboards',
    async (query: string, { getState, rejectWithValue }) => {
        if (!query || query.length < 2) return [];

        try {
            const state: any = getState();
            const token = state.auth.token;

            const response = await fetch(ENDPOINTS.DASHBOARD.SEARCH, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ q: query }),
            });
            const data = await response.json();

            if (data.status === 'success') {
                return data.data as SearchResult[];
            } else {
                return rejectWithValue(data.message || 'Search failed');
            }
        } catch (error: any) {
            return rejectWithValue(error.message || 'Network error occurred');
        }
    }
);

const searchSlice = createSlice({
    name: 'search',
    initialState,
    reducers: {
        clearSearchResults: (state) => {
            state.results = [];
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(searchDashboards.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(searchDashboards.fulfilled, (state, action) => {
            state.isLoading = false;
            state.results = action.payload;
        });
        builder.addCase(searchDashboards.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });
    },
});

export const { clearSearchResults } = searchSlice.actions;
export default searchSlice.reducer;

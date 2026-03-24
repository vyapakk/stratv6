import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ENDPOINTS } from '@/config/api';

export interface Notification {
    id: string;
    title: string;
    message: string;
    time: string;
    read: boolean;
    type: "update" | "alert" | "info";
}

export interface NotificationState {
    notifications: Notification[];
    isLoading: boolean;
    error: string | null;
}

const initialState: NotificationState = {
    notifications: [],
    isLoading: false,
    error: null,
};

export const fetchNotifications = createAsyncThunk(
    'notifications/fetchNotifications',
    async (_, { getState, rejectWithValue }) => {
        try {
            const state: any = getState();
            const token = state.auth.token;

            const response = await fetch(ENDPOINTS.DASHBOARD.NOTIFICATIONS, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            });
            const data = await response.json();

            if (data.status === 'success') {
                return data.data as Notification[];
            } else {
                return rejectWithValue(data.message || 'Failed to fetch notifications');
            }
        } catch (error: any) {
            return rejectWithValue(error.message || 'Network error occurred');
        }
    }
);

const notificationSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        markAsRead: (state, action) => {
            const notification = state.notifications.find(n => n.id === action.payload);
            if (notification) {
                notification.read = true;
            }
        },
        markAllAsRead: (state) => {
            state.notifications.forEach(n => {
                n.read = true;
            });
        },
        dismissNotification: (state, action) => {
            state.notifications = state.notifications.filter(n => n.id !== action.payload);
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchNotifications.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(fetchNotifications.fulfilled, (state, action) => {
            state.isLoading = false;
            state.notifications = action.payload;
        });
        builder.addCase(fetchNotifications.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });
    },
});

export const { markAsRead, markAllAsRead, dismissNotification } = notificationSlice.actions;
export default notificationSlice.reducer;

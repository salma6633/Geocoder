import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../api';

// Define types
export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  user?: string;
  global: boolean;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  image?: string;
  content?: string;
  link?: string;
}

export type NotificationsFilter = {
  type?: 'success' | 'error' | 'warning' | 'info' | 'all';
  isRead?: boolean | 'all';
  read?: boolean | 'all'; // For backward compatibility
  timeRange?: 'today' | 'week' | 'month' | 'all';
  category?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
};

export interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  // Additional properties used in Notifications.tsx
  page: number;
  pages: number;
  total: number;
}

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  selectedNotification: Notification | null;
  filters: NotificationsFilter;
  pagination: PaginationState;
}

// Initial state
const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  selectedNotification: null,
  filters: {
    type: 'all',
    read: 'all',
    isRead: 'all',
    timeRange: 'all',
    page: 1
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    page: 1,
    pages: 1,
    total: 0
  }
};

// Define error type
interface ApiError {
  response?: {
    data?: {
      error?: string;
    };
  };
  message?: string;
}

// Async thunks
export const fetchNotificationById = createAsyncThunk(
  'notifications/fetchNotificationById',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/v1/notifications/${notificationId}`);
      return response.data.data;
    } catch (error: unknown) {
      const err = error as ApiError;
      return rejectWithValue(err.response?.data?.error || err.message || 'Failed to fetch notification');
    }
  }
);

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/v1/notifications');
      return response.data.data;
    } catch (error: unknown) {
      const err = error as ApiError;
      return rejectWithValue(err.response?.data?.error || err.message || 'Failed to fetch notifications');
    }
  }
);

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      const response = await api.put(`/v1/notifications/${notificationId}/read`);
      return response.data.data;
    } catch (error: unknown) {
      const err = error as ApiError;
      return rejectWithValue(err.response?.data?.error || err.message || 'Failed to mark notification as read');
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.put('/v1/notifications/read-all');
      return response.data;
    } catch (error: unknown) {
      const err = error as ApiError;
      return rejectWithValue(err.response?.data?.error || err.message || 'Failed to mark all notifications as read');
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/v1/notifications/${notificationId}`);
      return notificationId;
    } catch (error: unknown) {
      const err = error as ApiError;
      return rejectWithValue(err.response?.data?.error || err.message || 'Failed to delete notification');
    }
  }
);

// Notifications slice
const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    },
    setFilters: (state, action: PayloadAction<NotificationsFilter>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        type: 'all',
        read: 'all',
        timeRange: 'all'
      };
    },
    clearSelectedNotification: (state) => {
      state.selectedNotification = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch notifications
    builder.addCase(fetchNotifications.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchNotifications.fulfilled, (state, action: PayloadAction<Notification[]>) => {
      state.isLoading = false;
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter(notification => !notification.isRead).length;
      state.error = null;
    });
    builder.addCase(fetchNotifications.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch notification by ID
    builder.addCase(fetchNotificationById.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchNotificationById.fulfilled, (state, action: PayloadAction<Notification>) => {
      state.isLoading = false;
      state.selectedNotification = action.payload;
      state.error = null;
    });
    builder.addCase(fetchNotificationById.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Mark notification as read
    builder.addCase(markAsRead.pending, (state) => {
      state.error = null;
    });
    builder.addCase(markAsRead.fulfilled, (state, action: PayloadAction<Notification>) => {
      const index = state.notifications.findIndex(n => n._id === action.payload._id);
      if (index !== -1) {
        const wasUnread = !state.notifications[index].isRead;
        state.notifications[index] = action.payload;
        if (wasUnread && action.payload.isRead) {
          state.unreadCount -= 1;
        }
      }
      state.error = null;
    });
    builder.addCase(markAsRead.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    // Mark all notifications as read
    builder.addCase(markAllAsRead.pending, (state) => {
      state.error = null;
    });
    builder.addCase(markAllAsRead.fulfilled, (state) => {
      state.notifications = state.notifications.map(notification => ({
        ...notification,
        isRead: true
      }));
      state.unreadCount = 0;
      state.error = null;
    });
    builder.addCase(markAllAsRead.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    // Delete notification
    builder.addCase(deleteNotification.pending, (state) => {
      state.error = null;
    });
    builder.addCase(deleteNotification.fulfilled, (state, action: PayloadAction<string>) => {
      const index = state.notifications.findIndex(n => n._id === action.payload);
      if (index !== -1) {
        const wasUnread = !state.notifications[index].isRead;
        state.notifications.splice(index, 1);
        if (wasUnread) {
          state.unreadCount -= 1;
        }
      }
      state.error = null;
    });
    builder.addCase(deleteNotification.rejected, (state, action) => {
      state.error = action.payload as string;
    });
  },
});

// Export actions and reducer
export const { 
  clearError, 
  addNotification, 
  setFilters, 
  clearFilters, 
  clearSelectedNotification 
} = notificationsSlice.actions;
export default notificationsSlice.reducer;

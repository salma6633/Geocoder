import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../api';

// Define types
export interface DailyUsage {
  date: string;
  value: number;
}

export interface DailyRequestHistory {
  date: string;
  success: number;
  failed: number;
}

export interface ModelUsage {
  name: string;
  requests: number;
  credits: number;
  avgResponseTime: number;
  successRate: number;
}

export interface UsageLimits {
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  concurrentRequests: number;
}

export interface UsageData {
  credits: {
    total: number;
    used: number;
    remaining: number;
    percentUsed: number;
    refreshDate: string;
    history: DailyUsage[];
  };
  requests: {
    total: number;
    successful: number;
    failed: number;
    successRate: number;
    history: DailyRequestHistory[];
  };
  models: ModelUsage[];
  limits: UsageLimits;
}

interface UsageState {
  data: UsageData | null;
  isLoading: boolean;
  error: string | null;
  timeRange: '7days' | '30days' | '90days' | 'custom';
}

// Initial state
const initialState: UsageState = {
  data: null,
  isLoading: false,
  error: null,
  timeRange: '30days',
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
export const fetchUsageData = createAsyncThunk(
  'usage/fetchUsageData',
  async (timeRange: string = '30days', { rejectWithValue }) => {
    try {
      const response = await api.get(`/v1/usage?timeRange=${timeRange}`);
      return response.data.data;
    } catch (error: unknown) {
      const err = error as ApiError;
      return rejectWithValue(err.response?.data?.error || err.message || 'Failed to fetch usage data');
    }
  }
);

// Usage slice
const usageSlice = createSlice({
  name: 'usage',
  initialState,
  reducers: {
    setTimeRange: (state, action: PayloadAction<'7days' | '30days' | '90days' | 'custom'>) => {
      state.timeRange = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch usage data
    builder.addCase(fetchUsageData.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchUsageData.fulfilled, (state, action: PayloadAction<UsageData>) => {
      state.isLoading = false;
      state.data = action.payload;
      state.error = null;
    });
    builder.addCase(fetchUsageData.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

// Export actions and reducer
export const { setTimeRange, clearError } = usageSlice.actions;
export default usageSlice.reducer;

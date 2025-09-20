import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../api';

// Define types
export interface RequestLog {
  _id: string;
  userId: string;
  apiKeyId?: {
    _id: string;
    name: string;
  };
  apiKeyName?: string;
  requestStatus: number;
  responseMessage?: string;
  requestDate: string;
  creditsUsed: number;
  endpointRoute: string;
  endpointName?: string;
  endpointCategory?: string;
  method: string;
  requestBody?: Record<string, unknown>;
  responseTime?: number;
  ipAddress?: string;
  userAgent?: string;
  errorDetails?: string;
  isSuccess: boolean;
}

export interface LogsFilter {
  page?: number;
  limit?: number;
  status?: number;
  success?: boolean;
  endpoint?: string;
  endpointName?: string;
  category?: string;
  apiKeyName?: string;
  apiKeyId?: string;
  startDate?: string;
  endDate?: string;
}

export interface LogsStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  successRate: number;
  avgResponseTime: number;
  creditsUsed: number;
  requestsByEndpoint: {
    route: string;
    name: string;
    category: string;
    count: number;
    successCount: number;
    failureCount: number;
    successRate: number;
    avgResponseTime: number;
  }[];
  requestsByApiKey: {
    apiKeyId: string;
    apiKeyName: string;
    count: number;
    successCount: number;
    failureCount: number;
    successRate: number;
    avgResponseTime: number;
  }[];
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export interface Pagination {
  total: number;
  pages: number;
  page: number;
  limit: number;
}

interface LogsState {
  logs: RequestLog[];
  selectedLog: RequestLog | null;
  stats: LogsStats | null;
  pagination: Pagination | null;
  filters: LogsFilter;
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: LogsState = {
  logs: [],
  selectedLog: null,
  stats: null,
  pagination: null,
  filters: {
    page: 1,
    limit: 20,
  },
  isLoading: false,
  error: null,
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
export const fetchLogs = createAsyncThunk(
  'logs/fetchLogs',
  async (filters: LogsFilter, { rejectWithValue }) => {
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams();
      
      if (filters.page) queryParams.append('page', filters.page.toString());
      if (filters.limit) queryParams.append('limit', filters.limit.toString());
      if (filters.status) queryParams.append('status', filters.status.toString());
      if (filters.success !== undefined) queryParams.append('success', filters.success.toString());
      if (filters.endpoint) queryParams.append('endpoint', filters.endpoint);
      if (filters.endpointName) queryParams.append('endpointName', filters.endpointName);
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.apiKeyName) queryParams.append('apiKeyName', filters.apiKeyName);
      if (filters.apiKeyId) queryParams.append('apiKeyId', filters.apiKeyId);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      
      const response = await api.get(`/v1/logs?${queryParams.toString()}`);
      return response.data;
    } catch (error: unknown) {
      const err = error as ApiError;
      return rejectWithValue(err.response?.data?.error || err.message || 'Failed to fetch logs');
    }
  }
);

export const fetchLogById = createAsyncThunk(
  'logs/fetchLogById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/v1/logs/${id}`);
      return response.data;
    } catch (error: unknown) {
      const err = error as ApiError;
      return rejectWithValue(err.response?.data?.error || err.message || 'Failed to fetch log details');
    }
  }
);

export const fetchLogStats = createAsyncThunk(
  'logs/fetchLogStats',
  async (dateRange: { startDate?: string; endDate?: string } = {}, { rejectWithValue }) => {
    try {
      // Build query string from date range
      const queryParams = new URLSearchParams();
      
      if (dateRange.startDate) queryParams.append('startDate', dateRange.startDate);
      if (dateRange.endDate) queryParams.append('endDate', dateRange.endDate);
      
      const response = await api.get(`/v1/logs/stats?${queryParams.toString()}`);
      return response.data;
    } catch (error: unknown) {
      const err = error as ApiError;
      return rejectWithValue(err.response?.data?.error || err.message || 'Failed to fetch log statistics');
    }
  }
);

// Logs slice
const logsSlice = createSlice({
  name: 'logs',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<LogsFilter>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        page: 1,
        limit: 20,
      };
    },
    clearSelectedLog: (state) => {
      state.selectedLog = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch logs
    builder.addCase(fetchLogs.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchLogs.fulfilled, (state, action) => {
      state.isLoading = false;
      state.logs = action.payload.data;
      state.pagination = action.payload.pagination;
      state.error = null;
    });
    builder.addCase(fetchLogs.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Fetch log by ID
    builder.addCase(fetchLogById.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchLogById.fulfilled, (state, action) => {
      state.isLoading = false;
      state.selectedLog = action.payload.data;
      state.error = null;
    });
    builder.addCase(fetchLogById.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Fetch log stats
    builder.addCase(fetchLogStats.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchLogStats.fulfilled, (state, action) => {
      state.isLoading = false;
      state.stats = action.payload.data;
      state.error = null;
    });
    builder.addCase(fetchLogStats.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

// Export actions and reducer
export const { setFilters, clearFilters, clearSelectedLog, clearError } = logsSlice.actions;
export default logsSlice.reducer;

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../api';

// Define response types
export interface AuthResponse {
  token: string;
  data: User;
  message?: string;
}

// Define types
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  agreeMarketing: boolean;
  role: string;
  maximumRequests: number;
  tier: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,
};

// Async thunks
export const signup = createAsyncThunk(
  'auth/signup',
  async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword?: string;
    company?: string;
    agreeMarketing?: boolean;
  }, { rejectWithValue }) => {
    try {
      // Remove confirmPassword as it's not needed in the API
      const { confirmPassword, ...apiData } = userData;
      const response = await api.post('/v1/auth/signup', apiData);
      
      // Store token in localStorage if successful
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data));
      }
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Signup failed');
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (loginData: {
    email: string;
    password: string;
    rememberMe?: boolean;
  }, { rejectWithValue }) => {
    try {
      // Remove rememberMe as it's not needed in the API
      const { rememberMe, ...apiData } = loginData;
      const response = await api.post('/v1/auth/login', apiData);
      
      // Store token in localStorage if successful
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data));
      }
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Login failed');
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/v1/auth/me');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to get user');
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Signup
    builder.addCase(signup.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(signup.fulfilled, (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.data;
      state.token = action.payload.token;
      state.error = null;
    });
    builder.addCase(signup.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Login
    builder.addCase(login.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.data;
      state.token = action.payload.token;
      state.error = null;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Get current user
    builder.addCase(getCurrentUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(getCurrentUser.fulfilled, (state, action: PayloadAction<User>) => {
      state.isLoading = false;
      state.user = action.payload;
      state.error = null;
    });
    builder.addCase(getCurrentUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

// Export actions and reducer
export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../api';

// Define types
export interface ApiKey {
  _id: string;
  name: string;
  key: string;
  prefix: string;
  lastUsed?: string;
  created: string;
  expires?: string;
  permissions: string[];
  status: 'active' | 'expired' | 'revoked';
}

interface ApiKeyState {
  apiKeys: ApiKey[];
  isLoading: boolean;
  error: string | null;
  newKey: ApiKey | null;
}

// Initial state
const initialState: ApiKeyState = {
  apiKeys: [],
  isLoading: false,
  error: null,
  newKey: null,
};

// Async thunks
export const fetchApiKeys = createAsyncThunk(
  'apiKeys/fetchApiKeys',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/v1/api-keys');
      return response.data.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch API keys';
      return rejectWithValue(errorMessage);
    }
  }
);

export const createApiKey = createAsyncThunk(
  'apiKeys/createApiKey',
  async (apiKeyData: { name: string; permissions: string[] }, { rejectWithValue }) => {
    try {
      const response = await api.post('/v1/api-keys', apiKeyData);
      return response.data.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create API key';
      return rejectWithValue(errorMessage);
    }
  }
);

export const revokeApiKey = createAsyncThunk(
  'apiKeys/revokeApiKey',
  async (keyId: string, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/v1/api-keys/${keyId}`);
      return { keyId, data: response.data.data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to revoke API key';
      return rejectWithValue(errorMessage);
    }
  }
);

// API key slice
const apiKeySlice = createSlice({
  name: 'apiKeys',
  initialState,
  reducers: {
    clearNewKey: (state) => {
      state.newKey = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch API keys
    builder.addCase(fetchApiKeys.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchApiKeys.fulfilled, (state, action: PayloadAction<ApiKey[]>) => {
      state.isLoading = false;
      state.apiKeys = action.payload;
      state.error = null;
    });
    builder.addCase(fetchApiKeys.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Create API key
    builder.addCase(createApiKey.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(createApiKey.fulfilled, (state, action: PayloadAction<ApiKey>) => {
      state.isLoading = false;
      state.apiKeys.push(action.payload);
      state.newKey = action.payload;
      state.error = null;
    });
    builder.addCase(createApiKey.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Revoke API key
    builder.addCase(revokeApiKey.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(revokeApiKey.fulfilled, (state, action) => {
      state.isLoading = false;
      const keyId = action.payload.keyId;
      state.apiKeys = state.apiKeys.map(key => 
        key._id === keyId ? { ...key, status: 'revoked' } : key
      );
      state.error = null;
    });
    builder.addCase(revokeApiKey.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

// Export actions and reducer
export const { clearNewKey, clearError } = apiKeySlice.actions;
export default apiKeySlice.reducer;

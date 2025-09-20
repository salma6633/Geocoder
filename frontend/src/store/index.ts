import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

// Import reducers
import counterReducer from './slices/counterSlice';
import authReducer from './slices/authSlice';
import apiKeyReducer from './slices/apiKeySlice';
import usageReducer from './slices/usageSlice';
import logsReducer from './slices/logsSlice';
import notificationsReducer from './slices/notificationsSlice';

export const store = configureStore({
  reducer: {
    // Add reducers here
    counter: counterReducer,
    auth: authReducer,
    apiKeys: apiKeyReducer,
    usage: usageReducer,
    logs: logsReducer,
    notifications: notificationsReducer,
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Enable listener behavior for the store
setupListeners(store.dispatch);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

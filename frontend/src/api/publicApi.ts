import axios, { AxiosResponse } from 'axios';

// Define types for API requests and responses
export interface LocationCoordinates {
  lat: number;
  lon: number;
}

export interface EtaPredictionRequest {
  pickup_lat: number;
  pickup_lon: number;
  drop_lat: number;
  drop_lon: number;
  pickup_time_utc?: string;
  hour_of_day?: number;
  day_of_week?: string;
}

export interface EtaPredictionResponse {
  eta_minutes: number;
  request: {
    pickup: LocationCoordinates;
    dropoff: LocationCoordinates;
    time: {
      hour: number;
      day: string;
      pickup_time_utc?: string;
    };
  };
  timestamp: string;
}

export interface CombinedPredictionRequest {
  pickup_lat: number;
  pickup_lon: number;
  drop_lat: number;
  drop_lon: number;
  pickup_time_utc: string;
}

export interface CombinedPredictionResponse {
  distance_meters: number;
  eta_minutes: number;
  request: {
    pickup: LocationCoordinates;
    dropoff: LocationCoordinates;
    time: {
      pickup_time_utc: string;
      pickup_local_time: string;
      day_of_week: string;
      hour_of_day: number;
    };
  };
  timestamp: string;
}

export interface DistancePredictionRequest {
  pickup_lat?: number;
  pickup_lon?: number;
  drop_lat?: number;
  drop_lon?: number;
  pickup_address?: string;
  dropoff_address?: string;
}

export interface DistancePredictionResponse {
  distance_meters: number;
  request: {
    pickup: LocationCoordinates & { address?: string };
    dropoff: LocationCoordinates & { address?: string };
  };
  timestamp: string;
}

/**
 * Create an API instance for public API endpoints that require an API key
 * @param apiKey The API key to use for authentication
 * @returns An axios instance configured with the API key
 */
export const createPublicApi = (apiKey: string) => {
  const publicApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey
    },
    timeout: 10000, // 10 seconds
  });

  // Response interceptor
  publicApi.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      // Handle API key errors
      if (error.response?.status === 401) {
        console.error('Invalid or expired API key');
      } else if (error.response?.status === 403) {
        console.error('API key does not have the required permissions or quota exceeded');
      }
      return Promise.reject(error);
    }
  );

  return publicApi;
};

/**
 * Predict ETA using the public API
 * @param apiKey The API key to use for authentication
 * @param data The data to send to the API
 * @returns The API response
 */
export const predictEta = async (apiKey: string, data: EtaPredictionRequest): Promise<AxiosResponse<EtaPredictionResponse>> => {
  const api = createPublicApi(apiKey);
  return api.post('/v1/public/eta', data);
};

/**
 * Predict distance using the public API
 * @param apiKey The API key to use for authentication
 * @param data The data to send to the API
 * @returns The API response with distance prediction
 */
export const predictDistance = async (apiKey: string, data: DistancePredictionRequest): Promise<AxiosResponse<DistancePredictionResponse>> => {
  const api = createPublicApi(apiKey);
  return api.post('/v1/public/distance', data);
};

/**
 * Predict combined distance and ETA using the public API
 * @param apiKey The API key to use for authentication
 * @param data The data to send to the API
 * @returns The API response with both distance and ETA predictions
 */
export const predictCombined = async (apiKey: string, data: CombinedPredictionRequest): Promise<AxiosResponse<CombinedPredictionResponse>> => {
  const api = createPublicApi(apiKey);
  return api.post('/v1/public/combined', data);
};

/**
 * Helper function to format the error message from the API
 * @param error The error object from axios
 * @returns A formatted error message
 */
export const formatApiError = (error: unknown): string => {
  // Type guard for axios error with response
  if (typeof error === 'object' && error !== null) {
    // Check if it's an axios error with response
    const axiosError = error as { 
      response?: { 
        data?: { error?: string },
        status?: number 
      },
      message?: string
    };
    
    if (axiosError.response?.data?.error) {
      return axiosError.response.data.error;
    } else if (axiosError.response?.status === 401) {
      return 'Invalid or expired API key';
    } else if (axiosError.response?.status === 403) {
      return 'API key does not have the required permissions or quota exceeded';
    } else if (axiosError.message) {
      return axiosError.message;
    }
  }
  
  // Default error message
  return 'An unknown error occurred';
};

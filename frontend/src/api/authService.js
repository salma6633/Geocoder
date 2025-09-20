import api from './index';

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @param {string} userData.firstName - User's first name
 * @param {string} userData.lastName - User's last name
 * @param {string} userData.email - User's email
 * @param {string} userData.password - User's password
 * @param {string} [userData.company] - User's company (optional)
 * @param {boolean} [userData.agreeMarketing] - Marketing consent (optional)
 * @returns {Promise} Promise with auth response
 */
export const signup = async (userData) => {
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
  } catch (error) {
    throw error;
  }
};

/**
 * Login user
 * @param {Object} loginData - User login credentials
 * @param {string} loginData.email - User's email
 * @param {string} loginData.password - User's password
 * @param {boolean} [loginData.rememberMe] - Remember me option (optional)
 * @returns {Promise} Promise with auth response
 */
export const login = async (loginData) => {
  try {
    // Remove rememberMe as it's not needed in the API
    const { rememberMe, ...apiData } = loginData;
    const response = await api.post('/v1/auth/login', apiData);
    
    // Store token in localStorage if successful
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data));
      
      // If rememberMe is true, we could set a longer expiration or use a different storage mechanism
      // This is handled client-side since the token expiration is set on the server
    }
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get current user profile
 * @returns {Promise} Promise with user profile
 */
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/v1/auth/me');
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Logout user
 */
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  // You might want to redirect to login page or home page here
};

/**
 * Check if user is authenticated
 * @returns {boolean} boolean indicating if user is authenticated
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

/**
 * Get current user from localStorage
 * @returns {Object|null} User profile or null if not authenticated
 */
export const getStoredUser = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error parsing user from localStorage', error);
    return null;
  }
};

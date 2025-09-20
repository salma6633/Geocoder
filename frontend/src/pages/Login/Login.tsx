import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { login } from '../../store/slices/authSlice';
import './Login.scss';

// Modern SVG components
const CompassIcon = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="18" cy="18" r="16" stroke="currentColor" strokeWidth="2" fill="none" />
    <circle cx="18" cy="18" r="2.5" fill="currentColor" />
    <path d="M18 4L21.5 16H14.5L18 4Z" fill="currentColor" />
    <path d="M18 18L27 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M18 18L9 27" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M9 13.5C9 13.5 13.5 9 18 9C22.5 9 27 13.5 27 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 2" />
    <circle cx="18" cy="18" r="14" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
  </svg>
);

const EmailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.5 6.66669L9.0755 11.0504C9.63533 11.4236 10.3647 11.4236 10.9245 11.0504L17.5 6.66669M4.16667 15.8334H15.8333C16.7538 15.8334 17.5 15.0872 17.5 14.1667V5.83335C17.5 4.91288 16.7538 4.16669 15.8333 4.16669H4.16667C3.24619 4.16669 2.5 4.91288 2.5 5.83335V14.1667C2.5 15.0872 3.24619 15.8334 4.16667 15.8334Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13.3333 9.16669V6.66669C13.3333 4.82574 11.8409 3.33335 10 3.33335C8.15905 3.33335 6.66667 4.82574 6.66667 6.66669V9.16669M6.66667 9.16669H13.3333M6.66667 9.16669H5.83333C5.3731 9.16669 5 9.53978 5 10V15C5 15.4602 5.3731 15.8334 5.83333 15.8334H14.1667C14.6269 15.8334 15 15.4602 15 15V10C15 9.53978 14.6269 9.16669 14.1667 9.16669H13.3333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 4.16669C3.75 4.16669 1.66667 10 1.66667 10C1.66667 10 3.75 15.8334 10 15.8334C16.25 15.8334 18.3333 10 18.3333 10C18.3333 10 16.25 4.16669 10 4.16669Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 13.3333C11.8409 13.3333 13.3333 11.8409 13.3333 10C13.3333 8.15907 11.8409 6.66669 10 6.66669C8.15905 6.66669 6.66667 8.15907 6.66667 10C6.66667 11.8409 8.15905 13.3333 10 13.3333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.7678 11.7678C11.2989 12.2366 10.663 12.5 10 12.5C8.61929 12.5 7.5 11.3807 7.5 10C7.5 9.33696 7.76339 8.70107 8.23223 8.23223C8.70107 7.76339 9.33696 7.5 10 7.5C11.3807 7.5 12.5 8.61929 12.5 10C12.5 10.663 12.2366 11.2989 11.7678 11.7678Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2.04834 2.04834L17.9517 17.9517M9.99999 4.16667C12.0844 4.16667 14.0867 5.03571 15.5083 6.49917C16.9299 7.96262 17.8333 10.0111 17.8333 12.1429C17.8333 13.0958 17.6253 14.0255 17.2344 14.8889M14.8889 17.2344C14.0255 17.6253 13.0958 17.8333 12.1429 17.8333C10.0111 17.8333 7.96262 16.9299 6.49917 15.5083C5.03571 14.0867 4.16667 12.0844 4.16667 9.99999C4.16667 9.04708 4.37466 8.11742 4.76559 7.25397" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.76 10.2301C19.76 9.55012 19.7014 8.86012 19.5747 8.18012H10.24V11.9501H15.7094C15.4614 13.1701 14.7427 14.2201 13.6694 14.8801V17.3201H16.8814C18.7894 15.5701 19.76 13.1101 19.76 10.2301Z" fill="#4285F4"/>
    <path d="M10.24 20.0001C12.9454 20.0001 15.2347 19.1001 16.8814 17.3201L13.6694 14.8801C12.7694 15.4801 11.6054 15.8301 10.24 15.8301C7.6587 15.8301 5.4787 14.0801 4.6987 11.7101H1.3867V14.2301C3.0227 17.6001 6.3907 20.0001 10.24 20.0001Z" fill="#34A853"/>
    <path d="M4.69867 11.7101C4.48667 11.1101 4.36667 10.4701 4.36667 9.80012C4.36667 9.13012 4.48667 8.49012 4.69867 7.89012V5.37012H1.38667C0.724001 6.72012 0.333344 8.22679 0.333344 9.80012C0.333344 11.3735 0.724001 12.8801 1.38667 14.2301L4.69867 11.7101Z" fill="#FBBC05"/>
    <path d="M10.24 3.77C11.7214 3.77 13.0534 4.28 14.1054 5.29L16.9694 2.42667C15.2347 0.800001 12.9454 -0.0133323 10.24 -0.0133323C6.3907 -0.0133323 3.0227 2.38667 1.3867 5.75667L4.6987 8.27667C5.4787 5.90667 7.6587 3.77 10.24 3.77Z" fill="#EA4335"/>
  </svg>
);

const AppleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13.9638 3.33331C14.7571 2.39998 15.3504 1.13331 15.1838 -0.133362C14.0838 -0.0666952 12.7638 0.633305 11.9438 1.56664C11.2038 2.39998 10.5038 3.69998 10.6971 4.93331C11.9171 5.03331 13.1704 4.26664 13.9638 3.33331Z" fill="black"/>
    <path d="M15.9971 10.6C15.9704 8.26664 17.8304 7.09998 17.9038 7.06664C16.7104 5.26664 14.8238 5.03331 14.1638 5.01664C12.4504 4.83331 10.8238 5.99998 9.95713 5.99998C9.07713 5.99998 7.7571 5.03331 6.32377 5.06664C4.49043 5.09998 2.79043 6.13331 1.87043 7.76664C0.00376654 11.0666 1.42377 16.0333 3.22377 18.8333C4.12377 20.2 5.19043 21.7333 6.59043 21.6666C7.95713 21.6 8.47713 20.7666 10.1238 20.7666C11.7704 20.7666 12.2571 21.6666 13.6904 21.6333C15.1571 21.6 16.0771 20.2333 16.9438 18.8666C17.9704 17.3 18.3838 15.7666 18.4104 15.7C18.3838 15.6666 15.9971 14.7333 15.9971 10.6Z" fill="black"/>
  </svg>
);

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'email' | 'social'>('email');

  // Add decorative elements when component mounts
  useEffect(() => {
    const loginPage = document.querySelector('.login-page');
    if (loginPage) {
      const decorations = [
        { className: 'decoration circle-1' },
        { className: 'decoration circle-2' },
        { className: 'decoration dots-1' },
        { className: 'decoration dots-2' },
        { className: 'decoration wave' },
        { className: 'decoration grid' },
        { className: 'decoration blur-1' },
        { className: 'decoration blur-2' }
      ];
      
      decorations.forEach(decoration => {
        const element = document.createElement('div');
        element.className = decoration.className;
        loginPage.appendChild(element);
      });
    }
    
    return () => {
      const decorations = document.querySelectorAll('.decoration');
      decorations.forEach(decoration => decoration.remove());
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    return newErrors;
  };

  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated } = useAppSelector(state => state.auth);
  
  // Update isSubmitting state based on Redux isLoading state
  useEffect(() => {
    setIsSubmitting(isLoading);
  }, [isLoading]);
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);
  
  // Update errors from Redux state
  useEffect(() => {
    if (error) {
      setErrors({
        ...errors,
        general: error
      });
    }
  }, [error, errors]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    try {
      // Dispatch login action
      await dispatch(login({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe
      })).unwrap();
      
      // Navigation will happen in the useEffect when isAuthenticated changes
    } catch (error) {
      // Error handling is done in the reducer and useEffect
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const switchLoginMethod = (method: 'email' | 'social') => {
    setLoginMethod(method);
  };

  return (
    <div className="login-page">
      {/* Header with logo and signup link */}
      <div className="login-header">
        <Link to="/" className="logo-link">
          <div className="logo">
            <span className="logo-icon">
              <CompassIcon />
            </span>
            <span className="logo-text">Armada Etijahat</span>
          </div>
        </Link>
        
        <Link to="/signup" className="signup-link">
          <span>Create account</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 8H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 4L13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
      </div>
      
      <div className="login-content">
        <div className="login-card">
          <div className="login-card-header">
            <h1>Welcome back</h1>
            <p>Sign in to your Armada Etijahat account</p>
          </div>
          
          <div className="login-tabs">
            <button 
              className={`login-tab ${loginMethod === 'email' ? 'active' : ''}`}
              onClick={() => switchLoginMethod('email')}
            >
              Email
            </button>
            <button 
              className={`login-tab ${loginMethod === 'social' ? 'active' : ''}`}
              onClick={() => switchLoginMethod('social')}
            >
              Social
            </button>
            <div className="tab-indicator" style={{ left: loginMethod === 'email' ? '0%' : '50%' }}></div>
          </div>
          
          {loginMethod === 'email' ? (
            <form className="login-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <div className="input-wrapper">
                  <span className="input-icon">
                    <EmailIcon />
                  </span>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={errors.email ? 'error' : ''}
                    placeholder="Enter your email address"
                    autoComplete="email"
                  />
                  {errors.email && <div className="error-message">{errors.email}</div>}
                </div>
              </div>
              
              <div className="form-group">
                <div className="label-row">
                  <label htmlFor="password">Password</label>
                  <Link to="/forgot-password" className="forgot-password">Forgot password?</Link>
                </div>
                <div className="input-wrapper">
                  <span className="input-icon">
                    <LockIcon />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={errors.password ? 'error' : ''}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                  <button 
                    type="button" 
                    className="password-toggle" 
                    onClick={togglePasswordVisibility}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                  {errors.password && <div className="error-message">{errors.password}</div>}
                </div>
              </div>
              
              <div className="form-group checkbox-group">
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
                <label htmlFor="rememberMe">
                  Remember me for 30 days
                </label>
              </div>
              
              <button 
                type="submit" 
                className="login-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="loading-spinner">
                    <span className="spinner-circle"></span>
                    <span className="spinner-text">Signing in...</span>
                  </span>
                ) : (
                  <>
                    Sign in
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 8H13" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9 4L13 8L9 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="social-login">
              <p className="social-login-text">Continue with your social account</p>
              
              <div className="social-buttons">
                <button className="social-button google">
                  <GoogleIcon />
                  <span>Continue with Google</span>
                </button>
                
                <button className="social-button apple">
                  <AppleIcon />
                  <span>Continue with Apple</span>
                </button>
              </div>
            </div>
          )}
          
          <div className="login-footer">
            <p>Don't have an account? <Link to="/signup">Create one</Link></p>
          </div>
        </div>
        
        <div className="login-features">
          <div className="features-content">
            <h2>Unlock the power of Armada Etijahat</h2>
            <ul className="features-list">
              <li>
                <div className="feature-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 11L12 14L22 4M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="feature-text">
                  <h3>Advanced Analytics</h3>
                  <p>Get real-time insights and visualizations for your data</p>
                </div>
              </li>
              <li>
                <div className="feature-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 3V5M12 19V21M5 12H3M21 12H19M18.364 5.636L16.95 7.05M7.05 16.95L5.636 18.364M7.05 7.05L5.636 5.636M18.364 18.364L16.95 16.95" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="feature-text">
                  <h3>Intelligent Insights</h3>
                  <p>AI-powered recommendations to optimize your operations</p>
                </div>
              </li>
              <li>
                <div className="feature-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="feature-text">
                  <h3>Real-time Tracking</h3>
                  <p>Monitor your fleet and deliveries with precision</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

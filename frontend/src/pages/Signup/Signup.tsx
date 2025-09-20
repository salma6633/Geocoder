import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { signup } from '../../store/slices/authSlice';
import './Signup.scss';

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

const SuccessIcon = () => (
  <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" stroke="#10b981" strokeWidth="4" fill="none" />
    <path d="M30 50L45 65L70 40" stroke="#10b981" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="50" cy="50" r="40" stroke="#10b981" strokeWidth="1" strokeDasharray="3 3" />
    <circle cx="50" cy="50" r="35" stroke="#10b981" strokeWidth="1" strokeDasharray="1 1" opacity="0.5" />
  </svg>
);


const ArrowIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 2V16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 9L9 16L2 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Signup: React.FC = () => {
  // Add decorative elements when component mounts
  useEffect(() => {
    const signupPage = document.querySelector('.signup-page');
    if (signupPage) {
      const decorations = [
        { className: 'decoration circle-1' },
        { className: 'decoration circle-2' },
        { className: 'decoration dots-1' },
        { className: 'decoration dots-2' },
        { className: 'decoration wave' },
        { className: 'decoration grid' }
      ];
      
      decorations.forEach(decoration => {
        const element = document.createElement('div');
        element.className = decoration.className;
        signupPage.appendChild(element);
      });
    }
    
    return () => {
      const decorations = document.querySelectorAll('.decoration');
      decorations.forEach(decoration => decoration.remove());
    };
  }, []);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    agreeTerms: false,
    agreeMarketing: false
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [passwordFocus, setPasswordFocus] = useState(false);

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

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};
    
    if (step === 1) {
      if (!formData.firstName.trim()) {
        newErrors.firstName = 'First name is required';
      }
      
      if (!formData.lastName.trim()) {
        newErrors.lastName = 'Last name is required';
      }
      
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid';
      }
    }
    
    if (step === 2) {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      } else if (!/[A-Z]/.test(formData.password)) {
        newErrors.password = 'Password must include an uppercase letter';
      } else if (!/[0-9]/.test(formData.password)) {
        newErrors.password = 'Password must include a number';
      } else if (!/[^A-Za-z0-9]/.test(formData.password)) {
        newErrors.password = 'Password must include a special character';
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    if (step === 3) {
      if (!formData.agreeTerms) {
        newErrors.agreeTerms = 'You must agree to the terms and conditions';
      }
    }
    
    return newErrors;
  };

  const handleNextStep = () => {
    const newErrors = validateStep(currentStep);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setCurrentStep(currentStep + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const navigate = useNavigate();
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
    
    const newErrors = validateStep(currentStep);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Dispatch signup action
      await dispatch(signup({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        company: formData.company,
        agreeMarketing: formData.agreeMarketing
      })).unwrap();
      
      setSignupSuccess(true);
    } catch (error) {
      // Error handling is done in the reducer
      setErrors({
        ...errors,
        general: typeof error === 'string' ? error : 'Signup failed. Please try again.'
      });
      setIsSubmitting(false);
    }
  };

  // Login icon for the header
  const LoginIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15.8333 9.99996H4.16666M4.16666 9.99996L9.16666 15M4.16666 9.99996L9.16666 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  
  // Step indicator component
  const StepIndicator = ({ currentStep, totalSteps = 3 }: { currentStep: number, totalSteps?: number }) => {
    return (
      <div className="step-indicator">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div 
            key={index} 
            className={`step-dot ${currentStep > index ? 'completed' : ''} ${currentStep === index + 1 ? 'active' : ''}`}
          />
        ))}
      </div>
    );
  };

  if (signupSuccess) {
    return (
      <div className="signup-page success-page">
        <div className="decoration circle-1"></div>
        <div className="decoration circle-2"></div>
        <div className="decoration dots-1"></div>
        <div className="decoration dots-2"></div>
        <div className="decoration wave"></div>
        <div className="decoration grid"></div>
        
        <div className="signup-success">
          <div className="success-icon">
            <SuccessIcon />
          </div>
          <h2>Your Armada Etijahat ID has been created!</h2>
          <p>Welcome to Armada Etijahat. You can now access all our services and APIs.</p>
          <div className="success-actions">
            <Link to="/" className="btn btn-primary">
              Go to Dashboard
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginLeft: '8px'}}>
                <path d="M3 8H13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 4L13 8L9 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <button className="btn btn-secondary">
              Complete Your Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="signup-page">
      <div className="decoration circle-1"></div>
      <div className="decoration circle-2"></div>
      <div className="decoration dots-1"></div>
      <div className="decoration dots-2"></div>
      <div className="decoration wave"></div>
      <div className="decoration grid"></div>
      
      {/* Header with logo and login link */}
      <div className="signup-header">
        <Link to="/" className="logo-link">
          <div className="logo">
            <span className="logo-icon">
              <CompassIcon />
            </span>
            <span className="logo-text">Armada Etijahat</span>
          </div>
        </Link>
        
        <Link to="/" className="login-link">
          <LoginIcon />
          Sign in
        </Link>
      </div>
      
      <div className="signup-content">
        <div className="content-header">
          <h1>Create your Armada Etijahat ID</h1>
          <p>Your Armada Etijahat ID gives you access to all Armada services and APIs</p>
        </div>
        
        {/* Step indicator */}
        <StepIndicator currentStep={currentStep} />
        
        <form className="signup-form" onSubmit={handleSubmit}>
          {currentStep === 1 && (
            <div className="form-step" style={{animationDelay: '0.1s'}}>
              <h2>Account Information</h2>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First name</label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={errors.firstName ? 'error' : ''}
                      placeholder="Enter your first name"
                    />
                    {errors.firstName && <div className="error-message">{errors.firstName}</div>}
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="lastName">Last name</label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={errors.lastName ? 'error' : ''}
                      placeholder="Enter your last name"
                    />
                    {errors.lastName && <div className="error-message">{errors.lastName}</div>}
                  </div>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <div className="input-wrapper">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={errors.email ? 'error' : ''}
                    placeholder="Enter your email address"
                  />
                  {errors.email && <div className="error-message">{errors.email}</div>}
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="company">Company (optional)</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="Enter your company name"
                  />
                </div>
              </div>
            </div>
          )}
          
          {currentStep === 2 && (
            <div className="form-step" style={{animationDelay: '0.1s'}}>
              <h2>Security Setup</h2>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-wrapper">
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => setPasswordFocus(true)}
                    onBlur={() => setPasswordFocus(false)}
                    className={errors.password ? 'error' : ''}
                    placeholder="Create a password"
                  />
                  {errors.password && <div className="error-message">{errors.password}</div>}
                </div>
                
                <div className={`password-requirements ${passwordFocus ? 'visible' : ''}`}>
                  <ul>
                    <li className={formData.password.length >= 8 ? 'valid' : ''}>
                      <span className="check-icon"></span>
                      At least 8 characters
                    </li>
                    <li className={/[A-Z]/.test(formData.password) ? 'valid' : ''}>
                      <span className="check-icon"></span>
                      At least 1 uppercase letter
                    </li>
                    <li className={/[0-9]/.test(formData.password) ? 'valid' : ''}>
                      <span className="check-icon"></span>
                      At least 1 number
                    </li>
                    <li className={/[^A-Za-z0-9]/.test(formData.password) ? 'valid' : ''}>
                      <span className="check-icon"></span>
                      At least 1 special character
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm password</label>
                <div className="input-wrapper">
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={errors.confirmPassword ? 'error' : ''}
                    placeholder="Confirm your password"
                  />
                  {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
                </div>
              </div>
              
              <div className="password-strength">
                <div className="strength-label">Password strength:</div>
                <div className="strength-meter">
                  <div 
                    className={`strength-value ${
                      formData.password.length === 0 ? 'empty' :
                      formData.password.length < 8 ? 'weak' :
                      !/[A-Z]/.test(formData.password) || !/[0-9]/.test(formData.password) ? 'medium' :
                      !/[^A-Za-z0-9]/.test(formData.password) ? 'good' : 'strong'
                    }`}
                  ></div>
                </div>
                <div className="strength-text">
                  {formData.password.length === 0 ? '' :
                   formData.password.length < 8 ? 'Weak' :
                   !/[A-Z]/.test(formData.password) || !/[0-9]/.test(formData.password) ? 'Medium' :
                   !/[^A-Za-z0-9]/.test(formData.password) ? 'Good' : 'Strong'}
                </div>
              </div>
            </div>
          )}
          
          {currentStep === 3 && (
            <div className="form-step" style={{animationDelay: '0.1s'}}>
              <h2>Terms & Preferences</h2>
              <div className="terms-section">
                <h3>Terms and Conditions</h3>
                <div className="terms-container">
                  <p>By creating an Armada Etijahat ID, you agree to the following terms:</p>
                  <ul>
                    <li>Your personal information will be processed in accordance with our Privacy Policy.</li>
                    <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                    <li>Armada Etijahat services are provided "as is" without warranties of any kind.</li>
                    <li>We reserve the right to modify, suspend, or discontinue any part of our services.</li>
                    <li>You agree not to use our services for any illegal or unauthorized purpose.</li>
                  </ul>
                </div>
                
                <div className="form-group checkbox-group">
                  <input
                    type="checkbox"
                    id="agreeTerms"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    className={errors.agreeTerms ? 'error' : ''}
                  />
                  <label htmlFor="agreeTerms">
                    I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
                  </label>
                  {errors.agreeTerms && <div className="error-message">{errors.agreeTerms}</div>}
                </div>
                
                <div className="form-group checkbox-group">
                  <input
                    type="checkbox"
                    id="agreeMarketing"
                    name="agreeMarketing"
                    checked={formData.agreeMarketing}
                    onChange={handleChange}
                  />
                  <label htmlFor="agreeMarketing">
                    I would like to receive updates about Armada Etijahat products, services, and events
                  </label>
                </div>
              </div>
              
              <div className="account-summary">
                <h3>Account Summary</h3>
                <div className="summary-item">
                  <span className="summary-label">Name:</span>
                  <span className="summary-value">{formData.firstName} {formData.lastName}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Email:</span>
                  <span className="summary-value">{formData.email}</span>
                </div>
                {formData.company && (
                  <div className="summary-item">
                    <span className="summary-label">Company:</span>
                    <span className="summary-value">{formData.company}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="form-actions">
            {currentStep > 1 && (
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={handlePrevStep}
              >
                Back
              </button>
            )}
            
            {currentStep < 3 ? (
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={handleNextStep}
              >
                Continue
              </button>
            ) : (
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="loading-spinner">
                      <span className="spinner-circle"></span>
                      <span className="spinner-text">Creating Account...</span>
                    </span>
                  ) : (
                    <>
                      Create Armada Etijahat ID
                      <ArrowIcon />
                    </>
                  )}
                </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface ValidationErrors {
  first_name?: string;
  last_name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  checks: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    symbol: boolean;
    noRepeated: boolean;
    differentFromEmail: boolean;
  };
}

export default function RegistrationForm() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    label: '',
    color: '',
    checks: {
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      symbol: false,
      noRepeated: false,
      differentFromEmail: false,
    }
  });

  // Calculate password strength
  const calculatePasswordStrength = (password: string, email: string): PasswordStrength => {
    const checks = {
      length: password.length >= 12,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      symbol: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      noRepeated: !hasRepeatedChars(password),
      differentFromEmail: isDifferentFromEmail(password, email),
    };

    const score = Object.values(checks).filter(Boolean).length;
    
    let label = '';
    let color = '';
    
    if (score === 0) {
      label = '';
      color = '';
    } else if (score <= 2) {
      label = 'Weak';
      color = 'bg-red-500';
    } else if (score <= 4) {
      label = 'Fair';
      color = 'bg-yellow-500';
    } else if (score <= 6) {
      label = 'Good';
      color = 'bg-blue-500';
    } else {
      label = 'Strong';
      color = 'bg-green-500';
    }

    return { score, label, color, checks };
  };

  const hasRepeatedChars = (password: string): boolean => {
    for (let i = 0; i <= password.length - 3; i++) {
      if (password[i] === password[i + 1] && password[i] === password[i + 2]) {
        return true;
      }
    }
    return false;
  };

  const isDifferentFromEmail = (password: string, email: string): boolean => {
    if (!email) return true;
    const emailLocal = email.split('@')[0].toLowerCase();
    const passwordLower = password.toLowerCase();
    let differences = 0;
    const minLength = Math.min(emailLocal.length, passwordLower.length);
    
    for (let i = 0; i < minLength; i++) {
      if (emailLocal[i] !== passwordLower[i]) differences++;
    }
    differences += Math.abs(emailLocal.length - passwordLower.length);
    
    return differences >= 5;
  };

  // Validation functions
  const validateName = (name: string, field: string): string | undefined => {
    if (!name.trim()) return `${field} is required`;
    if (name.trim().length < 2) return `${field} must be at least 2 characters`;
    if (!/^[a-zA-Z\s-]+$/.test(name)) return `${field} can only contain letters, spaces, and hyphens`;
    return undefined;
  };

  const validateEmail = (email: string): string | undefined => {
    if (!email) return 'Work email is required';
    if (!email.endsWith('@getcovered.io')) return 'Email must be @getcovered.io';
    const emailRegex = /^[a-zA-Z0-9._%+-]+@getcovered\.io$/;
    if (!emailRegex.test(email)) return 'Invalid email format';
    return undefined;
  };

  const validatePassword = (password: string, email: string): string | undefined => {
    if (!password) return 'Password is required';
    
    const strength = calculatePasswordStrength(password, email);
    setPasswordStrength(strength);
    
    if (!strength.checks.length) return 'Password must be at least 12 characters long';
    if (!strength.checks.uppercase) return 'Password must contain an uppercase letter';
    if (!strength.checks.lowercase) return 'Password must contain a lowercase letter';
    if (!strength.checks.number) return 'Password must contain a number';
    if (!strength.checks.symbol) return 'Password must contain a special character';
    if (!strength.checks.noRepeated) return 'Password cannot have 3 or more repeated characters in a row';
    if (!strength.checks.differentFromEmail) return 'Password must differ from email username by at least 5 characters';
    
    return undefined;
  };

  const validateConfirmPassword = (password: string, confirmPassword: string): string | undefined => {
    if (!confirmPassword) return 'Please confirm your password';
    if (password !== confirmPassword) return 'Passwords do not match';
    return undefined;
  };

  // Real-time validation
  const validateField = (name: keyof FormData, value: string) => {
    let error: string | undefined;
    
    switch (name) {
      case 'first_name':
        error = validateName(value, 'First name');
        break;
      case 'last_name':
        error = validateName(value, 'Last name');
        break;
      case 'email':
        error = validateEmail(value);
        if (formData.password) {
          const passwordError = validatePassword(formData.password, value);
          setErrors(prev => ({ ...prev, password: passwordError }));
        }
        break;
      case 'password':
        error = validatePassword(value, formData.email);
        if (formData.confirmPassword) {
          const confirmError = validateConfirmPassword(value, formData.confirmPassword);
          setErrors(prev => ({ ...prev, confirmPassword: confirmError }));
        }
        break;
      case 'confirmPassword':
        error = validateConfirmPassword(formData.password, value);
        break;
    }
    
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name as keyof FormData, value);
  };

  const isFormValid = () => {
    return (
      formData.first_name &&
      formData.last_name &&
      formData.email &&
      formData.password &&
      formData.confirmPassword &&
      !Object.values(errors).some(error => error) &&
      passwordStrength.score === 7
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) return;

    setIsSubmitting(true);
    try {
      await register({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
      });
      navigate('/welcome');
    } catch (error: any) {
      setErrors({ email: error.response?.data?.detail || 'Registration failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
      <div className="space-y-5">
        {/* First Name */}
        <div>
          <label 
            htmlFor="first_name" 
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            First Name
          </label>
          <input
            id="first_name"
            name="first_name"
            type="text"
            autoComplete="given-name"
            value={formData.first_name}
            onChange={handleInputChange}
            className={`block w-full px-4 py-3 border ${
              errors.first_name 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
            } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors duration-200`}
            placeholder="Enter your first name"
            aria-invalid={errors.first_name ? 'true' : 'false'}
            aria-describedby={errors.first_name ? 'first_name-error' : undefined}
          />
          {errors.first_name && (
            <p id="first_name-error" role="alert" className="mt-2 text-sm text-red-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.first_name}
            </p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <label 
            htmlFor="last_name" 
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Last Name
          </label>
          <input
            id="last_name"
            name="last_name"
            type="text"
            autoComplete="family-name"
            value={formData.last_name}
            onChange={handleInputChange}
            className={`block w-full px-4 py-3 border ${
              errors.last_name 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
            } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors duration-200`}
            placeholder="Enter your last name"
            aria-invalid={errors.last_name ? 'true' : 'false'}
            aria-describedby={errors.last_name ? 'last_name-error' : undefined}
          />
          {errors.last_name && (
            <p id="last_name-error" role="alert" className="mt-2 text-sm text-red-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.last_name}
            </p>
          )}
        </div>

        {/* Work Email */}
        <div>
          <label 
            htmlFor="email" 
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Work Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`block w-full px-4 py-3 border ${
              errors.email 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
            } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors duration-200`}
            placeholder="your.name@getcovered.io"
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={errors.email ? 'email-error' : 'email-hint'}
          />
          <p id="email-hint" className="mt-1 text-sm text-gray-500">
            Must be a @getcovered.io email address
          </p>
          {errors.email && (
            <p id="email-error" role="alert" className="mt-2 text-sm text-red-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.email}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label 
            htmlFor="password" 
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={formData.password}
              onChange={handleInputChange}
              className={`block w-full px-4 py-3 pr-12 border ${
                errors.password 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
              } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors duration-200`}
              placeholder="Create a strong password"
              aria-invalid={errors.password ? 'true' : 'false'}
              aria-describedby="password-requirements password-strength"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>
          
          {/* Password Strength Meter */}
          {formData.password && (
            <div className="mt-3" id="password-strength" aria-live="polite">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Password strength:</span>
                <span className={`text-sm font-medium ${
                  passwordStrength.color === 'bg-green-500' ? 'text-green-600' :
                  passwordStrength.color === 'bg-blue-500' ? 'text-blue-600' :
                  passwordStrength.color === 'bg-yellow-500' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {passwordStrength.label}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                  style={{ width: `${(passwordStrength.score / 7) * 100}%` }}
                />
              </div>
              
              {/* Password Requirements Checklist */}
              <div className="grid grid-cols-1 gap-1 text-xs">
                {Object.entries({
                  length: '12+ characters',
                  uppercase: 'Uppercase letter',
                  lowercase: 'Lowercase letter', 
                  number: 'Number',
                  symbol: 'Special character',
                  noRepeated: 'No 3+ repeated chars',
                  differentFromEmail: 'Different from email'
                }).map(([key, label]) => (
                  <div key={key} className="flex items-center">
                    <svg 
                      className={`w-3 h-3 mr-2 ${
                        passwordStrength.checks[key as keyof typeof passwordStrength.checks] 
                          ? 'text-green-500' 
                          : 'text-gray-300'
                      }`} 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className={passwordStrength.checks[key as keyof typeof passwordStrength.checks] ? 'text-gray-700' : 'text-gray-400'}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {errors.password && (
            <p role="alert" className="mt-2 text-sm text-red-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.password}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label 
            htmlFor="confirmPassword" 
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={`block w-full px-4 py-3 pr-12 border ${
                errors.confirmPassword 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                  : formData.confirmPassword && !errors.confirmPassword
                  ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
                  : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
              } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors duration-200`}
              placeholder="Confirm your password"
              aria-invalid={errors.confirmPassword ? 'true' : 'false'}
              aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
              aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
            >
              {showConfirmPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>
          {formData.confirmPassword && !errors.confirmPassword && (
            <p className="mt-2 text-sm text-green-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Passwords match
            </p>
          )}
          {errors.confirmPassword && (
            <p id="confirm-password-error" role="alert" className="mt-2 text-sm text-red-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.confirmPassword}
            </p>
          )}
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={!isFormValid() || isSubmitting}
          className={`group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            isFormValid() && !isSubmitting
              ? 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
          aria-describedby="submit-status"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating Account...
            </>
          ) : (
            'Create Account'
          )}
        </button>
        <p id="submit-status" className="sr-only" aria-live="polite">
          {isSubmitting ? 'Creating your account, please wait' : isFormValid() ? 'Ready to create account' : 'Please fill out all required fields'}
        </p>
      </div>
    </form>
  );
};

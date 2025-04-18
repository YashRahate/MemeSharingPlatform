import React, { useState } from 'react';
import useAuth from '../../hooks/useAuth';

const Signup = ({ switchToLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');
  
  const { register } = useAuth();
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }
    
    setIsLoading(true);
    setFormError('');
    
    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      // Redirect is handled by the protected route component
    } catch (err) {
      setFormError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="p-6 w-full max-w-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Create an Account</h2>
      
      {formError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {formError}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="username" className="form-label">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            className="form-input"
            placeholder="Choose a username"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="form-input"
            placeholder="your@email.com"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="password" className="form-label">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="form-input"
            placeholder="••••••••"
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="form-input"
            placeholder="••••••••"
          />
        </div>
        
        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>
      
      <div className="mt-4 text-center">
        <p>
          Already have an account?{' '}
          <button
            onClick={switchToLogin}
            className="text-blue-600 hover:underline"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default Signup;
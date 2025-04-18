import React, { useState } from 'react';
import useAuth from '../../hooks/useAuth';

const Login = ({ switchToSignup }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');
  
  const { login } = useAuth();
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError('');
    
    try {
      await login(formData);
      // Redirect is handled by the protected route component
    } catch (err) {
      setFormError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="p-6 w-full max-w-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Login to MemeHub</h2>
      
      {formError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {formError}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="form-label">Email - </label>
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
        
        <div className="mb-6">
          <label htmlFor="password" className="form-label">Password - </label>
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
        
        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
      <div className="mt-4 text-center">
        <p>
          Don't have an account?{' '}
          <button
            onClick={switchToSignup}
            className="text-blue-600 hover:underline"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
import React, { useState } from 'react';
import Login from '../components/Auth/Login';
import Signup from '../components/Auth/Signup';

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState('login');

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('login')}
          className={`flex-1 py-4 font-medium text-center ${
            activeTab === 'login'
              ? 'bg-white text-blue-500 border-b-2 border-blue-500'
              : 'bg-gray-50 text-gray-600'
          }`}
        >
          Login
        </button>
        <button
          onClick={() => setActiveTab('signup')}
          className={`flex-1 py-4 font-medium text-center ${
            activeTab === 'signup'
              ? 'bg-white text-blue-500 border-b-2 border-blue-500'
              : 'bg-gray-50 text-gray-600'
          }`}
        >
          Sign Up
        </button>
      </div>
      
      <div className="p-6">
        {activeTab === 'login' ? <Login /> : <Signup />}
      </div>
    </div>
  );
};

export default AuthPage;
'use client';
import React, { useState } from 'react';
import { Mail, Lock, User, Sparkles } from 'lucide-react';

const AuthPage = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);

  // Reusable Input Component
  const InputField = ({ icon: Icon, type, placeholder }) => (
    <div className="relative mb-4">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type={type}
        className="block w-full pl-11 pr-4 py-3 border border-gray-100 rounded-xl bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all shadow-sm"
        placeholder={placeholder}
      />
    </div>
  );

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F9F9F9] p-4 font-sans">
      {/* Soft Background Gradients */}
      <div className="fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-50 via-transparent to-orange-50 opacity-70" />
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 p-8 md:p-12 transition-all">
        
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-50 to-purple-100 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
            <Sparkles className="text-indigo-400 w-8 h-8" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-2 tracking-tight">
            {isLogin ? 'Welcome Back' : 'Join ScholarSync'}
          </h1>
          <p className="text-gray-400 text-sm">
            {isLogin 
              ? 'Sign in to continue your learning journey' 
              : 'Start your AI-powered learning journey'}
          </p>
        </div>

        {/* Form Fields */}
        <form onSubmit={(e) => e.preventDefault()}>
          {!isLogin && (
            <InputField icon={User} type="text" placeholder="Full Name" />
          )}
          
          <InputField icon={Mail} type="email" placeholder="Email" />
          <InputField icon={Lock} type="password" placeholder="Password" />
          
          {!isLogin && (
            <InputField icon={Lock} type="password" placeholder="Confirm Password" />
          )}

          {/* Primary Action Button */}
          <button 
           onClick={onLoginSuccess} // <--- ADD THIS
  type="button"            // <--- ADD THIS so it doesn't refresh the page
          className="w-full bg-[#E0E7FF] hover:bg-[#D1DAFF] text-[#4F46E5] font-semibold py-4 rounded-xl transition-colors mt-4 shadow-sm">
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-100"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-4 text-gray-400 font-medium">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </span>
          </div>
        </div>

        {/* Toggle Button */}
        <button 
          onClick={() => setIsLogin(!isLogin)}
          className="w-full border border-gray-100 hover:bg-gray-50 text-gray-700 font-semibold py-4 rounded-xl transition-all"
        >
          {isLogin ? 'Create Account' : 'Sign In'}
        </button>
      </div>
    </div>
  );
};

export default AuthPage;
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const LoginPage = () => {
  const [email, setEmail] = useState('demo@dealflow.com');
  const [password, setPassword] = useState('demo123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 w-full max-w-md">
        {/* DealFlow360 Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#a459a8] text-white font-bold text-2xl mx-auto flex items-center justify-center shadow-lg shadow-[#a459a8]/30 mb-3">
            D
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">DealFlow<span className="text-[#a459a8]">360</span></h1>
          <p className="text-xs text-slate-500 mt-1">Enterprise Quote & Deal Revenue Intelligence</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Work Email"
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="demo@dealflow.com"
            icon={Mail}
            required
          />

          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            icon={Lock}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            required
          />

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-slate-600">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-300 text-[#a459a8] focus:ring-[#a459a8]"
              />
              Remember me
            </label>
            <a href="#forgot" className="text-[#a459a8] font-medium hover:underline">
              Forgot Password?
            </a>
          </div>

          <Button type="submit" variant="primary" className="w-full py-2.5 font-semibold">
            Sign In to DealFlow360
          </Button>
        </form>

        {/* Demo Credentials Box */}
        <div className="mt-6 p-3 bg-purple-50/70 border border-purple-200 rounded-xl text-xs text-purple-900 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-[#a459a8] flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-slate-800">Demo Credentials:</p>
            <p className="text-slate-600 font-mono mt-0.5">Email: <span className="font-bold">demo@dealflow.com</span></p>
            <p className="text-slate-600 font-mono">Password: <span className="font-bold">demo123</span></p>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/signup" className="text-[#a459a8] font-semibold hover:underline">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

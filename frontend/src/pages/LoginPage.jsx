import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, Crown, Briefcase, UserCheck, Calculator, Globe, ArrowRight } from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { useAuth, DEMO_ACCOUNTS } from '../contexts/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('admin@dealflow360.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login, switchRole } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await login(email, password);
      if (res.user.role === 'customer') {
        navigate('/customer-portal/demo-token-123');
      } else {
        navigate('/dashboard');
      }
    } catch {
      setError('Invalid login credentials');
    }
  };

  const handleQuickRoleLogin = (roleKey) => {
    const acc = DEMO_ACCOUNTS[roleKey];
    if (acc) {
      setEmail(acc.email);
      setPassword('password123');
      switchRole(roleKey);
      if (roleKey === 'customer') {
        navigate('/customer-portal/demo-token-123');
      } else {
        navigate('/dashboard');
      }
    }
  };

  const quickRoles = [
    { key: 'admin', label: 'Admin', roleText: 'Full System Access', icon: Crown, border: 'hover:border-purple-500 hover:bg-purple-50/50', badge: 'bg-purple-100 text-purple-700' },
    { key: 'sales_rep', label: 'Sales Rep', roleText: 'Quotes & Catalog', icon: Briefcase, border: 'hover:border-blue-500 hover:bg-blue-50/50', badge: 'bg-blue-100 text-blue-700' },
    { key: 'sales_manager', label: 'Sales Manager', roleText: 'L1 Approvals & Health', icon: UserCheck, border: 'hover:border-indigo-500 hover:bg-indigo-50/50', badge: 'bg-indigo-100 text-indigo-700' },
    { key: 'finance_ops', label: 'Finance & Ops', roleText: 'L2 Approvals & Orders', icon: Calculator, border: 'hover:border-emerald-500 hover:bg-emerald-50/50', badge: 'bg-emerald-100 text-emerald-700' },
    { key: 'customer', label: 'Customer Portal', roleText: 'Negotiate & Accept', icon: Globe, border: 'hover:border-amber-500 hover:bg-amber-50/50', badge: 'bg-amber-100 text-amber-700' }
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg space-y-6">
        {/* DealFlow360 Logo */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#a459a8] text-white font-bold text-2xl mx-auto flex items-center justify-center shadow-lg shadow-[#a459a8]/30 mb-3">
            D
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">DealFlow<span className="text-[#a459a8]">360</span></h1>
          <p className="text-xs text-slate-500 mt-1">Enterprise Quote & Deal Revenue Operations</p>
        </div>

        {/* 1-Click Role Access Buttons */}
        <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#a459a8]" /> 1-Click Role Access Buttons
            </span>
            <span className="text-[10px] text-slate-400">Click any role to test</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {quickRoles.map((r) => {
              const Icon = r.icon;
              return (
                <button
                  key={r.key}
                  id={`login-role-${r.key}`}
                  type="button"
                  onClick={() => handleQuickRoleLogin(r.key)}
                  className={`p-2.5 rounded-xl border border-slate-200 bg-white text-left transition-all flex items-center justify-between group shadow-sm ${r.border}`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 group-hover:text-[#a459a8]">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 leading-tight">{r.label}</p>
                      <p className="text-[10px] text-slate-400 leading-tight">{r.roleText}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#a459a8] group-hover:translate-x-0.5 transition-all" />
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
            {error}
          </div>
        )}

        {/* Standard Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Work Email"
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@dealflow360.com"
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
              Default password: <span className="font-mono font-bold">password123</span>
            </a>
          </div>

          <Button type="submit" variant="primary" className="w-full py-2.5 font-semibold bg-[#a459a8] hover:bg-[#924b96]">
            Sign In with Credentials
          </Button>
        </form>

        <div className="text-center text-xs text-slate-500">
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

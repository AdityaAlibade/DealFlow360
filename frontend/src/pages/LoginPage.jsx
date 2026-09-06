import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Crown,
  UserCheck,
  Briefcase,
  Calculator,
  ShoppingBag,
  ArrowRight,
  Zap
} from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login, directLogin } = useAuth();

  const getPortalDestination = (roleKey) => {
    switch (roleKey) {
      case 'admin':
        return '/admin';
      case 'sales_rep':
      case 'sales_manager':
        return '/sales';
      case 'finance_ops':
        return '/finance';
      case 'customer':
        return '/customer-portal/demo-token-123';
      default:
        return '/dashboard';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await login(email, password);
      const destination = getPortalDestination(res.user?.role);
      navigate(destination);
    } catch {
      setError('Invalid login credentials');
    }
  };

  const handleDirectLogin = async (roleKey) => {
    setError(null);
    try {
      const res = await directLogin(roleKey);
      if (res && res.user) {
        const destination = getPortalDestination(res.user.role);
        navigate(destination);
      }
    } catch {
      setError('Failed to log in with selected role');
    }
  };

  const roleLogins = [
    {
      roleKey: 'admin',
      name: 'Admin',
      badge: 'System Admin',
      email: 'adityaalibade1046@gmail.com',
      portalText: '/admin',
      icon: Crown,
      borderClass: 'border-purple-200 hover:border-purple-500',
      bgClass: 'bg-purple-50/40 hover:bg-purple-50',
      iconBg: 'bg-purple-100 text-purple-700',
      iconColor: 'text-purple-700',
      badgeClass: 'bg-purple-100 text-purple-800'
    },
    {
      roleKey: 'sales_manager',
      name: 'Sales Manager',
      badge: 'L1 Approver',
      email: 'salesmanager@dealflow360.com',
      portalText: '/sales',
      icon: UserCheck,
      borderClass: 'border-indigo-200 hover:border-indigo-500',
      bgClass: 'bg-indigo-50/40 hover:bg-indigo-50',
      iconBg: 'bg-indigo-100 text-indigo-700',
      iconColor: 'text-indigo-700',
      badgeClass: 'bg-indigo-100 text-indigo-800'
    },
    {
      roleKey: 'sales_rep',
      name: 'Sales Rep',
      badge: 'Sales Ops',
      email: 'salesrep@dealflow360.com',
      portalText: '/sales',
      icon: Briefcase,
      borderClass: 'border-blue-200 hover:border-blue-500',
      bgClass: 'bg-blue-50/40 hover:bg-blue-50',
      iconBg: 'bg-blue-100 text-blue-700',
      iconColor: 'text-blue-700',
      badgeClass: 'bg-blue-100 text-blue-800'
    },
    {
      roleKey: 'finance_ops',
      name: 'Finance Manager',
      badge: 'L2 Approver',
      email: 'financemanager@dealflow360.com',
      portalText: '/finance',
      icon: Calculator,
      borderClass: 'border-emerald-200 hover:border-emerald-500',
      bgClass: 'bg-emerald-50/40 hover:bg-emerald-50',
      iconBg: 'bg-emerald-100 text-emerald-700',
      iconColor: 'text-emerald-700',
      badgeClass: 'bg-emerald-100 text-emerald-800'
    },
    {
      roleKey: 'customer',
      name: 'Customer',
      badge: 'Client Portal',
      email: 'customer@dealflow360.com',
      portalText: '/customer',
      icon: ShoppingBag,
      borderClass: 'border-amber-200 hover:border-amber-500',
      bgClass: 'bg-amber-50/40 hover:bg-amber-50',
      iconBg: 'bg-amber-100 text-amber-700',
      iconColor: 'text-amber-700',
      badgeClass: 'bg-amber-100 text-amber-800'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 w-full max-w-md space-y-6">
        {/* DealFlow360 Logo */}
        <div className="text-center">
          <Link
            to="/dashboard"
            className="inline-block cursor-pointer hover:opacity-90 transition-opacity"
            title="DealFlow360 Dashboard"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#a459a8] text-white font-bold text-2xl mx-auto flex items-center justify-center shadow-lg shadow-[#a459a8]/30 mb-3">
              D
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">DealFlow<span className="text-[#a459a8]">360</span></h1>
          </Link>
          <p className="text-xs text-slate-500 mt-1">Enterprise Quote & Deal Revenue Operations</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
            {error}
          </div>
        )}

        {/* Direct 1-Click Role Login Section */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Direct Role Access
            </span>
            <span className="text-[10px] text-slate-400 font-medium">1-Click Portal Sign-In</span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {roleLogins.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.roleKey}
                  type="button"
                  id={`direct-login-${item.roleKey}`}
                  onClick={() => handleDirectLogin(item.roleKey)}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all duration-150 ${item.borderClass} ${item.bgClass} hover:shadow-sm cursor-pointer group`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.iconBg}`}>
                      <Icon className={`w-4 h-4 ${item.iconColor}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{item.name}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${item.badgeClass}`}>
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">{item.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 group-hover:text-slate-800 transition-colors">
                    <span>{item.portalText}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider absolute">
            Or Sign In Manually
          </span>
        </div>

        {/* Standard Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Work Email"
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
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
            <Link to="/forgot-password" className="text-[#a459a8] font-medium hover:underline">
              Forgot password?
            </Link>
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

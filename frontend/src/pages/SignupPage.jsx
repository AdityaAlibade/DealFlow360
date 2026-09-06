import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Lock,
  Building,
  Phone,
  MapPin,
  CheckCircle,
  AlertCircle,
  ShoppingBag,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles
} from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { useAuth } from '../contexts/AuthContext';
import authAPI from '../api/authAPI';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    billingAddress: '',
    shippingAddress: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();
  const { directLogin } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please verify your password.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const res = await authAPI.registerCustomer({
        fullName: formData.fullName.trim(),
        companyName: formData.companyName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password,
        billingAddress: formData.billingAddress.trim(),
        shippingAddress: formData.shippingAddress.trim() || formData.billingAddress.trim()
      });

      if (res.token) {
        localStorage.setItem('dealflow360_token', res.token);
        if (res.user) {
          localStorage.setItem('dealflow360_user', JSON.stringify(res.user));
        }
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/customer');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create customer account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 py-8">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 w-full max-w-xl space-y-6">
        {/* DealFlow360 Logo & Header */}
        <div className="text-center">
          <Link
            to="/login"
            className="inline-block cursor-pointer hover:opacity-90 transition-opacity"
            title="DealFlow360 Customer Portal"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#a459a8] text-white font-bold text-2xl mx-auto flex items-center justify-center shadow-lg shadow-[#a459a8]/30 mb-3">
              D
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              DealFlow<span className="text-[#a459a8]">360</span> Customer Portal
            </h1>
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold mt-2">
            <Sparkles className="w-3.5 h-3.5 text-[#a459a8]" /> Enterprise Customer Self-Registration
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Create your enterprise buyer account to build custom order carts, submit quote requests, and manage company billing details.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>Account created successfully! Redirecting you to Customer Portal...</span>
          </div>
        )}

        {/* Self-Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <Input
              label="Contact Person Name *"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="e.g. Ananya Deshmukh"
              icon={User}
              required
            />

            <Input
              label="Enterprise Company Name *"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="e.g. Tata Consultancy Services"
              icon={Building}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <Input
              label="Business Work Email *"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="procurement@company.com"
              icon={Mail}
              required
            />

            <Input
              label="Contact Phone Number"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 98200 12345"
              icon={Phone}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <Input
              label="Password *"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
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

            <Input
              label="Confirm Password *"
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Repeat password"
              icon={Lock}
              required
            />
          </div>

          <div className="space-y-3 pt-1">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Company Billing Address
              </label>
              <input
                type="text"
                name="billingAddress"
                value={formData.billingAddress}
                onChange={handleChange}
                placeholder="e.g. 42 Cyber City, Magarpatta, Pune, MH 411028"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-[#a459a8]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Default Shipping / Warehouse Delivery Address
              </label>
              <input
                type="text"
                name="shippingAddress"
                value={formData.shippingAddress}
                onChange={handleChange}
                placeholder="Leave blank to use billing address"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-[#a459a8]"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={loading || success}
            className="w-full py-2.5 font-bold bg-[#a459a8] hover:bg-[#924b96] text-white shadow-md shadow-[#a459a8]/20 mt-2"
          >
            {loading ? 'Creating Enterprise Account...' : 'Register Customer Account'}
          </Button>
        </form>

        <div className="pt-2 border-t border-slate-100 text-center text-xs text-slate-500">
          Already registered as a Customer or Partner?{' '}
          <Link to="/login" className="text-[#a459a8] font-bold hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;

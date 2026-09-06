import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  User,
  Mail,
  Phone,
  Briefcase,
  MapPin,
  Calendar,
  Shield,
  Clock,
  CheckCircle2,
  FileText,
  TrendingUp,
  Award,
  Edit3,
  Save,
  X,
  AlertCircle,
  RefreshCw,
  Sliders,
  Building
} from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Form state for editing
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    department: '',
    territory: '',
    title: '',
    bio: ''
  });

  // Fetch profile details from backend API
  const fetchProfileDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get(`${API_BASE_URL}/auth/profile`, {
        headers,
        timeout: 8000
      });

      if (response.data && response.data.success && response.data.user) {
        const userData = response.data.user;
        setProfile(userData);
        setFormData({
          fullName: userData.fullName || '',
          phone: userData.phone || '',
          department: userData.department || 'Enterprise Revenue',
          territory: userData.territory || 'India & Global Enterprise',
          title: userData.title || 'Revenue Operations Specialist',
          bio: userData.bio || 'Managing enterprise CPQ quoting, margin governance, and revenue operations.'
        });
      } else {
        throw new Error(response.data?.message || 'Failed to retrieve profile data');
      }
    } catch (err) {
      console.warn('API fetch error for user profile:', err);
      if (user) {
        setProfile(user);
        setFormData({
          fullName: user.fullName || user.name || '',
          phone: user.phone || '',
          department: user.department || 'Enterprise Revenue',
          territory: 'India & Global Enterprise',
          title: user.roleLabel || 'Revenue Operations Specialist',
          bio: 'Managing enterprise CPQ quoting, margin governance, and revenue operations.'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileDetails();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSuccessMessage('');
      setError(null);

      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.put(`${API_BASE_URL}/auth/profile`, formData, {
        headers,
        timeout: 8000
      });

      if (response.data && response.data.success && response.data.user) {
        setProfile(response.data.user);
      } else {
        setProfile((prev) => ({ ...prev, ...formData, updatedAt: new Date().toISOString() }));
      }

      setSuccessMessage('Profile information updated successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      console.warn('API update failed, updating local state:', err);
      setProfile((prev) => ({ ...prev, ...formData, updatedAt: new Date().toISOString() }));
      setSuccessMessage('Profile information saved locally!');
      setIsEditing(false);
      setTimeout(() => setSuccessMessage(''), 4000);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <MainLayout>
      <div className="space-y-6 pb-12">
        {/* Top Breadcrumb & Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              User Profile
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Prisma User Governance &bull; Enterprise CPQ credentials and sales quota tracking
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchProfileDetails}
              disabled={loading}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-sm"
              title="Refresh Profile"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#a459a8]' : ''}`} />
              Sync Data
            </button>

            {!isEditing ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsEditing(true)}
                icon={Edit3}
              >
                Edit Profile
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsEditing(false)}
                icon={X}
              >
                Cancel
              </Button>
            )}
          </div>
        </div>

        {/* Success Alert Banner */}
        {successMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-emerald-800 text-xs font-medium animate-in fade-in slide-in-from-top-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Alert Banner */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-red-800 text-xs font-medium">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Profile Hero Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Vibrant Brand Banner Header */}
          <div className="h-32 bg-gradient-to-r from-[#a459a8] via-[#7d3b81] to-[#401f42] relative">
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
          </div>

          <div className="px-6 pb-6 pt-0 relative">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4">
              {/* Left side: Avatar + User Info */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Avatar protruding neatly into banner */}
                <div className="relative -mt-12 sm:-mt-14 z-10 flex-shrink-0">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#a459a8] to-[#c892cb] text-white flex items-center justify-center font-black text-2xl shadow-md border-4 border-white ring-1 ring-slate-200/80">
                    {getInitials(profile?.fullName)}
                  </div>
                  <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full ring-2 ring-white" title="Active Account" />
                </div>

                {/* Name, Role & Status - sitting cleanly on white background */}
                <div className="pt-2 sm:pt-4">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-xl font-black text-slate-900 leading-tight">
                      {profile?.fullName || 'John Doe'}
                    </h2>
                    <Badge variant="primary" dot>
                      {profile?.role || 'SALES_REP'}
                    </Badge>
                    <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {profile?.status || 'ACTIVE'}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-600 mt-1">
                    {profile?.title || 'Senior Enterprise Sales Representative'}
                  </p>
                </div>
              </div>

              {/* Right side: Quick Info Chips */}
              <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500 pt-2 sm:pt-0">
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs">
                  <Building className="w-3.5 h-3.5 text-[#a459a8]" />
                  <span className="font-medium text-slate-700">{profile?.department || 'Enterprise CPQ'}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs">
                  <MapPin className="w-3.5 h-3.5 text-[#a459a8]" />
                  <span className="font-medium text-slate-700">{profile?.territory || 'North America'}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs">
                  <Calendar className="w-3.5 h-3.5 text-[#a459a8]" />
                  <span className="text-slate-500">Joined {formatDate(profile?.createdAt)}</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed max-w-3xl pt-3 border-t border-slate-100">
              {profile?.bio || 'Strategic CPQ Deal Specialist driving enterprise deal governance, margin protection, and multi-tier subscription packaging.'}
            </p>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="px-6 border-t border-slate-200 bg-slate-50/70 flex gap-6 overflow-x-auto text-xs font-semibold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-3 border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'overview'
                  ? 'border-[#a459a8] text-[#a459a8]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Overview & Quotas
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`py-3 border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'details'
                  ? 'border-[#a459a8] text-[#a459a8]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Account Details
            </button>
            <button
              onClick={() => setActiveTab('governance')}
              className={`py-3 border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'governance'
                  ? 'border-[#a459a8] text-[#a459a8]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              CPQ Governance Limits
            </button>
          </div>
        </div>

        {/* Tab 1: Overview & Performance KPI Cards */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Quotations */}
              <Card className="hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Authored Quotes</p>
                    <p className="text-2xl font-black text-slate-900 mt-1">
                      {profile?.stats?.totalQuotations || 42}
                    </p>
                    <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3" /> +6 this month
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#a459a8] flex items-center justify-center font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                </div>
              </Card>

              {/* Pending Approvals */}
              <Card className="hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">In Governance Queue</p>
                    <p className="text-2xl font-black text-amber-600 mt-1">
                      {profile?.stats?.pendingApprovals || 8}
                    </p>
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Avg review: 3.2 hrs
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>
              </Card>

              {/* Approved Deals */}
              <Card className="hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Approved Deals</p>
                    <p className="text-2xl font-black text-emerald-700 mt-1">
                      {profile?.stats?.approvedDeals || 31}
                    </p>
                    <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                      <Award className="w-3 h-3" /> {profile?.stats?.winRate || 78.5}% Win Rate
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>
              </Card>

              {/* Quota Revenue */}
              <Card className="hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Quota Attainment</p>
                    <p className="text-xl font-black text-slate-900 mt-1">
                      {profile?.stats?.closedRevenue || '₹28,50,000'}
                    </p>
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Target: {profile?.stats?.targetQuota || '₹40,00,000'}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
                  <div className="bg-[#a459a8] h-2 rounded-full" style={{ width: '71%' }} />
                </div>
              </Card>
            </div>

            {/* Detailed Sales Highlights Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card
                title="Sales Governance Health"
                subtitle="Quote compliance metrics evaluated by DealSentinel"
                className="lg:col-span-2"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Compliance & Margin Score</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Average quote margin maintained across deals</p>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-black text-[#a459a8]">{profile?.stats?.avgDealMargin || 24.2}%</span>
                      <p className="text-[10px] text-emerald-600 font-semibold">+3.1% above floor</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Discount Governance Index</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Automated approval pass rate without escalations</p>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-black text-emerald-600">{profile?.stats?.governanceScore || '94/100'}</span>
                      <p className="text-[10px] text-slate-500">Tier A Rated</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Fulfillment Split Routing</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Quotes routed via optimal regional warehouse hubs</p>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-black text-sky-600">98.2%</span>
                      <p className="text-[10px] text-slate-500">Fast delivery path</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card
                title="Quick Profile Actions"
                subtitle="Account management shortcuts"
              >
                <div className="space-y-2.5">
                  <button
                    onClick={() => {
                      setActiveTab('details');
                      setIsEditing(true);
                    }}
                    className="w-full px-3.5 py-2.5 text-xs text-left font-medium bg-purple-50/60 hover:bg-purple-50 text-[#a459a8] border border-purple-200/60 rounded-xl flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Edit3 className="w-3.5 h-3.5" /> Edit Profile Details
                    </span>
                    &rarr;
                  </button>

                  <button
                    onClick={() => setActiveTab('governance')}
                    className="w-full px-3.5 py-2.5 text-xs text-left font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Sliders className="w-3.5 h-3.5 text-slate-500" /> View Approval Limits
                    </span>
                    &rarr;
                  </button>

                  <button
                    onClick={() => window.open('/quotations', '_self')}
                    className="w-full px-3.5 py-2.5 text-xs text-left font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-slate-500" /> My Quotations
                    </span>
                    &rarr;
                  </button>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Tab 2: Account Details & Editable Profile Form */}
        {activeTab === 'details' && (
          <Card
            title={isEditing ? 'Edit Profile Information' : 'Prisma User Profile Information'}
            subtitle={isEditing ? 'Modify your contact information and territory below' : 'Synchronized with backend PostgreSQL / Prisma user table'}
            action={
              !isEditing ? (
                <Button variant="primary" size="sm" onClick={() => setIsEditing(true)} icon={Edit3}>
                  Edit Information
                </Button>
              ) : null
            }
          >
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#a459a8] focus:ring-2 focus:ring-[#a459a8]/20 transition-all text-slate-800"
                    />
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800">
                      <User className="w-3.5 h-3.5 text-[#a459a8]" />
                      <span>{profile?.fullName || 'John Doe'}</span>
                    </div>
                  )}
                </div>

                {/* Email Address (Read-only from Prisma schema) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Email Address <span className="text-slate-400 font-normal">(System Unique ID)</span>
                  </label>
                  <div className="flex items-center justify-between px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{profile?.email || 'demo@dealflow.com'}</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Verified</span>
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#a459a8] focus:ring-2 focus:ring-[#a459a8]/20 transition-all text-slate-800"
                    />
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800">
                      <Phone className="w-3.5 h-3.5 text-[#a459a8]" />
                      <span>{profile?.phone || 'Not Provided'}</span>
                    </div>
                  )}
                </div>

                {/* Role (Read-only Prisma Enum) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Assigned Role <span className="text-slate-400 font-normal">(Prisma Role Enum)</span>
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700">
                    <Shield className="w-3.5 h-3.5 text-[#a459a8]" />
                    <Badge variant="primary" dot>{profile?.role || 'SALES_REP'}</Badge>
                    <span className="text-[11px] text-slate-400 ml-auto">Governance Protected</span>
                  </div>
                </div>

                {/* Department */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Department
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#a459a8] focus:ring-2 focus:ring-[#a459a8]/20 transition-all text-slate-800"
                    />
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800">
                      <Briefcase className="w-3.5 h-3.5 text-[#a459a8]" />
                      <span>{profile?.department || 'Enterprise CPQ'}</span>
                    </div>
                  )}
                </div>

                {/* Sales Territory */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Sales Territory
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="territory"
                      value={formData.territory}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#a459a8] focus:ring-2 focus:ring-[#a459a8]/20 transition-all text-slate-800"
                    />
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800">
                      <MapPin className="w-3.5 h-3.5 text-[#a459a8]" />
                      <span>{profile?.territory || 'North America'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bio / Strategic Summary */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Professional Bio & Deal Focus
                </label>
                {isEditing ? (
                  <textarea
                    name="bio"
                    rows={3}
                    value={formData.bio}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#a459a8] focus:ring-2 focus:ring-[#a459a8]/20 transition-all text-slate-800"
                  />
                ) : (
                  <div className="px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 leading-relaxed">
                    {profile?.bio || 'Strategic CPQ Deal Specialist driving enterprise deal governance, margin protection, and multi-tier subscription packaging.'}
                  </div>
                )}
              </div>

              {/* Database Timestamps */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
                <span>User Record ID: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-mono">{profile?.id || 'usr-cuid-9021'}</code></span>
                <span>Last Updated: {formatDate(profile?.updatedAt)}</span>
              </div>

              {/* Action Buttons for Edit Mode */}
              {isEditing && (
                <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    type="submit"
                    disabled={saving}
                    icon={Save}
                  >
                    {saving ? 'Saving Changes...' : 'Save Profile Details'}
                  </Button>
                </div>
              )}
            </form>
          </Card>
        )}

        {/* Tab 3: CPQ Governance & Permissions */}
        {activeTab === 'governance' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card
              title="Pricing & Discount Limits"
              subtitle="Governance matrix configured for this sales role"
            >
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-slate-600 font-medium">Self-Approval Discount Ceiling:</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Up to 15.0%
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-slate-600 font-medium">Sales Manager Escalation:</span>
                  <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    15.1% - 25.0%
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-slate-600 font-medium">Finance VP Escalation:</span>
                  <span className="font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                    &gt; 25.0%
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-slate-600 font-medium">Customer Tiers Permitted:</span>
                  <div className="flex gap-1">
                    <Badge variant="gold">Gold</Badge>
                    <Badge variant="silver">Silver</Badge>
                    <Badge variant="bronze">Bronze</Badge>
                  </div>
                </div>
              </div>
            </Card>

            <Card
              title="Warehouse & Fulfillment Access"
              subtitle="Supply chain nodes accessible for deal allocation"
            >
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-slate-800">Main Logistics Hub (BOM-1)</h5>
                    <p className="text-[11px] text-slate-500">Primary fulfillment facility &bull; 85,000 units</p>
                  </div>
                  <Badge variant="success">Active</Badge>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-slate-800">Eastern Regional Depot (CCU-1)</h5>
                    <p className="text-[11px] text-slate-500">Secondary distribution depot &bull; 32,400 units</p>
                  </div>
                  <Badge variant="success">Active</Badge>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-slate-800">Automated Split Fulfillment</h5>
                    <p className="text-[11px] text-slate-500">Auto-routes split delivery based on SKU availability</p>
                  </div>
                  <Badge variant="primary">Enabled</Badge>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ProfilePage;

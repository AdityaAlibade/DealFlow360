import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, Loader2, Send } from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { authAPI } from '../api/authAPI';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setError(null);
    setLoading(true);

    try {
      const response = await authAPI.forgotPassword(email);
      if (response && response.success !== false) {
        setSuccess(true);
        setCooldown(60);
      } else {
        setError(response?.message || 'Failed to send reset link. Please try again.');
      }
    } catch (err) {
      // Even if network or rate limit error occurs, show polite user error
      if (err.response?.status === 429) {
        setError(err.response.data?.message || 'Too many reset requests. Please wait a few minutes before trying again.');
      } else {
        // Safe fallback - default to generic message to preserve privacy
        setSuccess(true);
        setCooldown(60);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || loading) return;
    setLoading(true);
    setError(null);
    try {
      await authAPI.forgotPassword(email);
      setCooldown(60);
    } catch {
      setError('Unable to resend email right now. Please try again shortly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 w-full max-w-md space-y-6">
        {/* DealFlow360 Header & Logo */}
        <div className="text-center">
          <Link
            to="/login"
            className="inline-block cursor-pointer hover:opacity-90 transition-opacity"
            title="Back to Login"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#a459a8] text-white font-bold text-2xl mx-auto flex items-center justify-center shadow-lg shadow-[#a459a8]/30 mb-3">
              D
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              DealFlow<span className="text-[#a459a8]">360</span>
            </h1>
          </Link>
          <p className="text-xs text-slate-500 mt-1">Enterprise Quote & Deal Revenue Operations</p>
        </div>

        {/* Title & Description */}
        <div className="text-center space-y-1">
          <h2 className="text-lg font-bold text-slate-900">Forgot your password?</h2>
          <p className="text-xs text-slate-500">
            No worries! Enter your work email address below and we'll send you a secure link to reset it.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Success State */}
        {success ? (
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2 text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-emerald-950">Password Reset Link Sent</h3>
              <p className="text-xs text-emerald-800 leading-relaxed">
                If an account exists with <strong className="font-semibold text-emerald-950">{email}</strong>, you will receive an email shortly with instructions to reset your password.
              </p>
              <div className="pt-2 text-[11px] text-emerald-700 bg-emerald-100/60 rounded-lg p-2 font-medium">
                ⏱ Link expires in <strong>15 minutes</strong>. Remember to check your spam folder.
              </div>
            </div>

            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleResend}
                disabled={cooldown > 0 || loading}
                className="w-full py-2.5 text-xs font-semibold"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Sending...
                  </span>
                ) : cooldown > 0 ? (
                  `Resend email in ${cooldown}s`
                ) : (
                  'Did not receive email? Resend'
                )}
              </Button>

              <Link
                to="/login"
                className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          /* Email Input Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Registered Work Email"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              icon={Mail}
              helperText="Enter the email associated with your DealFlow360 account."
              required
              autoFocus
            />

            <Button
              type="submit"
              variant="primary"
              disabled={loading || !email.trim()}
              className="w-full py-2.5 font-semibold bg-[#a459a8] hover:bg-[#924b96]"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Sending Reset Link...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="w-4 h-4" /> Send Reset Link
                </span>
              )}
            </Button>

            <div className="pt-2 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#a459a8] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Return to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

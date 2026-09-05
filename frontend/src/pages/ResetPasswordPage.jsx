import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, useParams } from 'react-router-dom';
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  Check,
  X
} from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { authAPI } from '../api/authAPI';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const routeParams = useParams();
  const navigate = useNavigate();

  // Extract token from query param (?token=xyz) or path param (/reset-password/xyz)
  const token = searchParams.get('token') || routeParams.token || '';

  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [accountEmail, setAccountEmail] = useState('');
  const [tokenError, setTokenError] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // 1. Verify token on mount
  useEffect(() => {
    let isMounted = true;

    const verifyToken = async () => {
      if (!token) {
        if (isMounted) {
          setVerifying(false);
          setTokenValid(false);
          setTokenError('No password reset token was provided.');
        }
        return;
      }

      try {
        const response = await authAPI.verifyResetToken(token);
        if (isMounted) {
          if (response && response.success !== false) {
            setTokenValid(true);
            setAccountEmail(response.email || '');
          } else {
            setTokenValid(false);
            setTokenError(response?.message || 'Password reset link is invalid or has expired.');
          }
        }
      } catch (err) {
        if (isMounted) {
          setTokenValid(false);
          setTokenError(
            err.response?.data?.message || 'Password reset link is invalid or has expired.'
          );
        }
      } finally {
        if (isMounted) {
          setVerifying(false);
        }
      }
    };

    verifyToken();

    return () => {
      isMounted = false;
    };
  }, [token]);

  // Validation rules
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const passwordsMatch = password && confirmPassword && password === confirmPassword;
  const isFormValid = hasMinLength && passwordsMatch;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid || submitting) return;

    setError(null);
    setSubmitting(true);

    try {
      const res = await authAPI.resetPassword({ token, password });
      if (res && res.success !== false) {
        setSuccess(true);
      } else {
        setError(res?.message || 'Failed to reset password. Please try again.');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to reset password. The link may have expired or already been used.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 w-full max-w-md space-y-6">
        {/* DealFlow360 Header */}
        <div className="text-center">
          <Link
            to="/login"
            className="inline-block cursor-pointer hover:opacity-90 transition-opacity"
            title="DealFlow360 Login"
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

        {/* State 1: Verifying Token Spinner */}
        {verifying ? (
          <div className="py-12 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#a459a8] animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-700">Verifying security token...</p>
            <p className="text-xs text-slate-400">Please wait while we validate your reset link.</p>
          </div>
        ) : !tokenValid ? (
          /* State 2: Invalid / Expired Token */
          <div className="space-y-5 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 mx-auto flex items-center justify-center border border-red-200">
              <KeyRound className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-lg font-bold text-slate-900">Reset Link Invalid or Expired</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                {tokenError ||
                  'This password reset link is invalid, already used, or has expired (links are valid for 15 minutes).'}
              </p>
            </div>

            <div className="pt-2 space-y-3">
              <Link to="/forgot-password" className="block w-full">
                <Button variant="primary" className="w-full py-2.5 font-semibold bg-[#a459a8] hover:bg-[#924b96]">
                  Request a New Reset Link
                </Button>
              </Link>
              <Link
                to="/login"
                className="block text-xs font-semibold text-slate-600 hover:text-slate-900 py-1"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        ) : success ? (
          /* State 3: Password Successfully Reset */
          <div className="space-y-5 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center border border-emerald-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-lg font-bold text-slate-900">Password Reset Complete!</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your DealFlow360 account password has been securely updated. You can now sign in with your new credentials.
              </p>
            </div>

            <div className="pt-2">
              <Button
                variant="primary"
                onClick={() => navigate('/login')}
                className="w-full py-2.5 font-semibold bg-[#a459a8] hover:bg-[#924b96] flex items-center justify-center gap-2"
              >
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          /* State 4: Set New Password Form */
          <div className="space-y-5">
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 border border-purple-200 text-[#a459a8] text-[11px] font-bold mb-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Account {accountEmail ? `(${accountEmail})` : ''}</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900">Create New Password</h2>
              <p className="text-xs text-slate-500">
                Please enter and confirm your new secure password.
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="New Password"
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
                autoFocus
              />

              <Input
                label="Confirm New Password"
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                icon={Lock}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                required
              />

              {/* Password Quality Checklist */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  Password Requirements:
                </p>
                <div className="flex items-center gap-2">
                  {hasMinLength ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600 font-bold" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  <span className={hasMinLength ? 'text-emerald-700 font-medium' : 'text-slate-500'}>
                    At least 8 characters
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {hasNumber ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600 font-bold" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  <span className={hasNumber ? 'text-emerald-700 font-medium' : 'text-slate-500'}>
                    Contains at least 1 number
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {passwordsMatch ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600 font-bold" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  <span className={passwordsMatch ? 'text-emerald-700 font-medium' : 'text-slate-500'}>
                    Passwords match
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={!isFormValid || submitting}
                className="w-full py-2.5 font-semibold bg-[#a459a8] hover:bg-[#924b96]"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Updating Password...
                  </span>
                ) : (
                  'Reset Password & Sign In'
                )}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;

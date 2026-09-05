import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { hasPermission, hasAnyPermission } from '../../utils/permissions';
import { ShieldAlert, ExternalLink, ArrowRight, Lock, KeyRound } from 'lucide-react';
import Button from '../common/Button';

const ProtectedRoute = ({
  children,
  requiredPermission,
  requiredPermissions,
  allowedRoles
}) => {
  const { user, role, switchRole } = useAuth();

  // 1. Not logged in -> 401 Authentication Required
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="bg-white max-w-md w-full rounded-2xl shadow-xl border border-slate-200 p-8 text-center space-y-4">
          <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">401 - Authentication Required</h2>
          <p className="text-xs text-slate-600">
            You must be authenticated with valid DealFlow360 credentials to access internal platform modules.
          </p>
          <div className="pt-3">
            <Link to="/login">
              <Button variant="primary" className="w-full">
                Go to Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. Customer user trying to access internal routes -> 403 Customer Portal Access Only
  if (role === 'customer') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="bg-slate-800 max-w-lg w-full rounded-2xl shadow-2xl border border-slate-700 p-8 text-center space-y-5">
          <div className="w-14 h-14 bg-[#a459a8]/20 text-[#e2b7e5] border border-[#a459a8]/40 rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <span className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30">
              Customer Account
            </span>
            <h2 className="text-xl font-extrabold text-white mt-3">403 - Customer Portal Access Only</h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            As an external customer user (<span className="font-semibold text-white">{user.name}</span>), internal management dashboards, fulfillment queues, and platform configuration are strictly restricted.
          </p>
          <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-700 text-left space-y-2">
            <p className="text-xs text-slate-400 font-medium">Your authorized workspace is the Customer Portal:</p>
            <Link
              to="/customer-portal/demo-token-123"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#e2b7e5] hover:text-white transition-colors"
            >
              Open Secure Customer Portal <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="pt-2 flex flex-col gap-2">
            <Link to="/login" className="text-xs text-slate-400 hover:text-slate-200">
              Sign out and login as another user
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Check Role Whitelist
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(role)) {
      // Auto-redirect to role-appropriate portal dashboard rather than trapping in 403
      if (role === 'sales_rep' || role === 'sales_manager') {
        return <Navigate to="/sales" replace />;
      }
      if (role === 'finance_ops') {
        return <Navigate to="/finance" replace />;
      }
      if (role === 'admin') {
        return <Navigate to="/admin" replace />;
      }

      return (
        <div className="min-h-[70vh] flex items-center justify-center p-6">
          <div className="bg-white max-w-lg w-full rounded-2xl shadow-xl border border-red-200 p-8 text-center space-y-4">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase bg-red-100 text-red-700 rounded-full">
                Insufficient Permissions
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-2">403 - Access Denied</h2>
            </div>
            <p className="text-xs text-slate-600">
              Your role <span className="font-bold text-slate-800 font-mono">[{user.roleLabel || role}]</span> is not permitted to view this module. Allowed roles:{' '}
              <span className="font-semibold text-slate-700">{allowedRoles.join(', ')}</span>.
            </p>
            <div className="pt-2">
              <Link to={role === 'admin' ? '/admin' : (role === 'finance_ops' ? '/finance' : '/sales')}>
                <Button variant="secondary" className="text-xs">
                  Return to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      );
    }
  }

  // 4. Check Granular Permission
  if (requiredPermission && !hasPermission(role, requiredPermission)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="bg-white max-w-lg w-full rounded-2xl shadow-xl border border-red-200 p-8 text-center space-y-4">
          <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase bg-red-100 text-red-700 rounded-full">
              Permission Required
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-2">403 - Access Denied</h2>
          </div>
          <p className="text-xs text-slate-600">
            This action requires permission <span className="font-mono font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">{requiredPermission}</span> which is not granted to <span className="font-bold text-slate-800">{user.roleLabel || role}</span>.
          </p>
          <div className="pt-2">
            <Link to="/dashboard">
              <Button variant="secondary" className="text-xs">
                Return to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 5. Check List of Permissions
  if (requiredPermissions && requiredPermissions.length > 0) {
    if (!hasAnyPermission(role, requiredPermissions)) {
      return (
        <div className="min-h-[70vh] flex items-center justify-center p-6">
          <div className="bg-white max-w-lg w-full rounded-2xl shadow-xl border border-red-200 p-8 text-center space-y-4">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">403 - Access Denied</h2>
            <p className="text-xs text-slate-600">
              Your role <span className="font-bold">{role}</span> lacks the required permissions.
            </p>
          </div>
        </div>
      );
    }
  }

  return children;
};

export default ProtectedRoute;

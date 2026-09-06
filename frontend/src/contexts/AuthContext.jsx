import React, { createContext, useContext, useState, useEffect } from 'react';
import { ROLE_PERMISSIONS, hasPermission } from '../utils/permissions';
import { logAuditEvent } from '../utils/auditLogger';
import authAPI from '../api/authAPI';

export const AuthContext = createContext(null);

// Default role credentials for one-click access in development/testing
export const ROLE_CREDENTIALS = {
  admin: {
    email: 'adityaalibade1046@gmail.com',
    password: 'password123',
    roleLabel: 'System Administrator'
  },
  sales_manager: {
    email: 'salesmanager@dealflow360.com',
    password: 'password123',
    roleLabel: 'Sales Manager (L1 Approver)'
  },
  sales_rep: {
    email: 'salesrep@dealflow360.com',
    password: 'password123',
    roleLabel: 'Sales Representative'
  },
  finance_ops: {
    email: 'financemanager@dealflow360.com',
    password: 'password123',
    roleLabel: 'Finance Manager (L2 Approver)'
  },
  customer: {
    email: 'customer@dealflow360.com',
    password: 'password123',
    roleLabel: 'Customer Portal User'
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('dealflow360_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [loading, setLoading] = useState(true);

  // Validate session on app launch
  useEffect(() => {
    const initSession = async () => {
      const token = localStorage.getItem('dealflow360_token');
      if (token) {
        try {
          const res = await authAPI.getCurrentUser();
          const liveUser = res?.data || res?.user || res;
          if (liveUser && liveUser.id) {
            const normalized = {
              id: liveUser.id,
              name: liveUser.fullName || liveUser.name,
              fullName: liveUser.fullName || liveUser.name,
              email: liveUser.email,
              role: (liveUser.role || 'SALES_REP').toLowerCase(),
              roleLabel: liveUser.role || 'Sales Representative',
              avatar: liveUser.avatar || (liveUser.fullName || liveUser.email).substring(0, 2).toUpperCase(),
              department: liveUser.department || 'Enterprise Sales',
              token: token
            };
            setUser(normalized);
            localStorage.setItem('dealflow360_user', JSON.stringify(normalized));
            localStorage.setItem('dealflow360_role', normalized.role);
          }
        } catch {
          console.warn('[AuthContext] Stored session invalid or expired.');
        }
      }
      setLoading(false);
    };

    initSession();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await authAPI.login({ email, password });
      if (!res.success && res.message && !res.token) {
        throw new Error(res.message);
      }

      const rawUser = res.user || res.data?.user || res.data || {};
      const token = res.token || res.data?.token;

      const normalizedUser = {
        id: rawUser.id || 'usr-' + Date.now(),
        name: rawUser.fullName || rawUser.name || email.split('@')[0],
        fullName: rawUser.fullName || rawUser.name || email.split('@')[0],
        email: rawUser.email || email,
        role: (rawUser.role || 'SALES_REP').toLowerCase(),
        roleLabel: rawUser.role || 'Sales Representative',
        avatar: rawUser.avatar || (rawUser.fullName || rawUser.name || email).substring(0, 2).toUpperCase(),
        department: rawUser.department || 'Enterprise Operations',
        token
      };

      setUser(normalizedUser);
      if (token) {
        localStorage.setItem('dealflow360_token', token);
      }
      localStorage.setItem('dealflow360_user', JSON.stringify(normalizedUser));
      localStorage.setItem('dealflow360_role', normalizedUser.role);

      logAuditEvent({
        user: normalizedUser.name,
        role: normalizedUser.role,
        action: 'LOGIN',
        resource: 'AUTH_SESSION',
        resourceId: normalizedUser.id,
        result: 'SUCCESS',
        reason: 'Authenticated successfully with PostgreSQL credentials'
      });

      return { success: true, user: normalizedUser };
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const directLogin = async (roleKey) => {
    const creds = ROLE_CREDENTIALS[roleKey];
    if (!creds) {
      throw new Error(`Unknown role key: ${roleKey}`);
    }
    return login(creds.email, creds.password);
  };

  const signup = async (userData) => {
    setLoading(true);
    try {
      const res = await authAPI.signup(userData);
      if (!res.success && res.message && !res.token) {
        throw new Error(res.message);
      }
      const rawUser = res.user || res.data?.user || {};
      const token = res.token || res.data?.token;

      const normalizedUser = {
        id: rawUser.id,
        name: rawUser.fullName || userData.fullName || userData.name,
        fullName: rawUser.fullName || userData.fullName || userData.name,
        email: rawUser.email || userData.email,
        role: (rawUser.role || userData.role || 'SALES_REP').toLowerCase(),
        roleLabel: rawUser.role || userData.role || 'Sales Representative',
        avatar: (userData.fullName || userData.name || userData.email).substring(0, 2).toUpperCase(),
        department: userData.department || 'Enterprise Sales',
        token
      };

      setUser(normalizedUser);
      if (token) {
        localStorage.setItem('dealflow360_token', token);
      }
      localStorage.setItem('dealflow360_user', JSON.stringify(normalizedUser));
      localStorage.setItem('dealflow360_role', normalizedUser.role);

      return { success: true, user: normalizedUser };
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    if (user) {
      logAuditEvent({
        user: user.name,
        role: user.role,
        action: 'LOGOUT',
        resource: 'AUTH_SESSION',
        resourceId: user.id,
        result: 'SUCCESS',
        reason: 'User ended active session'
      });
    }
    setUser(null);
    localStorage.removeItem('dealflow360_user');
    localStorage.removeItem('dealflow360_token');
    localStorage.removeItem('dealflow360_role');
  };

  const switchRole = async (roleKey) => {
    if (user?.role !== 'admin') {
      console.warn(`[RBAC Security] Role switch rejected: only System Admin can switch RBAC contexts.`);
      return null;
    }
    return directLogin(roleKey);
  };

  const checkPermission = (permission) => {
    if (!user) return false;
    return hasPermission(user.role, permission);
  };

  const permissions = user ? ROLE_PERMISSIONS[user.role] || [] : [];

  return (
    <AuthContext.Provider
      value={{
        user,
        role: (user?.role || '').toLowerCase(),
        loading,
        login,
        directLogin,
        signup,
        logout,
        switchRole,
        checkPermission,
        permissions,
        isAuthenticated: !!user,
        roleCredentials: ROLE_CREDENTIALS
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

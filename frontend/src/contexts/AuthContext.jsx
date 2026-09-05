import React, { createContext, useContext, useState, useEffect } from 'react';
import { ROLE_PERMISSIONS, hasPermission } from '../utils/permissions';
import { logAuditEvent } from '../utils/auditLogger';

export const AuthContext = createContext(null);

export const DEMO_ACCOUNTS = {
  admin: {
    id: 'usr-admin-01',
    name: 'Admin User',
    email: 'admin@dealflow360.com',
    role: 'admin',
    roleLabel: 'System Administrator',
    avatar: 'AD',
    department: 'Platform Administration',
    token: 'jwt-admin-token-dealflow360'
  },
  sales_manager: {
    id: 'usr-mgr-02',
    name: 'Sales Manager',
    email: 'salesmanager@dealflow360.com',
    role: 'sales_manager',
    roleLabel: 'Sales Manager (L1 Approver)',
    avatar: 'SM',
    department: 'Sales Leadership',
    token: 'jwt-salesmanager-token-dealflow360'
  },
  sales_rep: {
    id: 'usr-rep-03',
    name: 'Sales Rep',
    email: 'salesrep@dealflow360.com',
    role: 'sales_rep',
    roleLabel: 'Sales Representative',
    avatar: 'SR',
    department: 'Enterprise Sales',
    token: 'jwt-salesrep-token-dealflow360'
  },
  finance_ops: {
    id: 'usr-fin-04',
    name: 'Finance Manager',
    email: 'financemanager@dealflow360.com',
    role: 'finance_ops',
    roleLabel: 'Finance Manager (L2 Approver)',
    avatar: 'FM',
    department: 'Finance & Operations',
    token: 'jwt-financemanager-token-dealflow360'
  },
  customer: {
    id: 'usr-cust-05',
    name: 'Customer Account',
    email: 'customer@dealflow360.com',
    role: 'customer',
    roleLabel: 'Customer Portal User',
    avatar: 'CU',
    department: 'Client Procurement',
    token: 'demo-token-123',
    portalToken: 'demo-token-123'
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('dealflow360_user');
    if (saved) {
      try {
        if (
          saved.includes('Sarah Connor') ||
          saved.includes('Marcus Vance') ||
          saved.includes('Elena Rostova') ||
          saved.includes('Alex Rivera') ||
          saved.includes('David Sterling')
        ) {
          localStorage.removeItem('dealflow360_user');
          localStorage.removeItem('dealflow360_auth_user');
          localStorage.removeItem('dealflow360_token');
          localStorage.removeItem('dealflow360_role');
          return DEMO_ACCOUNTS.admin;
        }
        return JSON.parse(saved);
      } catch {
        return DEMO_ACCOUNTS.admin;
      }
    }
    return DEMO_ACCOUNTS.admin;
  });

  const [authUser, setAuthUser] = useState(() => {
    const savedAuth = localStorage.getItem('dealflow360_auth_user');
    if (savedAuth) {
      try {
        if (
          savedAuth.includes('Sarah Connor') ||
          savedAuth.includes('Marcus Vance') ||
          savedAuth.includes('Elena Rostova') ||
          savedAuth.includes('Alex Rivera') ||
          savedAuth.includes('David Sterling')
        ) {
          return null;
        }
        return JSON.parse(savedAuth);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [loading, setLoading] = useState(false);

  // Authenticated user determination:
  // An authenticated Admin is either identified by authUser or user having admin role
  const effectiveAuth = authUser || user;
  const isAdmin = effectiveAuth?.role === 'admin';

  useEffect(() => {
    if (user) {
      localStorage.setItem('dealflow360_user', JSON.stringify(user));
      localStorage.setItem('dealflow360_token', user.token || 'demo-token');
      localStorage.setItem('dealflow360_role', user.role);
    } else {
      localStorage.removeItem('dealflow360_user');
      localStorage.removeItem('dealflow360_token');
      localStorage.removeItem('dealflow360_role');
      localStorage.removeItem('dealflow360_auth_user');
    }
  }, [user]);

  // Secure Role Switcher: Strictly restricted to Admin users only
  const switchRole = (roleKey) => {
    // 1. Security check: Only Admin may switch roles
    if (!isAdmin) {
      logAuditEvent({
        user: user?.name || 'Unknown',
        role: user?.role || 'UNKNOWN',
        action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        resource: 'RBAC_SWITCHER',
        resourceId: roleKey,
        result: 'FORBIDDEN_403',
        reason: `Non-admin role '${user?.role}' attempted unauthorized role switch to '${roleKey}'`
      });
      console.warn(`[RBAC Security] Role switch to '${roleKey}' rejected. Only Admin portal has role switching privileges.`);
      return null;
    }

    // 2. Security check: Customer portal cannot be assumed via role switcher
    if (roleKey === 'customer') {
      console.warn('[RBAC Security] Customer Portal access cannot be assumed via role switching.');
      return null;
    }

    const target = DEMO_ACCOUNTS[roleKey];
    if (target) {
      setUser(target);
      logAuditEvent({
        user: target.name,
        role: target.role,
        action: 'ROLE_SWITCHED',
        resource: 'AUTH_SESSION',
        resourceId: target.id,
        result: 'SUCCESS',
        reason: `Switched active RBAC context to ${target.roleLabel}`
      });
      return target;
    }
    return null;
  };

  const directLogin = (roleKey) => {
    const target = DEMO_ACCOUNTS[roleKey];
    if (target) {
      setUser(target);
      setAuthUser(target);
      localStorage.setItem('dealflow360_user', JSON.stringify(target));
      localStorage.setItem('dealflow360_auth_user', JSON.stringify(target));
      localStorage.setItem('dealflow360_token', target.token);
      localStorage.setItem('dealflow360_role', target.role);
      logAuditEvent({
        user: target.name,
        role: target.role,
        action: 'DIRECT_ROLE_LOGIN',
        resource: 'AUTH_SESSION',
        resourceId: target.id,
        result: 'SUCCESS',
        reason: `Direct 1-click login as ${target.roleLabel}`
      });
      return target;
    }
    return null;
  };

  const login = async (email, password) => {
    setLoading(true);
    const cleanEmail = (email || '').trim().toLowerCase();
    // Find matching demo account by email or alias
    let match = Object.values(DEMO_ACCOUNTS).find(
      (acc) => acc.email.toLowerCase() === cleanEmail
    );

    if (!match) {
      if (cleanEmail === 'manager@dealflow360.com') match = DEMO_ACCOUNTS.sales_manager;
      if (cleanEmail === 'finance@dealflow360.com') match = DEMO_ACCOUNTS.finance_ops;
      if (cleanEmail === 'customer@acmecorp.com') match = DEMO_ACCOUNTS.customer;
    }

    if (match) {
      setUser(match);
      setAuthUser(match);
      localStorage.setItem('dealflow360_user', JSON.stringify(match));
      localStorage.setItem('dealflow360_auth_user', JSON.stringify(match));
      localStorage.setItem('dealflow360_token', match.token);
      localStorage.setItem('dealflow360_role', match.role);
      logAuditEvent({
        user: match.name,
        role: match.role,
        action: 'LOGIN',
        resource: 'AUTH_SESSION',
        resourceId: match.id,
        result: 'SUCCESS',
        reason: 'Authenticated successfully with role credentials'
      });
      setLoading(false);
      return { success: true, user: match };
    }

    // Default fallback
    const fallback = {
      id: 'usr-custom-' + Date.now(),
      name: email.split('@')[0],
      email: email,
      role: 'sales_rep',
      roleLabel: 'Sales Representative',
      avatar: email.substring(0, 2).toUpperCase(),
      department: 'Sales',
      token: 'jwt-custom-token'
    };
    setUser(fallback);
    setAuthUser(fallback);
    localStorage.setItem('dealflow360_auth_user', JSON.stringify(fallback));
    setLoading(false);
    return { success: true, user: fallback };
  };

  const signup = async (userData) => {
    const newUser = {
      id: 'usr-' + Date.now(),
      name: userData.name || 'New User',
      email: userData.email,
      role: userData.role || 'sales_rep',
      roleLabel: userData.role === 'admin' ? 'Administrator' : 'Sales Representative',
      avatar: (userData.name || 'U').substring(0, 2).toUpperCase(),
      department: userData.department || 'Sales',
      token: 'jwt-signup-token'
    };
    setUser(newUser);
    setAuthUser(newUser);
    localStorage.setItem('dealflow360_auth_user', JSON.stringify(newUser));
    return { success: true, user: newUser };
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
        reason: 'User explicitly logged out'
      });
    }
    setUser(null);
    setAuthUser(null);
    localStorage.removeItem('dealflow360_auth_user');
  };

  const checkPermission = (permission) => {
    if (!user || !user.role) return false;
    return hasPermission(user.role, permission);
  };

  const permissions = user?.role ? ROLE_PERMISSIONS[user.role] || [] : [];

  return (
    <AuthContext.Provider
      value={{
        user,
        authUser,
        isAdmin,
        canSwitchRole: isAdmin,
        loading,
        role: user?.role || null,
        permissions,
        checkPermission,
        switchRole,
        directLogin,
        login,
        signup,
        logout,
        demoAccounts: DEMO_ACCOUNTS
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

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ROLE_PERMISSIONS, hasPermission } from '../utils/permissions';
import { logAuditEvent } from '../utils/auditLogger';

export const AuthContext = createContext(null);

export const DEMO_ACCOUNTS = {
  admin: {
    id: 'usr-admin-01',
    name: 'Sarah Connor',
    email: 'admin@dealflow360.com',
    role: 'admin',
    roleLabel: 'Admin / Ops Director',
    avatar: 'SC',
    department: 'Platform Administration',
    token: 'jwt-admin-token-dealflow360'
  },
  sales_rep: {
    id: 'usr-rep-02',
    name: 'Alex Rivera',
    email: 'salesrep@dealflow360.com',
    role: 'sales_rep',
    roleLabel: 'Sales Representative',
    avatar: 'AR',
    department: 'Enterprise Sales',
    token: 'jwt-salesrep-token-dealflow360'
  },
  sales_manager: {
    id: 'usr-mgr-03',
    name: 'Marcus Vance',
    email: 'manager@dealflow360.com',
    role: 'sales_manager',
    roleLabel: 'Sales Manager (L1 Approver)',
    avatar: 'MV',
    department: 'Sales Management',
    token: 'jwt-manager-token-dealflow360'
  },
  finance_ops: {
    id: 'usr-fin-04',
    name: 'Elena Rostova',
    email: 'finance@dealflow360.com',
    role: 'finance_ops',
    roleLabel: 'Finance & Operations (L2 Approver)',
    avatar: 'ER',
    department: 'Finance & Fulfillment Operations',
    token: 'jwt-finance-token-dealflow360'
  },
  customer: {
    id: 'usr-cust-05',
    name: 'David Sterling',
    email: 'customer@acmecorp.com',
    role: 'customer',
    roleLabel: 'Customer / Portal User',
    avatar: 'DS',
    department: 'Acme Corp Procurement',
    token: 'demo-token-123',
    portalToken: 'demo-token-123'
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('dealflow360_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEMO_ACCOUNTS.admin;
      }
    }
    return DEMO_ACCOUNTS.admin;
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('dealflow360_user', JSON.stringify(user));
      localStorage.setItem('dealflow360_token', user.token || 'demo-token');
      localStorage.setItem('dealflow360_role', user.role);
    } else {
      localStorage.removeItem('dealflow360_user');
      localStorage.removeItem('dealflow360_token');
      localStorage.removeItem('dealflow360_role');
    }
  }, [user]);

  // Fast 1-click Role Switcher
  const switchRole = (roleKey) => {
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

  const login = async (email, password) => {
    setLoading(true);
    // Find matching demo account by email
    const match = Object.values(DEMO_ACCOUNTS).find(
      (acc) => acc.email.toLowerCase() === email.toLowerCase()
    );

    if (match) {
      setUser(match);
      logAuditEvent({
        user: match.name,
        role: match.role,
        action: 'LOGIN',
        resource: 'AUTH_SESSION',
        resourceId: match.id,
        result: 'SUCCESS',
        reason: 'Authenticated successfully with demo credentials'
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
        loading,
        role: user?.role || null,
        permissions,
        checkPermission,
        switchRole,
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

import React, { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { hasPermission, hasAnyPermission } from '../../utils/permissions';

/**
 * PermissionGate Component
 * Conditionally renders children if active user role has required permission(s).
 */
export const PermissionGate = ({ children, permission, permissions, fallback = null }) => {
  const auth = useContext(AuthContext);
  const { currentRole } = auth || {};
  const roleId = currentRole || localStorage.getItem('dealflow360_user_role') || 'sales_rep';

  if (permission && !hasPermission(roleId, permission)) {
    return fallback;
  }

  if (permissions && permissions.length > 0 && !hasAnyPermission(roleId, permissions)) {
    return fallback;
  }

  return children;
};

export default PermissionGate;

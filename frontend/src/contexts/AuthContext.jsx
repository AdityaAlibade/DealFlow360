import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Verify active session or token from storage
    setUser({ id: '1', name: 'Demo Sales Rep', email: 'sales@dealflow360.io' });
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    // TODO: Implement login logic
  };

  const logout = () => {
    // TODO: Implement logout logic
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

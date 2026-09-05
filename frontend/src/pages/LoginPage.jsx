import React from 'react';
import Login from '../components/auth/Login';

const LoginPage = () => {
  // TODO: Handle authenticated user redirect
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <Login />
    </div>
  );
};

export default LoginPage;

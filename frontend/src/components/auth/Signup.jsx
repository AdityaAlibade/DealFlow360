import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';
import Input from '../common/Input';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    company: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Connect with authAPI.signup
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 w-full max-w-md">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Create Account</h1>
        <p className="text-sm text-slate-500 mt-1">Join DealFlow360 for enterprise quote management</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* TODO: Implement password complexity indicators */}
        <Input
          label="Full Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Jane Doe"
          required
        />
        <Input
          label="Work Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="jane@company.com"
          required
        />
        <Input
          label="Company Name"
          name="company"
          value={formData.company}
          onChange={handleChange}
          placeholder="Acme Corp"
          required
        />
        <Input
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          required
        />
        <Button type="submit" variant="primary" className="w-full">
          Create Account
        </Button>
      </form>
      <div className="mt-6 text-center text-sm text-slate-500">
        Already registered?{' '}
        <Link to="/login" className="text-primary font-medium hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
};

export default Signup;

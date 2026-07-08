"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sun, Moon, ArrowLeft, Mail, Lock, User, Briefcase, Tag } from 'lucide-react';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('participant');
  const [department, setDepartment] = useState('');
  
  // UI states
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (activeTab === 'login') {
        // Form Data serialization required for OAuth2 compatibility
        const params = new URLSearchParams();
        params.append('username', email);
        params.append('password', password);

        const response = await api.post('/auth/login', params, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        
        const { access_token } = response.data;
        localStorage.setItem('token', access_token);
        
        // Fetch current user details
        const meResponse = await api.get('/auth/me');
        const userData = meResponse.data;
        localStorage.setItem('user', JSON.stringify(userData));

        // Role-based routing
        routeUser(userData.role);
      } else {
        const response = await api.post('/auth/register', {
          email,
          password,
          full_name: fullName,
          role,
          department
        });
        
        // Auto-login after registration
        setActiveTab('login');
        setEmail(email);
        setPassword(password);
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "Authentication request failed. Please check credentials.");
      setLoading(false);
    }
  };

  const routeUser = (userRole: string) => {
    if (userRole === 'admin' || userRole === 'staff') {
      router.push('/dashboard/admin');
    } else if (userRole === 'trainer' || userRole === 'external_trainer') {
      router.push('/dashboard/trainer');
    } else {
      router.push('/dashboard/participant');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[350px] h-[350px] rounded-full bg-orange-400/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-indigo-500/20 blur-[100px] pointer-events-none" />

      {/* Floating Utilities */}
      <div className="absolute top-6 left-6 flex items-center space-x-4">
        <button
          onClick={() => router.push('/')}
          className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-orange-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-medium text-sm">Back to Home</span>
        </button>
      </div>

      <div className="absolute top-6 right-6">
        <button
          onClick={toggleDarkMode}
          className="p-2.5 rounded-xl bg-slate-200/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* Auth Card Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md glass border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-8 shadow-2xl z-10"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-orange-500 to-indigo-600 bg-clip-text text-transparent">
            LPU HRDC Nexus
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Access training lifecycles and AI insights
          </p>
        </div>

        {/* Form Tab Switches */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6">
          <button
            onClick={() => { setActiveTab('login'); setError(''); }}
            className={`flex-1 pb-3 text-center font-bold text-sm transition-colors ${activeTab === 'login' ? 'border-b-2 border-orange-500 text-orange-500' : 'text-slate-500'}`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setActiveTab('register'); setError(''); }}
            className={`flex-1 pb-3 text-center font-bold text-sm transition-colors ${activeTab === 'register' ? 'border-b-2 border-orange-500 text-orange-500' : 'text-slate-500'}`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-100/80 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs rounded-xl mb-4 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleAuthSubmit} className="space-y-4">
          {activeTab === 'register' && (
            <>
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    placeholder="Enter your name"
                  />
                </div>
              </div>

              {/* Department */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Department</label>
                <div className="relative">
                  <Briefcase className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    placeholder="School of Computer Science, etc."
                  />
                </div>
              </div>

              {/* Role selector */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Account Role</label>
                <div className="relative">
                  <Tag className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                  >
                    <option value="participant">Participant Faculty</option>
                    <option value="trainer">Trainer</option>
                    <option value="external_trainer">External Industry Trainer</option>
                    <option value="corporate_client">Corporate Client Partner</option>
                    <option value="staff">HRDC Staff</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                placeholder="email@lpu.co.in"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold text-sm transition-all hover:scale-[1.01] shadow-lg shadow-orange-500/20 disabled:opacity-50"
          >
            {loading ? "Processing..." : activeTab === 'login' ? "Sign In" : "Register"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

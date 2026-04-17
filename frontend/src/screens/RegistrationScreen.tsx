import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = 'http://localhost:8000';
const LAST_PHONE_KEY = 'giginsure_last_phone';

interface User {
  id: number;
  name: string;
  location: string;
  phone: string;
  platform: string;
  avg_daily_income: number;
  work_hours_per_day: number;
  work_type: string;
}

interface RegistrationScreenProps {
  onRegister: (user: User) => void;
}

// ─── Shared styles ────────────────────────────────────────────────────────────
const inputCls =
  'w-full px-4 py-3.5 rounded-2xl bg-white border border-gray-100 shadow-sm ' +
  'focus:outline-none focus:ring-4 focus:ring-[#1E3A8A]/5 focus:border-[#1E3A8A] ' +
  'transition-all text-sm font-medium text-gray-800 placeholder:text-gray-300';

const labelCls =
  'block text-[11px] font-bold text-gray-400 mb-2 ml-1 uppercase tracking-wider';

// ─── Brand Header ─────────────────────────────────────────────────────────────
const BrandHeader: React.FC = () => (
  <div className="flex flex-col items-center mb-8 pt-10">
    <div className="w-16 h-16 bg-[#1E3A8A] rounded-3xl flex items-center justify-center mb-5 shadow-xl shadow-blue-900/25">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <polyline points="9 12 11 14 15 10"/>
      </svg>
    </div>
    <h1 className="text-[30px] font-extrabold text-[#111827] tracking-tight leading-none">
      GigInsure
    </h1>
    <p className="text-[13px] text-gray-400 mt-2 font-medium text-center px-6 leading-snug">
      Personalized AI insurance for gig partners.
    </p>
  </div>
);

// ─── Tab Toggle ───────────────────────────────────────────────────────────────
interface TabToggleProps {
  activeTab: 'login' | 'register';
  onChange: (tab: 'login' | 'register') => void;
}

const TabToggle: React.FC<TabToggleProps> = ({ activeTab, onChange }) => (
  <div className="flex bg-gray-100 p-1 rounded-2xl mb-6 relative">
    <motion.div
      layoutId="tab-bg"
      className="absolute inset-1 w-[calc(50%-4px)] bg-white rounded-xl shadow-sm"
      animate={{ x: activeTab === 'register' ? '100%' : '0%' }}
      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
    />
    {(['login', 'register'] as const).map((tab) => (
      <button
        key={tab}
        onClick={() => onChange(tab)}
        className={`flex-1 py-2.5 text-[13px] font-bold rounded-xl z-10 relative transition-colors ${
          activeTab === tab ? 'text-[#1E3A8A]' : 'text-gray-400'
        }`}
      >
        {tab === 'login' ? 'Sign In' : 'Create Account'}
      </button>
    ))}
  </div>
);

// ─── LOGIN PANEL ──────────────────────────────────────────────────────────────
interface LoginPanelProps {
  onLogin: (user: User) => void;
  onSwitchToRegister: () => void;
}

const LoginPanel: React.FC<LoginPanelProps> = ({ onLogin, onSwitchToRegister }) => {
  const remembered = localStorage.getItem(LAST_PHONE_KEY) || '';
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (phoneOverride?: string) => {
    const target = phoneOverride ?? phone;
    if (!target.trim()) {
      setError('Please enter your phone number.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, { phone: target });
      localStorage.setItem(LAST_PHONE_KEY, target);
      onLogin(res.data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('Account not found. Please register to get started.');
      } else if (err.code === 'ERR_NETWORK') {
        setError('Cannot reach server. Make sure the backend is running.');
      } else {
        setError(err.response?.data?.detail || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      key="login"
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16 }}
      transition={{ duration: 0.18 }}
      className="space-y-4"
    >
      {/* Remembered phone quick-access */}
      {remembered && (
        <button
          onClick={() => handleLogin(remembered)}
          disabled={loading}
          className="w-full flex items-center gap-3 bg-[#EFF6FF] border border-blue-100 rounded-2xl px-4 py-3.5 text-left active:scale-[0.98] transition-all disabled:opacity-50"
        >
          <div className="w-9 h-9 rounded-xl bg-[#1E3A8A] flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-bold text-[#1E3A8A] uppercase tracking-wider mb-0.5">
              Continue with
            </div>
            <div className="text-[14px] font-bold text-[#111827] truncate">
              {remembered.replace(/(\d{2})(\d{6})(\d{2})/, '+91 $1XXXXXX$3')}
            </div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1E3A8A" strokeWidth="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      )}

      <div>
        <label className={labelCls}>Phone Number</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[13px] font-bold text-gray-400 select-none">
            +91
          </span>
          <input
            type="tel"
            inputMode="numeric"
            maxLength={10}
            placeholder="98765 43210"
            className={`${inputCls} pl-12`}
            value={phone}
            onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '')); setError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>
            </svg>
            <span className="text-[12px] font-semibold text-red-600 flex-1">{error}</span>
            {error.includes('create an account') && (
              <button onClick={onSwitchToRegister} className="text-[11px] font-bold text-[#1E3A8A] underline whitespace-nowrap">
                Register →
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => handleLogin()}
        disabled={loading || phone.trim().length < 10}
        className="w-full bg-[#1E3A8A] text-white text-[15px] font-bold py-4 rounded-2xl active:scale-[0.98] transition-all shadow-lg shadow-blue-900/20 disabled:opacity-40 mt-2"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
            </svg>
            Signing In...
          </span>
        ) : 'Sign In'}
      </button>

      <p className="text-center text-[12px] text-gray-400 pt-1">
        New to GigInsure?{' '}
        <button onClick={onSwitchToRegister} className="font-bold text-[#1E3A8A]">
          Create an account
        </button>
      </p>
    </motion.div>
  );
};

// ─── REGISTER PANEL ───────────────────────────────────────────────────────────
interface RegisterPanelProps {
  onRegister: (user: User) => void;
  onSwitchToLogin: () => void;
}

const RegisterPanel: React.FC<RegisterPanelProps> = ({ onRegister, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: 'Chennai',
    platform: 'Swiggy',
    avg_daily_income: 600,
    work_hours_per_day: 8,
    work_type: 'full-time',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const cities = ['Chennai', 'Bangalore', 'Mumbai', 'Delhi', 'Hyderabad'];
  const platforms = ['Swiggy', 'Zomato', 'Blinkit', 'Zepto', 'Other'];

  const set = (key: string, val: any) => setFormData((p) => ({ ...p, [key]: val }));

  const handleRegister = async () => {
    if (!formData.name.trim()) { setError('Please enter your full name.'); return; }
    if (formData.phone.trim().length < 10) { setError('Please enter a valid 10-digit phone number.'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_BASE}/auth/register`, formData);
      localStorage.setItem(LAST_PHONE_KEY, formData.phone);
      onRegister(res.data);
    } catch (err: any) {
      if (err.response?.status === 400 && err.response?.data?.detail?.includes('already registered')) {
        setError('This phone number is already registered. Please sign in instead.');
      } else if (err.code === 'ERR_NETWORK') {
        setError('Cannot reach server. Make sure the backend is running.');
      } else {
        setError(err.response?.data?.detail || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      key="register"
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.18 }}
      className="space-y-4"
    >
      {/* Name + Phone */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Full Name</label>
          <input
            type="text"
            placeholder="Ravi Kumar"
            className={inputCls}
            value={formData.name}
            onChange={(e) => { set('name', e.target.value); setError(''); }}
          />
        </div>
        <div>
          <label className={labelCls}>Phone</label>
          <input
            type="tel"
            inputMode="numeric"
            maxLength={10}
            placeholder="98765 43210"
            className={inputCls}
            value={formData.phone}
            onChange={(e) => { set('phone', e.target.value.replace(/\D/g, '')); setError(''); }}
          />
        </div>
      </div>

      {/* City + Platform */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>City</label>
          <select
            className={`${inputCls} appearance-none`}
            value={formData.location}
            onChange={(e) => set('location', e.target.value)}
          >
            {cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Platform</label>
          <select
            className={`${inputCls} appearance-none`}
            value={formData.platform}
            onChange={(e) => set('platform', e.target.value)}
          >
            {platforms.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {/* Daily Income slider */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-3">
          <label className={`${labelCls} mb-0`}>Avg Daily Earnings</label>
          <span className="text-sm font-extrabold text-[#1E3A8A]">₹{formData.avg_daily_income}</span>
        </div>
        <input
          type="range" min="300" max="1500" step="50"
          className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#1E3A8A]"
          value={formData.avg_daily_income}
          onChange={(e) => set('avg_daily_income', parseInt(e.target.value))}
        />
        <div className="flex justify-between mt-2 text-[10px] text-gray-400 font-medium">
          <span>₹300 / day</span>
          <span>₹1,500 / day</span>
        </div>
      </div>

      {/* Hours + Work type */}
      <div className="flex gap-3">
        <div className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <label className={`${labelCls} mb-2`}>Daily Hours</label>
          <select
            className="w-full text-[14px] font-bold text-gray-900 focus:outline-none bg-transparent"
            value={formData.work_hours_per_day}
            onChange={(e) => set('work_hours_per_day', parseInt(e.target.value))}
          >
            {[2, 4, 6, 8, 10, 12].map((h) => <option key={h} value={h}>{h} hrs</option>)}
          </select>
        </div>
        <div className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <label className={`${labelCls} mb-2`}>Work Type</label>
          <div className="flex bg-gray-50 p-1 rounded-xl">
            {(['part-time', 'full-time'] as const).map((type) => (
              <button
                key={type}
                onClick={() => set('work_type', type)}
                className={`flex-1 py-1 text-[10px] font-bold rounded-lg transition-all ${
                  formData.work_type === type
                    ? 'bg-white text-[#1E3A8A] shadow-sm'
                    : 'text-gray-400'
                }`}
              >
                {type === 'part-time' ? 'Part' : 'Full'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" className="flex-shrink-0 mt-0.5">
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>
            </svg>
            <span className="text-[12px] font-semibold text-red-600 flex-1">{error}</span>
            {error.includes('already registered') && (
              <button onClick={onSwitchToLogin} className="text-[11px] font-bold text-[#1E3A8A] underline whitespace-nowrap">
                Sign In →
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={handleRegister}
        disabled={loading}
        className="w-full bg-[#1E3A8A] text-white text-[15px] font-bold py-4 rounded-2xl active:scale-[0.98] transition-all shadow-lg shadow-blue-900/20 disabled:opacity-40"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
            </svg>
            Setting Up Your Protection...
          </span>
        ) : 'Activate My Protection'}
      </button>

      <p className="text-center text-[12px] text-gray-400">
        Already have an account?{' '}
        <button onClick={onSwitchToLogin} className="font-bold text-[#1E3A8A]">
          Sign in
        </button>
      </p>
    </motion.div>
  );
};

// ─── ROOT AUTH SCREEN ─────────────────────────────────────────────────────────
export const RegistrationScreen: React.FC<RegistrationScreenProps> = ({ onRegister }) => {
  // Default to login if a previous phone is remembered, otherwise register
  const hasRemembered = !!localStorage.getItem(LAST_PHONE_KEY);
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(
    hasRemembered ? 'login' : 'register'
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="flex flex-col h-full overflow-y-auto scrollbar-hide bg-[#F3F4F6]"
    >
      {/* Subtle top gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-[#1E3A8A]/5 to-transparent pointer-events-none" />

      <div className="relative z-10 px-6 pb-10">
        <BrandHeader />

        <div className="bg-white rounded-[28px] p-5 shadow-sm border border-gray-100/80">
          <TabToggle activeTab={activeTab} onChange={setActiveTab} />

          <AnimatePresence mode="wait">
            {activeTab === 'login' ? (
              <LoginPanel
                key="login"
                onLogin={onRegister}
                onSwitchToRegister={() => setActiveTab('register')}
              />
            ) : (
              <RegisterPanel
                key="register"
                onRegister={onRegister}
                onSwitchToLogin={() => setActiveTab('login')}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-5 mt-6 opacity-50">
          <div className="flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
            <span className="text-[10px] font-bold text-gray-700 uppercase tracking-wide">Encrypted</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span className="text-[10px] font-bold text-gray-700 uppercase tracking-wide">IRDAI Compliant</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <span className="text-[10px] font-bold text-gray-700 uppercase tracking-wide">AI-Powered</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

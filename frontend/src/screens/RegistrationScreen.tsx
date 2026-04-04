import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const API_BASE = 'http://localhost:8000';

interface User {
  id: number;
  name: string;
  location: string;
}

interface RegistrationScreenProps {
  onRegister: (user: User) => void;
}

export const RegistrationScreen: React.FC<RegistrationScreenProps> = ({ onRegister }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: 'Chennai',
    platform: 'Swiggy',
    avg_daily_income: 600,
    work_hours_per_day: 8,
    work_type: 'full-time'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const cities = ["Chennai", "Bangalore", "Mumbai", "Delhi", "Hyderabad"];
  const platforms = ["Swiggy", "Zomato"];

  const handleRegister = async () => {
    if (!formData.name || !formData.phone) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await axios.post(`${API_BASE}/auth/register`, formData);
      onRegister(response.data);
    } catch (err: any) {
      console.error("Registration error:", err);
      if (err.code === 'ERR_NETWORK') {
        onRegister({ id: 1, ...formData } as User);
      } else {
        setError(err.response?.data?.detail || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="p-6 flex flex-col h-full items-center overflow-y-auto scrollbar-hide pt-10"
    >
      <div className="w-16 h-16 bg-[#DCFCE7] rounded-3xl flex items-center justify-center mb-6 shadow-sm shadow-green-100">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-[32px] font-extrabold text-[#111827] mb-2 tracking-tight">GigInsure</h1>
        <p className="text-[14px] text-gray-500 leading-relaxed px-4 font-medium opacity-70">Personalized AI insurance for gig partners.</p>
      </div>

      <div className="w-full space-y-5">
        <div className="bg-[#EFF6FF] rounded-2xl p-4 border border-blue-100/50">
          <p className="text-[12px] text-[#1E40AF] font-medium leading-relaxed text-center">We calculate your premiums and payouts based on your unique work persona.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-gray-400 mb-2 ml-1 uppercase tracking-wider">Full Name</label>
            <input
              type="text"
              placeholder="John"
              className="w-full px-4 py-3.5 rounded-2xl bg-white border border-gray-100 shadow-sm focus:outline-none focus:ring-4 focus:ring-[#1E3A8A]/5 focus:border-[#1E3A8A] transition-all text-sm font-medium"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-400 mb-2 ml-1 uppercase tracking-wider">Phone</label>
            <input
              type="text"
              placeholder="98765..."
              className="w-full px-4 py-3.5 rounded-2xl bg-white border border-gray-100 shadow-sm focus:outline-none focus:ring-4 focus:ring-[#1E3A8A]/5 focus:border-[#1E3A8A] transition-all text-sm font-medium"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex-1">
            <label className="block text-[11px] font-bold text-gray-400 mb-2 ml-1 uppercase tracking-wider">City</label>
            <div className="relative">
              <select
                className="w-full px-4 py-3.5 rounded-2xl bg-white border border-gray-100 shadow-sm focus:outline-none focus:ring-4 focus:ring-[#1E3A8A]/5 focus:border-[#1E3A8A] transition-all text-sm appearance-none font-medium text-gray-700"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              >
                {cities.map(city => <option key={city} value={city}>{city}</option>)}
              </select>
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-[11px] font-bold text-gray-400 mb-2 ml-1 uppercase tracking-wider">Platform</label>
            <div className="relative">
              <select
                className="w-full px-4 py-3.5 rounded-2xl bg-white border border-gray-100 shadow-sm focus:outline-none focus:ring-4 focus:ring-[#1E3A8A]/5 focus:border-[#1E3A8A] transition-all text-sm appearance-none font-medium text-gray-700"
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
              >
                {platforms.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
           <div className="flex justify-between items-center mb-3">
             <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Avg Daily Income</label>
             <span className="text-sm font-bold text-[#1E3A8A]">₹{formData.avg_daily_income}</span>
           </div>
           <input 
             type="range" min="300" max="1500" step="50"
             className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#1E3A8A]"
             value={formData.avg_daily_income}
             onChange={(e) => setFormData({ ...formData, avg_daily_income: parseInt(e.target.value) })}
           />
           <div className="flex justify-between mt-2 text-[10px] text-gray-400 font-medium">
             <span>₹300</span>
             <span>₹1500</span>
           </div>
        </div>

        <div className="flex gap-4">
           <div className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
             <label className="block text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">Work Hours</label>
             <select 
               className="w-full text-sm font-bold text-gray-900 focus:outline-none bg-transparent"
               value={formData.work_hours_per_day}
               onChange={(e) => setFormData({ ...formData, work_hours_per_day: parseInt(e.target.value) })}
             >
               {[2,4,6,8,10,12].map(h => <option key={h} value={h}>{h} hrs</option>)}
             </select>
           </div>
           <div className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
             <label className="block text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">Work Type</label>
             <div className="flex bg-gray-50 p-1 rounded-xl">
               {['part-time', 'full-time'].map((type) => (
                 <button
                   key={type}
                   onClick={() => setFormData({ ...formData, work_type: type })}
                   className={`flex-1 py-1 text-[10px] font-bold rounded-lg transition-all ${formData.work_type === type ? 'bg-white text-[#1E3A8A] shadow-sm' : 'text-gray-400'}`}
                 >
                   {type === 'part-time' ? 'Part' : 'Full'}
                 </button>
               ))}
             </div>
           </div>
        </div>

        {error && <p className="text-red-500 text-xs font-bold text-center mt-2">{error}</p>}

        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full bg-[#1E3A8A] text-white text-[15px] font-bold py-5 rounded-2xl mt-4 active:scale-[0.98] transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50"
        >
          {loading ? 'Analyzing Persona...' : 'Get Personalized Protection'}
        </button>
      </div>
    </motion.div>
  );
};

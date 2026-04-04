import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const API_BASE = 'http://localhost:8000';

interface User {
  id: number;
  name: string;
  location: string;
  avg_daily_income: number;
}

interface Policy {
  id: number;
  plan_name: string;
  current_premium: number;
  coverage: number;
  is_active: boolean;
}

interface Claim {
  id: number;
  trigger_type: string;
  amount: number;
  created_at: string;
}

interface DashboardScreenProps {
  user: User;
  policy: Policy;
  onOpenProfile: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ user, policy, onOpenProfile }) => {
  const [claims, setClaims] = useState<Claim[]>([]);

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      const response = await axios.get(`${API_BASE}/policies/claims/${user.id}`);
      setClaims(response.data);
    } catch (err) {
      console.error("Failed to fetch claims:", err);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (!policy) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center h-full">
        <div className="w-16 h-16 bg-gray-200 rounded-full mb-4 animate-pulse" />
        <div className="text-gray-400 text-sm">Loading coverage...</div>
      </div>
    );
  }

  const activeClaimsCount = claims.filter(c => c.amount > 0).length;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="text-[22px] font-bold text-gray-900">Hi {user.name.split(' ')[0]} 👋</div>
        <div 
          onClick={onOpenProfile}
          className="w-10 h-10 rounded-full bg-[#1E3A8A] flex items-center justify-center text-sm font-semibold text-white cursor-pointer active:scale-95 transition-transform"
        >
          {getInitials(user.name)}
        </div>
      </div>

      <div className="inline-flex items-center gap-1.5 bg-[#DCFCE7] text-[#166534] text-xs font-medium px-3.5 py-1.5 rounded-full mb-4">
        <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
        Protected This Week
      </div>

      <div className="bg-[#1E3A8A] rounded-[24px] p-6 mb-5 relative overflow-hidden shadow-xl shadow-blue-900/20">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[13px] font-medium text-blue-100 opacity-80">Weekly Cover</span>
            <div className="bg-green-500/20 text-[#4ADE80] text-[10px] font-bold px-2.5 py-1 rounded-full border border-green-500/20 flex items-center gap-1.5 uppercase tracking-wider">
              <div className="w-1 h-1 rounded-full bg-[#4ADE80] animate-pulse" />
              Active
            </div>
          </div>
          <div className="text-[34px] font-extrabold text-white mb-1 tracking-tighter">₹{policy.coverage}</div>
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/10 uppercase tracking-widest">
             <div className="flex-1">
               <div className="text-[9px] text-blue-200/60 font-bold mb-0.5">Daily Income</div>
               <div className="text-[14px] text-white font-bold">₹{user.avg_daily_income}</div>
             </div>
             <div className="w-[1px] h-6 bg-white/10" />
             <div className="flex-1">
               <div className="text-[9px] text-blue-200/60 font-bold mb-0.5">Est. Protection</div>
               <div className="text-[14px] text-white font-bold">₹{Math.round(user.avg_daily_income * 0.6)}/event</div>
             </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2.5 mb-5">
        <div className="flex-1 bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
          <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center mb-2">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="#1E3A8A" strokeWidth="1.8"><path d="M10 2v16M6 6h6a2 2 0 010 4H6M6 10h7a2 2 0 010 4H6"/></svg>
          </div>
          <div className="text-[10px] text-gray-500 mb-0.5">Weekly Premium</div>
          <div className="text-base font-bold text-gray-900">₹{policy.current_premium}</div>
        </div>
        <div className="flex-1 bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
          <div className="w-7 h-7 rounded-lg bg-yellow-100/50 flex items-center justify-center mb-2">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="#92400E" strokeWidth="1.8"><path d="M9 12H5l7-10v8h4l-7 10z"/></svg>
          </div>
          <div className="text-[10px] text-gray-500 mb-0.5">Active Claims</div>
          <div className="text-base font-bold text-[#92400E]">{activeClaimsCount}</div>
        </div>
        <div className="flex-1 bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
          <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center mb-2">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="#166534" strokeWidth="1.8"><path d="M3 10a7 7 0 1014 0A7 7 0 003 10z"/><path d="M7 10l2 2 4-4"/></svg>
          </div>
          <div className="text-[10px] text-gray-500 mb-0.5">Coverage</div>
          <div className="text-base font-bold text-[#166534]">₹{policy.coverage}</div>
        </div>
      </div>

      <div className="text-base font-semibold text-gray-900 mb-3">Recent Activity</div>
      <div className="space-y-2 pb-4">
        {claims.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-xs">No recent activity</div>
        ) : (
          claims.slice(0, 3).map((claim, idx) => (
            <div key={idx} className="flex items-start gap-3 bg-white rounded-xl p-3 shadow-sm border border-gray-50">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                 {claim.amount > 0 ? (
                   <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#1E3A8A" strokeWidth="1.8"><path d="M10 2v16M6 6h6a2 2 0 010 4H6M6 10h7a2 2 0 010 4H6"/></svg>
                 ) : (
                   <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#1E3A8A" strokeWidth="1.8"><path d="M3 10c0-3 1-6 7-7m7 7c0 3-1 6-7 7M3 10h14M10 3v14"/><path d="M7 6c-2 1-3 3-3 5s1 3 3 4M13 6c2 1 3 3 3 5s-1 3-3 4"/></svg>
                 )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-gray-900 truncate">
                  {claim.amount > 0 ? `₹${claim.amount} payout processed` : `${claim.trigger_type.replace('_', ' ')} detected`}
                </div>
                <div className="text-[11px] text-gray-500 mt-0.5">
                  {new Date(claim.created_at).toLocaleDateString([], { day: 'numeric', month: 'short' })} • Auto-processed
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};

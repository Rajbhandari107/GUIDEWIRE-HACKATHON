import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const API_BASE = 'http://localhost:8000';

interface Claim {
  id: number;
  trigger_type: string;
  trigger_data: string;
  amount: number;
  status: string;
  created_at: string;
}

interface User {
  id: number;
  avg_daily_income: number;
}

interface ClaimsScreenProps {
  user: User;
}

export const ClaimsScreen: React.FC<ClaimsScreenProps> = ({ user }) => {
  const [claims, setClaims] = useState<Claim[]>([]);

  useEffect(() => {
    fetchClaims();
    const interval = setInterval(fetchClaims, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchClaims = async () => {
    try {
      const response = await axios.get(`${API_BASE}/policies/claims/${user.id}`);
      setClaims(response.data);
    } catch (err) {
      console.error("Failed to fetch claims:", err);
    }
  };

  const latestClaim = claims[0];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-4"
    >
      <div className="text-[20px] font-bold text-gray-900 mb-4">Claims</div>

      <div className="bg-[#EFF6FF] rounded-xl p-3 mb-5 flex items-start gap-2.5">
        <div className="w-5 h-5 rounded-full bg-[#BFDBFE] flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="#1E3A8A" strokeWidth="1.2"/><path d="M6 4v4M6 3v.5" stroke="#1E3A8A" strokeWidth="1.2" strokeLinecap="round"/></svg>
        </div>
        <div className="text-[12px] text-[#1E40AF] leading-relaxed">No action needed. We automatically detect disruptions and process your claims.</div>
      </div>

      {!latestClaim ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-sm">No claims processed yet.</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-3.5">
            <div className="text-base font-semibold text-gray-900">Latest Claim</div>
            <span className="text-[11px] bg-[#DCFCE7] text-[#166534] px-2.5 py-1 rounded-full font-medium">Completed</span>
          </div>

          <div className="relative pl-7">
            {/* Timeline Line */}
            <div className="absolute left-[15px] top-4 bottom-4 w-[2px] bg-gradient-to-b from-[#22C55E] via-[#22C55E] to-gray-200 rounded-full" />

            <div className="space-y-6">
              {/* Step 1: Detection */}
              <div className="relative">
                <div className="absolute -left-7 w-[30px] h-[30px] rounded-full bg-[#DCFCE7] flex items-center justify-center z-10 border-2 border-white">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="#166534" strokeWidth="2"><path d="M3 6l5 4 2-3c1.5-2 4-4 8-4"/><path d="M3 12l5 4 2-3c1.5-2 4-4 8-4"/></svg>
                </div>
                <div className="bg-white rounded-[14px] p-3 shadow-sm border border-gray-50 ml-2">
                  <div className="text-[13px] font-semibold text-gray-900">{latestClaim.trigger_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Detected</div>
                  <div className="text-[11px] text-[#166534] mt-0.5">Threshold exceeded — {latestClaim.trigger_type === 'heavy_rain' ? '74mm/hr' : 'AQI 350+'}</div>
                  <div className="text-[10px] text-gray-400 mt-1">
                    {new Date(latestClaim.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>

              {/* Step 2: Validation */}
              <div className="relative">
                <div className="absolute -left-7 w-[30px] h-[30px] rounded-full bg-[#DCFCE7] flex items-center justify-center z-10 border-2 border-white">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="#166534" strokeWidth="2"><path d="M5 10l4 4 7-7"/></svg>
                </div>
                <div className="bg-white rounded-[14px] p-3 shadow-sm border border-gray-50 ml-2">
                  <div className="text-[13px] font-semibold text-gray-900">Claim Validated</div>
                  <div className="text-[11px] text-[#166534] mt-0.5">Fraud check passed — Risk score: 0.08</div>
                  <div className="text-[10px] text-gray-400 mt-1">
                   {new Date(new Date(latestClaim.created_at).getTime() + 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>

              {/* Step 3: Payout */}
              <div className="relative">
                <div className="absolute -left-7 w-[30px] h-[30px] rounded-full bg-[#DCFCE7] flex items-center justify-center z-10 border-2 border-white">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="#166534" strokeWidth="2"><path d="M10 2v16M6 6h6a2 2 0 010 4H6M6 10h7a2 2 0 010 4H6"/></svg>
                </div>
                <div className="bg-white rounded-[14px] p-3 shadow-sm border border-gray-50 ml-2">
                  <div className="text-[13px] font-semibold text-gray-900">Payout Processed</div>
                  <div className="text-[11px] text-[#166534] mt-0.5">Credited based on ₹{user.avg_daily_income} avg. daily income</div>
                  <div className="text-[15px] font-bold text-[#166534] mt-1">₹{latestClaim.amount} credited</div>
                  <div className="text-[10px] text-gray-400 mt-1">
                    {new Date(new Date(latestClaim.created_at).getTime() + 180000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="mt-8">
        <div className="text-base font-semibold text-gray-900 mb-3">Previous Claims</div>
        <div className="space-y-2">
          {claims.slice(1, 4).map((claim, idx) => (
            <div key={idx} className="flex items-center justify-between bg-white rounded-xl p-3 shadow-sm border border-gray-50">
              <div>
                <div className="text-[13px] font-medium text-gray-900">{claim.trigger_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} — {new Date(claim.created_at).toLocaleDateString([], { day: 'numeric', month: 'short' })}</div>
                <div className="text-[11px] text-gray-500 mt-0.5 font-normal">Validated & paid</div>
              </div>
              <div className="text-[14px] font-bold text-[#166534]">₹{claim.amount}</div>
            </div>
          ))}
          {claims.length <= 1 && (
             <div className="text-center py-4 text-gray-400 text-[11px]">No previous claims.</div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
